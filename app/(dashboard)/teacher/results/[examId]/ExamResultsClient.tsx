"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  Home,
  AlertTriangle,
  Eye,
  Clock,
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ─── Types ───────────────────────────────────────────────────

type ResultStatus = "PASSED" | "FAILED" | "UNDER_GRADING";

interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
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
  if (m === 0) return `${s} ث`;
  return `${m} د ${s > 0 ? `${s} ث` : ""}`.trim();
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

// ─── Client Component ────────────────────────────────────────

export default function ExamResultsClient({
  examId,
  examTitle,
  examSubject,
  maxScore,
  results,
}: {
  examId: string;
  examTitle: string;
  examSubject: string;
  maxScore: number;
  results: StudentResult[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResults = useMemo(() => {
    if (!searchQuery) return results;
    const q = searchQuery.toLowerCase();
    return results.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.studentCode.toLowerCase().includes(q),
    );
  }, [results, searchQuery]);

  // Analytics
  const analytics = useMemo(() => {
    if (results.length === 0) {
      return { total: 0, passRate: 0, avgScore: 0, highest: 0 };
    }
    const scores = results.map((r) => r.score);
    const passed = results.filter((r) => r.status === "PASSED").length;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      total: results.length,
      passRate: Math.round((passed / results.length) * 100),
      avgScore: Math.round(avg * 10) / 10,
      highest: Math.max(...scores),
    };
  }, [results]);

  const statsCards = [
    {
      title: "إجمالي التسليمات",
      value: analytics.total.toString(),
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
      value: `${analytics.avgScore} / ${maxScore}`,
      icon: TrendingUp,
      accent: "text-amber-600 bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "أعلى درجة",
      value: `${analytics.highest} / ${maxScore}`,
      icon: Award,
      accent: "text-purple-600 bg-purple-50 dark:bg-purple-950",
    },
  ];

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
            <BreadcrumbPage>{examTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {examTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {examSubject} • نتائج الطلاب
        </p>
      </div>

      {/* Analytics Cards */}
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

      {/* Results Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/60 dark:bg-gray-900/40">
              <TableHead className="text-right">اسم الطالب</TableHead>
              <TableHead className="text-right">كود الطالب</TableHead>
              <TableHead className="text-right">الدرجة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الوقت المستغرق</TableHead>
              <TableHead className="text-right">المخالفات</TableHead>
              <TableHead className="text-right">وقت التسليم</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="h-8 w-8" />
                    <p>لا توجد نتائج مطابقة</p>
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
                      <span
                        className={`mr-2 text-xs ${
                          result.status === "PASSED"
                            ? "text-emerald-600"
                            : result.status === "UNDER_GRADING"
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        ({percentage}%)
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={result.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatDuration(result.timeTaken)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {result.violationsCount > 0 ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="size-3" />
                          {result.violationsCount}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {result.submittedAt}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        nativeButton={false}
                        render={
                          <Link
                            href={`/teacher/results/${examId}/${result.studentId}`}
                          />
                        }
                      >
                        <Eye className="size-4" />
                        معاينة الإجابات
                      </Button>
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
        عرض {filteredResults.length} من أصل {results.length} نتيجة
      </p>
    </div>
  );
}
