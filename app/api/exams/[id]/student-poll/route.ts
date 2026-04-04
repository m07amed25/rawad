import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: examId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    // 1. Get active result for this student and exam
    const activeResult = await prisma.result.findFirst({
      where: {
        studentId: session.user.id,
        examId: examId,
        isArchived: false,
      },
      select: {
        id: true,
        isForceEnded: true,
        status: true,
      },
    });

    if (!activeResult) {
      return NextResponse.json(
        { error: "لا يوجد سجل امتحان نشط" },
        { status: 404 },
      );
    }

    // 2. Fetch recent messages for this exam
    // Optional: Only fetch messages since a certain timestamp to save bandwidth
    const searchParams = req.nextUrl.searchParams;
    const since = searchParams.get("since");

    const messages = await prisma.examMessage.findMany({
      where: {
        examId: examId,
        ...(since ? { createdAt: { gt: new Date(since) } } : {}),
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      isForceEnded: activeResult.isForceEnded,
      status: activeResult.status,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        sender: m.sender.name,
        timestamp: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[STUDENT_POLL_ERROR]", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
