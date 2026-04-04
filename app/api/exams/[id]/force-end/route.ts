import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "معرف الطالب مطلوب" }, { status: 400 });
    }

    // Verify teacher owns the exam
    const exam = await prisma.exam.findUnique({
      where: { id: examId, teacherId: session.user.id },
      select: { id: true },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "الامتحان غير موجود" },
        { status: 404 },
      );
    }

    // Find active result for this student and exam
    const activeResult = await prisma.result.findFirst({
      where: {
        studentId,
        examId,
        isArchived: false,
        status: "UNDER_GRADING",
      },
    });

    if (!activeResult) {
      return NextResponse.json(
        { error: "لا يوجد امتحان قيد الإجراء لهذا الطالب" },
        { status: 400 },
      );
    }

    // Mark as force ended
    await prisma.result.update({
      where: { id: activeResult.id },
      data: {
        isForceEnded: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنهاء الامتحان لهذا الطالب",
    });
  } catch (error) {
    console.error("[EXAM_FORCE_END]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
