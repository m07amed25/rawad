import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import OtpEmail from "@/emails/OtpEmail";
import PasswordChangedEmail from "@/emails/PasswordChangedEmail";

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
