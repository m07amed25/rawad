"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  updateSubjectsSchema,
  type SubjectInput,
} from "@/lib/validations";

export async function updateTeacherSubjects(data: SubjectInput[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك، يرجى تسجيل الدخول" };
  }

  if (session.user.role !== "TEACHER") {
    return { error: "هذا الإجراء متاح للمعلمين فقط" };
  }

  const parsed = updateSubjectsSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return { error: firstError ?? "بيانات المواد غير صالحة" };
  }

  const teacherId = session.user.id;
  const subjects = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Get existing subjects for this teacher
      const existing = await tx.subject.findMany({
        where: { teacherId },
        select: { id: true },
      });

      const existingIds = new Set(existing.map((s) => s.id));
      const incomingIds = new Set(
        subjects.filter((s) => s.id).map((s) => s.id!),
      );

      // IDs to delete: existing but not in the incoming list
      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

      // Delete removed subjects (Restrict on Exam will throw if exams reference them)
      if (toDelete.length > 0) {
        await tx.subject.deleteMany({
          where: { id: { in: toDelete }, teacherId },
        });
      }

      // Upsert: update existing, create new
      for (const subject of subjects) {
        if (subject.id && existingIds.has(subject.id)) {
          await tx.subject.update({
            where: { id: subject.id, teacherId },
            data: {
              name: subject.name,
              academicYear: subject.academicYear,
            },
          });
        } else {
          await tx.subject.create({
            data: {
              name: subject.name,
              academicYear: subject.academicYear,
              teacherId,
            },
          });
        }
      }
    });

    revalidatePath("/teacher/settings");
    revalidatePath("/teacher/settings/subjects");
    revalidatePath("/teacher/exams/create");

    return { success: true };
  } catch (err: unknown) {
    console.error("[updateTeacherSubjects] Error:", err);

    // Check for Prisma foreign key constraint error (subject used by exams)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2003"
    ) {
      return {
        error:
          "لا يمكن حذف مادة مرتبطة بامتحانات موجودة. قم بحذف الامتحانات أولاً.",
      };
    }

    return { error: "حدث خطأ أثناء حفظ المواد، يرجى المحاولة لاحقاً" };
  }
}

export async function getTeacherSubjects() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "TEACHER") {
    return [];
  }

  return prisma.subject.findMany({
    where: { teacherId: session.user.id },
    select: {
      id: true,
      name: true,
      academicYear: true,
    },
    orderBy: { createdAt: "asc" },
  });
}
