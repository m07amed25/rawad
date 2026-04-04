"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { completeAcademicProfile } from "@/app/actions/onboarding";
import { UNIVERSITIES, FACULTIES } from "@/constants/academic-data";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  GraduationCap,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  School,
  Building2,
} from "lucide-react";
import Image from "next/image";

const academicYears = [
  { value: "الأولى", label: "الفرقة الأولى" },
  { value: "الثانية", label: "الفرقة الثانية" },
  { value: "الثالثة", label: "الفرقة الثالثة" },
  { value: "الرابعة", label: "الفرقة الرابعة" },
];

// Client form shape (before Zod transforms)
type FormValues = {
  universityName: { selected: string; custom?: string };
  college: { selected: string; custom?: string };
  department: string;
  academicYear: string;
};

export default function CompleteProfilePage() {
  const {
    setValue,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      universityName: { selected: "", custom: "" },
      college: { selected: "", custom: "" },
      department: "",
      academicYear: "",
    },
  });

  const universityName = watch("universityName");
  const college = watch("college");
  const academicYear = watch("academicYear");
  const department = watch("department");

  const canSubmit =
    universityName.selected !== "" &&
    college.selected !== "" &&
    academicYear !== "";

  async function onSubmit(data: FormValues) {
    try {
      const result = await completeAcademicProfile({
        universityName: data.universityName,
        college: data.college,
        department: data.department.trim() || undefined,
        academicYear: data.academicYear,
      });
      if (result?.error) {
        setError("root", { message: result.error });
      }
    } catch {
      setError("root", {
        message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
      });
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-bl from-blue-50 via-white to-indigo-50/40 flex items-center justify-center p-4 sm:p-6"
      dir="rtl"
    >
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-l from-blue-600 to-indigo-600 px-6 sm:px-8 pt-8 pb-7 text-white">
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
                  أكمل بياناتك الأكاديمية
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  خطوة أخيرة قبل الوصول إلى لوحة الطالب
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="relative flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs text-blue-100">البيانات الأساسية</span>
              </div>
              <div className="flex-1 h-px bg-white/20" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <span className="text-xs font-semibold">
                  البيانات الأكاديمية
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 sm:px-8 py-7 space-y-5"
          >
            {/* Error */}
            {errors.root && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            {/* University Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <School className="w-4 h-4 text-blue-500" />
                الجامعة
                <span className="text-red-400">*</span>
              </label>
              <SearchableSelect
                options={UNIVERSITIES}
                value={universityName.selected}
                onChange={(val) =>
                  setValue("universityName", {
                    selected: val,
                    custom: universityName.custom,
                  })
                }
                customValue={universityName.custom}
                onCustomValueChange={(val) =>
                  setValue("universityName", {
                    selected: universityName.selected,
                    custom: val,
                  })
                }
                placeholder="ابحث عن جامعتك..."
                searchPlaceholder="اكتب اسم الجامعة..."
                otherPlaceholder="أدخل اسم الجامعة"
                hasError={!!errors.universityName}
                disabled={isSubmitting}
              />
              {errors.universityName && (
                <p className="text-xs text-red-500">
                  {(errors.universityName as { message?: string }).message}
                </p>
              )}
            </div>

            {/* College */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Building2 className="w-4 h-4 text-blue-500" />
                الكلية
                <span className="text-red-400">*</span>
              </label>
              <SearchableSelect
                options={FACULTIES}
                value={college.selected}
                onChange={(val) =>
                  setValue("college", { selected: val, custom: college.custom })
                }
                customValue={college.custom}
                onCustomValueChange={(val) =>
                  setValue("college", {
                    selected: college.selected,
                    custom: val,
                  })
                }
                placeholder="ابحث عن كليتك..."
                searchPlaceholder="اكتب اسم الكلية..."
                otherPlaceholder="أدخل اسم الكلية"
                hasError={!!errors.college}
                disabled={isSubmitting}
              />
              {errors.college && (
                <p className="text-xs text-red-500">
                  {(errors.college as { message?: string }).message}
                </p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                القسم
                <span className="text-xs font-normal text-gray-400">
                  (اختياري)
                </span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setValue("department", e.target.value)}
                placeholder="مثال: إدارة الأعمال"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                يمكنك تركه فارغاً إذا لم يتم تحديد القسم بعد (مثل طلاب الفرقة
                الأولى)
              </p>
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <GraduationCap className="w-4 h-4 text-violet-500" />
                الفرقة الدراسية
                <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {academicYears.map((year) => {
                  const isActive = academicYear === year.value;
                  return (
                    <button
                      key={year.value}
                      type="button"
                      onClick={() => setValue("academicYear", year.value)}
                      disabled={isSubmitting}
                      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                        isActive
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {year.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ والانتقال للوحة الطالب</span>
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
