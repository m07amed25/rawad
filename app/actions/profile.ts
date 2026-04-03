"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  studentProfileSchema,
  teacherProfileSchema,
} from "@/lib/validations";

// ─── Complete Profile Action ─────────────────────────────────
// Unified profile completion for both STUDENT and TEACHER roles.
// Session is verified server-side — no client data is trusted for identity.

export async function completeProfile(formData: {
  university: string;
  department: string;
  academicYear?: string;
  disabilityType?: string;
}) {
  // 1) Authenticate: read session from server cookies
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك، يرجى تسجيل الدخول" };
  }

  const { role } = session.user;

  try {
    if (role === "STUDENT") {
      // 2a) Validate student-specific payload
      const parsed = studentProfileSchema.safeParse(formData);
      if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message;
        return { error: firstError ?? "بيانات غير صالحة" };
      }

      const { university, department, academicYear, disabilityType } =
        parsed.data;

      // 3a) Update student profile & mark complete
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          universityName: university,
          department,
          academicYear,
          disabilityType,
          isProfileComplete: true,
        },
      });

      // 4a) Redirect student to dashboard
      redirect("/student");
    } else if (role === "TEACHER") {
      // 2b) Validate teacher-specific payload
      const parsed = teacherProfileSchema.safeParse(formData);
      if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message;
        return { error: firstError ?? "بيانات غير صالحة" };
      }

      const { university, department } = parsed.data;

      // 3b) Update teacher profile & mark complete
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          universityName: university,
          department,
          isProfileComplete: true,
        },
      });

      // 4b) Redirect teacher to dashboard
      redirect("/teacher");
    } else {
      return { error: "دور المستخدم غير معروف" };
    }
  } catch (err: unknown) {
    // Re-throw Next.js redirect (it uses a special NEXT_REDIRECT error)
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }

    // Handle Prisma unique constraint violations
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { error: "البيانات المدخلة مسجلة بالفعل لحساب آخر" };
    }

    console.error("[completeProfile] Unexpected error:", err);
    return { error: "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً" };
  }
}
