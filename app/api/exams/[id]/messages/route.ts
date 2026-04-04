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

  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId, teacherId: session.user.id },
      select: { id: true },
    });

    if (!exam) {
      return NextResponse.json({ error: "الامتحان غير موجود" }, { status: 404 });
    }

    const messages = await prisma.examMessage.findMany({
      where: { examId },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[EXAM_MESSAGES_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: examId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "محتوى الرسالة مطلوب" }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId, teacherId: session.user.id },
      select: { id: true, status: true },
    });

    if (!exam) {
      return NextResponse.json({ error: "الامتحان غير موجود" }, { status: 404 });
    }

    if (exam.status !== "ACTIVE") {
      return NextResponse.json({ error: "الامتحان ليس نشطاً" }, { status: 400 });
    }

    const message = await prisma.examMessage.create({
      data: {
        content,
        examId,
        senderId: session.user.id,
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[EXAM_MESSAGES_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
