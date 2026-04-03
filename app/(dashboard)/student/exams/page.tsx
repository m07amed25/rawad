import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ExamsClient from "./ExamsClient";
import type { ExamData } from "./ExamsClient";

// --- Server Component: Student Exams Page ------------------------------------

export default async function ExamsPage() {
  // -- 1. Auth guard ------------------------------------------
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/teacher");
  }

  const universityName = session.user.universityName;
  const department = session.user.department;
  const studentId = session.user.id;

  // -- 2. Fetch exams where this student is explicitly allowed --
  const [exams, takenExamIds] = await Promise.all([
    prisma.exam.findMany({
      where: {
        status: { in: ["ACTIVE", "ENDED"] },
        allowedStudents: {
          some: { id: studentId },
        },
      },
      select: {
        id: true,
        title: true,
        subject: true,
        date: true,
        endDate: true,
        duration: true,
        status: true,
        questions: { select: { id: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.result
      .findMany({
        where: { studentId },
        select: { examId: true },
      })
      .then((results) => new Set(results.map((r) => r.examId))),
  ]);

  // -- 3. Map to client-friendly format -----------------------
  const clientExams: ExamData[] = exams.map((exam) => {
    const taken = takenExamIds.has(exam.id);
    let status: ExamData["status"];
    if (taken) {
      status = "taken";
    } else if (exam.status === "ACTIVE") {
      status = "available";
    } else {
      status = "ended";
    }

    const startDate = new Date(exam.date);
    const endDate = exam.endDate ? new Date(exam.endDate) : null;
    const timeFmt: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    const startTime = startDate.toLocaleTimeString("ar-SA", timeFmt);
    const timeStr = endDate
      ? `${startTime} — ${endDate.toLocaleTimeString("ar-SA", timeFmt)}`
      : startTime;

    return {
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      date: startDate.toLocaleDateString("ar-SA"),
      time: timeStr,
      duration: `${exam.duration} دقيقة`,
      questions: exam.questions.length,
      status,
    };
  });

  return <ExamsClient exams={clientExams} />;
}
