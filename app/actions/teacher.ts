"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
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
