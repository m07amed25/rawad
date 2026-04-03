import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, username } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
  appName: process.env.APP_NAME ?? "RAWAD",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      }
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        input: true,
      },

      onboardingCompleted: {
        type: "boolean",
        required: false,
        input: true,
        defaultValue: false,
      },
      isProfileComplete: {
        type: "boolean",
        required: false,
        input: false,
        defaultValue: false,
      },
      nationalId: {
        type: "string",
        required: false,
        input: true,
      },
      universityName: {
        type: "string",
        required: false,
        input: true,
      },
      studentCode: {
        type: "string",
        required: false,
        input: true,
      },
      disabilityType: {
        type: "string",
        required: false,
        input: true,
      },
      college: {
        type: "string",
        required: false,
        input: false,
      },
      department: {
        type: "string",
        required: false,
        input: false,
      },
      academicYear: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  plugins: [
    nextCookies(),
    username(),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 3,
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendOtpEmail({ to: email, otp, purpose: type });
      },
    }),
  ],
});
