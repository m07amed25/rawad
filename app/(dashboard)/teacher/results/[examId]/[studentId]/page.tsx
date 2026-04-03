import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import AnswerPreviewClient from "./AnswerPreviewClient";

export default async function StudentAnswerPreviewPage({
  params,
}: {
  params: Promise<{ examId: string; studentId: string }>;
}) {
  const { examId, studentId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/student");

  // ── Data isolation: only the teacher who owns the exam can view ──
  const exam = await prisma.exam.findUnique({
    where: { id: examId, teacherId: session.user.id },
    select: {
      id: true,
      title: true,
      subject: true,
      questions: {
        select: {
          id: true,
          text: true,
          type: true,
          score: true,
          options: {
            select: {
              id: true,
              text: true,
              isCorrect: true,
            },
          },
        },
      },
    },
  });

  if (!exam) notFound();

  // Fetch the student and their result
  const [student, result] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, studentCode: true },
    }),
    prisma.result.findFirst({
      where: { studentId, examId, isArchived: false },
      select: {
        score: true,
        maxScore: true,
        timeTaken: true,
        violationsCount: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  if (!student || !result) notFound();

  // Fetch all student answers for this exam (non-archived)
  const studentAnswers = await prisma.studentAnswer.findMany({
    where: { studentId, examId, isArchived: false },
    select: {
      id: true,
      questionId: true,
      optionId: true,
      textAnswer: true,
      isCorrect: true,
      marksAwarded: true,
    },
  });

  // Build answer map: questionId → answer
  const answerMap = new Map(studentAnswers.map((a) => [a.questionId, a]));

  const questionsWithAnswers = exam.questions.map((q) => {
    const answer = answerMap.get(q.id);
    return {
      id: q.id,
      text: q.text,
      type: q.type as "MCQ" | "ESSAY",
      score: q.score,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
      studentAnswer: answer
        ? {
            id: answer.id,
            optionId: answer.optionId,
            textAnswer: answer.textAnswer,
            isCorrect: answer.isCorrect,
            marksAwarded: answer.marksAwarded ?? 0,
          }
        : null,
    };
  });

  return (
    <AnswerPreviewClient
      examId={examId}
      examTitle={exam.title}
      examSubject={exam.subject}
      studentName={student.name}
      studentCode={student.studentCode ?? "—"}
      result={{
        score: result.score,
        maxScore: result.maxScore,
        timeTaken: result.timeTaken,
        violationsCount: result.violationsCount,
        status: result.status as "PASSED" | "FAILED" | "UNDER_GRADING",
        submittedAt: new Date(result.createdAt).toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }}
      questions={questionsWithAnswers}
    />
  );
}
