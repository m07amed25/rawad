"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {
  IconMail,
  IconUser,
  IconLock,
  IconSchool,
  IconChalkboard,
} from "@tabler/icons-react";
import { getErrorMessage } from "@/lib/error-handler";
import { AuthInput } from "@/components/ui/auth-input";
import { AuthButton } from "@/components/ui/auth-button";
import {
  PasswordStrength,
  isPasswordStrong,
} from "@/components/ui/password-strength";
import { Magnetic } from "@/components/ui/magnetic";
import { GsapTextReveal } from "@/components/ui/gsap-text-reveal";
import { GsapStagger } from "@/components/ui/gsap-stagger";
import gsap from "gsap";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const otpContainerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });
  const roleRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (roleRef.current) {
        gsap.from(roleRef.current, {
          y: 15,
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          delay: 0.25,
          ease: "back.out(1.7)",
        });
      }
      if (dividerRef.current) {
        gsap.from(dividerRef.current.children, {
          scaleX: 0,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.9,
          ease: "power2.out",
        });
      }
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          y: 15,
          opacity: 0,
          duration: 0.5,
          delay: 1.1,
          ease: "power2.out",
        });
      }
    });
    return () => ctx.revert();
  }, []);

  // Animate sliding indicator on role change
  useEffect(() => {
    const container = roleRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const buttons = container.querySelectorAll<HTMLButtonElement>("button");
    const activeIndex = formData.role === "STUDENT" ? 0 : 1;
    const target = buttons[activeIndex];
    if (!target) return;

    gsap.to(indicator, {
      x: target.offsetLeft,
      width: target.offsetWidth,
      duration: 0.35,
      ease: "power2.out",
    });

    // Bounce the active icon
    const icon = target.querySelector("svg");
    if (icon) {
      gsap.fromTo(
        icon,
        { scale: 0.6, rotation: -15 },
        { scale: 1, rotation: 0, duration: 0.4, ease: "back.out(2)" },
      );
    }
  }, [formData.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "الاسم الأول مطلوب";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "الاسم الأول يجب أن يكون حرفين على الأقل";
    }

    if (!formData.middleName.trim()) {
      errors.middleName = "الاسم الأوسط مطلوب";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "الاسم الأخير مطلوب";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "الاسم الأخير يجب أن يكون حرفين على الأقل";
    }

    if (!formData.email.trim()) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }

    if (!formData.username.trim()) {
      errors.username = "اسم المستخدم مطلوب";
    } else if (formData.username.trim().length < 3) {
      errors.username = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username =
        "اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام فقط";
    }

    if (!formData.password) {
      errors.password = "كلمة المرور مطلوبة";
    } else if (!isPasswordStrong(formData.password)) {
      errors.password = "كلمة المرور غير قوية بما يكفي";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const fullName =
        `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim();

      const { error } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: fullName,
        username: formData.username,
        // @ts-expect-error custom fields aren't strongly typed without passing typeof auth natively
        role: formData.role,
      });

      if (error) {
        setError(getErrorMessage(error.message || error));
        setLoading(false);
        return;
      }

      // Send verification OTP
      const otpRes = await authClient.emailOtp.sendVerificationOtp({
        email: formData.email,
        type: "email-verification",
      });

      if (otpRes.error) {
        setError(getErrorMessage(otpRes.error.message || otpRes.error));
        setLoading(false);
        return;
      }

      setStep("otp");
      setLoading(false);
      setError("");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && otpInputsRef.current[index]) {
      gsap.fromTo(
        otpInputsRef.current[index],
        { scale: 1.15, borderColor: "#3b82f6" },
        { scale: 1, duration: 0.3, ease: "back.out(1.7)" },
      );
    }

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setOtpDigits(newDigits);
    const focusIdx = Math.min(pasted.length, 5);
    otpInputsRef.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setError("يرجى إدخال الرمز المكوّن من 6 أرقام");
      setLoading(false);
      return;
    }

    try {
      const res = await authClient.emailOtp.verifyEmail({
        email: formData.email,
        otp,
      });

      if (res.error) {
        setError(getErrorMessage(res.error.message || res.error));
        if (otpContainerRef.current) {
          gsap.fromTo(
            otpContainerRef.current,
            { x: -8 },
            { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" },
          );
        }
        setLoading(false);
        return;
      }

      if (formData.role === "STUDENT") {
        router.push("/welcome/student");
      } else {
        router.push("/welcome/teacher");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  if (step === "otp") {
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
            {formData.email}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl mb-5 text-sm text-center font-cairo">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyOtp}>
          <div
            ref={otpContainerRef}
            className="flex justify-center gap-2 mb-6"
            dir="ltr"
          >
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  otpInputsRef.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-cairo"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <Magnetic strength={0.15}>
            <AuthButton loading={loading} type="submit">
              تأكيد الرمز
            </AuthButton>
          </Magnetic>
        </form>

        <p className="text-center text-sm text-gray-500 font-cairo mt-6">
          لم تستلم الرمز؟{" "}
          <button
            type="button"
            onClick={async () => {
              setError("");
              await authClient.emailOtp.sendVerificationOtp({
                email: formData.email,
                type: "email-verification",
              });
            }}
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            إعادة الإرسال
          </button>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="text-center mb-4">
        <GsapTextReveal
          as="h1"
          className="text-2xl font-extrabold text-gray-900 font-cairo"
          mode="words"
          delay={0.1}
          stagger={0.06}
        >
          إنشاء حساب
        </GsapTextReveal>
        <GsapTextReveal
          as="p"
          className="text-gray-400 mt-1.5 text-sm font-cairo"
          mode="words"
          delay={0.35}
          stagger={0.05}
        >
          مرحباً بك في رواد، يرجى تعبئة بياناتك
        </GsapTextReveal>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl mb-4 text-sm text-center font-cairo animate-[shake_0.5s_ease-in-out]">
          {error}
        </div>
      )}

      {/* Role Toggle */}
      <div
        ref={roleRef}
        className="relative flex bg-gray-100 rounded-xl p-1 mb-5"
      >
        <div
          ref={indicatorRef}
          className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm pointer-events-none"
          style={{ width: "50%", left: 0 }}
        />
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setFormData((prev) => ({ ...prev, role: "STUDENT" }))}
          className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-semibold font-cairo flex items-center justify-center gap-1.5 transition-colors duration-200 ${
            formData.role === "STUDENT"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <IconSchool className="size-4" />
          طالب
        </button>
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setFormData((prev) => ({ ...prev, role: "TEACHER" }))}
          className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-semibold font-cairo flex items-center justify-center gap-1.5 transition-colors duration-200 ${
            formData.role === "TEACHER"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <IconChalkboard className="size-4" />
          معلم / دكتور
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <GsapStagger className="space-y-3" stagger={0.08} delay={0.35}>
          {/* Name Row */}
          <div className="grid grid-cols-3 gap-2">
            <AuthInput
              label="الاسم الأول"
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="أحمد"
              errorMessage={fieldErrors.firstName}
            />
            <AuthInput
              label="الاسم الأوسط"
              required
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="محمد"
              errorMessage={fieldErrors.middleName}
            />
            <AuthInput
              label="الاسم الأخير"
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="علي"
              errorMessage={fieldErrors.lastName}
            />
          </div>

          {/* Email */}
          <div>
            <AuthInput
              label="البريد الإلكتروني"
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              icon={<IconMail className="size-4" />}
              errorMessage={fieldErrors.email}
            />
          </div>

          {/* Username */}
          <div>
            <AuthInput
              label="اسم المستخدم"
              required
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="ahmed_ali"
              icon={<IconUser className="size-4" />}
              errorMessage={fieldErrors.username}
            />
          </div>

          {/* Password Row */}
          <div className="grid grid-cols-2 gap-2">
            <AuthInput
              label="كلمة المرور"
              type="password"
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<IconLock className="size-4" />}
              errorMessage={fieldErrors.password}
            />
            <AuthInput
              label="تأكيد كلمة المرور"
              type="password"
              required
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<IconLock className="size-4" />}
              errorMessage={fieldErrors.confirmPassword}
            />
          </div>

          {/* Password Strength */}
          {formData.password && (
            <PasswordStrength password={formData.password} />
          )}
        </GsapStagger>

        <div className="mt-5">
          <Magnetic strength={0.15}>
            <AuthButton loading={loading} type="submit">
              إنشاء الحساب
            </AuthButton>
          </Magnetic>
        </div>
      </form>

      {/* Divider */}
      <div ref={dividerRef} className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200 origin-right" />
        <span className="text-xs text-gray-400 font-cairo">أو</span>
        <div className="flex-1 h-px bg-gray-200 origin-left" />
      </div>

      <p
        ref={footerRef}
        className="text-center text-sm text-gray-500 font-cairo"
      >
        لديك حساب بالفعل؟{" "}
        <Link
          href="/auth/sign-in"
          className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
        >
          تسجيل الدخول
        </Link>
      </p>
    </>
  );
}
