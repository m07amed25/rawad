"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  CheckCircle2,
  UserPlus,
  Activity,
  User,
  ShieldAlert,
  Search,
  Home,
  RefreshCw,
  Wifi,
  WifiOff,
  Timer,
  Eye,
  TrendingUp,
  Send,
  XCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED";
  startTime: string | null;
  violations: number;
  score: number | null;
  maxScore: number | null;
  timeTaken: number | null;
}

interface ActivityLog {
  id: string;
  studentName: string;
  studentImage: string | null;
  time: string;
  type: "STARTED" | "SUBMITTED" | "VIOLATION" | "MESSAGE";
  status?: string;
  violations?: number;
  content?: string;
}

interface LiveData {
  stats: {
    total: number;
    notStarted: number;
    inProgress: number;
    submitted: number;
  };
  students: Student[];
  recentActivity: ActivityLog[];
  title: string;
  subject: string;
  examStatus: string;
  duration: number;
  date: string;
  endDate: string | null;
}

const POLL_INTERVAL_MS = 5_000;

export default function LiveMonitorClient({
  examId,
  initialData,
}: {
  examId: string;
  initialData: LiveData;
}) {
  const [data, setData] = useState<LiveData>(initialData);
  const [search, setSearch] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isPolling, setIsPolling] = useState(false);
  const pollCountRef = useRef(0);
  const [msgContent, setMsgContent] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [studentToForceEnd, setStudentToForceEnd] = useState<Student | null>(
    null,
  );
  const [isForceEnding, setIsForceEnding] = useState(false);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Polling logic with connection status tracking
  const fetchData = useCallback(async () => {
    setIsPolling(true);
    try {
      const res = await fetch(`/api/exams/${examId}/live-stats`, {
        cache: "no-store",
      });
      if (res.ok) {
        const freshData = await res.json();
        setData(freshData);
        setLastUpdated(new Date());
        setIsOnline(true);
        pollCountRef.current += 1;
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsPolling(false);
    }
  }, [examId]);

  useEffect(() => {
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Send message to all students
  const sendMessage = async () => {
    if (!msgContent.trim()) return;
    setIsSendingMsg(true);
    try {
      const res = await fetch(`/api/exams/${examId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msgContent }),
      });
      if (res.ok) {
        setMsgContent("");
        toast.success("تم إرسال الرسالة بنجاح");
        fetchData();
      } else {
        toast.error("فشل إرسال الرسالة");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setIsSendingMsg(false);
    }
  };

  // Force end student exam
  const handleForceEnd = async () => {
    if (!studentToForceEnd) return;
    setIsForceEnding(true);
    try {
      const res = await fetch(`/api/exams/${examId}/force-end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentToForceEnd.id }),
      });
      if (res.ok) {
        toast.success(`تم إنهاء امتحان ${studentToForceEnd.name}`);
        setStudentToForceEnd(null);
        fetchData();
      } else {
        toast.error("فشل إنهاء الامتحان");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setIsForceEnding(false);
    }
  };

  // Filter students
  const filteredStudents = data.students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  // Progress percentage
  const progressPercent =
    data.stats.total > 0
      ? Math.round((data.stats.submitted / data.stats.total) * 100)
      : 0;

  // Total violations
  const totalViolations = data.students.reduce(
    (sum, s) => sum + s.violations,
    0,
  );

  return (
    <TooltipProvider delay={0}>
      <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
        {/* ── Breadcrumbs ── */}
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
              <BreadcrumbLink
                render={<Link href="/teacher/exams" />}
                className="flex items-center gap-1.5"
              >
                إدارة الامتحانات
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>غرفة المراقبة</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-linear-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/15 dark:to-purple-400/15 border border-blue-100 dark:border-blue-800/40">
                <Eye className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
                  {data.title}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {data.subject}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span>غرفة التحكم والمراقبة المباشرة</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <Tooltip>
              <TooltipTrigger
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                  isOnline
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
                    : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50",
                )}
              >
                {isOnline ? (
                  <Wifi className="size-3.5" />
                ) : (
                  <WifiOff className="size-3.5" />
                )}
                {isOnline ? "متصل" : "غير متصل"}
              </TooltipTrigger>
              <TooltipContent>
                آخر تحديث:{" "}
                {isMounted
                  ? lastUpdated.toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "..."}
              </TooltipContent>
            </Tooltip>

            {/* Live Indicator */}
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all",
                "bg-linear-to-l from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
                "text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50",
              )}
            >
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              بث مباشر
              {isPolling && (
                <RefreshCw className="size-3 animate-spin text-emerald-500" />
              )}
            </div>
          </div>
        </div>

        {/* ── Exam Meta Bar ── */}
        <div className="flex flex-wrap items-center gap-3">
          <MetaPill
            icon={Timer}
            label="المدة"
            value={`${data.duration} دقيقة`}
          />
          <MetaPill
            icon={TrendingUp}
            label="نسبة التسليم"
            value={`${progressPercent}%`}
            accent={
              progressPercent >= 80
                ? "emerald"
                : progressPercent >= 40
                  ? "amber"
                  : "gray"
            }
          />
          {totalViolations > 0 && (
            <MetaPill
              icon={ShieldAlert}
              label="إجمالي المخالفات"
              value={`${totalViolations}`}
              accent="red"
            />
          )}
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي الطلاب"
            value={data.stats.total}
            icon={Users}
            gradient="from-blue-500 to-blue-600"
            bgLight="bg-blue-50 dark:bg-blue-950/30"
            textColor="text-blue-600 dark:text-blue-400"
            borderColor="border-blue-100 dark:border-blue-900/40"
            description="الطلاب المسجلين"
          />
          <StatCard
            title="لم يبدأ بعد"
            value={data.stats.notStarted}
            icon={UserPlus}
            gradient="from-slate-400 to-slate-500"
            bgLight="bg-slate-50 dark:bg-slate-950/30"
            textColor="text-slate-600 dark:text-slate-400"
            borderColor="border-slate-100 dark:border-slate-800/40"
            description="بانتظار الدخول"
          />
          <StatCard
            title="قيد الاختبار"
            value={data.stats.inProgress}
            icon={Clock}
            gradient="from-amber-500 to-orange-500"
            bgLight="bg-amber-50 dark:bg-amber-950/30"
            textColor="text-amber-600 dark:text-amber-400"
            borderColor="border-amber-100 dark:border-amber-900/40"
            description="يؤدون الامتحان حالياً"
            pulse={data.stats.inProgress > 0}
          />
          <StatCard
            title="تم التسليم"
            value={data.stats.submitted}
            icon={CheckCircle2}
            gradient="from-emerald-500 to-green-500"
            bgLight="bg-emerald-50 dark:bg-emerald-950/30"
            textColor="text-emerald-600 dark:text-emerald-400"
            borderColor="border-emerald-100 dark:border-emerald-900/40"
            description="أنهوا الاختبار"
          />
        </div>

        {/* ── Progress Bar ── */}
        {data.stats.total > 0 && (
          <Card className="border-none shadow-none ring-1 ring-gray-200 dark:ring-gray-800">
            <CardContent className="py-3 flex items-center gap-4">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                تقدم الامتحان
              </span>
              <div className="flex-1">
                <Progress value={progressPercent} />
              </div>
              <span className="text-xs font-bold tabular-nums text-foreground">
                {progressPercent}%
              </span>
            </CardContent>
          </Card>
        )}

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Students Table */}
          <div className="xl:col-span-8 space-y-4">
            <Card className="border-none shadow-none ring-1 ring-gray-200 dark:ring-gray-800 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="size-5 text-blue-600 dark:text-blue-400" />
                  قائمة الطلاب
                  <Badge
                    variant="secondary"
                    className="mr-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    {filteredStudents.length}
                  </Badge>
                </CardTitle>
                <div className="relative w-56">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="بحث باسم الطالب..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-9 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 transition-all text-right"
                    dir="rtl"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden rounded-b-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/60 dark:bg-gray-900/40 hover:bg-gray-50/60 dark:hover:bg-gray-900/40">
                        <TableHead className="text-right">الطالب</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">وقت البدء</TableHead>
                        <TableHead className="text-right">المخالفات</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <motion.tr
                              key={student.id}
                              layout
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.2 }}
                              className={cn(
                                "group border-b border-gray-100 dark:border-gray-800/60 transition-colors",
                                student.violations >= 3
                                  ? "bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50/60 dark:hover:bg-red-950/20"
                                  : "hover:bg-gray-50/80 dark:hover:bg-gray-900/40",
                              )}
                            >
                              {/* Student Info */}
                              <TableCell className="py-3.5">
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-9 border-2 border-white dark:border-gray-800 shadow-sm">
                                    <AvatarImage src={student.image ?? ""} />
                                    <AvatarFallback className="bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs">
                                      {student.name.slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {student.name}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground truncate">
                                      {student.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>

                              {/* Status */}
                              <TableCell>
                                <StudentStatusBadge status={student.status} />
                              </TableCell>

                              {/* Start Time */}
                              <TableCell className="text-sm font-medium tabular-nums text-muted-foreground text-right">
                                {isMounted && student.startTime
                                  ? new Date(
                                      student.startTime,
                                    ).toLocaleTimeString("ar-SA", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : student.startTime
                                    ? "..."
                                    : "—"}
                              </TableCell>

                              {/* Violations */}
                              <TableCell>
                                <ViolationsBadge count={student.violations} />
                              </TableCell>

                              <TableCell>
                                {student.status === "IN_PROGRESS" && (
                                  <Tooltip>
                                    <TooltipTrigger
                                      onClick={() =>
                                        setStudentToForceEnd(student)
                                      }
                                      className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-100 dark:border-red-900/60"
                                    >
                                      <XCircle className="size-4" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      إنهاء الامتحان قسراً
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </TableCell>
                            </motion.tr>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-52 text-center">
                              <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                                  <Users className="size-8 opacity-30" />
                                </div>
                                <p className="text-sm">
                                  لا يوجد طلاب يطابقون بحثك
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar Activity Feed ── */}
          <div className="xl:col-span-4">
            <Card className="border-none shadow-none ring-1 ring-gray-200 dark:ring-gray-800 h-full max-h-[740px] flex flex-col overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Activity className="size-5 text-purple-600 dark:text-purple-400" />
                  سجل النشاط
                  {data.recentActivity.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="mr-2 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
                    >
                      مباشر
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    <AnimatePresence initial={false}>
                      {data.recentActivity.length > 0 ? (
                        data.recentActivity.map((log, index) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative flex gap-3 group"
                          >
                            {/* Connector line */}
                            {index !== data.recentActivity.length - 1 && (
                              <div className="absolute top-12 right-[22px] w-px h-[calc(100%-24px)] bg-gray-100 dark:bg-gray-800" />
                            )}

                            {/* Event icon */}
                            <div
                              className={cn(
                                "relative z-10 size-8 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white dark:ring-gray-950",
                                log.type === "VIOLATION"
                                  ? "bg-linear-to-br from-red-500 to-rose-600 text-white shadow-sm shadow-red-500/25"
                                  : log.type === "SUBMITTED"
                                    ? "bg-linear-to-br from-emerald-500 to-green-600 text-white shadow-sm shadow-emerald-500/25"
                                    : "bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/25",
                              )}
                            >
                              {log.type === "VIOLATION" ? (
                                <ShieldAlert className="size-3.5" />
                              ) : log.type === "SUBMITTED" ? (
                                <CheckCircle2 className="size-3.5" />
                              ) : log.type === "MESSAGE" ? (
                                <MessageSquare className="size-3.5" />
                              ) : (
                                <User className="size-3.5" />
                              )}
                            </div>

                            {/* Event content */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                  {log.studentName}
                                </p>
                                <time className="text-[10px] text-muted-foreground font-medium tabular-nums shrink-0 mt-0.5">
                                  {isMounted
                                    ? new Date(log.time).toLocaleTimeString(
                                        "ar-SA",
                                        {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          second: "2-digit",
                                        },
                                      )
                                    : "..."}
                                </time>
                              </div>
                              <div
                                className={cn(
                                  "text-xs p-2 rounded-lg leading-relaxed",
                                  log.type === "VIOLATION"
                                    ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/30"
                                    : log.type === "SUBMITTED"
                                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30"
                                      : "bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400",
                                )}
                              >
                                {log.type === "VIOLATION" ? (
                                  <span className="font-bold">
                                    تنبيه: تم اكتشاف محاولة غش — مخالفة رقم{" "}
                                    {log.violations}
                                  </span>
                                ) : log.type === "SUBMITTED" ? (
                                  <span>تم تسليم الاختبار بنجاح</span>
                                ) : log.type === "MESSAGE" ? (
                                  <span className="font-medium text-blue-700 dark:text-blue-300">
                                    رسالة المدرس: {log.content}
                                  </span>
                                ) : (
                                  <span>بدأ في أداء الاختبار الآن</span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-24 text-center space-y-3">
                          <div className="mx-auto p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 w-fit">
                            <Clock className="size-8 text-gray-300 dark:text-gray-600" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            لا توجد أنشطة حالية
                          </p>
                          <p className="text-xs text-muted-foreground/60">
                            ستظهر الأنشطة هنا عند بدء الطلاب في الاختبار
                          </p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollArea>

                {/* Message Input Area */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
                  <div className="space-y-3">
                    <div className="relative">
                      <Textarea
                        placeholder="أرسل رسالة لجميع الطلاب..."
                        value={msgContent}
                        onChange={(e) => setMsgContent(e.target.value)}
                        className="min-h-[80px] bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 pr-3 pl-10 text-sm resize-none focus:ring-blue-500"
                      />
                      <div className="absolute left-3 bottom-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={sendMessage}
                          disabled={!msgContent.trim() || isSendingMsg}
                          className={cn(
                            "rounded-lg transition-all",
                            msgContent.trim() && !isSendingMsg
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
                              : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed",
                          )}
                        >
                          {isSendingMsg ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Send className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      سيتم إرسال هذه الرسالة كإشعار لجميع الطلاب الذين يؤدون
                      الامتحان حالياً
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Force End Confirmation Dialog */}
        <AlertDialog
          open={!!studentToForceEnd}
          onOpenChange={(open) => !open && setStudentToForceEnd(null)}
        >
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right">
                إنهاء الامتحان قسراً؟
              </AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                هل أنت متأكد من رغبتك في إنهاء امتحان الطالب{" "}
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {studentToForceEnd?.name}
                </span>
                ؟ سيتم تسليم إجاباته الحالية فوراً وإغلاق صفحة الامتحان لديه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse gap-3">
              <AlertDialogAction
                onClick={handleForceEnd}
                disabled={isForceEnding}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isForceEnding ? (
                  <Loader2 className="size-4 animate-spin ml-2" />
                ) : null}
                نعم، إنهاء الامتحان
              </AlertDialogAction>
              <AlertDialogCancel disabled={isForceEnding} className="mt-0">
                إلغاء
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  bgLight,
  textColor,
  borderColor,
  description,
  pulse = false,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  description: string;
  pulse?: boolean;
}) {
  return (
    <Card
      className={cn(
        "border-none shadow-none ring-1 overflow-hidden group relative",
        "hover:ring-2 transition-all duration-300",
        borderColor.replace("border-", "ring-"),
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <div
              className={cn(
                "text-3xl font-bold tracking-tight tabular-nums transition-colors",
                textColor,
              )}
            >
              {value}
            </div>
            <p className="text-[10px] text-muted-foreground/70 font-medium">
              {description}
            </p>
          </div>
          <div
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
              bgLight,
              borderColor,
              "border",
            )}
          >
            <Icon
              className={cn("size-5", textColor, pulse && "animate-pulse")}
            />
          </div>
        </div>
      </CardContent>
      {/* Gradient accent bar */}
      <div
        className={cn("h-0.5 w-full bg-linear-to-l", gradient, "opacity-60")}
      />
    </Card>
  );
}

function StudentStatusBadge({ status }: { status: Student["status"] }) {
  if (status === "SUBMITTED") {
    return (
      <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-none px-3 py-1 font-bold text-[11px]">
        <CheckCircle2 className="size-3 ml-1" />
        تم التسليم
      </Badge>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 border-none px-3 py-1 font-bold text-[11px]">
        <span className="relative flex size-1.5 ml-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
          <span className="relative inline-flex rounded-full size-1.5 bg-amber-500" />
        </span>
        قيد الاختبار
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-none px-3 py-1 font-bold text-[11px]"
    >
      لم يبدأ
    </Badge>
  );
}

function ViolationsBadge({ count }: { count: number }) {
  const isHigh = count >= 3;
  const isMedium = count > 0 && count < 3;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all",
        isHigh
          ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40 animate-pulse"
          : isMedium
            ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40"
            : "bg-gray-50 dark:bg-gray-900/40 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-800",
      )}
    >
      <ShieldAlert className="size-3" />
      <span className="tabular-nums">{count}</span>
    </div>
  );
}

function MetaPill({
  icon: Icon,
  label,
  value,
  accent = "gray",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: "gray" | "emerald" | "amber" | "red";
}) {
  const colors = {
    gray: "bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    emerald:
      "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
    amber:
      "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
    red: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/40",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border",
        colors[accent],
      )}
    >
      <Icon className="size-3.5" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
