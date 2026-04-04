"use client";

import React, { useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  useWatch,
  type UseFormReturn,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  FileText,
  ClipboardList,
  Save,
  BookOpen,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateExam } from "@/app/actions/exams";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

// ─── Schema (same as create page) ───────────────────────────────────────────

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "نص الخيار مطلوب"),
});

const questionSchema = z
  .object({
    id: z.string().optional(),
    text: z.string().min(1, "نص السؤال مطلوب"),
    type: z.enum(["MCQ", "ESSAY"]),
    score: z.coerce.number().min(1, "الدرجة يجب أن تكون 1 على الأقل"),
    options: z
      .array(optionSchema)
      .default([{ text: "" }, { text: "" }, { text: "" }, { text: "" }]),
    correctOption: z.coerce.number().default(0),
  })
  .superRefine((q, ctx) => {
    if (q.type === "MCQ") {
      if (q.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "يجب إضافة خيارين على الأقل",
          path: ["options"],
        });
      }
      q.options.forEach((opt, i) => {
        if (!opt.text.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "نص الخيار مطلوب",
            path: ["options", i, "text"],
          });
        }
      });
      if (q.correctOption < 0 || q.correctOption >= q.options.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "يجب تحديد الإجابة الصحيحة",
          path: ["correctOption"],
        });
      }
    }
  });

const editExamSchema = z.object({
  title: z.string().min(3, "اسم الامتحان يجب أن يكون 3 أحرف على الأقل"),
  subject: z.string().min(1, "يجب اختيار المادة"),
  date: z.string().min(1, "تاريخ الامتحان مطلوب"),
  startTime: z.string().min(1, "وقت بداية الامتحان مطلوب"),
  endTime: z.string().min(1, "وقت نهاية الامتحان مطلوب"),
  duration: z.coerce
    .number()
    .min(1, "مدة الامتحان يجب أن تكون دقيقة واحدة على الأقل"),
  questions: z.array(questionSchema).min(1, "يجب إضافة سؤال واحد على الأقل"),
});

type EditExamFormValues = z.infer<typeof editExamSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────

interface InitialData {
  id: string;
  title: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  hasResults: boolean;
  questions: {
    id: string;
    text: string;
    type: "MCQ" | "ESSAY";
    score: number;
    options: { id: string; text: string }[];
    correctOption: number;
  }[];
}

// ─── Subjects list ───────────────────────────────────────────────────────────

const subjects = [
  "الرياضيات",
  "الفيزياء",
  "الكيمياء",
  "الأحياء",
  "اللغة العربية",
  "اللغة الإنجليزية",
  "التاريخ",
  "الجغرافيا",
  "إدارة الأعمال",
  "الفلسفة",
] as const;

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

// ─── MCQ Options Nested Field Array ──────────────────────────────────────────

function McqOptionsBlock({
  questionIndex,
  form,
  correctOption,
  errors,
  setValue,
  disabled,
}: {
  questionIndex: number;
  form: UseFormReturn<EditExamFormValues>;
  correctOption: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any> | undefined;
  setValue: UseFormReturn<EditExamFormValues>["setValue"];
  disabled?: boolean;
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
        {!disabled && (
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
        )}
      </div>

      <RadioGroup
        value={String(correctOption)}
        onValueChange={(val) => {
          if (!disabled) {
            setValue(`questions.${questionIndex}.correctOption`, Number(val));
          }
        }}
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
            <RadioGroupItem
              value={String(optIdx)}
              disabled={disabled}
              aria-label={`تحديد الخيار ${optionLabels[optIdx] || optIdx + 1} كإجابة صحيحة`}
            />

            <span
              className={`flex items-center justify-center size-7 rounded-md text-xs font-bold shrink-0 ${
                correctOption === optIdx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {optionLabels[optIdx] || optIdx + 1}
            </span>

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

            {!disabled && fields.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  remove(optIdx);
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

// ─── Question Card Sub-component ─────────────────────────────────────────────

function QuestionCard({
  index,
  form,
  onRemove,
  totalQuestions,
  hasResults,
}: {
  index: number;
  form: UseFormReturn<EditExamFormValues>;
  onRemove: () => void;
  totalQuestions: number;
  hasResults: boolean;
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
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              {index + 1}
            </div>
            <CardTitle className="text-base">السؤال {index + 1}</CardTitle>
          </div>
          {!hasResults && (
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
          )}
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
          <div className="space-y-2">
            <Label>نوع السؤال</Label>
            <Controller
              control={control}
              name={`questions.${index}.type`}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    if (!hasResults) field.onChange(val);
                  }}
                  disabled={hasResults}
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
            disabled={hasResults}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ─── Error Summary Helper ────────────────────────────────────────────────────

function getEditErrorSummary(errors: FieldErrors<EditExamFormValues>) {
  const metadataErrors: string[] = [];
  const questionErrors: string[] = [];

  if (errors.title) metadataErrors.push("اسم الامتحان: " + errors.title.message);
  if (errors.subject) metadataErrors.push("المادة: " + errors.subject.message);
  if (errors.date) metadataErrors.push("التاريخ: " + errors.date.message);
  if (errors.startTime) metadataErrors.push("وقت البداية: " + errors.startTime.message);
  if (errors.endTime) metadataErrors.push("وقت النهاية: " + errors.endTime.message);
  if (errors.duration) metadataErrors.push("المدة: " + errors.duration.message);

  if (errors.questions) {
    if (errors.questions.message) {
      questionErrors.push(errors.questions.message);
    }
    if (Array.isArray(errors.questions)) {
      errors.questions.forEach((qErr, idx) => {
        if (!qErr) return;
        const qNum = idx + 1;
        if (qErr.text) questionErrors.push(`السؤال ${qNum}: نص السؤال مطلوب`);
        if (qErr.score) questionErrors.push(`السؤال ${qNum}: ${qErr.score.message}`);
        if (qErr.options) {
          if (typeof qErr.options === "object" && "message" in qErr.options && qErr.options.message) {
            questionErrors.push(`السؤال ${qNum}: ${qErr.options.message}`);
          } else if (Array.isArray(qErr.options)) {
            const emptyCount = qErr.options.filter(Boolean).length;
            if (emptyCount > 0) questionErrors.push(`السؤال ${qNum}: بعض الخيارات فارغة`);
          }
        }
        if (qErr.correctOption) questionErrors.push(`السؤال ${qNum}: يجب تحديد الإجابة الصحيحة`);
      });
    }
  }

  return { metadataErrors, questionErrors };
}

// ─── Error Summary Banner ────────────────────────────────────────────────────

function EditErrorSummaryBanner({
  errors,
  onGoToTab,
}: {
  errors: FieldErrors<EditExamFormValues>;
  onGoToTab: (tab: string) => void;
}) {
  const { metadataErrors, questionErrors } = getEditErrorSummary(errors);
  const hasErrors = metadataErrors.length > 0 || questionErrors.length > 0;

  if (!hasErrors) return null;

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2">
        <AlertCircle className="size-5 text-destructive shrink-0" />
        <h3 className="text-sm font-bold text-destructive">
          يوجد {metadataErrors.length + questionErrors.length} خطأ يجب تصحيحه قبل الحفظ
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

// ─── Main Edit Exam Client Component ─────────────────────────────────────────

export default function EditExamClient({
  initialData,
}: {
  initialData: InitialData;
}) {
  const router = useRouter();
  const { hasResults } = initialData;
  const [activeTab, setActiveTab] = useState("metadata");

  const form = useForm<EditExamFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editExamSchema) as any,
    defaultValues: {
      title: initialData.title,
      subject: initialData.subject,
      date: initialData.date,
      startTime: initialData.startTime,
      endTime: initialData.endTime,
      duration: initialData.duration,
      questions: initialData.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        score: q.score,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
        correctOption: q.correctOption,
      })),
    },
  });

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

  function onError(errs: FieldErrors<EditExamFormValues>) {
    console.log("Validation Errors:", errs);
    const { metadataErrors, questionErrors } = getEditErrorSummary(errs);

    // Auto-switch to the tab with errors
    if (metadataErrors.length > 0) {
      setActiveTab("metadata");
    } else if (questionErrors.length > 0) {
      setActiveTab("questions");
    }

    // Show a detailed toast
    const total = metadataErrors.length + questionErrors.length;
    const details: string[] = [];
    if (metadataErrors.length > 0) details.push(`${metadataErrors.length} في البيانات الأساسية`);
    if (questionErrors.length > 0) details.push(`${questionErrors.length} في الأسئلة`);

    toast.error(`يوجد ${total} خطأ: ${details.join(" و ")}`, {
      description: "راجع التفاصيل في أعلى النموذج",
      duration: 5000,
    });
  }

  async function onSubmit(data: EditExamFormValues) {
    // Transform client shape → server action shape
    const startDate = new Date(`${data.date}T${data.startTime}`);
    const endDate = data.endTime
      ? new Date(`${data.date}T${data.endTime}`)
      : null;

    // Map subject name to ID (you may need to adjust this based on your actual subject-to-ID mapping)
    const subjectIdMap: Record<string, string> = {
      الرياضيات: "math-id",
      الفيزياء: "physics-id",
      الكيمياء: "chemistry-id",
      الأحياء: "biology-id",
      "اللغة العربية": "arabic-id",
      "اللغة الإنجليزية": "english-id",
      التاريخ: "history-id",
      الجغرافيا: "geography-id",
      "إدارة الأعمال": "ba-id",
      الفلسفة: "philosophy-id",
    };

    const subjectId = subjectIdMap[data.subject] || "";

    const payload = {
      id: initialData.id,
      title: data.title,
      subject: data.subject,
      subjectId,
      duration: data.duration,
      date: startDate,
      endDate,
      questions: data.questions.map((q) => ({
        id: (q as { id?: string }).id,
        text: q.text,
        type: q.type,
        score: q.score,
        options:
          q.type === "MCQ"
            ? q.options.map((opt, i) => ({
                id: (opt as { id?: string }).id,
                text: opt.text,
                isCorrect: i === q.correctOption,
              }))
            : [],
      })),
    };

    try {
      const result = await updateExam(payload);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("تم تعديل الامتحان بنجاح!");
      router.push("/teacher/exams");
    } catch {
      toast.error("حدث خطأ غير متوقع. حاول مرة أخرى.");
    }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link href="/teacher" />}
              className="flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              لوحة التحكم
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/teacher/exams" />}>
              إدارة الامتحانات
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>تعديل الامتحان</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              تعديل الامتحان
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              تعديل بيانات وأسئلة الامتحان
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner for exams with results */}
      {hasResults && (
        <Alert className="mb-6 border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">
            تنبيه: يوجد نتائج مسجلة
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            يوجد طلاب أدوا هذا الامتحان بالفعل. يمكنك فقط تصحيح النصوص (الأخطاء
            الإملائية). لا يمكن إضافة أو حذف أسئلة أو خيارات أو تغيير الإجابة
            الصحيحة حتى لا تتأثر درجاتهم.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {/* Error summary banner */}
        <EditErrorSummaryBanner errors={errors} onGoToTab={setActiveTab} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="metadata" className="gap-2 relative">
              <FileText className="size-4" />
              البيانات الأساسية
              {(errors.title || errors.subject || errors.date || errors.startTime || errors.endTime || errors.duration) && (
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
                  تعديل المعلومات الأساسية للامتحان
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
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError message={errors.subject?.message as string} />
                  </div>

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

                {/* Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">تعديل الأسئلة</h2>
                  <p className="text-sm text-muted-foreground">
                    {hasResults
                      ? "يمكنك تصحيح النصوص فقط — لا يمكن تغيير بنية الأسئلة"
                      : "عدّل أسئلة الامتحان أو أضف أسئلة جديدة"}
                  </p>
                </div>
                {!hasResults && (
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
                )}
              </div>

              {errors.questions?.message && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <FieldError message={errors.questions.message as string} />
                </div>
              )}

              <div className="space-y-5">
                {fields.map((field, index) => (
                  <QuestionCard
                    key={field.id}
                    index={index}
                    form={form}
                    onRemove={() => remove(index)}
                    totalQuestions={fields.length}
                    hasResults={hasResults}
                  />
                ))}
              </div>

              {!hasResults && fields.length > 0 && (
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
                {isSubmitting ? "جارٍ الحفظ..." : "حفظ التعديلات"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
