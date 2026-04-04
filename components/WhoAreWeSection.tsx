"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const paragraphs = [
  "نظام رواد هو منصة تعليمية إلكترونية صممت لتسهيل إدارة الامتحانات وتنظيمها بطريقة حديثة وفعالة. ويهدف النظام إلى توفير بيئة رقمية تساعد المعلمين على إنشاء الاختبارات بسهولة وتمكين الطلاب من أداء الامتحانات بطريقة مريحة ومنظمة.",
  "كما يركز رواد على دعم الطلاب من ذوي الإعاقة من خلال توفير أدوات وخصائص تساعدهم على التفاعل مع الامتحانات بشكل أفضل، وتقديم واجهات بسيطة وسهلة الاستخدام.",
  "نحن نسعى من خلال رواد إلى تطوير تجربة الامتحانات الإلكترونية وجعلها أكثر عدلاً ومرونة، بحيث يستطيع كل طالب إظهار قدراته الحقيقية في بيئة تعليمية مناسبة للجميع.",
];

export default function WhoAreWeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Heading — reveal from below with clip-path
      gsap.fromTo(
        ".whoarewe-heading",
        { opacity: 0, y: 50, clipPath: "inset(100% 0 0 0)" },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0 0 0)",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".whoarewe-heading",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // Underline bar — expand from center
      gsap.fromTo(
        ".whoarewe-bar",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".whoarewe-heading",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // Content card — glass card slides up + fades in
      gsap.fromTo(
        ".whoarewe-card",
        { opacity: 0, y: 60, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".whoarewe-card",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        },
      );

      // List items — stagger from right (RTL feel)
      gsap.fromTo(
        ".whoarewe-item",
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".whoarewe-card",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );

      // Bullets — pop in with scale bounce
      gsap.fromTo(
        ".whoarewe-bullet",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.2,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: ".whoarewe-card",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <div
      ref={sectionRef}
      id="whoisus"
      className="relative container mx-auto px-6 sm:px-12 py-2 lg:py-2 mt-2 lg:-mt-12"
      style={{ fontFamily: "var(--font-cairo)" }}
      dir="rtl"
    >
      {/* Decorative blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-400/10 blur-3xl rounded-full -z-10"></div>

      <div className="max-w-4xl mx-auto">
        {/* Section heading */}
        <div className="whoarewe-heading text-center mb-5">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.2] tracking-tight">
            من{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
              نحن؟
            </span>
          </h2>
          <div className="whoarewe-bar mt-3 mx-auto h-1 w-20 rounded-full bg-linear-to-r from-blue-600 to-indigo-500 origin-center"></div>
        </div>

        {/* Content card */}
        <div className="whoarewe-card bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-xl shadow-blue-500/5 p-6 sm:p-8 lg:p-10 space-y-0">
          <ul className="space-y-2">
            {paragraphs.map((text, i) => (
              <li
                key={i}
                className="whoarewe-item group flex items-start gap-3 p-3 rounded-2xl transition-all duration-300 hover:bg-blue-50/60"
              >
                {/* Blue bullet */}
                <span className="whoarewe-bullet mt-2 shrink-0 w-3 h-3 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/40 group-hover:scale-125 transition-transform duration-300"></span>
                <p className="text-lg sm:text-xl leading-relaxed text-slate-700">
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
