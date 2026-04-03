"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { completeAcademicProfileSchema } from "@/lib/validations";

export async function completeAcademicProfile(formData: {
  universityName: string;
  college: string;
  department?: string;
  academicYear: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك" };
  }

  if (session.user.role !== "STUDENT") {
    return { error: "هذا الإجراء متاح للطلاب فقط" };
  }

  const parsed = completeAcademicProfileSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return { error: firstError ?? "بيانات غير صالحة" };
  }

  const { universityName, college, department, academicYear } = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      universityName,
      college,
      department: department ?? null,
      academicYear,
      isProfileComplete: true,
    },
  });

  redirect("/student");
}
