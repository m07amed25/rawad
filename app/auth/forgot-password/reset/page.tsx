"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/app/actions/auth-actions";
import { Loader2 } from "lucide-react";
import { IconLock } from "@tabler/icons-react";
import { getErrorMessage } from "@/lib/error-handler";
import { AuthInput } from "@/components/ui/auth-input";
import { AuthButton } from "@/components/ui/auth-button";
import { Magnetic } from "@/components/ui/magnetic";
import { GsapTextReveal } from "@/components/ui/gsap-text-reveal";
import { GsapStagger } from "@/components/ui/gsap-stagger";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("كلمات المرور لا تتطابق");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(email, otp, password);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push(`/auth/sign-in?reset=success`);
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
          كلمة مرور جديدة
        </GsapTextReveal>
        <GsapTextReveal
          as="p"
          className="text-gray-400 mt-2 text-sm font-cairo"
          mode="words"
          delay={0.4}
          stagger={0.05}
        >
          أدخل كلمة المرور الجديدة أدناه
        </GsapTextReveal>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl mb-5 text-sm text-center font-cairo animate-[shake_0.5s_ease-in-out]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <GsapStagger className="space-y-4" stagger={0.12} delay={0.3}>
          <div>
            <AuthInput
              label="كلمة المرور الجديدة"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة"
              icon={<IconLock className="size-4" />}
              error={!!error}
            />
          </div>

          <div>
            <AuthInput
              label="تأكيد كلمة المرور"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور"
              icon={<IconLock className="size-4" />}
              error={!!error}
            />
          </div>
        </GsapStagger>

        <div className="mt-6">
          <Magnetic strength={0.15}>
            <AuthButton loading={loading} type="submit">
              تعيين كلمة المرور
            </AuthButton>
          </Magnetic>
        </div>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
