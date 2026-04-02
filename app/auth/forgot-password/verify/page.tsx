"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOTP } from "@/app/actions/auth-actions";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/error-handler";
import { AuthButton } from "@/components/ui/auth-button";
import { Magnetic } from "@/components/ui/magnetic";
import { GsapTextReveal } from "@/components/ui/gsap-text-reveal";
import gsap from "gsap";

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digitsContainerRef = useRef<HTMLDivElement>(null);

  const otp = digits.join("");

  useEffect(() => {
    if (digitsContainerRef.current) {
      const inputs = digitsContainerRef.current.querySelectorAll("input");
      gsap.fromTo(
        inputs,
        { scale: 0, opacity: 0, y: 20 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          delay: 0.4,
          ease: "back.out(2)",
          clearProps: "all",
        },
      );
    }
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Pulse animation on input
    if (value && inputsRef.current[index]) {
      gsap.fromTo(
        inputsRef.current[index],
        { scale: 1.15, borderColor: "#3b82f6" },
        { scale: 1, duration: 0.3, ease: "back.out(1.7)" },
      );
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await verifyOTP(email, otp);
      if (res.error) {
        setError(res.error);
        // Shake the inputs on error
        if (digitsContainerRef.current) {
          gsap.fromTo(
            digitsContainerRef.current,
            { x: -8 },
            { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" },
          );
        }
        setLoading(false);
        return;
      }
      router.push(
        `/auth/forgot-password/reset?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
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
          رمز التحقق
        </GsapTextReveal>
        <GsapTextReveal
          as="p"
          className="text-gray-400 mt-2 text-sm font-cairo"
          mode="words"
          delay={0.3}
          stagger={0.05}
        >
          أدخل الرمز المكوّن من 6 أرقام المُرسل إلى
        </GsapTextReveal>
        <p
          className="text-gray-700 text-sm font-semibold font-cairo mt-1"
          dir="ltr"
        >
          {email}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl mb-5 text-sm text-center font-cairo">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          ref={digitsContainerRef}
          className="flex gap-2 justify-center"
          dir="ltr"
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center text-xl font-bold text-gray-900 bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-cairo"
            />
          ))}
        </div>

        <div className="mt-6">
          <Magnetic strength={0.15}>
            <AuthButton
              loading={loading}
              type="submit"
              disabled={otp.length !== 6}
            >
              تحقق
            </AuthButton>
          </Magnetic>
        </div>
      </form>
    </>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
        </div>
      }
    >
      <VerifyOTPForm />
    </Suspense>
  );
}
