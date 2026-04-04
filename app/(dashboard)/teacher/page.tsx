import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  FileText,
  Users,
  Activity,
  Home,
  Inbox,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
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

// ─── Page Component (Server) ─────────────────────────────────

export default async function TeacherDashboardPage() {
  // ── 1. Auth guard ──────────────────────────────────────────
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/student");
  }

  const teacherId = session.user.id;
  const universityName = session.user.universityName;
  const department = session.user.department;

  // ── 2. Parallel data fetching ──────────────────────────────
  const [
    totalExams,
    totalStudents,
    activeExamsCount,
    activeExamsList,
    recentResults,
    subjectsCount,
  ] = await Promise.all([
    // a. Total exams by this teacher
    prisma.exam.count({
      where: { teacherId },
    }),

    // b. Total students in same university & department
    prisma.user.count({
      where: {
        role: "STUDENT",
        ...(universityName ? { universityName } : {}),
        ...(department ? { department } : {}),
      },
    }),

    // c. Active exams by this teacher
    prisma.exam.count({
      where: { teacherId, status: "ACTIVE" },
    }),

    // d. Active exams list for the table
    prisma.exam.findMany({
      where: { teacherId, status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        subject: true,
        duration: true,
      },
      orderBy: { date: "desc" },
      take: 5,
    }),

    // e. Latest 5 results for exams by this teacher (exclude archived)
    prisma.result.findMany({
      where: {
        exam: { teacherId },
        isArchived: false,
      },
      select: {
        id: true,
        score: true,
        maxScore: true,
        timeTaken: true,
        student: { select: { name: true } },
        exam: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // f. Count teacher subjects
    prisma.subject.count({
      where: { teacherId },
    }),
  ]);

  // ── 3. Build stats cards ───────────────────────────────────
  const statsCards = [
    {
      title: "مجموع الامتحانات",
      value: String(totalExams),
      icon: FileText,
      accent: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "إجمالي الطلاب",
      value: String(totalStudents),
      icon: Users,
      accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "الامتحانات النشطة",
      value: String(activeExamsCount),
      icon: Activity,
      accent: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  return (
    <div className="space-y-8">
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
            <BreadcrumbPage>الرئيسية</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">لوحة القيادة</h1>

      {/* No Subjects Warning */}
      {subjectsCount === 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-5">
          <div className="flex items-center justify-center size-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-foreground">
              لم تقم بإضافة مواد دراسية بعد
            </p>
            <p className="text-sm text-gray-600 dark:text-muted-foreground mt-0.5">
              يجب إضافة المواد الدراسية التي تقوم بتدريسها قبل أن تتمكن من إنشاء
              امتحانات.
            </p>
          </div>
          <Link
            href="/teacher/settings/subjects"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          >
            <BookOpen className="size-4" />
            إضافة المواد
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statsCards.map((card) => (
          <Card key={card.title} className="border-gray-100 dark:border-border shadow-sm">
            <CardContent className="flex items-center gap-4 pt-2">
              <div className={`rounded-xl p-3 ${card.accent}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Exams Table */}
        <Card className="border-gray-100 dark:border-border shadow-sm">
          <CardHeader className="border-b dark:border-border">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-foreground">
              الامتحانات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activeExamsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-muted-foreground">
                <Inbox className="w-10 h-10 mb-3" />
                <p className="text-sm">لا توجد امتحانات نشطة حالياً</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الامتحان</TableHead>
                    <TableHead className="text-right">الموضوع</TableHead>
                    <TableHead className="text-right">المدة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeExamsList.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">
                        {exam.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {exam.subject}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {exam.duration} دقيقة
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Results Table */}
        <Card className="border-gray-100 dark:border-border shadow-sm">
          <CardHeader className="border-b dark:border-border">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-foreground">
              النتائج الاخيرة
            </CardTitle>
            <CardAction>
              <Link
                href="/teacher/results"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                عرض الكل
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="p-0">
            {recentResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-muted-foreground">
                <Inbox className="w-10 h-10 mb-3" />
                <p className="text-sm">لا توجد نتائج بعد</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الطالب</TableHead>
                    <TableHead className="text-right">الامتحان</TableHead>
                    <TableHead className="text-right">النتيجة</TableHead>
                    <TableHead className="text-right">الوقت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentResults.map((result) => {
                    const percentage =
                      result.maxScore > 0
                        ? Math.round((result.score / result.maxScore) * 100)
                        : 0;
                    return (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">
                          {result.student.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {result.exam.title}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600/10 dark:ring-emerald-500/20">
                            {percentage}%
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {result.timeTaken} دقيقة
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
