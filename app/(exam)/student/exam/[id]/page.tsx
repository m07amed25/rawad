import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ExamClient from "./ExamClient";
import type { SanitizedExamData } from "./ExamClient";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: examId } = await params;

  // ── 1. Auth guard ──────────────────────────────────────────
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

  // ── 2. Check if student already submitted this exam ────────
  const existingResult = await prisma.result.findUnique({
    where: {
      studentId_examId: { studentId, examId },
    },
    select: { id: true },
  });

  if (existingResult) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 p-6"
        dir="rtl"
      >
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto size-20 rounded-2xl bg-amber-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-10 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            لقد قمت بأداء هذا الامتحان مسبقاً
          </h1>
          <p className="text-gray-500">
            لا يمكنك إعادة الامتحان. يمكنك الاطلاع على نتيجتك من صفحة النتائج.
          </p>
          <Link
            href="/student"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  // ── 3. Fetch exam with questions and options ───────────────
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: {
      id: true,
      title: true,
      subject: true,
      duration: true,
      status: true,
      teacher: {
        select: { name: true },
      },
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
              // NOTE: isCorrect is intentionally NOT selected here.
              // This is the primary security measure — the field never
              // leaves the database for this query.
            },
          },
        },
      },
    },
  });

  // ── 4. Validate exam exists and is active ──────────────────
  if (!exam) {
    notFound();
  }

  if (exam.status !== "ACTIVE") {
    notFound();
  }

  // ── 5. Build sanitized payload ─────────────────────────────
  const totalPoints = exam.questions.reduce((sum, q) => sum + q.score, 0);

  const sanitizedExam: SanitizedExamData = {
    id: exam.id,
    title: exam.title,
    subject: exam.subject,
    instructor: exam.teacher.name,
    durationMinutes: exam.duration,
    totalPoints,
    questions: exam.questions.map((q) => {
      if (q.type === "MCQ") {
        return {
          id: q.id,
          type: "MCQ" as const,
          text: q.text,
          points: q.score,
          options: q.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
          })),
        };
      }
      return {
        id: q.id,
        type: "ESSAY" as const,
        text: q.text,
        points: q.score,
      };
    }),
  };

  // ── 6. Get student's disability type ────────────────────────
  const disabilityType = (session.user.disabilityType ?? "NONE") as
    | "NONE"
    | "HEARING"
    | "MOTOR"
    | "VISUAL"
    | "LEARNING"
    | "MULTIPLE";

  return <ExamClient exam={sanitizedExam} disabilityType={disabilityType} />;
}
