"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Button ripple effect on submit
    const btn = (e.target as HTMLFormElement).querySelector(
      "button[type='submit']"
    );
    if (btn) {
      gsap.fromTo(
        btn,
        { scale: 0.95 },
        {
          scale: 1,
          duration: 0.4,
          ease: "elastic.out(1.2, 0.5)",
        }
      );
    }
    console.log("Form submitted:", formData);
  };

  useGSAP(
    () => {
      // Section title — slide from right
      gsap.fromTo(
        ".contact-title",
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-title",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Underline bar — expand from right (RTL)
      gsap.fromTo(
        ".contact-bar",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.6,
          ease: "power2.out",
          transformOrigin: "right center",
          scrollTrigger: {
            trigger: ".contact-title",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Info text — stagger fade up
      gsap.fromTo(
        ".contact-info",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-content",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // Email link — slide in with gradient shimmer
      gsap.fromTo(
        ".contact-email",
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-content",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Form card — 3D tilt entrance
      gsap.fromTo(
        ".contact-form-card",
        { opacity: 0, y: 60, rotateY: -8, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-form-card",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      // Form fields — stagger up
      gsap.fromTo(
        ".contact-field",
        { opacity: 0, y: 25, x: -15 },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-form-card",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Submit button — bounce in
      gsap.fromTo(
        ".contact-submit",
        { opacity: 0, scale: 0.7, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".contact-form-card",
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );

      // Background SVG — parallax
      gsap.to(".contact-bg", {
        y: -40,
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative py-10 lg:py-14 overflow-hidden"
      id="contactus"
      dir="rtl"
      style={{ fontFamily: "var(--font-cairo)", perspective: "800px" }}
    >
      {/* Background SVG blob */}
      <div className="contact-bg absolute inset-0 -z-10 pointer-events-none">
        <Image
          src="/contact.svg"
          alt=""
          fill
          className="object-contain object-left opacity-60 scale-125"
          priority={false}
        />
      </div>

      <div className="container mx-auto px-6 sm:px-12">
        {/* Section Title */}
        <div className="text-right mb-8">
          <h2 className="contact-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            تواصل معنا
          </h2>
          <div className="contact-bar mt-2 mr-0 h-1 w-16 rounded-full bg-linear-to-l from-blue-600 to-indigo-500 origin-right" />
        </div>

        {/* Two-Column Grid */}
        <div className="contact-content grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Right Column – Info & Text */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="contact-info text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 leading-relaxed">
                يسعدنا تواصلكم معنا في أي وقت.
              </p>
              <p className="contact-info text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 leading-relaxed">
                إذا كان لديكم أي استفسار أو واجهتكم أي مشكلة أثناء استخدام نظام
                رواد ، يمكنكم التواصل معنا من خلال البريد الإلكتروني الخاص بنا.
              </p>
            </div>

            {/* Email Link */}
            <a
              href="mailto:rawad.exam@gmail.com"
              className="contact-email inline-block text-xl sm:text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300"
            >
              rawad.exam@gmail.com
            </a>
          </div>

          {/* Left Column – Contact Form Card */}
          <div>
            <div className="contact-form-card bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-blue-500/5 p-6 sm:p-8">
              {/* Form Title */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 text-center mb-4">
                أرسل لنا رسالة
              </h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Full Name */}
                <input
                  type="text"
                  id="contact-name"
                  placeholder="الاسم الكامل"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="contact-field w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-right text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                  required
                />

                {/* Email */}
                <input
                  type="email"
                  id="contact-email"
                  placeholder="البريد الإلكتروني"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="contact-field w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-right text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                  required
                />

                {/* Message */}
                <textarea
                  id="contact-message"
                  placeholder="اكتب رسالتك هنا.."
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="contact-field w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-right text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-300 resize-none text-sm sm:text-base"
                  required
                />

                {/* Submit Button */}
                <div className="contact-submit pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 text-base sm:text-lg cursor-pointer"
                  >
                    إرسال الرسالة
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
