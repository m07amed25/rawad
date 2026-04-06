"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * Change the currently logged-in user's password.
 * Verifies the current password before updating.
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك، يرجى تسجيل الدخول" };
  }

  if (!data.currentPassword || !data.newPassword) {
    return { error: "يرجى ملء جميع الحقول" };
  }

  if (data.newPassword.length < 8) {
    return { error: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" };
  }

  // Fetch the user's credential account
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "credential",
    },
  });

  if (!account?.password) {
    return { error: "لا يوجد كلمة مرور مرتبطة بهذا الحساب" };
  }

  // Verify current password
  const isValid = await bcrypt.compare(data.currentPassword, account.password);
  if (!isValid) {
    return { error: "كلمة المرور الحالية غير صحيحة" };
  }

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await prisma.account.update({
    where: { id: account.id },
    data: { password: hashedPassword },
  });

  return { success: true };
}

/**
 * Get current user's settings-relevant data from session + DB.
 */
export async function getCurrentUserData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      universityName: true,
      department: true,
      role: true,
    },
  });

  return user;
}

/**
 * Update current user's display name.
 */
export async function updateUserName(name: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك" };
  }

  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) {
    return { error: "الاسم يجب أن يكون حرفين على الأقل" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
  });

  return { success: true };
}

/**
 * Update current user's profile image URL.
 */
export async function updateUserImage(imageUrl: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "غير مصرح لك" };
  }

  if (!imageUrl) {
    return { error: "رابط الصورة غير صالح" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  });

  return { success: true };
}
