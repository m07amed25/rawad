"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { completeTeacherProfile } from "@/app/actions/auth-actions";
import { ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { IconId, IconCloudUpload } from "@tabler/icons-react";
import { UploadButton } from "@/lib/uploadthing";
import { getErrorMessage } from "@/lib/error-handler";
import { authClient } from "@/lib/auth-client";
import { AuthInput } from "@/components/ui/auth-input";
import { AuthButton } from "@/components/ui/auth-button";
import { GsapBackground } from "@/components/ui/gsap-background";
import { GsapFloatingImage } from "@/components/ui/gsap-floating-image";
import { GsapTextReveal } from "@/components/ui/gsap-text-reveal";
import { GsapStagger } from "@/components/ui/gsap-stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { CursorGlow } from "@/components/ui/cursor-glow";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";

export default function TeacherWelcomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nationalId: "",
    verificationDocUrl: "",
    nationalIdDocUrl: "",
  });
  const formRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const decorativesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (navRef.current) {
        gsap.from(navRef.current, {
          x: 20,
          opacity: 0,
          duration: 0.6,
          delay: 0.5,
          ease: "power3.out",
        });
      }
      if (formRef.current) {
        gsap.from(formRef.current, {
          x: 40,
          opacity: 0,
          duration: 0.7,
          delay: 0.2,
          ease: "power3.out",
        });
      }
      if (decorativesRef.current) {
        gsap.from(decorativesRef.current.children, {
          scale: 0,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          delay: 0.3,
          ease: "back.out(1.7)",
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, nationalId: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await completeTeacherProfile(formData);
      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/teacher");
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh flex overflow-hidden" dir="rtl">
      {/* Decorative Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-linear-to-br from-blue-600 via-indigo-600 to-blue-800 items-center justify-center overflow-hidden">
        <GsapBackground />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "url('/background.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div ref={decorativesRef}>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/4 rounded-full" />
          <div className="absolute -bottom-28 -left-28 w-105 h-105 bg-white/4 rounded-full" />
          <div className="absolute top-[20%] left-8 w-14 h-14 bg-white/5 rounded-2xl rotate-12 backdrop-blur-sm" />
          <div className="absolute bottom-[25%] right-10 w-10 h-10 bg-white/5 rounded-full backdrop-blur-sm" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-10 max-w-md">
          <GsapFloatingImage
            src="/auth/complete-data.png"
            alt="رواد"
            className="w-96 h-96 mb-6"
            interactive
          />
          <GsapTextReveal
            as="h2"
            className="text-3xl font-bold text-white font-cairo mb-2"
            mode="words"
            delay={0.6}
            stagger={0.06}
          >
            أكمل بياناتك
          </GsapTextReveal>
          <GsapTextReveal
            as="p"
            className="text-blue-100/80 text-base leading-relaxed font-cairo"
            mode="words"
            delay={0.9}
            stagger={0.04}
          >
            خطوة أخيرة لتفعيل حسابك كمعلم في نظام رواد
          </GsapTextReveal>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white relative overflow-hidden">
        <CursorGlow />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #6366f1 0.5px, transparent 0.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div
          ref={navRef}
          className="absolute top-4 right-4 z-50 flex items-center gap-2"
        >
          <button
            onClick={async () => {
              await authClient.signOut();
              router.push("/auth/sign-up");
              router.refresh();
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 bg-white/80 backdrop-blur-sm hover:bg-gray-50 px-4 py-2 rounded-xl border border-gray-200/80 transition-all font-cairo shadow-sm hover:shadow"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لإنشاء حساب</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 bg-white/80 backdrop-blur-sm hover:bg-gray-50 px-4 py-2 rounded-xl border border-gray-200/80 transition-all font-cairo shadow-sm hover:shadow"
          >
            <span>الرئيسية</span>
          </Link>
        </div>

        <div className="lg:hidden absolute top-4 left-4">
          <Image src="/images/logo.png" alt="رواد" width={36} height={36} />
        </div>

        <div ref={formRef} className="relative z-10 w-full max-w-105 px-6">
          <div className="text-center mb-8">
            <GsapTextReveal
              as="h1"
              className="text-2xl font-extrabold text-gray-900 font-cairo"
              mode="words"
              delay={0.1}
              stagger={0.06}
            >
              إكمال ملف المعلم
            </GsapTextReveal>
            <GsapTextReveal
              as="p"
              className="text-gray-400 mt-1.5 text-sm font-cairo"
              mode="words"
              delay={0.35}
              stagger={0.05}
            >
              يرجى تقديم الرقم القومي ورفع إثبات الهوية لإكمال تسجيلك
            </GsapTextReveal>
          </div>

          <div className="mb-6 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600 mt-0.5">
              <IconCloudUpload className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900 font-cairo">
                خطوة التحقق من الهوية
              </p>
              <p className="text-xs text-blue-700/80 mt-1 font-cairo leading-relaxed">
                برجاء رفع صورة كارنيه الجامعة أو إثبات العمل كعضو هيئة تدريس
                لتتم مراجعته من قبل الإدارة.
              </p>
            </div>
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
                  label="الرقم القومي"
                  required
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  placeholder="أدخل الرقم القومي"
                  icon={<IconId className="size-4" />}
                  error={!!error}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2 font-cairo pr-1">
                  إثبات الهوية (صورة الكارنيه أو PDF)
                </label>
                <div
                  className={`p-4 rounded-2xl border-2 border-dashed transition-all ${formData.verificationDocUrl ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30"}`}
                >
                  {!formData.verificationDocUrl ? (
                    <UploadButton
                      endpoint="teacherVerification"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setFormData((prev) => ({
                            ...prev,
                            verificationDocUrl: res[0].url,
                          }));
                        }
                      }}
                      onUploadError={(error: Error) => {
                        setError(`خطأ أثناء الرفع: ${error.message}`);
                      }}
                      content={{
                        button({ ready }) {
                          if (ready) return "رفع كارنيه الجامعة";
                          return "جاري التحميل...";
                        },
                        allowedContent() {
                          return "صورة أو PDF (بحد أقصى 4MB)";
                        },
                      }}
                      appearance={{
                        button:
                          "ut-ready:bg-blue-600 ut-ready:hover:bg-blue-700 ut-uploading:cursor-not-allowed bg-blue-500 after:bg-blue-600 rounded-xl text-sm font-cairo h-10 w-full transition-all shadow-sm",
                        allowedContent:
                          "text-gray-400 text-[10px] font-cairo mt-2",
                        container: "w-full",
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                          <CheckCircle2 className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-900 font-cairo">
                            تم رفع كارنيه الجامعة
                          </p>
                          <p className="text-[10px] text-green-600 font-cairo flex items-center gap-1">
                            <FileText className="size-3" />
                            مستند التحقق جاهز
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            verificationDocUrl: "",
                          }))
                        }
                        className="text-xs font-medium text-gray-400 hover:text-red-500 font-cairo px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
                      >
                        تغيير
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2 font-cairo pr-1">
                  صورة البطاقة الشخصية (صورة أو PDF)
                </label>
                <div
                  className={`p-4 rounded-2xl border-2 border-dashed transition-all ${formData.nationalIdDocUrl ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30"}`}
                >
                  {!formData.nationalIdDocUrl ? (
                    <UploadButton
                      endpoint="teacherVerification"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setFormData((prev) => ({
                            ...prev,
                            nationalIdDocUrl: res[0].url,
                          }));
                        }
                      }}
                      onUploadError={(error: Error) => {
                        setError(`خطأ أثناء الرفع: ${error.message}`);
                      }}
                      content={{
                        button({ ready }) {
                          if (ready) return "رفع صورة البطاقة";
                          return "جاري التحميل...";
                        },
                        allowedContent() {
                          return "صورة أو PDF (بحد أقصى 4MB)";
                        },
                      }}
                      appearance={{
                        button:
                          "ut-ready:bg-blue-600 ut-ready:hover:bg-blue-700 ut-uploading:cursor-not-allowed bg-blue-500 after:bg-blue-600 rounded-xl text-sm font-cairo h-10 w-full transition-all shadow-sm",
                        allowedContent:
                          "text-gray-400 text-[10px] font-cairo mt-2",
                        container: "w-full",
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                          <CheckCircle2 className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-900 font-cairo">
                            تم رفع صورة البطاقة
                          </p>
                          <p className="text-[10px] text-green-600 font-cairo flex items-center gap-1">
                            <FileText className="size-3" />
                            مستند البطاقة جاهز
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            nationalIdDocUrl: "",
                          }))
                        }
                        className="text-xs font-medium text-gray-400 hover:text-red-500 font-cairo px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
                      >
                        تغيير
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </GsapStagger>

            <div className="mt-6">
              <Magnetic strength={0.15}>
                <AuthButton loading={loading} type="submit">
                  إكمال التسجيل
                </AuthButton>
              </Magnetic>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
