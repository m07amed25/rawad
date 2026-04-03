import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Check, Home, ArrowRight, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import PrintButton from "./PrintButton";

export default async function AnswerKeyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/student");

  const exam = await prisma.exam.findUnique({
    where: { id, teacherId: session.user.id },
    select: {
      id: true,
      title: true,
      subject: true,
      duration: true,
      date: true,
      endDate: true,
      status: true,
      questions: {
        select: {
          id: true,
          text: true,
          type: true,
          score: true,
          options: {
            select: {
              id: true,
              text: true,
              isCorrect: true,
            },
          },
        },
      },
    },
  });

  if (!exam) notFound();

  const totalScore = exam.questions.reduce((sum, q) => sum + q.score, 0);
  const optionLabels = ["أ", "ب", "ج", "د", "هـ", "و", "ز", "ح"];
  const startDate = new Date(exam.date);
  const endDate = exam.endDate ? new Date(exam.endDate) : null;
  const timeFormat: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  return (
    <div className="min-h-screen pb-12">
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
            <BreadcrumbPage>نموذج الإجابة</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <FileText className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              نموذج الإجابة
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {exam.title} — {exam.subject}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/teacher/exams/${exam.id}/edit`} />}
          >
            <ArrowRight className="size-4" />
            تعديل الامتحان
          </Button>
          <PrintButton />
        </div>
      </div>

      {/* Exam Info Card */}
      <Card className="mb-6 print:shadow-none print:border-gray-300">
        <CardContent className="flex flex-wrap gap-6 py-4">
          <div>
            <p className="text-xs text-muted-foreground">المادة</p>
            <p className="font-medium">{exam.subject}</p>
          </div>
          <Separator orientation="vertical" className="h-10 print:hidden" />
          <div>
            <p className="text-xs text-muted-foreground">المدة</p>
            <p className="font-medium">{exam.duration} دقيقة</p>
          </div>
          <Separator orientation="vertical" className="h-10 print:hidden" />
          <div>
            <p className="text-xs text-muted-foreground">التاريخ</p>
            <p className="font-medium">
              {startDate.toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Separator orientation="vertical" className="h-10 print:hidden" />
          <div>
            <p className="text-xs text-muted-foreground">الوقت</p>
            <p className="font-medium">
              {endDate
                ? `${startDate.toLocaleTimeString("ar-SA", timeFormat)} — ${endDate.toLocaleTimeString("ar-SA", timeFormat)}`
                : startDate.toLocaleTimeString("ar-SA", timeFormat)}
            </p>
          </div>
          <Separator orientation="vertical" className="h-10 print:hidden" />
          <div>
            <p className="text-xs text-muted-foreground">عدد الأسئلة</p>
            <p className="font-medium">{exam.questions.length} سؤال</p>
          </div>
          <Separator orientation="vertical" className="h-10 print:hidden" />
          <div>
            <p className="text-xs text-muted-foreground">الدرجة الكلية</p>
            <p className="font-medium">{totalScore} درجة</p>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-5">
        {exam.questions.map((question, qIndex) => (
          <Card
            key={question.id}
            className="print:shadow-none print:border-gray-300 print:break-inside-avoid"
          >
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                    {qIndex + 1}
                  </div>
                  <CardTitle className="text-base">{question.text}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {question.type === "MCQ" ? "اختيار من متعدد" : "مقالي"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary"
                  >
                    {question.score} درجة
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {question.type === "MCQ" ? (
                <div className="space-y-2.5">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                        option.isCorrect
                          ? "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/40"
                          : "border-border"
                      }`}
                    >
                      {/* Option label badge */}
                      <span
                        className={`flex items-center justify-center size-7 rounded-md text-xs font-bold shrink-0 ${
                          option.isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {optionLabels[optIndex] || optIndex + 1}
                      </span>

                      {/* Option text */}
                      <span
                        className={`flex-1 text-sm ${
                          option.isCorrect
                            ? "font-semibold text-emerald-800 dark:text-emerald-200"
                            : "text-foreground"
                        }`}
                      >
                        {option.text}
                      </span>

                      {/* Check icon for correct answer */}
                      {option.isCorrect && (
                        <div className="flex items-center justify-center size-6 rounded-full bg-emerald-600 text-white shrink-0">
                          <Check className="size-3.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    سؤال مقالي — يتطلب تصحيحاً يدوياً
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
