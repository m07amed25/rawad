import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ResultsClient from "./ResultsClient";
import type { ResultData } from "./ResultsClient";

// --- Server Component: Student Results Page ----------------------------------

const STATUS_MAP = {
  PASSED: "passed",
  FAILED: "failed",
  UNDER_GRADING: "grading",
} as const;

export default async function ResultsPage() {
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

  const studentId = session.user.id;

  // -- 2. Fetch student results with exam info ----------------
  const results = await prisma.result.findMany({
    where: { studentId },
    select: {
      id: true,
      score: true,
      maxScore: true,
      correctAnswers: true,
      wrongAnswers: true,
      timeTaken: true,
      status: true,
      createdAt: true,
      exam: {
        select: {
          title: true,
          subject: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // -- 3. Map to client-friendly format -----------------------
  const clientResults: ResultData[] = results.map((r) => ({
    id: r.id,
    examName: r.exam.title,
    subject: r.exam.subject,
    score: r.score,
    totalScore: r.maxScore,
    status: STATUS_MAP[r.status],
    date: new Date(r.createdAt).toLocaleDateString("ar-SA"),
    correctAnswers: r.correctAnswers,
    wrongAnswers: r.wrongAnswers,
    duration: `${r.timeTaken} ?????`,
  }));

  return <ResultsClient results={clientResults} />;
}
