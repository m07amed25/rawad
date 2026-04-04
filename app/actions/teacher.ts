"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Validation ──────────────────────────────────────────────

const completeTeacherProfileSchema = z.object({
  universityName: z
    .string()
    .trim()
    .min(2, "يرجى إدخال اسم الجامعة")
    .max(150, "اسم الجامعة طويل جداً"),
  college: z
    .string()
    .trim()
    .max(150, "اسم الكلية طويل جداً")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  department: z
    .string()
    .trim()
    .min(2, "يرجى إدخال اسم القسم الأكاديمي")
    .max(150, "اسم القسم طويل جداً"),
});

// ─── Complete Teacher Profile ────────────────────────────────

export async function completeTeacherProfile(formData: {
  universityName: string;
  college?: string;
  department: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك" };
  }

  if (session.user.role !== "TEACHER") {
    return { error: "هذا الإجراء متاح للمعلمين فقط" };
  }

  const parsed = completeTeacherProfileSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return { error: firstError ?? "بيانات غير صالحة" };
  }

  const { universityName, college, department } = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      universityName,
      college: college ?? null,
      department,
      isProfileComplete: true,
    },
  });

  redirect("/teacher");
}

// ─── Get Students For Teacher ────────────────────────────────

export async function getStudentsForTeacher(teacherId: string) {
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { universityName: true, department: true, role: true },
  });

  if (!teacher || teacher.role !== "TEACHER") {
    return [];
  }

  if (!teacher.universityName || !teacher.department) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      role: "STUDENT",
      universityName: teacher.universityName,
      department: teacher.department,
      isProfileComplete: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      nationalId: true,
      studentCode: true,
      college: true,
      department: true,
      academicYear: true,
      disabilityType: true,
    },
    orderBy: { name: "asc" },
  });
}

// ─── Reset Student Attempt (Soft Delete / Archive) ───────────

const resetAttemptSchema = z.object({
  examId: z.string().min(1, "معرف الامتحان غير صالح"),
  studentId: z.string().min(1, "معرف الطالب غير صالح"),
});

export async function resetStudentAttempt(examId: string, studentId: string) {
  // ── 1. Auth: only TEACHER can reset ────────────────────────
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
  const parsed = resetAttemptSchema.safeParse({ examId, studentId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  try {
    // ── 3. Verify teacher owns the exam ──────────────────────
    const exam = await prisma.exam.findUnique({
      where: { id: examId, teacherId },
      select: { id: true },
    });

    if (!exam) {
      return { error: "الامتحان غير موجود أو لا يخصك" };
    }

    // ── 4. Check that an active (non-archived) result exists ─
    const activeResult = await prisma.result.findFirst({
      where: { examId, studentId, isArchived: false },
      select: { id: true },
    });

    if (!activeResult) {
      return { error: "لا توجد محاولة نشطة لهذا الطالب" };
    }

    // ── 5. Archive in a transaction ──────────────────────────
    await prisma.$transaction(async (tx) => {
      // 5a. Archive the Result
      await tx.result.updateMany({
        where: { examId, studentId, isArchived: false },
        data: { isArchived: true },
      });

      // 5b. Archive the StudentAnswer records
      await tx.studentAnswer.updateMany({
        where: { examId, studentId, isArchived: false },
        data: { isArchived: true },
      });
    });

    // ── 6. Revalidate affected pages ─────────────────────────
    revalidatePath(`/teacher/results/${examId}`);
    revalidatePath("/teacher/results");
    revalidatePath("/student");
    revalidatePath("/student/results");

    return { success: true, message: "تم أرشفة المحاولة بنجاح — يمكن للطالب إعادة الامتحان الآن" };
  } catch (err: unknown) {
    console.error("[resetStudentAttempt] Unexpected error:", err);
    return { error: "حدث خطأ أثناء إعادة تعيين المحاولة" };
  }
}
