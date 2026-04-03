"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { sendOtpEmail, sendPasswordChangedEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";
import { DisabilityType } from "@prisma/client";

export async function completeStudentProfile(data: {
  nationalId: string;
  universityName: string;
  studentCode: string;
  disabilityType: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك" };
  }

  // Validate nationalId
  const nationalId = data.nationalId?.trim();
  if (!nationalId || !/^\d{14}$/.test(nationalId)) {
    return { error: "الرقم القومي يجب أن يكون 14 رقماً" };
  }

  // Validate universityName
  const universityName = data.universityName?.trim();
  if (!universityName) {
    return { error: "يرجى إدخال اسم الجامعة" };
  }

  // Validate studentCode
  const studentCode = data.studentCode?.trim();
  if (!studentCode) {
    return { error: "يرجى إدخال رقم الطالب" };
  }

  // Validate disabilityType
  const validDisabilities: string[] = Object.values(DisabilityType);
  if (!validDisabilities.includes(data.disabilityType)) {
    return { error: "نوع الإعاقة غير صالح" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        nationalId,
        universityName,
        studentCode,
        disabilityType: data.disabilityType as DisabilityType,
      },
    });

    return { success: true };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      const meta = (err as { meta?: { target?: string[] } }).meta;
      if (meta?.target?.includes("nationalId")) {
        return { error: "الرقم القومي مسجل بالفعل لحساب آخر" };
      }
      return { error: "البيانات المدخلة مسجلة بالفعل لحساب آخر" };
    }
    throw err;
  }
}

export async function completeTeacherProfile(data: { nationalId: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك" };
  }

  // Validate nationalId
  const nationalId = data.nationalId?.trim();
  if (!nationalId || !/^\d{14}$/.test(nationalId)) {
    return { error: "الرقم القومي يجب أن يكون 14 رقماً" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        nationalId,
      },
    });

    return { success: true };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { error: "الرقم القومي مسجل بالفعل لحساب آخر" };
    }
    throw err;
  }
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // We shouldn't throw error to prevent email enumeration, but for UX we can return generic success.
    return { success: true };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Cleanup old verifications for this email
  await prisma.verification.deleteMany({
    where: { identifier: email },
  });

  await prisma.verification.create({
    data: {
      identifier: email,
      value: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  });

  await sendOtpEmail({ to: email, otp, purpose: "forget-password" });
  return { success: true };
}

export async function verifyOTP(email: string, otp: string) {
  const verification = await prisma.verification.findFirst({
    where: {
      identifier: email,
      value: otp,
      expiresAt: { gt: new Date() },
    },
  });

  if (!verification) {
    return { error: "رمز التحقق غير صحيح أو منتهي الصلاحية" };
  }

  return { success: true };
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
) {
  // Verify again to be secure
  const verification = await prisma.verification.findFirst({
    where: {
      identifier: email,
      value: otp,
      expiresAt: { gt: new Date() },
    },
  });

  if (!verification) {
    return { error: "رمز التحقق غير صحيح أو منتهي الصلاحية" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "لم يتم العثور على الحساب" };

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update Better Auth Account password
  await prisma.account.updateMany({
    where: {
      userId: user.id,
      providerId: "credential", // standard better auth credentials provider ID
    },
    data: {
      password: hashedPassword,
    },
  });

  // Delete the OTP
  await prisma.verification.delete({
    where: { id: verification.id },
  });

  // Notify user that their password was changed
  await sendPasswordChangedEmail(email);

  return { success: true };
}
