"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  shadowColor: string;
}

const features: Feature[] = [
  {
    title: "دعم جميع أنواع الإعاقات",
    description:
      "أدوات مخصصة تراعي احتياجات كل طالب من ذوي الإعاقة لضمان تجربة عادلة ومتاحة للجميع",
    gradient: "from-blue-500 to-indigo-600",
    shadowColor: "shadow-blue-500/30 group-hover:shadow-blue-500/50",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="16" cy="4" r="1" />
        <path d="m18 19 1-7-6 1" />
        <path d="m5 8 3-3 5.5 3-2.36 3.5" />
        <path d="M4.24 14.5a5 5 0 0 0 6.88 6" />
        <path d="M13.76 17.5a5 5 0 0 0-6.88-6" />
      </svg>
    ),
  },
  {
    title: "واجهة سهلة الاستخدام",
    description:
      "تصميم بسيط وبديهي يسهّل على الطلاب والمعلمين التعامل مع النظام دون أي تعقيد",
    gradient: "from-cyan-500 to-blue-600",
    shadowColor: "shadow-cyan-500/30 group-hover:shadow-cyan-500/50",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 7h3v3H7z" />
        <path d="M14 7h3" />
        <path d="M14 11h3" />
        <path d="M7 14h10" />
        <path d="M7 18h10" />
      </svg>
    ),
  },
  {
    title: "تصحيح تلقائي أو يدوي",
    description:
      "مرونة كاملة في تصحيح الاختبارات سواء بشكل تلقائي فوري أو يدوي حسب حاجة المعلم",
    gradient: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/30 group-hover:shadow-violet-500/50",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "تقارير ونتائج دقيقة",
    description:
      "إحصائيات شاملة وتقارير مفصّلة تساعد في متابعة أداء الطلاب واتخاذ قرارات تعليمية أفضل",
    gradient: "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-500/30 group-hover:shadow-emerald-500/50",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
];

export default function WhyUsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Heading — split reveal
      gsap.fromTo(
        ".whyus-heading",
        { opacity: 0, y: 50, clipPath: "inset(100% 0 0 0)" },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0 0 0)",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".whyus-heading",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Underline bar — expand from center
      gsap.fromTo(
        ".whyus-bar",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".whyus-heading",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Subtitle text — fade up
      gsap.fromTo(
        ".whyus-subtitle",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".whyus-heading",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Feature cards — staggered rise with 3D rotation
      gsap.fromTo(
        ".whyus-card",
        {
          opacity: 0,
          y: 80,
          rotateX: 15,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".whyus-grid",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      // Card icons — spin + bounce in after cards appear
      gsap.fromTo(
        ".whyus-icon",
        { scale: 0, rotation: -180, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: ".whyus-grid",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Background art — parallax drift
      gsap.to(".whyus-bg-art", {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-4 lg:py-10 mt-6 lg:mt-8"
      id="whyus"
      dir="rtl"
      style={{ fontFamily: "var(--font-cairo)", perspective: "600px" }}
    >
      <div
        className="whyus-bg-art absolute top-0 left-0 w-[600px] h-[600px] sm:w-[750px] sm:h-[750px] -z-10 opacity-25 dark:opacity-15"
        style={{
          backgroundImage: "url('/whyus.png')",
          backgroundSize: "contain",
          backgroundPosition: "left top",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute top-1/3 left-1/4 w-[40%] h-[40%] bg-blue-400/15 dark:bg-blue-500/10 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] bg-indigo-400/10 dark:bg-indigo-500/8 blur-[80px] rounded-full -z-10" />

      <div className="container mx-auto px-6 sm:px-12">
        {/* Section heading */}
        <div className="whyus-heading text-center mb-5 lg:mb-6">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.2] tracking-tight">
            لماذا{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
              رواد؟
            </span>
          </h2>
          <div className="whyus-bar mt-2 mx-auto h-1 w-20 rounded-full bg-linear-to-r from-blue-600 to-indigo-500 origin-center" />
          <p className="whyus-subtitle mt-3 text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            نقدم لك تجربة تعليمية فريدة ومتكاملة تميزنا عن غيرنا
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="whyus-grid grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="whyus-card group relative bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-lg shadow-blue-500/5 p-5 sm:p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-2 hover:border-blue-300/50 dark:hover:border-blue-600/30"
            >
              {/* Icon */}
              <div
                className={`whyus-icon w-12 h-12 mb-3 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-all duration-500`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
