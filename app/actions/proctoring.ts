"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { z } from "zod";
import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import CheatAlertEmail from "@/emails/CheatAlertEmail";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const VALID_VIOLATION_TYPES = ["TAB_SWITCH", "EXITED_FULLSCREEN"] as const;

const reportSchema = z.object({
  examId: z.string().uuid(),
  violationType: z.enum(VALID_VIOLATION_TYPES),
});

/**
 * Reports a cheat violation for the currently authenticated student.
 * - Increments violationsCount on the student's Result (upserts if needed).
 * - Sends an urgent email to the teacher who owns the exam.
 */
export async function reportCheatViolation(input: {
  examId: string;
  violationType: string;
}) {
  // ── 1. Authenticate ────────────────────────────────────────
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "STUDENT") {
    return { error: "غير مصرح" };
  }

  // ── 2. Validate input ──────────────────────────────────────
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "بيانات غير صالحة" };
  }

  const { examId, violationType } = parsed.data;
  const studentId = session.user.id;

  try {
    // ── 3. Fetch exam + teacher info in one query ──────────────
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        title: true,
        subject: true,
        teacher: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!exam) {
      return { error: "الامتحان غير موجود" };
    }

    // ── 4. Increment violations count ────────────────────────────
    // Use upsert: if no Result row yet (exam still in progress, not submitted),
    // create a placeholder row so violations are tracked from the start.
    await prisma.result.upsert({
      where: {
        studentId_examId_isArchived: { studentId, examId, isArchived: false },
      },
      update: {
        violationsCount: { increment: 1 },
      },
      create: {
        studentId,
        examId,
        score: 0,
        maxScore: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        timeTaken: 0,
        violationsCount: 1,
        status: "UNDER_GRADING",
        isArchived: false,
      },
    });

    // ── 5. Send email to teacher (fire-and-forget) ───────────────
    const studentName = session.user.name;
    const timestamp = new Date().toLocaleString("ar-EG", {
      timeZone: "Africa/Cairo",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Don't await — we don't want to block the client on email delivery.
    sendCheatAlertEmail({
      teacherEmail: exam.teacher.email,
      studentName,
      examTitle: exam.title,
      violationType,
      timestamp,
    }).catch((err) => {
      console.error("[reportCheatViolation] Email send failed:", err);
    });

    return { success: true };
  } catch (err) {
    console.error("[reportCheatViolation] DB error:", err);
    return { error: "حدث خطأ أثناء تسجيل المخالفة" };
  }
}

// ─── Internal email helper ───────────────────────────────────────────────────

async function sendCheatAlertEmail(params: {
  teacherEmail: string;
  studentName: string;
  examTitle: string;
  violationType: string;
  timestamp: string;
}) {
  const html = await render(
    CheatAlertEmail({
      studentName: params.studentName,
      examTitle: params.examTitle,
      violationType: params.violationType,
      timestamp: params.timestamp,
    }),
  );

  await transporter.sendMail({
    from: `"RAWAD App" <${process.env.SMTP_USER}>`,
    to: params.teacherEmail,
    subject: "تنبيه غش: خروج عن شاشة الامتحان",
    html,
  });
}
