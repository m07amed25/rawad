import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TeacherExamsClient from "./ExamsClient";

export default async function TeacherExamsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/student");

  const exams = await prisma.exam.findMany({
    where: { teacherId: session.user.id },
    select: {
      id: true,
      title: true,
      subject: true,
      createdAt: true,
      date: true,
      endDate: true,
      duration: true,
      status: true,
      questions: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const clientExams = exams.map((exam) => {
    const startDate = new Date(exam.date);
    const endDate = exam.endDate ? new Date(exam.endDate) : null;
    const timeFormat: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    return {
      id: exam.id,
      name: exam.title,
      subject: exam.subject,
      createdAt: new Date(exam.createdAt).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      scheduledAt: startDate.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      timeRange: endDate
        ? `${startDate.toLocaleTimeString("ar-SA", timeFormat)} — ${endDate.toLocaleTimeString("ar-SA", timeFormat)}`
        : startDate.toLocaleTimeString("ar-SA", timeFormat),
      duration: exam.duration,
      questionsCount: exam.questions.length,
      status: exam.status as "DRAFT" | "ACTIVE" | "ENDED",
    };
  });

  return <TeacherExamsClient exams={clientExams} />;
}
