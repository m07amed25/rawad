import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";

import EditExamClient from "./EditExamClient";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/student");

  const exam = await prisma.exam.findUnique({
    where: { id, teacherId: session.user.id },
    select: {
      id: true,
      title: true,
      subject: true,
      duration: true,
      date: true,
      endDate: true,
      status: true,
      _count: { select: { results: { where: { isArchived: false } } } },
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

  // Transform DB data to client form shape
  const examDate = new Date(exam.date);
  const examEndDate = exam.endDate ? new Date(exam.endDate) : null;

  const initialData = {
    id: exam.id,
    title: exam.title,
    subject: exam.subject,
    date: examDate.toISOString().split("T")[0],
    startTime: examDate.toTimeString().slice(0, 5), // "HH:MM"
    endTime: examEndDate ? examEndDate.toTimeString().slice(0, 5) : "",
    duration: exam.duration,
    status: exam.status,
    hasResults: exam._count.results > 0,
    questions: exam.questions.map((q) => {
      const correctIndex = q.options.findIndex((o) => o.isCorrect);
      return {
        id: q.id,
        text: q.text,
        type: q.type as "MCQ" | "ESSAY",
        score: q.score,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
        correctOption: correctIndex >= 0 ? correctIndex : 0,
      };
    }),
  };

  return <EditExamClient initialData={initialData} />;
}
