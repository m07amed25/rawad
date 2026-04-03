"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, BookOpen, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateTeacherSubjects } from "@/app/actions/subjects";
import { type SubjectInput } from "@/lib/validations";
import { ACADEMIC_YEARS } from "@/constants";
import { subjectsFormSchema, type SubjectsFormValues } from "@/lib/validations";

// ─── Component ───────────────────────────────────────────────

export default function TeacherSubjectsPage({
  initialSubjects,
}: {
  initialSubjects: SubjectInput[];
}) {
  const [saving, setSaving] = useState(false);

  const form = useForm<SubjectsFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(subjectsFormSchema) as any,
    defaultValues: {
      subjects:
        initialSubjects.length > 0
          ? initialSubjects
          : [{ name: "", academicYear: "الفرقة الأولى" as const }],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subjects",
  });

  // Re-sync when initialSubjects change (navigation back)
  useEffect(() => {
    if (initialSubjects.length > 0) {
      form.reset({ subjects: initialSubjects });
    }
  }, [initialSubjects, form]);

  async function onSubmit(data: SubjectsFormValues) {
    setSaving(true);
    try {
      const result = await updateTeacherSubjects(data.subjects);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("تم حفظ المواد بنجاح");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-primary-foreground">
          <BookOpen className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة المواد</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            أضف المواد التي تقوم بتدريسها لكل فرقة دراسية
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>المواد الدراسية</CardTitle>
                <CardDescription>
                  أضف أو عدّل المواد الخاصة بك. سيتم ربط المواد بالامتحانات التي
                  تنشئها.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ name: "", academicYear: "الفرقة الأولى" })
                }
                className="gap-1.5"
              >
                <Plus className="size-4" />
                إضافة مادة
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {fields.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <BookOpen className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  لم تقم بإضافة أي مواد بعد. اضغط على &quot;إضافة مادة&quot;
                  للبدء.
                </p>
              </div>
            )}

            {fields.map((field, index) => {
              const subjectErrors = errors.subjects?.[index];
              return (
                <div
                  key={field.id}
                  className="flex items-start gap-3 rounded-xl border border-border p-4 transition-all hover:ring-2 hover:ring-primary/10"
                >
                  {/* Row number */}
                  <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground text-sm font-bold shrink-0 mt-1">
                    {index + 1}
                  </div>

                  {/* Subject Name */}
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor={`subject-name-${index}`}>اسم المادة</Label>
                    <Input
                      id={`subject-name-${index}`}
                      placeholder="مثال: الرياضيات"
                      {...register(`subjects.${index}.name`)}
                    />
                    {subjectErrors?.name?.message && (
                      <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                        <AlertCircle className="size-3 shrink-0" />
                        {subjectErrors.name.message as string}
                      </p>
                    )}
                  </div>

                  {/* Academic Year */}
                  <div className="w-48 space-y-1.5">
                    <Label>الفرقة الدراسية</Label>
                    <Select
                      value={form.watch(`subjects.${index}.academicYear`)}
                      onValueChange={(val) =>
                        form.setValue(
                          `subjects.${index}.academicYear`,
                          val as SubjectsFormValues["subjects"][number]["academicYear"],
                          { shouldValidate: true },
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="اختر الفرقة" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACADEMIC_YEARS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {subjectErrors?.academicYear?.message && (
                      <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                        <AlertCircle className="size-3 shrink-0" />
                        {subjectErrors.academicYear.message as string}
                      </p>
                    )}
                  </div>

                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    aria-label="حذف المادة"
                    className="shrink-0 mt-7"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              );
            })}

            {errors.subjects?.message && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3 shrink-0" />
                  {errors.subjects.message as string}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            size="lg"
            disabled={saving}
            className="gap-2 min-w-40"
          >
            <Save className="size-4" />
            {saving ? "جارٍ الحفظ..." : "حفظ المواد"}
          </Button>
        </div>
      </form>
    </div>
  );
}
