import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, FileText, Users, BookOpen, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function TeacherResultsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/student");

  const exams = await prisma.exam.findMany({
    where: { teacherId: session.user.id },
    select: {
      id: true,
      title: true,
      subject: true,
      status: true,
      date: true,
      _count: {
        select: {
          results: { where: { isArchived: false } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          نتائج الامتحانات
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اختر امتحاناً لعرض نتائج الطلاب وتحليلاتهم
        </p>
      </div>

      {/* Exam Cards Grid */}
      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 py-20 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            لا توجد امتحانات بعد
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            قم بإنشاء امتحان أولاً من صفحة الامتحانات
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => {
            const statusLabel =
              exam.status === "ACTIVE"
                ? "نشط"
                : exam.status === "ENDED"
                  ? "منتهي"
                  : "مسودة";
            const statusColor =
              exam.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : exam.status === "ENDED"
                  ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";

            return (
              <Card
                key={exam.id}
                className="border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-2 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                        <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {exam.subject}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={statusColor}>
                      {statusLabel}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    <span>
                      {exam._count.results === 0
                        ? "لا توجد تسليمات بعد"
                        : `${exam._count.results} طالب قدّم الامتحان`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {new Date(exam.date).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/teacher/results/${exam.id}`} />}
                  >
                    عرض النتائج
                    <ChevronLeft className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
