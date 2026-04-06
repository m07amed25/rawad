import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import LiveMonitorClient from "./_components/LiveMonitorClient";

export default async function ExamMonitorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examId } = await params;

  // 1. Authenticate & Authorize
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/student");

  // 2. Fetch exam with students and results
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
          email: true,
          image: true,
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

  if (!exam) notFound();

  // 3. Map students with their result data
  const studentsMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      image: string | null;
      status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED";
      startTime: string | null;
      violations: number;
      score: number | null;
      maxScore: number | null;
      timeTaken: number | null;
    }
  >();

  exam.allowedStudents.forEach((student) => {
    studentsMap.set(student.id, {
      id: student.id,
      name: student.name,
      email: student.email,
      image: student.image,
      status: "NOT_STARTED",
      startTime: null,
      violations: 0,
      score: null,
      maxScore: null,
      timeTaken: null,
    });
  });

  exam.results.forEach((result) => {
    const student = studentsMap.get(result.studentId);
    if (student) {
      student.violations = result.violationsCount;
      student.startTime = result.createdAt.toISOString();
      student.score = result.score;
      student.maxScore = result.maxScore;
      student.timeTaken = result.timeTaken;

      if (result.status === "PASSED" || result.status === "FAILED") {
        student.status = "SUBMITTED";
      } else if (
        result.status === "UNDER_GRADING" ||
        result.status === "IN_PROGRESS"
      ) {
        student.status = "IN_PROGRESS";
      }
    }
  });

  const initialStudents = Array.from(studentsMap.values());

  const initialStats = {
    total: exam.allowedStudents.length,
    notStarted: initialStudents.filter((s) => s.status === "NOT_STARTED")
      .length,
    inProgress: initialStudents.filter((s) => s.status === "IN_PROGRESS")
      .length,
    submitted: initialStudents.filter((s) => s.status === "SUBMITTED").length,
  };

  const initialActivity = exam.results
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

  return (
    <LiveMonitorClient
      examId={examId}
      initialData={{
        stats: initialStats,
        students: initialStudents,
        recentActivity: initialActivity,
        title: exam.title,
        subject: exam.subject,
        examStatus: exam.status,
        duration: exam.duration,
        date: exam.date.toISOString(),
        endDate: exam.endDate?.toISOString() ?? null,
      }}
    />
  );
}
