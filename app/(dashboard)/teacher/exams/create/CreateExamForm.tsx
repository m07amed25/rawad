"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  useWatch,
  type UseFormReturn,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  FileText,
  ClipboardList,
  Save,
  BookOpen,
  AlertCircle,
  Users,
  Search,
  X,
  CheckCheck,
  UserCheck,
  Filter,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getStudentsForTeacher } from "@/app/actions/teacher";
import { createFullExam } from "@/app/actions/exams";
import { examFormSchema, type ExamFormValues } from "@/lib/validations";
import type { SubjectOption } from "@/types";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ─── Zod Schema (imported from @/lib/validations) ───────────────────────────

// ─── Student type ────────────────────────────────────────────────────────────

type Student = Awaited<ReturnType<typeof getStudentsForTeacher>>[number];

// ─── Field Error Helper ──────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-destructive mt-1.5">
      <AlertCircle className="size-3 shrink-0" />
      {message}
    </p>
  );
}

// ─── Question Card Sub-component ─────────────────────────────────────────────

function QuestionCard({
  index,
  form,
  onRemove,
  totalQuestions,
}: {
  index: number;
  form: UseFormReturn<ExamFormValues>;
  onRemove: () => void;
  totalQuestions: number;
}) {
  const {
    register,
    control,
    formState: { errors },
    setValue,
  } = form;

  const questionType = useWatch({
    control,
    name: `questions.${index}.type`,
  });

  const correctOption = useWatch({
    control,
    name: `questions.${index}.correctOption`,
  });

  const questionErrors = errors.questions?.[index];

  return (
    <Card className="relative transition-all hover:ring-2 hover:ring-primary/10">
      {/* Question number badge + delete */}
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              {index + 1}
            </div>
            <CardTitle className="text-base">السؤال {index + 1}</CardTitle>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            onClick={onRemove}
            disabled={totalQuestions <= 1}
            aria-label="حذف السؤال"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
        <CardDescription>أدخل نص السؤال واختر نوعه ودرجته</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        {/* Question text */}
        <div className="space-y-2">
          <Label htmlFor={`q-text-${index}`}>نص السؤال</Label>
          <Textarea
            id={`q-text-${index}`}
            placeholder="اكتب نص السؤال هنا..."
            className="min-h-20 resize-none"
            {...register(`questions.${index}.text`)}
          />
          <FieldError message={questionErrors?.text?.message as string} />
        </div>

        {/* Type + Score row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Question Type */}
          <div className="space-y-2">
            <Label>نوع السؤال</Label>
            <Controller
              control={control}
              name={`questions.${index}.type`}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر نوع السؤال" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">اختيار من متعدد</SelectItem>
                    <SelectItem value="ESSAY">مقالي</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={questionErrors?.type?.message as string} />
          </div>

          {/* Score */}
          <div className="space-y-2">
            <Label htmlFor={`q-score-${index}`}>الدرجة</Label>
            <Input
              id={`q-score-${index}`}
              type="number"
              min={1}
              placeholder="مثال: 5"
              className="h-8"
              {...register(`questions.${index}.score`)}
            />
            <FieldError message={questionErrors?.score?.message as string} />
          </div>
        </div>

        <Separator />

        {/* Sign Language Video URL (optional) */}
        <div className="space-y-2">
          <Label
            htmlFor={`q-sign-lang-${index}`}
            className="flex items-center gap-2"
          >
            <Video className="size-4 text-muted-foreground" />
            رابط فيديو لغة الإشارة (اختياري)
          </Label>
          <Input
            id={`q-sign-lang-${index}`}
            type="url"
            dir="ltr"
            placeholder="https://www.youtube.com/watch?v=... أو رابط فيديو مباشر"
            className="h-8 text-sm"
            {...register(`questions.${index}.signLanguageUrl`)}
          />
          <FieldError
            message={questionErrors?.signLanguageUrl?.message as string}
          />
          <p className="text-xs text-muted-foreground">
            ألصق رابط فيديو يوتيوب أو رابط فيديو مباشر يترجم السؤال إلى لغة
            الإشارة
          </p>
        </div>

        {/* Dynamic rendering based on type */}
        {questionType === "ESSAY" ? (
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              معاينة — حقل إجابة الطالب
            </Label>
            <Textarea
              disabled
              placeholder="سيظهر هنا حقل نصي للطالب للإجابة..."
              className="min-h-28 resize-none bg-muted/40 cursor-not-allowed"
            />
          </div>
        ) : (
          <McqOptionsBlock
            questionIndex={index}
            form={form}
            correctOption={correctOption}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            errors={questionErrors as Record<string, any> | undefined}
            setValue={setValue}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ─── Student Selector ────────────────────────────────────────────────────────

function StudentSelector({
  students,
  loading,
  form,
}: {
  students: Student[];
  loading: boolean;
  form: UseFormReturn<ExamFormValues>;
}) {
  const { control, setValue } = form;
  const [search, setSearch] = useState("");

  const selectionMode = useWatch({ control, name: "selectionMode" });
  const selectedYear = useWatch({ control, name: "selectedYear" });
  const studentIds = useWatch({ control, name: "studentIds" });

  const academicYears = useMemo(() => {
    const years = new Set(students.map((s) => s.academicYear).filter(Boolean));
    return Array.from(years).sort() as string[];
  }, [students]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    let list = students;
    if (selectionMode === "year" && selectedYear) {
      list = list.filter((s) => s.academicYear === selectedYear);
    }
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
        (s.nationalId && s.nationalId.toLowerCase().includes(q)),
    );
  }, [students, search, selectionMode, selectedYear]);

  // When mode changes, update studentIds accordingly
  const syncStudentIds = useCallback(
    (mode: string, year?: string) => {
      if (mode === "all") {
        setValue(
          "studentIds",
          students.map((s) => s.id),
          { shouldValidate: true },
        );
      } else if (mode === "year" && year) {
        setValue(
          "studentIds",
          students.filter((s) => s.academicYear === year).map((s) => s.id),
          { shouldValidate: true },
        );
      }
      // "manual" — keep current selection
    },
    [students, setValue],
  );

  useEffect(() => {
    syncStudentIds(selectionMode, selectedYear);
  }, [selectionMode, selectedYear, syncStudentIds]);

  const toggleStudent = (id: string) => {
    const current = studentIds || [];
    const next = current.includes(id)
      ? current.filter((sid) => sid !== id)
      : [...current, id];
    setValue("studentIds", next, { shouldValidate: true });
  };

  const selectAll = () => {
    setValue(
      "studentIds",
      filteredStudents.map((s) => s.id),
      { shouldValidate: true },
    );
  };

  const deselectAll = () => {
    setValue("studentIds", [], { shouldValidate: true });
  };

  const isSelected = (id: string) => (studentIds || []).includes(id);

  if (loading) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">
          جارٍ تحميل الطلاب...
        </p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <Users className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">
          لا يوجد طلاب مسجلين في نفس الجامعة والقسم
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection mode tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all" as const, label: "جميع الطلاب", icon: CheckCheck },
          { value: "year" as const, label: "حسب السنة الدراسية", icon: Filter },
          { value: "manual" as const, label: "اختيار يدوي", icon: UserCheck },
        ].map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() =>
              setValue("selectionMode", mode.value, { shouldValidate: true })
            }
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              selectionMode === mode.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <mode.icon className="size-4" />
            {mode.label}
          </button>
        ))}
      </div>

      {/* Year filter (only for year mode) */}
      {selectionMode === "year" && (
        <Controller
          control={control}
          name="selectedYear"
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={(val) => field.onChange(val)}
            >
              <SelectTrigger className="w-full sm:w-60">
                <SelectValue placeholder="اختر السنة الدراسية" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((y) => (
                  <SelectItem key={y} value={y}>
                    السنة {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}

      {/* Search + bulk actions (for manual & year modes) */}
      {selectionMode !== "all" && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="ابحث بالاسم أو الإيميل أو رقم الطالب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 h-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {selectionMode === "manual" && (
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAll}
              >
                تحديد الكل
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={deselectAll}
              >
                إلغاء الكل
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Student count badge */}
      <div className="flex items-center gap-2 text-sm">
        <Users className="size-4 text-primary" />
        <span className="text-muted-foreground">
          تم اختيار{" "}
          <span className="font-bold text-foreground">
            {(studentIds || []).length}
          </span>{" "}
          من أصل{" "}
          <span className="font-bold text-foreground">{students.length}</span>{" "}
          طالب
        </span>
      </div>

      {/* Student list (manual / year mode) */}
      {selectionMode !== "all" && (
        <div className="max-h-72 overflow-y-auto rounded-xl border border-border divide-y divide-border">
          {filteredStudents.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              لا توجد نتائج للبحث
            </div>
          ) : (
            filteredStudents.map((student) => (
              <label
                key={student.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/40 ${
                  isSelected(student.id) ? "bg-primary/5" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  className="size-4 rounded border-input accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{student.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {student.email}
                    {student.studentCode && ` · ${student.studentCode}`}
                    {student.academicYear && ` · السنة ${student.academicYear}`}
                  </p>
                </div>
                {isSelected(student.id) && (
                  <span className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground">
                    <CheckCheck className="size-3" />
                  </span>
                )}
              </label>
            ))
          )}
        </div>
      )}

      {/* "All" mode summary */}
      {selectionMode === "all" && (
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center">
          <CheckCheck className="mx-auto size-6 text-primary mb-2" />
          <p className="text-sm font-medium">
            سيتم تعيين الامتحان لجميع الطلاب
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {students.length} طالب في نفس الجامعة والقسم
          </p>
        </div>
      )}
    </div>
  );
}

// ─── MCQ Options Nested Field Array ──────────────────────────────────────────

function McqOptionsBlock({
  questionIndex,
  form,
  correctOption,
  errors,
  setValue,
}: {
  questionIndex: number;
  form: UseFormReturn<ExamFormValues>;
  correctOption: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any> | undefined;
  setValue: UseFormReturn<ExamFormValues>["setValue"];
}) {
  const { control, register } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const optionLabels = ["أ", "ب", "ج", "د", "هـ", "و", "ز", "ح"];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>الخيارات</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ text: "" })}
          disabled={fields.length >= 8}
        >
          <Plus className="size-3.5" />
          إضافة خيار
        </Button>
      </div>

      <RadioGroup
        value={String(correctOption)}
        onValueChange={(val) =>
          setValue(`questions.${questionIndex}.correctOption`, Number(val))
        }
        className="gap-3"
      >
        {fields.map((field, optIdx) => (
          <div
            key={field.id}
            className={`group flex items-center gap-3 rounded-xl border p-3 transition-all ${
              correctOption === optIdx
                ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                : "border-border hover:border-primary/20"
            }`}
          >
            {/* Radio to mark correct */}
            <RadioGroupItem
              value={String(optIdx)}
              aria-label={`تحديد الخيار ${optionLabels[optIdx] || optIdx + 1} كإجابة صحيحة`}
            />

            {/* Option label badge */}
            <span
              className={`flex items-center justify-center size-7 rounded-md text-xs font-bold shrink-0 ${
                correctOption === optIdx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {optionLabels[optIdx] || optIdx + 1}
            </span>

            {/* Option text input */}
            <div className="flex-1">
              <Input
                placeholder={`الخيار ${optionLabels[optIdx] || optIdx + 1}`}
                className="h-8"
                {...register(
                  `questions.${questionIndex}.options.${optIdx}.text`,
                )}
              />
              <FieldError
                message={
                  errors?.options?.[optIdx]?.text?.message as string | undefined
                }
              />
            </div>

            {/* Remove option */}
            {fields.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  remove(optIdx);
                  // Adjust correctOption if needed
                  if (correctOption >= fields.length - 1) {
                    setValue(
                      `questions.${questionIndex}.correctOption`,
                      Math.max(0, fields.length - 2),
                    );
                  } else if (correctOption > optIdx) {
                    setValue(
                      `questions.${questionIndex}.correctOption`,
                      correctOption - 1,
                    );
                  }
                }}
                aria-label="حذف الخيار"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="size-3 text-muted-foreground" />
              </Button>
            )}
          </div>
        ))}
      </RadioGroup>

      {errors?.options?.message && (
        <FieldError message={errors.options.message as string} />
      )}
      {correctOption !== undefined && errors?.correctOption?.message && (
        <FieldError message={errors.correctOption.message as string} />
      )}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

// ─── Error Summary Helper ────────────────────────────────────────────────────

function getErrorSummary(errors: FieldErrors<ExamFormValues>) {
  const metadataErrors: string[] = [];
  const questionErrors: string[] = [];

  if (errors.title)
    metadataErrors.push("اسم الامتحان: " + errors.title.message);
  if (errors.subject) metadataErrors.push("المادة: " + errors.subject.message);
  if (errors.date) metadataErrors.push("التاريخ: " + errors.date.message);
  if (errors.startTime)
    metadataErrors.push("وقت البداية: " + errors.startTime.message);
  if (errors.endTime)
    metadataErrors.push("وقت النهاية: " + errors.endTime.message);
  if (errors.duration) metadataErrors.push("المدة: " + errors.duration.message);
  if (errors.studentIds)
    metadataErrors.push("الطلاب: " + errors.studentIds.message);

  if (errors.questions) {
    if (errors.questions.message) {
      questionErrors.push(errors.questions.message);
    }
    if (Array.isArray(errors.questions)) {
      errors.questions.forEach((qErr, idx) => {
        if (!qErr) return;
        const qNum = idx + 1;
        if (qErr.text) questionErrors.push(`السؤال ${qNum}: نص السؤال مطلوب`);
        if (qErr.score)
          questionErrors.push(`السؤال ${qNum}: ${qErr.score.message}`);
        if (qErr.signLanguageUrl)
          questionErrors.push(`السؤال ${qNum}: رابط لغة الإشارة غير صالح`);
        if (qErr.options) {
          if (
            typeof qErr.options === "object" &&
            "message" in qErr.options &&
            qErr.options.message
          ) {
            questionErrors.push(`السؤال ${qNum}: ${qErr.options.message}`);
          } else if (Array.isArray(qErr.options)) {
            const emptyCount = qErr.options.filter(Boolean).length;
            if (emptyCount > 0)
              questionErrors.push(`السؤال ${qNum}: بعض الخيارات فارغة`);
          }
        }
        if (qErr.correctOption)
          questionErrors.push(`السؤال ${qNum}: يجب تحديد الإجابة الصحيحة`);
      });
    }
  }

  return { metadataErrors, questionErrors };
}

// ─── Error Summary Banner ────────────────────────────────────────────────────

function ErrorSummaryBanner({
  errors,
  onGoToTab,
}: {
  errors: FieldErrors<ExamFormValues>;
  onGoToTab: (tab: string) => void;
}) {
  const { metadataErrors, questionErrors } = getErrorSummary(errors);
  const hasErrors = metadataErrors.length > 0 || questionErrors.length > 0;

  if (!hasErrors) return null;

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2">
        <AlertCircle className="size-5 text-destructive shrink-0" />
        <h3 className="text-sm font-bold text-destructive">
          يوجد {metadataErrors.length + questionErrors.length} خطأ يجب تصحيحه
          قبل الحفظ
        </h3>
      </div>

      {metadataErrors.length > 0 && (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onGoToTab("metadata")}
            className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1"
          >
            <FileText className="size-3.5" />
            البيانات الأساسية ({metadataErrors.length})
          </button>
          <ul className="list-disc list-inside text-xs text-destructive/80 space-y-0.5 mr-5">
            {metadataErrors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {questionErrors.length > 0 && (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onGoToTab("questions")}
            className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1"
          >
            <ClipboardList className="size-3.5" />
            الأسئلة ({questionErrors.length})
          </button>
          <ul className="list-disc list-inside text-xs text-destructive/80 space-y-0.5 mr-5">
            {questionErrors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function CreateExamPage({
  subjects,
}: {
  subjects: SubjectOption[];
}) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("metadata");

  const form = useForm<ExamFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(examFormSchema) as any,
    defaultValues: {
      title: "",
      subject: "",
      date: "",
      startTime: "",
      endTime: "",
      duration: 60,
      isPublished: false,
      selectionMode: "all",
      selectedYear: "",
      studentIds: [],
      questions: [
        {
          text: "",
          type: "MCQ",
          score: 5,
          options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
          correctOption: 0,
        },
      ],
    },
  });

  // Fetch students on mount
  useEffect(() => {
    async function loadStudents() {
      try {
        // We need the teacher's ID from the session — use a lightweight fetch
        const res = await fetch("/api/auth/get-session");
        const session = await res.json();
        console.log("[StudentLoad] session response:", JSON.stringify(session));
        if (session?.user?.id) {
          console.log("[StudentLoad] teacher id:", session.user.id);
          const data = await getStudentsForTeacher(session.user.id);
          console.log("[StudentLoad] students found:", data.length, data);
          setStudents(data);
          // Auto-select all students by default
          form.setValue(
            "studentIds",
            data.map((s) => s.id),
            { shouldValidate: true },
          );
        }
      } catch (err) {
        console.error("[StudentLoad] Failed to load students:", err);
      } finally {
        setStudentsLoading(false);
      }
    }
    loadStudents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const questions = useWatch({ control, name: "questions" });
  const totalScore = questions?.reduce(
    (sum, q) => sum + (Number(q?.score) || 0),
    0,
  );

  function onError(errs: FieldErrors<ExamFormValues>) {
    console.log("Validation Errors:", errs);
    const { metadataErrors, questionErrors } = getErrorSummary(errs);

    // Auto-switch to the tab with errors
    if (metadataErrors.length > 0) {
      setActiveTab("metadata");
    } else if (questionErrors.length > 0) {
      setActiveTab("questions");
    }

    // Show a detailed toast
    const total = metadataErrors.length + questionErrors.length;
    const details: string[] = [];
    if (metadataErrors.length > 0)
      details.push(`${metadataErrors.length} في البيانات الأساسية`);
    if (questionErrors.length > 0)
      details.push(`${questionErrors.length} في الأسئلة`);

    toast.error(`يوجد ${total} خطأ: ${details.join(" و ")}`, {
      description: "راجع التفاصيل في أعلى النموذج",
      duration: 5000,
    });
  }

  async function onSubmit(data: ExamFormValues) {
    console.log("Form Data Submitted:", data);

    // Transform client shape → server action shape
    const startDate = new Date(`${data.date}T${data.startTime}`);
    const endDate = data.endTime
      ? new Date(`${data.date}T${data.endTime}`)
      : null;

    // Resolve subject name from the subjects array prop
    const selectedSubject = subjects.find((s) => s.id === data.subject);
    const subjectName = selectedSubject?.name ?? data.subject;

    const payload = {
      title: data.title,
      subject: subjectName,
      subjectId: data.subject, // this is the UUID
      duration: data.duration,
      date: startDate,
      endDate,
      questions: data.questions.map((q) => ({
        text: q.text,
        type: q.type,
        score: q.score,
        signLanguageUrl: q.signLanguageUrl || undefined,
        options:
          q.type === "MCQ"
            ? q.options.map((opt, i) => ({
                text: opt.text,
                isCorrect: i === q.correctOption,
              }))
            : [],
      })),
    };

    try {
      const result = await createFullExam(payload);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("تم إنشاء الامتحان بنجاح!");
      router.push("/teacher/exams");
    } catch (err) {
      console.error("Unexpected error creating exam:", err);
      toast.error("حدث خطأ غير متوقع. حاول مرة أخرى.");
    }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              إنشاء امتحان جديد
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              أنشئ امتحانك، أضف الأسئلة، ثم انشره للطلاب
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {/* Error summary banner */}
        <ErrorSummaryBanner errors={errors} onGoToTab={setActiveTab} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab navigation */}
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="metadata" className="gap-2 relative">
              <FileText className="size-4" />
              البيانات الأساسية
              {(errors.title ||
                errors.subject ||
                errors.date ||
                errors.startTime ||
                errors.endTime ||
                errors.duration ||
                errors.studentIds) && (
                <span className="absolute -top-1 -left-1 flex size-2.5 rounded-full bg-destructive">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full size-2.5 bg-destructive" />
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2 relative">
              <ClipboardList className="size-4" />
              الأسئلة
              {fields.length > 0 && !errors.questions && (
                <span className="mr-1 flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  {fields.length}
                </span>
              )}
              {errors.questions && (
                <span className="absolute -top-1 -left-1 flex size-2.5 rounded-full bg-destructive">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full size-2.5 bg-destructive" />
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Exam Metadata ─── */}
          <TabsContent value="metadata">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>بيانات الامتحان</CardTitle>
                <CardDescription>
                  أدخل المعلومات الأساسية للامتحان
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="exam-title">اسم الامتحان</Label>
                  <Input
                    id="exam-title"
                    placeholder="مثال: امتحان منتصف الفصل — الرياضيات"
                    {...register("title")}
                  />
                  <FieldError message={errors.title?.message as string} />
                </div>

                {/* Subject + Date row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Subject */}
                  <div className="space-y-2">
                    <Label>المادة</Label>
                    <Controller
                      control={control}
                      name="subject"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(val) => field.onChange(val)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="اختر المادة" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} — {s.academicYear}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.subject?.message as string} />
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="exam-date">تاريخ الامتحان</Label>
                    <Input id="exam-date" type="date" {...register("date")} />
                    <FieldError message={errors.date?.message as string} />
                  </div>
                </div>

                {/* Start Time + End Time row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="exam-start-time">وقت بداية الامتحان</Label>
                    <Input
                      id="exam-start-time"
                      type="time"
                      {...register("startTime")}
                    />
                    <FieldError message={errors.startTime?.message as string} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-end-time">وقت نهاية الامتحان</Label>
                    <Input
                      id="exam-end-time"
                      type="time"
                      {...register("endTime")}
                    />
                    <FieldError message={errors.endTime?.message as string} />
                  </div>
                </div>

                {/* Duration + Status row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="exam-duration">
                      مدة الامتحان (بالدقائق)
                    </Label>
                    <Input
                      id="exam-duration"
                      type="number"
                      min={1}
                      placeholder="60"
                      {...register("duration")}
                    />
                    <FieldError message={errors.duration?.message as string} />
                  </div>

                  {/* Published status */}
                  <div className="space-y-2">
                    <Label>حالة الامتحان</Label>
                    <Controller
                      control={control}
                      name="isPublished"
                      render={({ field }) => (
                        <div className="flex items-center gap-3 rounded-lg border p-3">
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked)
                            }
                          />
                          <span className="text-sm font-medium">
                            {field.value ? (
                              <span className="text-emerald-600">
                                نشر — متاح للطلاب
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                مسودة — غير متاح
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* ─── Student Selection ─── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    <Label className="text-base font-semibold">
                      الطلاب المستهدفون
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    اختر الطلاب الذين سيتم تعيين هذا الامتحان لهم
                  </p>
                  <StudentSelector
                    students={students}
                    loading={studentsLoading}
                    form={form}
                  />
                  <FieldError message={errors.studentIds?.message as string} />
                </div>

                <Separator />

                {/* Score summary */}
                <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-4">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                    <ClipboardList className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">ملخص الامتحان</p>
                    <p className="text-xs text-muted-foreground">
                      عدد الأسئلة:{" "}
                      <span className="font-bold text-foreground">
                        {fields.length}
                      </span>{" "}
                      — المجموع الكلي:{" "}
                      <span className="font-bold text-foreground">
                        {totalScore}
                      </span>{" "}
                      درجة
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 2: Questions ─── */}
          <TabsContent value="questions">
            <div className="space-y-5">
              {/* Questions header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">منشئ الأسئلة</h2>
                  <p className="text-sm text-muted-foreground">
                    أضف أسئلة الامتحان واختر نوع كل سؤال
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() =>
                    append({
                      text: "",
                      type: "MCQ",
                      score: 5,
                      options: [
                        { text: "" },
                        { text: "" },
                        { text: "" },
                        { text: "" },
                      ],
                      correctOption: 0,
                    })
                  }
                  className="gap-1.5"
                >
                  <Plus className="size-4" />
                  إضافة سؤال
                </Button>
              </div>

              {errors.questions?.message && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <FieldError message={errors.questions.message as string} />
                </div>
              )}

              {/* Question cards */}
              <div className="space-y-5">
                {fields.map((field, index) => (
                  <QuestionCard
                    key={field.id}
                    index={index}
                    form={form}
                    onRemove={() => remove(index)}
                    totalQuestions={fields.length}
                  />
                ))}
              </div>

              {/* Add question CTA at bottom */}
              {fields.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    append({
                      text: "",
                      type: "MCQ",
                      score: 5,
                      options: [
                        { text: "" },
                        { text: "" },
                        { text: "" },
                        { text: "" },
                      ],
                      correctOption: 0,
                    })
                  }
                  className="w-full rounded-xl border-2 border-dashed border-muted-foreground/25 p-6 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Plus className="size-4" />
                  إضافة سؤال جديد
                </button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* ─── Sticky Submit Bar ─── */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-background/80 backdrop-blur-xl border-t border-border">
            <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  الأسئلة:{" "}
                  <span className="font-bold text-foreground">
                    {fields.length}
                  </span>
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span>
                  المجموع:{" "}
                  <span className="font-bold text-foreground">
                    {totalScore}
                  </span>{" "}
                  درجة
                </span>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="gap-2 min-w-40"
              >
                <Save className="size-4" />
                {isSubmitting ? "جارٍ الحفظ..." : "حفظ الامتحان"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
