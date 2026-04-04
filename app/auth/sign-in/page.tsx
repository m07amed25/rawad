"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { IconUser, IconLock } from "@tabler/icons-react";
import { getErrorMessage } from "@/lib/error-handler";
import { AuthInput } from "@/components/ui/auth-input";
import { AuthButton } from "@/components/ui/auth-button";
import { Magnetic } from "@/components/ui/magnetic";
import { GsapTextReveal } from "@/components/ui/gsap-text-reveal";
import { GsapStagger } from "@/components/ui/gsap-stagger";
import gsap from "gsap";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const dividerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (dividerRef.current) {
        gsap.from(dividerRef.current.children, {
          scaleX: 0,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.8,
          ease: "power2.out",
        });
      }
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          y: 15,
          opacity: 0,
          duration: 0.5,
          delay: 1,
          ease: "power2.out",
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isEmail = formData.identifier.includes("@");

      let res;
      if (isEmail) {
        res = await authClient.signIn.email({
          email: formData.identifier,
          password: formData.password,
        });
      } else {
        res = await authClient.signIn.username({
          username: formData.identifier,
          password: formData.password,
        });
      }

      if (res.error) {
        setError(getErrorMessage(res.error.message || res.error));
        setLoading(false);
        return;
      }

      // @ts-expect-error res is loosely typed from plugin returns
      const role = res.data?.user?.role;
      if (role === "STUDENT") {
        router.push("/student");
      } else if (role === "TEACHER") {
        router.push("/teacher");
      } else {
        router.push("/");
      }
      router.refresh();
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
          from="bottom"
        >
          تسجيل الدخول
        </GsapTextReveal>
        <GsapTextReveal
          as="p"
          className="text-gray-400 mt-2 text-sm font-cairo"
          mode="words"
          delay={0.4}
          stagger={0.05}
        >
          أهلاً بك مجدداً في رواد
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
              label="اسم المستخدم أو البريد الإلكتروني"
              required
              value={formData.identifier}
              onChange={(e) =>
                setFormData({ ...formData, identifier: e.target.value })
              }
              placeholder="أدخل اسم المستخدم أو البريد"
              icon={<IconUser className="size-4" />}
              error={!!error}
            />
          </div>

          <AuthInput
            label="كلمة المرور"
            type="password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="أدخل كلمة المرور"
            icon={<IconLock className="size-4" />}
            labelAction={
              <Link
                href="/auth/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 font-cairo transition-colors"
              >
                نسيت كلمة المرور؟
              </Link>
            }
          />
        </GsapStagger>

        <div className="mt-6">
          <Magnetic strength={0.15}>
            <AuthButton loading={loading} type="submit">
              دخول
            </AuthButton>
          </Magnetic>
        </div>
      </form>

      {/* Divider */}
      <div ref={dividerRef} className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200 origin-right" />
        <span className="text-xs text-gray-400 font-cairo">أو</span>
        <div className="flex-1 h-px bg-gray-200 origin-left" />
      </div>

      <p
        ref={footerRef}
        className="text-center text-sm text-gray-500 font-cairo"
      >
        ليس لديك حساب؟{" "}
        <Link
          href="/auth/sign-up"
          className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
        >
          إنشاء حساب جديد
        </Link>
      </p>
    </>
  );
}
