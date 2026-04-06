"use client";

import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { completeTeacherProfile } from "@/app/actions/teacher";
import { UNIVERSITIES, FACULTIES } from "@/constants/academic-data";
import { SearchableSelect } from "@/components/ui/searchable-select";
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

type FormValues = {
  universityName: { selected: string; custom?: string };
  college: { selected: string; custom?: string };
  department: string;
};

export default function TeacherCompleteProfilePage() {
  const {
    setValue,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      universityName: { selected: "", custom: "" },
      college: { selected: "", custom: "" },
      department: "",
    },
  });

  const universityName = useWatch({ control, name: "universityName" });
  const college = useWatch({ control, name: "college" });
  const department = useWatch({ control, name: "department" });

  const canSubmit =
    universityName.selected !== "" && department.trim().length >= 2;

  async function onSubmit(data: FormValues) {
    try {
      const result = await completeTeacherProfile({
        universityName: data.universityName,
        college: data.college,
        department: data.department.trim(),
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
      className="min-h-screen bg-linear-to-bl from-emerald-50 via-white to-teal-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 sm:p-6"
      dir="rtl"
    >
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-xl shadow-gray-200/60 dark:shadow-black/20 border border-gray-100 dark:border-border overflow-hidden">
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
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 sm:px-8 py-7 space-y-5"
          >
            {/* Error */}
            {errors.root && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            {/* University */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-foreground">
                <School className="w-4 h-4 text-emerald-500" />
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
                  {(errors.universityName as any).message}
                </p>
              )}
            </div>

            {/* College */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-foreground">
                <Building2 className="w-4 h-4 text-teal-500" />
                الكلية
                <span className="text-xs font-normal text-gray-400 dark:text-muted-foreground">
                  (اختياري)
                </span>
              </label>
              <SearchableSelect
                options={FACULTIES}
                value={college.selected}
                onChange={(val) =>
                  setValue("college", {
                    selected: val,
                    custom: college.custom,
                  })
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
              <p className="text-[11px] text-gray-400 dark:text-muted-foreground leading-relaxed">
                يمكنك تركه فارغاً إذا لم يكن ذا صلة بهيكلك الأكاديمي
              </p>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-foreground">
                <BookOpen className="w-4 h-4 text-cyan-500" />
                القسم الأكاديمي
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setValue("department", e.target.value)}
                placeholder="مثال: إدارة الأعمال"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50/50 dark:bg-muted/30 text-sm text-gray-800 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 focus:bg-white dark:focus:bg-background transition-all"
                disabled={isSubmitting}
              />
              {errors.department && (
                <p className="text-xs text-red-500">
                  {errors.department.message}
                </p>
              )}
            </div>

            {/* Info box */}
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
              <GraduationCap className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                ستُستخدم هذه البيانات لعرض الطلاب المسجلين في نفس الجامعة والقسم
                فقط.
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold bg-linear-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            >
              {isSubmitting ? (
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
        <p className="text-center text-xs text-gray-400 dark:text-muted-foreground mt-5">
          يمكنك تعديل هذه البيانات لاحقاً من إعدادات الملف الشخصي
        </p>
      </div>
    </div>
  );
}
