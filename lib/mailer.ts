import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import OtpEmail from "@/emails/OtpEmail";
import PasswordChangedEmail from "@/emails/PasswordChangedEmail";
import ExamNotificationEmail from "@/emails/ExamNotificationEmail";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendOtpParams {
  to: string;
  otp: string;
  purpose: string;
}

export const sendOtpEmail = async ({ to, otp, purpose }: SendOtpParams) => {
  const html = await render(OtpEmail({ otp, purpose }));

  await transporter.sendMail({
    from: `"RAWAD App" <${process.env.SMTP_USER}>`,
    to,
    subject:
      purpose === "forget-password" ? "Reset your password" : "Your OTP Code",
    html,
  });
};

export const sendPasswordChangedEmail = async (to: string) => {
  const html = await render(PasswordChangedEmail());

  await transporter.sendMail({
    from: `"RAWAD App" <${process.env.SMTP_USER}>`,
    to,
    subject: "تم تغيير كلمة المرور",
    html,
  });
};

interface ExamNotificationParams {
  examTitle: string;
  subjectName: string;
  examDate: string;
  examTime: string;
  durationMinutes: number;
  teacherName: string;
}

/**
 * Sends exam notification emails to a list of students.
 * Emails are sent concurrently in batches of 5 to avoid SMTP rate limits.
 */
export const sendExamNotificationEmails = async (
  students: { email: string; name: string }[],
  examInfo: ExamNotificationParams,
) => {
  const BATCH_SIZE = 5;

  for (let i = 0; i < students.length; i += BATCH_SIZE) {
    const batch = students.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (student) => {
        try {
          const html = await render(
            ExamNotificationEmail({
              studentName: student.name,
              ...examInfo,
            }),
          );

          await transporter.sendMail({
            from: `"RAWAD App" <${process.env.SMTP_USER}>`,
            to: student.email,
            subject: `امتحان جديد متاح: ${examInfo.examTitle}`,
            html,
          });
        } catch (err) {
          console.error(
            `[sendExamNotification] Failed to send to ${student.email}:`,
            err,
          );
        }
      }),
    );
  }
};
