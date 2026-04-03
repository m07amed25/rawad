"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  BarChart3,
  Power,
  Trash2,
  FileText,
  Home,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toggleExamStatus, endExam, deleteExam } from "@/app/actions/exams";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────

type ExamStatus = "DRAFT" | "ACTIVE" | "ENDED";

export interface TeacherExamData {
  id: string;
  name: string;
  subject: string;
  createdAt: string;
  scheduledAt: string;
  timeRange?: string;
  duration: number;
  questionsCount: number;
  status: ExamStatus;
}

// ─── Status Helpers ──────────────────────────────────────────

const STATUS_LABELS: Record<ExamStatus, string> = {
  DRAFT: "مسودة",
  ACTIVE: "نشط",
  ENDED: "مكتمل",
};

function StatusBadge({ status }: { status: ExamStatus }) {
  const styles: Record<ExamStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    ACTIVE:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    ENDED: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  };
  return (
    <Badge variant="outline" className={styles[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

// ─── Client Component ────────────────────────────────────────

export default function TeacherExamsClient({
  exams: initialExams,
}: {
  exams: TeacherExamData[];
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<TeacherExamData | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  // Filtered exams
  const filteredExams = useMemo(() => {
    return initialExams.filter((exam) => {
      const matchesSearch =
        !searchQuery ||
        exam.name.includes(searchQuery) ||
        exam.subject.includes(searchQuery);
      const matchesStatus =
        statusFilter === "ALL" || exam.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [initialExams, searchQuery, statusFilter]);

  // Toggle status: DRAFT <-> ACTIVE
  function handleToggleStatus(examId: string) {
    startTransition(async () => {
      const result = await toggleExamStatus(examId);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    });
  }

  // End exam: ACTIVE -> ENDED (permanent)
  function handleEndExam(examId: string) {
    startTransition(async () => {
      const result = await endExam(examId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("تم إنهاء الامتحان بنجاح");
        router.refresh();
      }
    });
  }

  // Delete exam
  function handleConfirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteExam(deleteTarget.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("تم حذف الامتحان بنجاح");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  }

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
            <BreadcrumbPage>إدارة الامتحانات</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            إدارة الامتحانات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إنشاء وإدارة جميع الامتحانات الخاصة بك
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/teacher/exams/create" />}
        >
          <Plus className="h-4 w-4" />
          إنشاء امتحان جديد
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث باسم الامتحان أو المادة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value ?? "ALL")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">الكل</SelectItem>
            <SelectItem value="DRAFT">مسودة</SelectItem>
            <SelectItem value="ACTIVE">نشط</SelectItem>
            <SelectItem value="ENDED">مكتمل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exams Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/60 dark:bg-gray-900/40">
              <TableHead className="text-right">اسم الامتحان</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">المدة</TableHead>
              <TableHead className="text-right">عدد الأسئلة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-left w-15">
                <span className="sr-only">الإجراءات</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-8 w-8" />
                    <p>لا توجد امتحانات مطابقة للبحث</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((exam) => (
                <TableRow key={exam.id}>
                  {/* Name & Subject */}
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-50">
                        {exam.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exam.subject}
                      </p>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-muted-foreground text-sm">
                    {exam.scheduledAt ? (
                      <div>
                        <p>{exam.scheduledAt}</p>
                        {exam.timeRange && (
                          <p className="text-xs">{exam.timeRange}</p>
                        )}
                        {!exam.timeRange && (
                          <p className="text-xs">الموعد المحدد</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p>{exam.createdAt}</p>
                        <p className="text-xs">تاريخ الإنشاء</p>
                      </div>
                    )}
                  </TableCell>

                  {/* Duration */}
                  <TableCell className="text-muted-foreground text-sm">
                    {exam.duration} دقيقة
                  </TableCell>

                  {/* Questions Count */}
                  <TableCell className="text-muted-foreground text-sm">
                    {exam.questionsCount} سؤال
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={exam.status} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            disabled={isPending}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">فتح القائمة</span>
                          </button>
                        }
                      />
                      <DropdownMenuContent align="end" side="bottom">
                        <DropdownMenuItem
                          render={
                            <Link href={`/teacher/exams/${exam.id}/edit`} />
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <Link href={`/teacher/exams/${exam.id}/key`} />
                          }
                        >
                          <FileText className="h-4 w-4" />
                          نموذج الإجابة
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <Link href={`/teacher/exams/${exam.id}/results`} />
                          }
                        >
                          <BarChart3 className="h-4 w-4" />
                          النتائج
                        </DropdownMenuItem>
                        {exam.status === "DRAFT" && (
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(exam.id)}
                          >
                            <Power className="h-4 w-4" />
                            تفعيل الامتحان
                          </DropdownMenuItem>
                        )}
                        {exam.status === "ACTIVE" && (
                          <DropdownMenuItem
                            onClick={() => handleEndExam(exam.id)}
                          >
                            <Power className="h-4 w-4" />
                            إيقاف الامتحان
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(exam)}
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        عرض {filteredExams.length} من أصل {initialExams.length} امتحان
      </p>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              هل أنت متأكد من حذف هذا الامتحان؟
            </AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف &quot;{deleteTarget?.name}&quot; نهائياً. هذا الإجراء لا
              يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              حذف الامتحان
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
