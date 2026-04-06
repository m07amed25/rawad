import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ResultStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: examId } = await params;

  // 1. Authenticate
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    // 2. Verify exam ownership & fetch data in a single query
    const exam = await prisma.exam.findUnique({
      where: { id: examId, teacherId: session.user.id },
      select: {
        id: true,
        title: true,
        subject: true,
        status: true,
        duration: true,
        date: true,
        endDate: true,
        allowedStudents: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        results: {
          where: { isArchived: false },
          select: {
            studentId: true,
            status: true,
            score: true,
            maxScore: true,
            timeTaken: true,
            violationsCount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "الامتحان غير موجود" },
        { status: 404 },
      );
    }

    // 3. Process & map student data
    const studentsMap = new Map<
      string,
      {
        id: string;
        name: string;
        image: string | null;
        email: string;
        status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED";
        startTime: string | null;
        violations: number;
        score: number | null;
        maxScore: number | null;
        timeTaken: number | null;
      }
    >();

    // Initialize all allowed students
    exam.allowedStudents.forEach((student) => {
      studentsMap.set(student.id, {
        id: student.id,
        name: student.name,
        image: student.image,
        email: student.email,
        status: "NOT_STARTED",
        startTime: null,
        violations: 0,
        score: null,
        maxScore: null,
        timeTaken: null,
      });
    });

    // Merge result data
    exam.results.forEach((result) => {
      const student = studentsMap.get(result.studentId);
      if (student) {
        student.violations = result.violationsCount;
        student.startTime = result.createdAt.toISOString();
        student.score = result.score;
        student.maxScore = result.maxScore;
        student.timeTaken = result.timeTaken;

        if (
          result.status === ResultStatus.PASSED ||
          result.status === ResultStatus.FAILED
        ) {
          student.status = "SUBMITTED";
        } else if (
          result.status === ResultStatus.UNDER_GRADING ||
          result.status === ResultStatus.IN_PROGRESS
        ) {
          student.status = "IN_PROGRESS";
        }
      }
    });

    const studentsList = Array.from(studentsMap.values());

    // 4. Compute stats
    const stats = {
      total: exam.allowedStudents.length,
      notStarted: studentsList.filter((s) => s.status === "NOT_STARTED").length,
      inProgress: studentsList.filter((s) => s.status === "IN_PROGRESS").length,
      submitted: studentsList.filter((s) => s.status === "SUBMITTED").length,
    };

    // 5. Build activity log
    const recentActivity = exam.results
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20)
      .map((r) => {
        const student = studentsMap.get(r.studentId);
        const isSubmitted = r.status === "PASSED" || r.status === "FAILED";
        const hasViolations = r.violationsCount > 0;

        let type: "STARTED" | "SUBMITTED" | "VIOLATION" = "STARTED";
        if (isSubmitted) type = "SUBMITTED";
        if (hasViolations) type = "VIOLATION";

        return {
          id: r.studentId + r.createdAt.getTime(),
          studentName: student?.name || "طالب غير معروف",
          studentImage: student?.image || null,
          time: r.createdAt.toISOString(),
          type,
          status: r.status,
          violations: r.violationsCount,
        };
      });

    return NextResponse.json({
      stats,
      students: studentsList,
      recentActivity,
      title: exam.title,
      subject: exam.subject,
      examStatus: exam.status,
      duration: exam.duration,
      date: exam.date.toISOString(),
      endDate: exam.endDate?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("[LIVE_STATS_ERROR]", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب البيانات" },
      { status: 500 },
    );
  }
}
