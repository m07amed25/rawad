import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Inbox,
} from "lucide-react";
import Image from "next/image";

const colorPalette = ["blue", "emerald", "violet"] as const;

const colorMap = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-100 dark:border-blue-900/40",
    icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-100 dark:border-emerald-900/40",
    icon: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-100 dark:border-violet-900/40",
    icon: "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400",
    badge:
      "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    button: "bg-violet-600 hover:bg-violet-700 text-white",
  },
};

export default async function StudentDashboardPage() {
  // ── 1. Auth guard ──────────────────────────────────────────
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/teacher");
  }

  const studentId = session.user.id;
  const universityName = session.user.universityName;
  const department = session.user.department;

  // ── 2. Parallel data fetching ──────────────────────────────
  const [availableExams, previousResults] = await Promise.all([
    // a. Active exams where this student is explicitly allowed,
    //    excluding exams the student has already taken
    prisma.exam.findMany({
      where: {
        status: "ACTIVE",
        allowedStudents: {
          some: { id: studentId },
        },
        // Exclude exams the student already has an active (non-archived) result for
        NOT: {
          results: {
            some: { studentId, isArchived: false },
          },
        },
      },
      select: {
        id: true,
        title: true,
        subject: true,
        duration: true,
        date: true,
        endDate: true,
        subjectRef: {
          select: {
            id: true,
            name: true,
            academicYear: true,
          },
        },
        questions: {
          select: { id: true },
        },
      },
      orderBy: { date: "asc" },
    }),

    // b. Student's previous results with exam info (exclude archived)
    prisma.result.findMany({
      where: { studentId, isArchived: false },
      select: {
        id: true,
        score: true,
        maxScore: true,
        status: true,
        createdAt: true,
        exam: {
          select: {
            title: true,
            subject: true,
            date: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-linear-to-l from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-10 text-white shadow-lg overflow-hidden relative">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">
              مرحباً بك، {session.user.name}
            </h1>
            <p className="text-blue-100 text-xl">
              أهلاً بك في لوحة تحكم الطالب. يمكنك من هنا متابعة امتحاناتك
              والاطلاع على نتائجك.
            </p>
          </div>
          <div className="hidden md:block shrink-0">
            <Image
              src="/images/hello_massage.png"
              alt="مرحباً"
              width={200}
              height={200}
              className="drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Available Exams */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">
            الامتحانات المتاحة
          </h2>
          <span className="text-base text-gray-500 dark:text-muted-foreground">
            {availableExams.length} امتحانات
          </span>
        </div>

        {availableExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-muted-foreground bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border">
            <Inbox className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">لا توجد امتحانات متاحة حالياً</p>
            <p className="text-sm mt-1">سيتم إشعارك عند توفر امتحانات جديدة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableExams.map((exam, index) => {
              const colorKey = colorPalette[index % colorPalette.length];
              const colors = colorMap[colorKey];
              const questionsCount = exam.questions.length;
              const startDate = new Date(exam.date);
              const endDate = exam.endDate ? new Date(exam.endDate) : null;
              const timeFmt: Intl.DateTimeFormatOptions = {
                hour: "2-digit",
                minute: "2-digit",
              };
              const formattedDate = startDate.toLocaleDateString("ar-SA");
              const timeStr = endDate
                ? `${startDate.toLocaleTimeString("ar-SA", timeFmt)} — ${endDate.toLocaleTimeString("ar-SA", timeFmt)}`
                : startDate.toLocaleTimeString("ar-SA", timeFmt);
              return (
                <div
                  key={exam.id}
                  className={`${colors.bg} border ${colors.border} rounded-2xl p-6 transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center`}
                    >
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${colors.badge}`}
                    >
                      {exam.subjectRef?.name ?? exam.subject}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-3">
                    {exam.title}
                  </h3>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{exam.duration} دقيقة</span>
                      <span className="mx-1 text-gray-300 dark:text-gray-600">
                        •
                      </span>
                      <span>{questionsCount} سؤال</span>
                    </div>
                    {exam.subjectRef?.academicYear && (
                      <div className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400">
                        <BookOpen className="w-4 h-4" />
                        <span>{exam.subjectRef.academicYear}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400">
                      <CalendarDays className="w-4 h-4" />
                      <span>{formattedDate}</span>
                      <span className="mx-1 text-gray-300 dark:text-gray-600">
                        •
                      </span>
                      <span>{timeStr}</span>
                    </div>
                  </div>

                  <Link
                    href={`/student/exam/${exam.id}`}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium transition-colors ${colors.button}`}
                  >
                    <span>بدء الامتحان</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Previous Exams Table */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-5">
          سجل الامتحانات السابقة
        </h2>

        {previousResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-muted-foreground bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border">
            <Inbox className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">لا توجد نتائج سابقة</p>
            <p className="text-sm mt-1">
              ستظهر نتائجك هنا بعد إتمام أول امتحان
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="bg-gray-50 dark:bg-muted/50 border-b border-gray-200 dark:border-border">
                    <th className="text-start px-6 py-4 font-semibold text-gray-600 dark:text-muted-foreground">
                      اسم المادة
                    </th>
                    <th className="text-start px-6 py-4 font-semibold text-gray-600 dark:text-muted-foreground">
                      اسم الامتحان
                    </th>
                    <th className="text-start px-6 py-4 font-semibold text-gray-600 dark:text-muted-foreground">
                      الدرجة
                    </th>
                    <th className="text-start px-6 py-4 font-semibold text-gray-600 dark:text-muted-foreground">
                      الحالة
                    </th>
                    <th className="text-start px-6 py-4 font-semibold text-gray-600 dark:text-muted-foreground">
                      التاريخ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border">
                  {previousResults.map((result) => {
                    const percentage =
                      result.maxScore > 0
                        ? Math.round((result.score / result.maxScore) * 100)
                        : 0;
                    const isPassed = result.status === "PASSED";
                    const isUnderGrading = result.status === "UNDER_GRADING";
                    const formattedDate = new Date(
                      result.createdAt,
                    ).toLocaleDateString("ar-SA");
                    return (
                      <tr
                        key={result.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-foreground">
                          {result.exam.subject}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-muted-foreground">
                          {result.exam.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900 dark:text-foreground">
                            {percentage}
                          </span>
                          <span className="text-gray-400 dark:text-muted-foreground">
                            %
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {isUnderGrading ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Clock className="w-4 h-4" />
                              قيد التقييم
                            </span>
                          ) : isPassed ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                              <CheckCircle2 className="w-4 h-4" />
                              ناجح
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                              <XCircle className="w-4 h-4" />
                              راسب
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-muted-foreground">
                          {formattedDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
