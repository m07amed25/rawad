"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { GsapBackground } from "@/components/ui/gsap-background";
import { GsapTextReveal } from "@/components/ui/gsap-text-reveal";
import { GsapFloatingImage } from "@/components/ui/gsap-floating-image";
import { CursorGlow } from "@/components/ui/cursor-glow";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const formRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const decorativesRef = useRef<HTMLDivElement>(null);

  const getPanel = () => {
    if (pathname.includes("sign-up")) {
      return {
        image: "/auth/complete-data.png",
        title: "انضم إلى رواد",
        subtitle: "أنشئ حسابك وابدأ رحلتك التعليمية مع نظام رواد",
      };
    }
    if (pathname.includes("forgot-password")) {
      return {
        image: "/auth/right-auth.png",
        title: "لا تقلق",
        subtitle: "سنساعدك في استعادة حسابك بخطوات بسيطة",
      };
    }
    return {
      image: "/auth/right-auth.png",
      title: "مرحباً بعودتك",
      subtitle: "سجّل دخولك واستمر في رحلتك التعليمية مع رواد",
    };
  };

  const panel = getPanel();

  // GSAP entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Nav button slides in
      if (navRef.current) {
        gsap.from(navRef.current, {
          x: 20,
          opacity: 0,
          duration: 0.6,
          delay: 0.5,
          ease: "power3.out",
        });
      }

      // Form panel slides in
      if (formRef.current) {
        gsap.from(formRef.current, {
          x: 40,
          opacity: 0,
          duration: 0.7,
          delay: 0.2,
          ease: "power3.out",
        });
      }

      // Decorative shapes stagger in
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
  }, [pathname]);

  return (
    <div className="h-dvh flex overflow-hidden" dir="rtl">
      {/* Decorative Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-linear-to-br from-blue-600 via-indigo-600 to-blue-800 items-center justify-center overflow-hidden">
        {/* GSAP-powered animated background */}
        <GsapBackground />

        {/* Soft radial overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)]" />

        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "url('/background.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Decorative shapes — GSAP stagger entrance */}
        <div ref={decorativesRef}>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/4 rounded-full" />
          <div className="absolute -bottom-28 -left-28 w-105 h-105 bg-white/4 rounded-full" />
          <div className="absolute top-[20%] left-8 w-14 h-14 bg-white/[0.05] rounded-2xl rotate-12 backdrop-blur-sm" />
          <div className="absolute bottom-[25%] right-10 w-10 h-10 bg-white/[0.05] rounded-full backdrop-blur-sm" />
        </div>

        {/* Panel content with GSAP text reveal + floating image */}
        <div
          ref={panelContentRef}
          className="relative z-10 flex flex-col items-center text-center px-10 max-w-md"
        >
          <GsapFloatingImage
            src={panel.image}
            alt="رواد"
            className="w-64 h-64 mb-6"
          />
          <GsapTextReveal
            as="h2"
            className="text-3xl font-bold text-white font-cairo mb-2"
            mode="words"
            delay={0.6}
            stagger={0.06}
          >
            {panel.title}
          </GsapTextReveal>
          <GsapTextReveal
            as="p"
            className="text-blue-100/80 text-base leading-relaxed font-cairo"
            mode="words"
            delay={0.9}
            stagger={0.04}
          >
            {panel.subtitle}
          </GsapTextReveal>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white relative overflow-hidden">
        {/* GSAP cursor glow */}
        <CursorGlow />

        {/* Subtle dot pattern on form side */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #6366f1 0.5px, transparent 0.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div ref={navRef} className="absolute top-4 right-4 z-50">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 bg-white/80 backdrop-blur-sm hover:bg-gray-50 px-4 py-2 rounded-xl border border-gray-200/80 transition-all font-cairo shadow-sm hover:shadow"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>الرئيسية</span>
          </Link>
        </div>

        <div className="lg:hidden absolute top-4 left-4">
          <Image src="/images/logo.png" alt="رواد" width={36} height={36} />
        </div>

        <div
          ref={formRef}
          className="relative z-10 w-full max-w-105 px-6"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
