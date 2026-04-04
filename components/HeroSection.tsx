"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Image entrance — scale up from tiny + rotate in
      tl.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.6, y: 80, rotateY: -15 },
        { opacity: 1, scale: 1, y: 0, rotateY: 0, duration: 1.2 },
      );

      // Title — clip-reveal slide up
      tl.fromTo(
        ".hero-title",
        { opacity: 0, y: 60, clipPath: "inset(100% 0 0 0)" },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0 0 0)",
          duration: 0.9,
        },
        "-=0.7",
      );

      // Subtitle — fade up
      tl.fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7 },
        "-=0.4",
      );

      // CTA buttons — stagger pop in with slight scale bounce
      tl.fromTo(
        ".hero-cta",
        { opacity: 0, y: 30, scale: 0.85 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.7)",
        },
        "-=0.3",
      );

      // Decorative blur pulse
      tl.fromTo(
        blurRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" },
        "-=1",
      );

      // Continuous floating animation on the image
      gsap.to(imageRef.current, {
        y: -12,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.5,
      });

      // Slow pulsing glow on the blur element
      gsap.to(blurRef.current, {
        scale: 1.15,
        opacity: 0.7,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2,
      });
    },
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef} className="relative w-full pb-0">
      <div
        className="relative container mx-auto px-6 sm:px-12 pt-24 pb-6 min-h-[85vh] lg:min-h-[90vh] flex flex-col-reverse lg:flex-row-reverse items-center justify-between gap-10 md:gap-16"
        style={{ fontFamily: "var(--font-cairo)" }}
      >
        {/* Text Content */}
        <div
          ref={textRef}
          className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-start space-y-8"
        >
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.2] drop-shadow-sm tracking-tight">
            أهلاً بك في نظام{" "}
            <span className="ms-3 bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500">
              رواد
            </span>
          </h1>
          <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-2xl leading-relaxed">
            نظام الامتحانات الإلكتروني للطلاب وذوي الإعاقة، تمنحك الحرية وتدعم
            احتياجاتك بكل سهولة وأمان
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2 lg:w-full lg:justify-start">
            <Link
              href="/auth/sign-up"
              className="hero-cta px-8 py-4 w-full sm:w-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 text-lg flex items-center justify-center cursor-pointer"
            >
              ابدأ الآن
            </Link>
            <Link
              href="#whoisus"
              className="hero-cta px-8 py-4 w-full sm:w-auto bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white text-slate-800 font-bold rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 text-lg flex items-center justify-center cursor-pointer"
            >
              اكتشف المزيد
            </Link>
          </div>
        </div>

        {/* Image Content */}
        <div className="flex-1 w-full max-w-sm sm:max-w-md lg:max-w-2xl relative flex justify-center group">
          {/* Decorative background blur element */}
          <div
            ref={blurRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-400/20 blur-3xl rounded-full -z-10"
          ></div>

          <div
            ref={imageRef}
            className="relative w-full aspect-square drop-shadow-2xl"
            style={{ perspective: "800px" }}
          >
            <Image
              src={"/images/hero.png"}
              alt="واجهة رواد"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 672px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
