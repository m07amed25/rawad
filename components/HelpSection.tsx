"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const tabs = [
  {
    id: 0,
    label: "كيف أبدأ في استخدام رواد",
    content:
      "يمكنك البدء باستخدام منصة رواد بسهولة من خلال إنشاء حساب او تسجيل الدخول. بعد ذلك يمكنك الوصول إلي الامتحانات المتاحة ، الإجابة علي الأسئلة ، ومتابعة نتائجك بكل سهولة.",
    image: "/help1.png",
  },
  {
    id: 1,
    label: "كيف أؤدي الامتحان",
    content:
      "بعد الدخول علي حسابك يمكنك اختيار الامتحان المتاح لك والبدء فيه مباشرة.\nيوفر النظام واجهة سهلة مع أدوات مساعدة مثل قراءة الأسئلة صوتياً.",
    image: "/help3.png",
  },
  {
    id: 2,
    label: "كيف أتابع نتائجي",
    content:
      "بعد الانتهاء من الامتحان يمكنك الاطلاع علي نتائجك من صفحة نتائجي.\nيعرض النظام الدرجة والتفاصيل الخاصة بالإجابات الصحيحة والخاطئة لمساعدتك علي معرفة مستواك.",
    image: "/help2.png",
  },
  {
    id: 3,
    label: "الدعم والمساعدة",
    content:
      "إذا واجهت اي مشكلة أثناء استخدام النظام يمكنك التواصل معنا من خلال صفحة تواصل معنا ، وسيسعدك فريق الدعم بمساعدتك في اسرع وقت.",
    image: "/help4.png",
  },
];

export default function HelpSection() {
  const [activeTab, setActiveTab] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Animate tab content on tab change
  const handleTabChange = (tabId: number) => {
    if (tabId === activeTab) return;

    // Animate out the current content
    const contentEl = contentRef.current;
    if (contentEl) {
      gsap.to(contentEl, {
        opacity: 0,
        y: 20,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          setActiveTab(tabId);
          // Animate in the new content
          gsap.fromTo(
            contentEl,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
          );
        },
      });
    } else {
      setActiveTab(tabId);
    }
  };

  useGSAP(
    () => {
      // Section title
      gsap.fromTo(
        ".help-title",
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".help-title",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Underline bar
      gsap.fromTo(
        ".help-bar",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.6,
          ease: "power2.out",
          transformOrigin: "right center",
          scrollTrigger: {
            trigger: ".help-title",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Tab buttons — stagger in from right
      gsap.fromTo(
        ".help-tab",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".help-tabs",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      // Wave container — fade in
      gsap.fromTo(
        ".help-wave",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".help-wave",
            start: "top 95%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative mt-4 lg:mt-6 overflow-hidden"
      id="help"
      dir="rtl"
      style={{ fontFamily: "var(--font-cairo)" }}
    >
      {/* Subtle decorative background */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-100/40 dark:bg-blue-900/10 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-6 sm:px-12 pt-8 lg:pt-10 pb-4 lg:pb-6">
        {/* Section Title */}
        <div className="text-right mb-6">
          <h2 className="help-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ساعدني
          </h2>
          <div className="help-bar mt-2 mr-0 h-1 w-16 rounded-full bg-linear-to-l from-blue-600 to-indigo-500 origin-right" />
        </div>

        {/* Tabs */}
        <div className="help-tabs relative flex flex-wrap gap-0 mb-6">
          {/* Background line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-700" />

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`help-tab relative px-5 sm:px-7 py-3.5 text-sm sm:text-base font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}
              {/* Active indicator — thick dark underline */}
              <span
                className={`absolute bottom-0 left-1 right-1 h-[3.5px] rounded-t-full transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-[#1a365d] dark:bg-blue-400 scale-x-100"
                    : "bg-transparent scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Tab Content with GSAP animation */}
        <div ref={contentRef} className="relative min-h-[120px] sm:min-h-[100px]">
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 dark:text-slate-300 leading-[1.8] max-w-4xl whitespace-pre-line">
            {tabs[activeTab].content}
          </p>
        </div>
      </div>

      {/* Wave Images — each tab has its own unique wave */}
      <div className="help-wave relative w-full h-[80px] sm:h-[120px] lg:h-[160px]">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
              activeTab === tab.id
                ? "opacity-100 scale-100"
                : "opacity-0 scale-[1.02]"
            }`}
          >
            <Image
              src={tab.image}
              alt=""
              fill
              className="object-cover object-top"
              priority={tab.id === 0}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
