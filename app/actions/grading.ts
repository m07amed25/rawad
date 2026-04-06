"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ResultStatus } from "@prisma/client";
import { submitExamSchema } from "@/lib/validations";
import { calculateGrade } from "@/lib/helpers";
import { z } from "zod";

// ─── Submit & Auto-Grade Exam Action ─────────────────────────
//
// Grading Logic:
// 1. For MCQ questions: compare the student's selectedOptionId against the
//    correct option fetched from the DB. Award full marks on match, 0 otherwise.
// 2. For ESSAY questions: mark as pending (marksAwarded = 0, isCorrect = null).
//    These must be graded manually by the teacher later.
// 3. Calculate totals: totalScore, correctAnswersCount, wrongAnswersCount.
// 4. Determine result status:
//    - UNDER_GRADING: if any essay questions exist (manual review needed).
//    - PASSED: score >= 50% of maxScore (and no essays pending).
//    - FAILED: score < 50% of maxScore (and no essays pending).
// 5. All writes (Result + StudentAnswer records) run inside a Prisma
//    interactive transaction for atomicity.

export async function submitExam(
  examId: string,
  studentAnswers: Array<{
    questionId: string;
    selectedOptionId?: string | null;
    textAnswer?: string | null;
  }>,
  timeTaken: number = 0,
  violationsCount: number = 0,
) {
  // ── 1. Authenticate & Authorize ────────────────────────────
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك، يرجى تسجيل الدخول" };
  }

  if (session.user.role !== "STUDENT") {
    // ← Security wall: only students can submit exams
    return { error: "هذا الإجراء متاح للطلاب فقط" };
  }

  const studentId = session.user.id;

  // ── 2. Validate Input ──────────────────────────────────────
  const parsed = submitExamSchema.safeParse({
    examId,
    answers: studentAnswers,
    timeTaken,
    violationsCount,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return { error: firstError ?? "بيانات الاختبار غير صالحة" };
  }

  const validatedAnswers = parsed.data.answers;

  try {
    // ── 3. Check for Duplicate Submission ────────────────────
    // Only block if a non-archived result exists AND its status is NOT 'IN_PROGRESS'
    const existingResult = await prisma.result.findFirst({
      where: {
        studentId,
        examId,
        isArchived: false,
      },
      select: { id: true, status: true },
    });

    if (existingResult && existingResult.status !== "IN_PROGRESS") {
      return { error: "لقد قمت بتقديم هذا الامتحان بالفعل" };
    }

    // ── 4. Fetch Exam with Questions & Correct Options ───────
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        status: true,
        allowedStudents: {
          where: { id: studentId },
          select: { id: true },
        },
        questions: {
          select: {
            id: true,
            type: true,
            score: true,
            options: {
              where: { isCorrect: true },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!exam) {
      return { error: "الامتحان غير موجود" };
    }

    if (exam.allowedStudents.length === 0) {
      return { error: "غير مصرح لك بتقديم هذا الامتحان" };
    }

    if (exam.status !== "ACTIVE") {
      return { error: "الامتحان غير متاح حالياً" };
    }

    // ── 5. Build a lookup map: questionId → { type, score, correctOptionId }
    const questionMap = new Map(
      exam.questions.map((q) => [
        q.id,
        {
          type: q.type,
          score: q.score,
          correctOptionId: q.options[0]?.id ?? null,
        },
      ]),
    );

    // Calculate maxScore from all questions in the exam
    const maxScore = exam.questions.reduce((sum, q) => sum + q.score, 0);

    // ── 6. Grade Each Answer ─────────────────────────────────
    let totalScore = 0;
    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;
    let hasEssayQuestions = false;

    const gradedAnswers = validatedAnswers.map((answer) => {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        // Student answered a question not in this exam — skip with 0 marks
        return {
          questionId: answer.questionId,
          optionId: answer.selectedOptionId ?? null,
          textAnswer: answer.textAnswer ?? null,
          isCorrect: false,
          marksAwarded: 0,
        };
      }

      if (question.type === "MCQ") {
        // ── MCQ Grading: compare selectedOptionId with correct option from DB
        const isCorrect =
          !!answer.selectedOptionId &&
          answer.selectedOptionId === question.correctOptionId;

        const marksAwarded = isCorrect ? question.score : 0;

        if (isCorrect) {
          totalScore += marksAwarded;
          correctAnswersCount++;
        } else {
          wrongAnswersCount++;
        }

        return {
          questionId: answer.questionId,
          optionId: answer.selectedOptionId ?? null,
          textAnswer: null,
          isCorrect,
          marksAwarded,
        };
      } else {
        // ── ESSAY Grading: pending manual review by teacher
        // isCorrect = null means "not yet graded"
        // marksAwarded = 0 initially — teacher will update later
        hasEssayQuestions = true;

        return {
          questionId: answer.questionId,
          optionId: null,
          textAnswer: answer.textAnswer ?? null,
          isCorrect: null as boolean | null,
          marksAwarded: 0,
        };
      }
    });

    // ── 7. Determine Result Status ───────────────────────────
    // If any essay questions exist → UNDER_GRADING (teacher must review)
    // Otherwise → PASSED if score >= 50%, else FAILED
    let status: ResultStatus;
    if (hasEssayQuestions) {
      status = "UNDER_GRADING";
    } else {
      status = calculateGrade(totalScore, maxScore);
    }

    // ── 8. Atomic Transaction: Create Result + StudentAnswers ─
    const result = await prisma.$transaction(async (tx) => {
      // 8a. Create or Update the Result record
      // If we already have an IN_PROGRESS record, update it. Otherwise create new.
      const resultRecord = await tx.result.upsert({
        where: {
          studentId_examId_isArchived: {
            studentId,
            examId,
            isArchived: false,
          },
        },
        update: {
          score: totalScore,
          maxScore,
          correctAnswers: correctAnswersCount,
          wrongAnswers: wrongAnswersCount,
          timeTaken: parsed.data.timeTaken,
          violationsCount: parsed.data.violationsCount,
          status,
        },
        create: {
          studentId,
          examId,
          score: totalScore,
          maxScore,
          correctAnswers: correctAnswersCount,
          wrongAnswers: wrongAnswersCount,
          timeTaken: parsed.data.timeTaken,
          violationsCount: parsed.data.violationsCount,
          status,
          isArchived: false,
        },
      });

      // 8b. Create individual StudentAnswer records for analytics
      if (gradedAnswers.length > 0) {
        await tx.studentAnswer.createMany({
          data: gradedAnswers.map((ga) => ({
            studentId,
            examId,
            questionId: ga.questionId,
            optionId: ga.optionId,
            textAnswer: ga.textAnswer,
            isCorrect: ga.isCorrect,
            marksAwarded: ga.marksAwarded,
          })),
        });
      }

      return resultRecord;
    });

    // ── 9. Revalidate affected pages ─────────────────────────
    revalidatePath("/student/results");
    revalidatePath(`/student/exam/${examId}`);

    return {
      success: true,
      resultId: result.id,
      score: totalScore,
      maxScore,
      correctAnswers: correctAnswersCount,
      wrongAnswers: wrongAnswersCount,
      status,
    };
  } catch (err: unknown) {
    // Handle race condition: another submission arrived first
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { error: "لقد قمت بتقديم هذا الامتحان بالفعل" };
    }

    console.error("[submitExam] Unexpected error:", err);
    return { error: "حدث خطأ أثناء تقديم الامتحان، يرجى المحاولة لاحقاً" };
  }
}

const GradeEssaySchema = z.object({
  studentAnswerId: z.string().uuid(),
  marksAwarded: z.number().min(0, "الدرجة لا يمكن أن تكون سالبة"),
});

export async function gradeEssayQuestion(
  studentAnswerId: string,
  marksAwarded: number,
) {
  // ── 1. Auth: only TEACHER can grade ────────────────────────
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك، يرجى تسجيل الدخول" };
  }

  if (session.user.role !== "TEACHER") {
    return { error: "هذا الإجراء متاح للمعلمين فقط" };
  }

  const teacherId = session.user.id;

  // ── 2. Validate input ──────────────────────────────────────
  const parsed = GradeEssaySchema.safeParse({ studentAnswerId, marksAwarded });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  try {
    // ── 3. Fetch StudentAnswer + verify teacher owns the exam ─
    const studentAnswer = await prisma.studentAnswer.findUnique({
      where: { id: studentAnswerId },
      select: {
        id: true,
        examId: true,
        studentId: true,
        questionId: true,
        question: { select: { type: true, score: true } },
        exam: { select: { teacherId: true } },
      },
    });

    if (!studentAnswer) {
      return { error: "الإجابة غير موجودة" };
    }

    // ── Data isolation: teacher must own this exam ────────────
    if (studentAnswer.exam.teacherId !== teacherId) {
      return { error: "غير مصرح لك بتعديل هذا الامتحان" };
    }

    if (studentAnswer.question.type !== "ESSAY") {
      return { error: "هذا السؤال ليس مقالياً" };
    }

    // Clamp marks to question's max score
    const clampedMarks = Math.min(
      parsed.data.marksAwarded,
      studentAnswer.question.score,
    );

    // ── 4. Transaction: update answer + recalculate result ───
    await prisma.$transaction(async (tx) => {
      // 4a. Update the essay answer
      await tx.studentAnswer.update({
        where: { id: studentAnswerId },
        data: {
          marksAwarded: clampedMarks,
          isCorrect: clampedMarks > 0,
        },
      });

      // 4b. Recalculate totals from all answers for this student+exam
      const allAnswers = await tx.studentAnswer.findMany({
        where: {
          studentId: studentAnswer.studentId,
          examId: studentAnswer.examId,
          isArchived: false,
        },
        select: {
          isCorrect: true,
          marksAwarded: true,
          question: { select: { type: true } },
        },
      });

      let newScore = 0;
      let newCorrect = 0;
      let newWrong = 0;
      let hasUngradedEssay = false;

      for (const a of allAnswers) {
        newScore += a.marksAwarded ?? 0;
        if (a.isCorrect === true) newCorrect++;
        else if (a.isCorrect === false) newWrong++;

        // An essay with isCorrect === null means it hasn't been graded yet
        if (a.question.type === "ESSAY" && a.isCorrect === null) {
          hasUngradedEssay = true;
        }
      }

      // 4c. Determine new status
      const result = await tx.result.findFirst({
        where: {
          studentId: studentAnswer.studentId,
          examId: studentAnswer.examId,
          isArchived: false,
        },
        select: { maxScore: true },
      });

      let newStatus: ResultStatus;
      if (hasUngradedEssay) {
        newStatus = "UNDER_GRADING";
      } else {
        const threshold = (result?.maxScore ?? 0) * 0.5;
        newStatus = newScore >= threshold ? "PASSED" : "FAILED";
      }

      // 4d. Update the Result record
      await tx.result.updateMany({
        where: {
          studentId: studentAnswer.studentId,
          examId: studentAnswer.examId,
          isArchived: false,
        },
        data: {
          score: newScore,
          correctAnswers: newCorrect,
          wrongAnswers: newWrong,
          status: newStatus,
        },
      });
    });

    revalidatePath("/teacher/results");

    return { success: true, message: "تم تحديث الدرجة بنجاح" };
  } catch (err: unknown) {
    console.error("[gradeEssayQuestion] Unexpected error:", err);
    return { error: "حدث خطأ أثناء تحديث الدرجة" };
  }
}
