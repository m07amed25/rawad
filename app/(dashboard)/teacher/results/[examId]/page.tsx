import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import ExamResultsClient from "./ExamResultsClient";

export default async function ExamDetailResultsPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/student");

  // ── Data isolation: only fetch if teacher owns this exam ───
  const exam = await prisma.exam.findUnique({
    where: { id: examId, teacherId: session.user.id },
    select: {
      id: true,
      title: true,
      subject: true,
      questions: { select: { score: true } },
    },
  });

  if (!exam) notFound();

  const maxScore = exam.questions.reduce((sum, q) => sum + q.score, 0);

  // Fetch all results for this exam
  const results = await prisma.result.findMany({
    where: { examId },
    select: {
      id: true,
      score: true,
      maxScore: true,
      correctAnswers: true,
      wrongAnswers: true,
      timeTaken: true,
      violationsCount: true,
      status: true,
      createdAt: true,
      studentId: true,
      student: {
        select: {
          name: true,
          studentCode: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const clientResults = results.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentName: r.student.name,
    studentCode: r.student.studentCode ?? "—",
    score: r.score,
    maxScore: r.maxScore,
    timeTaken: r.timeTaken,
    violationsCount: r.violationsCount,
    status: r.status as "PASSED" | "FAILED" | "UNDER_GRADING",
    submittedAt: new Date(r.createdAt).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <ExamResultsClient
      examId={exam.id}
      examTitle={exam.title}
      examSubject={exam.subject}
      maxScore={maxScore}
      results={clientResults}
    />
  );
}
