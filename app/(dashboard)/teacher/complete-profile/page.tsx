"use client";

import React, { useState } from "react";
import { completeTeacherProfile } from "@/app/actions/teacher";
import {
  GraduationCap,
  Building2,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  School,
} from "lucide-react";
import Image from "next/image";

export default function TeacherCompleteProfilePage() {
  const [universityName, setUniversityName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    universityName.trim().length >= 2 && department.trim().length >= 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    setLoading(true);

    try {
      const result = await completeTeacherProfile({
        universityName: universityName.trim(),
        college: college.trim() || undefined,
        department: department.trim(),
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // On success, the server action redirects — no client handling needed
    } catch {
      setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-linear-to-bl from-emerald-50 via-white to-teal-50/40 flex items-center justify-center p-4 sm:p-6"
      dir="rtl"
    >
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="relative bg-linear-to-l from-emerald-600 to-teal-600 px-6 sm:px-8 pt-8 pb-7 text-white">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-12 -translate-y-12" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 translate-y-8" />

            <div className="relative flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="logo"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  أكمل بيانات التعيين الأكاديمي
                </h1>
                <p className="text-emerald-100 text-sm mt-1">
                  خطوة أخيرة قبل الوصول إلى لوحة المعلم
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="relative flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs text-emerald-100">
                  البيانات الأساسية
                </span>
              </div>
              <div className="flex-1 h-px bg-white/20" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600">2</span>
                </div>
                <span className="text-xs font-semibold">بيانات التعيين</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-6 sm:px-8 py-7 space-y-5"
          >
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* University */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <School className="w-4 h-4 text-emerald-500" />
                الجامعة
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="مثال: جامعة المنصورة"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all"
                disabled={loading}
              />
            </div>

            {/* College */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Building2 className="w-4 h-4 text-teal-500" />
                الكلية
                <span className="text-xs font-normal text-gray-400">
                  (اختياري)
                </span>
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="مثال: كلية التجارة"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all"
                disabled={loading}
              />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                يمكنك تركه فارغاً إذا لم يكن ذا صلة بهيكلك الأكاديمي
              </p>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <BookOpen className="w-4 h-4 text-cyan-500" />
                القسم الأكاديمي
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="مثال: إدارة الأعمال"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all"
                disabled={loading}
              />
            </div>

            {/* Info box */}
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
              <GraduationCap className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                ستُستخدم هذه البيانات لعرض الطلاب المسجلين في نفس الجامعة
                والقسم فقط.
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold bg-linear-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ والانتقال للوحة المعلم</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-5">
          يمكنك تعديل هذه البيانات لاحقاً من إعدادات الملف الشخصي
        </p>
      </div>
    </div>
  );
}
