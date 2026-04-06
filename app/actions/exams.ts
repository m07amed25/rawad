"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createExamServerSchema,
  type CreateExamServerInput,
} from "@/lib/validations";
import { z } from "zod";
import { sendExamNotificationEmails } from "@/lib/mailer";

// ─── Create Full Exam Action ─────────────────────────────────
// Creates an exam with all its questions and options in a single
// Prisma nested write (which runs as a transaction automatically).
// The teacherId is ALWAYS taken from the server session — never from the client.

export async function createFullExam(data: CreateExamServerInput) {
  // 1) Authenticate & authorize: only TEACHER role can create exams
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك، يرجى تسجيل الدخول" };
  }

  if (session.user.role !== "TEACHER") {
    // ← Security wall: blocks any non-teacher (e.g. a student using Postman)
    return { error: "هذا الإجراء متاح للمعلمين فقط" };
  }

  // 2) Validate the entire exam payload with Zod
  const parsed = createExamServerSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return { error: firstError ?? "بيانات الامتحان غير صالحة" };
  }

  const { title, subjectId, duration, date, endDate, questions, studentIds } =
    parsed.data;

  // Verify the subject belongs to this teacher
  const subjectRecord = await prisma.subject.findFirst({
    where: { id: subjectId, teacherId: session.user.id },
    select: { name: true },
  });
  if (!subjectRecord) {
    return {
      error:
        "المادة المحددة غير موجودة أو لا تخصك. يجب إضافة المواد أولاً من صفحة الإعدادات",
    };
  }
  const resolvedSubject = subjectRecord.name;

  // Verify all studentIds are real STUDENT users
  const validStudents = await prisma.user.count({
    where: { id: { in: studentIds }, role: "STUDENT" },
  });
  if (validStudents !== studentIds.length) {
    return { error: "بعض الطلاب المحددين غير موجودين أو ليسوا طلاباً" };
  }

  try {
    // 3) Nested create: Exam → Questions → Options (single DB transaction)
    const exam = await prisma.exam.create({
      data: {
        title,
        subject: resolvedSubject,
        subjectId,
        duration,
        date,
        endDate: endDate ?? null,
        // teacherId is from the session — impossible to spoof
        teacherId: session.user.id,
        // Strictly connect only selected students
        allowedStudents: {
          connect: studentIds.map((id) => ({ id })),
        },
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            type: q.type,
            score: q.score,
            signLanguageUrl: q.signLanguageUrl || null,
            options: {
              create:
                q.type === "MCQ"
                  ? q.options.map((opt) => ({
                      text: opt.text,
                      isCorrect: opt.isCorrect,
                    }))
                  : [], // Essay questions don't have options
            },
          })),
        },
      },
      select: { id: true },
    });

    // 4) Revalidate the teacher's exam list page
    revalidatePath("/teacher/exams");

    return { success: true, examId: exam.id };
  } catch (err: unknown) {
    console.error("[createFullExam] Unexpected error:", err);
    const detail =
      process.env.NODE_ENV === "development" && err instanceof Error
        ? ` (${err.message})`
        : "";
    return {
      error: `حدث خطأ أثناء إنشاء الامتحان، يرجى المحاولة لاحقاً${detail}`,
    };
  }
}

// ─── Toggle Exam Status Action ───────────────────────────────
// Toggles between DRAFT <-> ACTIVE. ENDED exams cannot be toggled.

export async function toggleExamStatus(examId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "غير مصرح لك" };
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId, teacherId: session.user.id },
    select: {
      status: true,
      title: true,
      subject: true,
      date: true,
      duration: true,
      teacher: {
        select: { name: true, universityName: true, department: true },
      },
      allowedStudents: {
        select: { email: true, name: true },
      },
    },
  });

  if (!exam) {
    return { error: "الامتحان غير موجود" };
  }

  if (exam.status === "ENDED") {
    return { error: "لا يمكن تعديل امتحان مكتمل" };
  }

  const newStatus = exam.status === "DRAFT" ? "ACTIVE" : "DRAFT";

  await prisma.exam.update({
    where: { id: examId },
    data: { status: newStatus },
  });

  // ── Send notification emails when activating (DRAFT → ACTIVE) ──
  if (newStatus === "ACTIVE" && exam.allowedStudents.length > 0) {
    // Fire-and-forget: don't block the response on email delivery
    const examDate = exam.date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const examTime = exam.date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });

    sendExamNotificationEmails(exam.allowedStudents, {
      examTitle: exam.title,
      subjectName: exam.subject,
      examDate,
      examTime,
      durationMinutes: exam.duration,
      teacherName: exam.teacher.name,
    }).catch((err) => {
      console.error("[toggleExamStatus] Failed to send notifications:", err);
    });
  }

  revalidatePath("/teacher/exams");
  return { success: true, newStatus };
}

// ─── End Exam Action ─────────────────────────────────────────
// Permanently ends an ACTIVE exam. Students will see it as a past exam.

export async function endExam(examId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "غير مصرح لك" };
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId, teacherId: session.user.id },
    select: { status: true },
  });

  if (!exam) {
    return { error: "الامتحان غير موجود" };
  }

  if (exam.status !== "ACTIVE") {
    return { error: "يمكن إنهاء الامتحانات النشطة فقط" };
  }

  await prisma.exam.update({
    where: { id: examId },
    data: { status: "ENDED" },
  });

  revalidatePath("/teacher/exams");
  revalidatePath("/student/exams");
  return { success: true };
}

// ─── Delete Exam Action ──────────────────────────────────────

export async function deleteExam(examId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "غير مصرح لك" };
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId, teacherId: session.user.id },
    select: { id: true },
  });

  if (!exam) {
    return { error: "الامتحان غير موجود" };
  }

  await prisma.exam.delete({
    where: { id: examId },
  });

  revalidatePath("/teacher/exams");
  return { success: true };
}

// ─── Update Exam Action ──────────────────────────────────────
// Handles updating exam metadata, questions, and options.
// If students have already submitted results, only text corrections are allowed.

const UpdateExamSchema = createExamServerSchema.extend({
  id: z.string().min(1, "معرف الامتحان غير صالح"),
  // subjectId is not required for updates — the edit form sends the subject name directly
  subjectId: z.string().min(1, "يجب اختيار المادة الدراسية").optional(),
  // studentIds is optional for updates — if omitted, allowed students are not changed
  studentIds: z
    .array(z.string().min(1, "معرف الطالب غير صالح"))
    .min(1, "يجب اختيار طالب واحد على الأقل")
    .optional(),
});

export async function updateExam(data: z.infer<typeof UpdateExamSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك، يرجى تسجيل الدخول" };
  }

  if (session.user.role !== "TEACHER") {
    return { error: "هذا الإجراء متاح للمعلمين فقط" };
  }

  const parsed = UpdateExamSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return { error: firstError ?? "بيانات الامتحان غير صالحة" };
  }

  const { id, title, subject, duration, date, endDate, questions, studentIds } =
    parsed.data;

  // Verify studentIds if provided
  if (studentIds && studentIds.length > 0) {
    const validStudents = await prisma.user.count({
      where: { id: { in: studentIds }, role: "STUDENT" },
    });
    if (validStudents !== studentIds.length) {
      return { error: "بعض الطلاب المحددين غير موجودين أو ليسوا طلاباً" };
    }
  }

  // Fetch the existing exam + check ownership + count results
  const existingExam = await prisma.exam.findUnique({
    where: { id, teacherId: session.user.id },
    select: {
      id: true,
      status: true,
      _count: { select: { results: { where: { isArchived: false } } } },
      questions: {
        select: {
          id: true,
          options: { select: { id: true, isCorrect: true } },
        },
      },
    },
  });

  if (!existingExam) {
    return { error: "الامتحان غير موجود" };
  }

  if (existingExam.status === "ENDED") {
    return { error: "لا يمكن تعديل امتحان مكتمل" };
  }

  const hasResults = existingExam._count.results > 0;

  try {
    if (hasResults) {
      // ── Restricted mode: only text corrections allowed ──
      // Update exam metadata (title, subject, duration, date)
      // Update question texts and option texts ONLY
      // Do NOT change structure (add/delete questions/options) or correct answers

      await prisma.$transaction(async (tx) => {
        // Update exam metadata
        await tx.exam.update({
          where: { id },
          data: {
            title,
            subject,
            duration,
            date,
            endDate: endDate ?? null,
            // Update allowed students if provided
            ...(studentIds
              ? {
                  allowedStudents: {
                    set: studentIds.map((sid) => ({ id: sid })),
                  },
                }
              : {}),
          },
        });

        // Update question & option texts only (no structural changes)
        for (const q of questions) {
          const existingQuestion = existingExam.questions.find(
            (eq) => eq.id === (q as { id?: string }).id,
          );
          if (!existingQuestion) continue; // skip new questions in restricted mode

          await tx.question.update({
            where: { id: existingQuestion.id },
            data: { text: q.text, score: q.score },
          });

          if (q.type === "MCQ") {
            for (const opt of q.options) {
              const optWithId = opt as { id?: string; text: string };
              if (!optWithId.id) continue; // skip new options in restricted mode
              const existingOpt = existingQuestion.options.find(
                (eo) => eo.id === optWithId.id,
              );
              if (!existingOpt) continue;

              // Only update text, NOT isCorrect
              await tx.option.update({
                where: { id: existingOpt.id },
                data: { text: optWithId.text },
              });
            }
          }
        }
      });
    } else {
      // ── Full edit mode: delete all questions and recreate ──
      await prisma.$transaction(async (tx) => {
        // Delete all existing questions (cascades to options)
        await tx.question.deleteMany({ where: { examId: id } });

        // Update exam metadata and recreate questions
        await tx.exam.update({
          where: { id },
          data: {
            title,
            subject,
            duration,
            date,
            endDate: endDate ?? null,
            // Update allowed students if provided
            ...(studentIds
              ? {
                  allowedStudents: {
                    set: studentIds.map((sid) => ({ id: sid })),
                  },
                }
              : {}),
            questions: {
              create: questions.map((q) => ({
                text: q.text,
                type: q.type,
                score: q.score,
                options: {
                  create:
                    q.type === "MCQ"
                      ? q.options.map((opt) => ({
                          text: opt.text,
                          isCorrect: opt.isCorrect,
                        }))
                      : [],
                },
              })),
            },
          },
        });
      });
    }

    revalidatePath("/teacher/exams");
    revalidatePath(`/teacher/exams/${id}/edit`);
    revalidatePath(`/teacher/exams/${id}/key`);

    return { success: true, examId: id };
  } catch (err: unknown) {
    console.error("[updateExam] Unexpected error:", err);
    return { error: "حدث خطأ أثناء تعديل الامتحان، يرجى المحاولة لاحقاً" };
  }
}

/**
 * ─── Start Exam Attempt Action ──────────────────────────────────
 * Called when a student clicks "Start Exam". Initializes a Result record.
 * This ensures the Teacher's Live Monitor sees the student as "In Progress"
 * the moment they enter.
 */
export async function startExamAttempt(examId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "STUDENT") {
    return { error: "غير مصرح لك" };
  }

  const studentId = session.user.id;

  try {
    // 1. Check if a Result already exists for this attempt
    // We only care about non-archived results for the current session.
    const existing = await prisma.result.findFirst({
      where: {
        examId,
        studentId,
        isArchived: false,
      },
    });

    // If already IN_PROGRESS, just return success
    if (existing && existing.status === "IN_PROGRESS") {
      return { success: true, alreadyExists: true };
    }
    // If already terminal, block
    if (existing) {
      return { error: "تم أداء هذا الامتحان مسبقاً" };
    }

    // 2. Create the initialization record
    // Note: we set score/marks to 0 initially.
    await prisma.result.create({
      data: {
        examId,
        studentId,
        status: "IN_PROGRESS",
        score: 0,
        maxScore: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        timeTaken: 0,
        isArchived: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[startExamAttempt] Error:", error);
    return { error: "فشل استهلال محاولة الامتحان" };
  }
}
