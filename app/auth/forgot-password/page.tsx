"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/app/actions/auth-actions";
import Link from "next/link";
import { IconMail } from "@tabler/icons-react";
import { getErrorMessage } from "@/lib/error-handler";
import { AuthInput } from "@/components/ui/auth-input";
import { AuthButton } from "@/components/ui/auth-button";
import { Magnetic } from "@/components/ui/magnetic";
import { GsapTextReveal } from "@/components/ui/gsap-text-reveal";
import { GsapStagger } from "@/components/ui/gsap-stagger";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(email);
      router.push(
        `/auth/forgot-password/verify?email=${encodeURIComponent(email)}`,
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <GsapTextReveal
          as="h1"
          className="text-3xl font-extrabold text-gray-900 font-cairo"
          mode="words"
          delay={0.1}
          stagger={0.06}
        >
          نسيت كلمة المرور
        </GsapTextReveal>
        <GsapTextReveal
          as="p"
          className="text-gray-400 mt-2 text-sm font-cairo"
          mode="words"
          delay={0.4}
          stagger={0.05}
        >
          أدخل بريدك الإلكتروني لإرسال رمز التحقق
        </GsapTextReveal>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl mb-5 text-sm text-center font-cairo animate-[shake_0.5s_ease-in-out]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <GsapStagger stagger={0.12} delay={0.3}>
          <div>
            <AuthInput
              label="البريد الإلكتروني"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
              icon={<IconMail className="size-4" />}
              error={!!error}
            />
          </div>
        </GsapStagger>

        <div className="mt-6">
          <Magnetic strength={0.15}>
            <AuthButton loading={loading} type="submit">
              إرسال الرمز
            </AuthButton>
          </Magnetic>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 font-cairo">
        <Link
          href="/auth/sign-in"
          className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
        >
          العودة لتسجيل الدخول
        </Link>
      </p>
    </>
  );
}
