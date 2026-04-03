"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Home,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  CircleDot,
  PenLine,
  Save,
  Loader2,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { gradeEssayQuestion } from "@/app/actions/grading";

// ─── Types ───────────────────────────────────────────────────

type ResultStatus = "PASSED" | "FAILED" | "UNDER_GRADING";

interface OptionData {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface StudentAnswerData {
  id: string;
  optionId: string | null;
  textAnswer: string | null;
  isCorrect: boolean | null;
  marksAwarded: number;
}

interface QuestionData {
  id: string;
  text: string;
  type: "MCQ" | "ESSAY";
  score: number;
  options: OptionData[];
  studentAnswer: StudentAnswerData | null;
}

interface ResultData {
  score: number;
  maxScore: number;
  timeTaken: number;
  violationsCount: number;
  status: ResultStatus;
  submittedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} ثانية`;
  return `${m} دقيقة${s > 0 ? ` و ${s} ثانية` : ""}`;
}

function StatusBadge({ status }: { status: ResultStatus }) {
  if (status === "PASSED") {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      >
        ناجح
      </Badge>
    );
  }
  if (status === "UNDER_GRADING") {
    return (
      <Badge
        variant="outline"
        className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      >
        قيد التصحيح
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
    >
      راسب
    </Badge>
  );
}

// ─── Essay Grading Input ─────────────────────────────────────

function EssayGradeInput({
  answerId,
  maxScore,
  currentMarks,
}: {
  answerId: string;
  maxScore: number;
  currentMarks: number;
}) {
  const [marks, setMarks] = useState(currentMarks.toString());
  const [isPending, startTransition] = useTransition();

  const handleGrade = () => {
    const numMarks = parseFloat(marks);
    if (isNaN(numMarks) || numMarks < 0) {
      toast.error("يرجى إدخال درجة صحيحة");
      return;
    }
    if (numMarks > maxScore) {
      toast.error(`الدرجة القصوى لهذا السؤال هي ${maxScore}`);
      return;
    }

    startTransition(async () => {
      const result = await gradeEssayQuestion(answerId, numMarks);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-3 mt-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 shrink-0">
        تقييم المعلم:
      </span>
      <Input
        type="number"
        min={0}
        max={maxScore}
        step="0.5"
        value={marks}
        onChange={(e) => setMarks(e.target.value)}
        className="w-24 text-center"
        disabled={isPending}
      />
      <span className="text-sm text-muted-foreground shrink-0">
        / {maxScore}
      </span>
      <Button
        size="sm"
        onClick={handleGrade}
        disabled={isPending}
        className="gap-1.5"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Save className="size-3.5" />
        )}
        {isPending ? "جارٍ الحفظ..." : "حفظ الدرجة"}
      </Button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function AnswerPreviewClient({
  examId,
  examTitle,
  examSubject,
  studentName,
  studentCode,
  result,
  questions,
}: {
  examId: string;
  examTitle: string;
  examSubject: string;
  studentName: string;
  studentCode: string;
  result: ResultData;
  questions: QuestionData[];
}) {
  const percentage =
    result.maxScore > 0
      ? Math.round((result.score / result.maxScore) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
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
            <BreadcrumbLink render={<Link href="/teacher/results" />}>
              نتائج الامتحانات
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link href={`/teacher/results/${examId}`} />}
            >
              {examTitle}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{studentName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Student Info + Telemetry Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Student Info */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4" />
              بيانات الطالب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الاسم</span>
              <span className="font-medium text-gray-900 dark:text-gray-50">
                {studentName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">كود الطالب</span>
              <span className="font-mono text-sm">{studentCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الامتحان</span>
              <span className="text-sm">
                {examTitle} — {examSubject}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">وقت التسليم</span>
              <span className="text-sm">{result.submittedAt}</span>
            </div>
          </CardContent>
        </Card>

        {/* Telemetry & Score */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4" />
              ملخص الأداء
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الدرجة</span>
              <span className="font-bold text-gray-900 dark:text-gray-50">
                {result.score} / {result.maxScore}{" "}
                <span
                  className={cn(
                    "text-sm font-medium",
                    result.status === "PASSED"
                      ? "text-emerald-600"
                      : result.status === "UNDER_GRADING"
                        ? "text-amber-600"
                        : "text-red-600",
                  )}
                >
                  ({percentage}%)
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الحالة</span>
              <StatusBadge status={result.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                الوقت المستغرق
              </span>
              <span className="text-sm inline-flex items-center gap-1">
                <Clock className="size-3.5 text-muted-foreground" />
                {formatDuration(result.timeTaken)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">المخالفات</span>
              {result.violationsCount > 0 ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="size-3" />
                  {result.violationsCount} مخالفة
                </Badge>
              ) : (
                <span className="text-sm text-emerald-600">
                  لا توجد مخالفات
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions + Answers */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
          الإجابات ({questions.length} سؤال)
        </h2>

        {questions.map((q, index) => {
          const answer = q.studentAnswer;
          const isUnanswered = !answer;
          const isMCQ = q.type === "MCQ";
          const isEssay = q.type === "ESSAY";

          return (
            <Card
              key={q.id}
              className={cn(
                "border shadow-sm",
                isUnanswered
                  ? "border-gray-200"
                  : answer.isCorrect === true
                    ? "border-emerald-200 dark:border-emerald-800"
                    : answer.isCorrect === false
                      ? "border-red-200 dark:border-red-800"
                      : "border-amber-200 dark:border-amber-800",
              )}
            >
              <CardContent className="pt-5 space-y-4">
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="size-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium text-gray-900 dark:text-gray-50 leading-relaxed">
                        {q.text}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs gap-1",
                        isMCQ
                          ? "bg-blue-50 text-blue-600"
                          : "bg-violet-50 text-violet-600",
                      )}
                    >
                      {isMCQ ? (
                        <CircleDot className="size-3" />
                      ) : (
                        <PenLine className="size-3" />
                      )}
                      {isMCQ ? "اختيار" : "مقالي"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {answer?.marksAwarded ?? 0} / {q.score}
                    </Badge>
                  </div>
                </div>

                {/* MCQ Options */}
                {isMCQ && (
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isSelected = answer?.optionId === opt.id;
                      const { isCorrect } = opt;

                      return (
                        <div
                          key={opt.id}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border-2 p-3 text-sm",
                            isCorrect && isSelected
                              ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950"
                              : isSelected && !isCorrect
                                ? "border-red-300 bg-red-50 dark:bg-red-950"
                                : isCorrect
                                  ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/50"
                                  : "border-gray-100 bg-white dark:bg-gray-950",
                          )}
                        >
                          {isCorrect && isSelected && (
                            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                          )}
                          {isSelected && !isCorrect && (
                            <XCircle className="size-4 text-red-500 shrink-0" />
                          )}
                          {isCorrect && !isSelected && (
                            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                          )}
                          {!isCorrect && !isSelected && (
                            <div className="size-4 rounded-full border-2 border-gray-200 shrink-0" />
                          )}
                          <span
                            className={cn(
                              "flex-1",
                              isCorrect
                                ? "text-emerald-700 dark:text-emerald-300 font-medium"
                                : isSelected
                                  ? "text-red-700 dark:text-red-300"
                                  : "text-gray-600 dark:text-gray-400",
                            )}
                          >
                            {opt.text}
                          </span>
                          {isSelected && (
                            <span className="text-xs text-muted-foreground">
                              إجابة الطالب
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Essay Answer */}
                {isEssay && (
                  <div className="space-y-2">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        إجابة الطالب:
                      </p>
                      {answer?.textAnswer ? (
                        <p className="text-base leading-relaxed text-gray-900 dark:text-gray-50 whitespace-pre-wrap">
                          {answer.textAnswer}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          لم يتم تقديم إجابة
                        </p>
                      )}
                    </div>

                    {/* Essay Grading Input */}
                    {answer && (
                      <EssayGradeInput
                        answerId={answer.id}
                        maxScore={q.score}
                        currentMarks={answer.marksAwarded}
                      />
                    )}
                  </div>
                )}

                {/* Unanswered indicator */}
                {isUnanswered && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <XCircle className="size-4" />
                    لم يجب الطالب على هذا السؤال
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
