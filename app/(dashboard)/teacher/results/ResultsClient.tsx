"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  Home,
  FileText,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ─── Types ───────────────────────────────────────────────────

type ResultStatus = "PASSED" | "FAILED" | "UNDER_GRADING" | "IN_PROGRESS";

export interface TeacherResultExam {
  id: string;
  name: string;
  subject: string;
  totalScore: number;
}

export interface TeacherStudentResult {
  id: string;
  examId: string;
  studentName: string;
  studentCode: string;
  score: number;
  maxScore: number;
  status: ResultStatus;
  submittedAt: string;
}

interface ExamAnalytics {
  totalSubmissions: number;
  passRate: number;
  averageScore: number;
  highestScore: number;
}

// ─── Helpers ─────────────────────────────────────────────────

function computeAnalytics(results: TeacherStudentResult[]): ExamAnalytics {
  const completedResults = results.filter((r) => r.status !== "IN_PROGRESS");
  if (completedResults.length === 0) {
    return {
      totalSubmissions: results.length, // Show total including in-progress in the count card
      passRate: 0,
      averageScore: 0,
      highestScore: 0,
    };
  }
  const scores = completedResults.map((r) => r.score);
  const passed = completedResults.filter((r) => r.status === "PASSED").length;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  return {
    totalSubmissions: results.length,
    passRate: Math.round((passed / completedResults.length) * 100),
    averageScore: Math.round(avg * 10) / 10,
    highestScore: Math.max(...scores),
  };
}

// ─── Status Badge ────────────────────────────────────────────

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
  if (status === "IN_PROGRESS") {
    return (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
      >
        يؤدي الامتحان
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

// ─── Client Component ────────────────────────────────────────

export default function TeacherResultsClient({
  exams,
  results,
}: {
  exams: TeacherResultExam[];
  results: TeacherStudentResult[];
}) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedExam = useMemo(
    () => exams.find((e) => e.id === selectedExamId) ?? null,
    [exams, selectedExamId],
  );

  // Results for the selected exam
  const examResults = useMemo(
    () =>
      selectedExamId ? results.filter((r) => r.examId === selectedExamId) : [],
    [results, selectedExamId],
  );

  // Filtered by search
  const filteredResults = useMemo(() => {
    if (!searchQuery) return examResults;
    const q = searchQuery.toLowerCase();
    return examResults.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.studentCode.toLowerCase().includes(q),
    );
  }, [examResults, searchQuery]);

  // Analytics
  const analytics = useMemo(
    () => (selectedExam ? computeAnalytics(examResults) : null),
    [examResults, selectedExam],
  );

  const statsCards =
    selectedExam && analytics
      ? [
          {
            title: "إجمالي التسليمات",
            value: analytics.totalSubmissions.toString(),
            icon: Users,
            accent: "text-blue-600 bg-blue-50 dark:bg-blue-950",
          },
          {
            title: "نسبة النجاح",
            value: `${analytics.passRate}%`,
            icon: CheckCircle,
            accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
          },
          {
            title: "متوسط الدرجات",
            value: `${analytics.averageScore} / ${selectedExam.totalScore}`,
            icon: TrendingUp,
            accent: "text-amber-600 bg-amber-50 dark:bg-amber-950",
          },
          {
            title: "أعلى درجة",
            value: `${analytics.highestScore} / ${selectedExam.totalScore}`,
            icon: Award,
            accent: "text-purple-600 bg-purple-50 dark:bg-purple-950",
          },
        ]
      : null;

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
            <BreadcrumbPage>نتائج الامتحانات</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            نتائج الامتحانات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            عرض وتحليل نتائج الطلاب في الامتحانات
          </p>
        </div>
        <Button variant="outline" disabled={!selectedExam}>
          <Download className="h-4 w-4" />
          تصدير كملف Excel
        </Button>
      </div>

      {/* Exam Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={selectedExamId}
          onValueChange={(value) => {
            setSelectedExamId(value ?? "");
            setSearchQuery("");
          }}
        >
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue placeholder="اختر امتحاناً لعرض النتائج..." />
          </SelectTrigger>
          <SelectContent>
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* No Exam Selected State */}
      {!selectedExam && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 py-20 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            اختر امتحاناً من القائمة أعلاه
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            سيتم عرض النتائج والتحليلات هنا
          </p>
        </div>
      )}

      {/* Analytics Cards */}
      {statsCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card) => (
            <Card key={card.title} className="border-gray-100 shadow-sm">
              <CardContent className="flex items-center gap-4 pt-2">
                <div className={`rounded-xl p-3 ${card.accent}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    {card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Table */}
      {selectedExam && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث باسم الطالب أو الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9"
            />
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/60 dark:bg-gray-900/40">
                  <TableHead className="text-right">اسم الطالب</TableHead>
                  <TableHead className="text-right">كود الطالب</TableHead>
                  <TableHead className="text-right">الدرجة</TableHead>
                  <TableHead className="text-right">النسبة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">وقت التسليم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="h-8 w-8" />
                        <p>لا توجد نتائج مطابقة للبحث</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => {
                    const percentage =
                      result.maxScore > 0
                        ? Math.round((result.score / result.maxScore) * 100)
                        : 0;

                    return (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                          {result.studentName}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm font-mono">
                          {result.studentCode}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="font-semibold text-gray-900 dark:text-gray-50">
                            {result.score}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            / {result.maxScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span
                            className={
                              result.status === "PASSED"
                                ? "font-semibold text-emerald-600"
                                : result.status === "UNDER_GRADING"
                                  ? "font-semibold text-amber-600"
                                  : "font-semibold text-red-600"
                            }
                          >
                            {percentage}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={result.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {result.submittedAt}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground">
            عرض {filteredResults.length} من أصل {examResults.length} نتيجة
          </p>
        </div>
      )}
    </div>
  );
}
