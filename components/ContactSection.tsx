"use client";

import { useState } from "react";
import Image from "next/image";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <section
      className="relative py-10 lg:py-14 overflow-hidden"
      id="contact"
      dir="rtl"
      style={{ fontFamily: "var(--font-cairo)" }}
    >
      {/* Background SVG blob */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Image
          src="/contact.svg"
          alt=""
          fill
          className="object-contain object-left opacity-60 dark:opacity-25 scale-125"
          priority={false}
        />
      </div>

      <div className="container mx-auto px-6 sm:px-12">
        {/* Section Title */}
        <div className="text-right mb-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            تواصل معنا
          </h2>
          <div className="mt-2 mr-0 h-1 w-16 rounded-full bg-linear-to-l from-blue-600 to-indigo-500" />
        </div>

        {/* Description Text */}
        <div className="text-center mb-6 max-w-4xl mx-auto space-y-1">
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
            يسعدنا تواصلكم معنا في أي وقت.
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
            إذا كان لديكم أي استفسار أو واجهتكم أي مشكلة أثناء استخدام نظام
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
            رواد ، يمكنكم التواصل معنا من خلال البريد الإلكتروني الخاص بنا.
          </p>

          {/* Email Link */}
          <a
            href="mailto:rawad.exam@gmail.com"
            className="inline-block mt-3 text-xl sm:text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300"
          >
            rawad.exam@gmail.com
          </a>
        </div>

        {/* Contact Form Card */}
        <div className="max-w-xl mx-auto">
          <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-xl shadow-blue-500/5 p-6 sm:p-8">
            {/* Form Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-4">
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
                className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-right text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
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
                className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-right text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
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
                className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl text-right text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-300 resize-none text-sm sm:text-base"
                required
              />

              {/* Submit Button */}
              <div className="pt-2">
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
    </section>
  );
}
