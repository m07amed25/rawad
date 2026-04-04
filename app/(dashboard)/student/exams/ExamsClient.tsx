"use client";

import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Clock,
  BookOpen,
  CalendarDays,
  ArrowLeft,
  Eye,
  FileX2,
  X,
  SlidersHorizontal,
  Calculator,
  Atom,
  Languages,
  FlaskConical,
  Globe,
  Dna,
  Check,
  FileText,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// ── Types ──────────────────────────────────────────────────────────────────

type ExamStatus = "available" | "ended" | "taken";

export interface ExamData {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  questions: number;
  status: ExamStatus;
}

// ── Subject Config ─────────────────────────────────────────────────────────

const subjectConfig = [
  {
    name: "الرياضيات",
    icon: Calculator,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    name: "الفيزياء",
    icon: Atom,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    name: "اللغة العربية",
    icon: Languages,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    name: "الكيمياء",
    icon: FlaskConical,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    name: "اللغة الإنجليزية",
    icon: Globe,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  { name: "علم الأحياء", icon: Dna, color: "text-teal-600", bg: "bg-teal-50" },
];

// ── Status Config ──────────────────────────────────────────────────────────

const statusConfig = {
  available: {
    label: "متاح",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  taken: {
    label: "تم أداء الامتحان",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  ended: {
    label: "انتهى",
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
};

const statusTabs = [
  { key: "all", label: "الكل" },
  { key: "available", label: "متاحة" },
  { key: "taken", label: "تم أداؤها" },
  { key: "ended", label: "انتهت" },
] as const;

// ── Page Component ─────────────────────────────────────────────────────────

export default function ExamsClient({ exams }: { exams: ExamData[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.get("q") ?? "";
  const statusFilter = searchParams.get("status") ?? "all";
  const subjectFilter = searchParams.get("subject") ?? "all";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      if (statusFilter !== "all" && exam.status !== statusFilter) return false;
      if (subjectFilter !== "all" && exam.subject !== subjectFilter)
        return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          exam.title.toLowerCase().includes(q) ||
          exam.subject.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [exams, query, statusFilter, subjectFilter]);

  const availableCount = exams.filter((e) => e.status === "available").length;
  const takenCount = exams.filter((e) => e.status === "taken").length;
  const endedCount = exams.filter((e) => e.status === "ended").length;

  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasActiveFilters =
    query !== "" || statusFilter !== "all" || subjectFilter !== "all";

  const clearAllFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">
            الامتحانات
          </h1>
          <p className="text-base text-gray-500 dark:text-muted-foreground mt-1">
            تصفح جميع الامتحانات المتاحة والسابقة
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border shadow-sm p-5 space-y-4">
        {/* Search Input */}
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all ${
            isSearchFocused
              ? "border-blue-400 ring-[3px] ring-blue-100 dark:ring-blue-900/40 bg-white dark:bg-background"
              : "border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/30 hover:border-gray-300 dark:hover:border-muted-foreground/30"
          }`}
        >
          <Search
            className={`w-5 h-5 shrink-0 transition-colors ${isSearchFocused ? "text-blue-500" : "text-gray-400 dark:text-muted-foreground"}`}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="ابحث باسم الامتحان أو المادة..."
            value={query}
            onChange={(e) => updateParams({ q: e.target.value })}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="bg-transparent text-base text-gray-700 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground outline-none w-full"
          />
          {query && (
            <button
              onClick={() => updateParams({ q: "" })}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-muted text-gray-400 hover:text-gray-600 dark:hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden lg:inline-flex text-[11px] font-medium text-gray-400 dark:text-muted-foreground bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border rounded-md px-2 py-0.5 shrink-0">
            /
          </kbd>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-muted/50 p-1 rounded-xl">
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.key;
              const count =
                tab.key === "all"
                  ? exams.length
                  : tab.key === "available"
                    ? availableCount
                    : tab.key === "taken"
                      ? takenCount
                      : endedCount;
              return (
                <button
                  key={tab.key}
                  onClick={() => updateParams({ status: tab.key })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-background text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-gray-200 dark:ring-border"
                      : "text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ms-1.5 text-xs tabular-nums ${isActive ? "text-blue-400" : "text-gray-400"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subject Select */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 hidden sm:block" />
            <SubjectPicker
              value={subjectFilter}
              onChange={(val) => updateParams({ subject: val })}
            />
          </div>
        </div>

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs text-gray-400 dark:text-muted-foreground">
              الفلاتر النشطة:
            </span>
            {query && (
              <FilterBadge
                label={`بحث: "${query}"`}
                onRemove={() => updateParams({ q: "" })}
              />
            )}
            {statusFilter !== "all" && (
              <FilterBadge
                label={
                  statusFilter === "available"
                    ? "متاحة"
                    : statusFilter === "taken"
                      ? "تم أداؤها"
                      : "انتهت"
                }
                onRemove={() => updateParams({ status: "all" })}
              />
            )}
            {subjectFilter !== "all" && (
              <FilterBadge
                label={subjectFilter}
                onRemove={() => updateParams({ subject: "all" })}
              />
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-base text-gray-500 dark:text-muted-foreground">
          عرض{" "}
          <span className="font-semibold text-gray-900 dark:text-foreground">
            {filteredExams.length}
          </span>{" "}
          امتحان
        </p>
      </div>

      {/* Exam Cards Grid or Empty State */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// ── Exam Card ──────────────────────────────────────────────────────────────

function ExamCard({ exam }: { exam: ExamData }) {
  const status = statusConfig[exam.status];
  const subjectInfo = subjectConfig.find((s) => s.name === exam.subject);
  const SubjectIcon = subjectInfo?.icon ?? BookOpen;

  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-5 transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-muted-foreground/30 flex flex-col">
      {/* Top — Icon + Name + Subject & Status Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${subjectInfo ? `${subjectInfo.bg} ${subjectInfo.color}` : "bg-blue-50 text-blue-600"}`}
          >
            <SubjectIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-foreground leading-snug">
              {exam.title}
            </h3>
            <span
              className={`text-sm font-medium ${subjectInfo ? subjectInfo.color : "text-blue-600"}`}
            >
              {exam.subject}
            </span>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full shrink-0 ${status.bg} ${status.text} border ${status.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Meta */}
      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-muted-foreground">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>{exam.date}</span>
          <span className="mx-1 text-gray-300 dark:text-muted-foreground/40">
            |
          </span>
          <span>{exam.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-muted-foreground">
          <Clock className="w-4 h-4 shrink-0" />
          <span>{exam.duration}</span>
          <span className="mx-1 text-gray-300">|</span>
          <span>{exam.questions} سؤال</span>
        </div>
      </div>

      {/* Action Button with Dialog */}
      {exam.status === "available" ? (
        <StartExamDialog exam={exam} subjectInfo={subjectInfo} />
      ) : (
        <ViewDetailsDialog exam={exam} subjectInfo={subjectInfo} />
      )}
    </div>
  );
}

// ── Start Exam Dialog ──────────────────────────────────────────────────────

function StartExamDialog({
  exam,
  subjectInfo,
}: {
  exam: ExamData;
  subjectInfo: (typeof subjectConfig)[number] | undefined;
}) {
  const SubjectIcon = subjectInfo?.icon ?? BookOpen;

  return (
    <Dialog>
      <DialogTrigger className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer">
        <span>بدء الامتحان</span>
        <ArrowLeft className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="gap-0! p-0! sm:max-w-lg! overflow-hidden rounded-2xl"
      >
        {/* Header */}
        <div className="relative bg-linear-to-bl from-blue-600 to-blue-700 px-6 pt-7 pb-6 text-white">
          <DialogClose className="absolute top-4 inset-e-4 w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-4 h-4 text-white" />
          </DialogClose>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/15 backdrop-blur-sm">
              <SubjectIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-blue-100 bg-white/10 px-3 py-1 rounded-full">
              {exam.subject}
            </span>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {exam.title}
            </DialogTitle>
            <DialogDescription className="text-blue-200 text-sm mt-1.5">
              تأكد من استعدادك قبل بدء الامتحان
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Details */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            <DetailItem icon={CalendarDays} label="التاريخ" value={exam.date} />
            <DetailItem icon={Clock} label="الوقت" value={exam.time} />
            <DetailItem icon={Clock} label="المدة" value={exam.duration} />
            <DetailItem
              icon={HelpCircle}
              label="عدد الأسئلة"
              value={`${exam.questions} سؤال`}
            />
          </div>

          <Separator className="-mx-6 w-auto my-5" />

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                تنبيه قبل البدء
              </p>
              <p className="text-[13px] text-amber-600 mt-1 leading-relaxed">
                لا يمكنك إيقاف الامتحان بعد البدء. تأكد من اتصالك بالإنترنت
                واستعدادك الكامل.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-border bg-gray-50/60 dark:bg-muted/30">
          <DialogClose className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted text-gray-700 dark:text-foreground transition-colors cursor-pointer">
            إلغاء
          </DialogClose>
          <Link
            href={`/student/exam/${exam.id}`}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>بدء الامتحان الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── View Details Dialog ────────────────────────────────────────────────────

function ViewDetailsDialog({
  exam,
  subjectInfo,
}: {
  exam: ExamData;
  subjectInfo: (typeof subjectConfig)[number] | undefined;
}) {
  const SubjectIcon = subjectInfo?.icon ?? BookOpen;

  const isTaken = exam.status === "taken";

  return (
    <Dialog>
      <DialogTrigger className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium bg-gray-100 dark:bg-muted hover:bg-gray-200 dark:hover:bg-muted/80 text-gray-700 dark:text-foreground transition-colors cursor-pointer">
        <span>{isTaken ? "عرض النتائج" : "عرض التفاصيل"}</span>
        <Eye className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="gap-0! p-0! sm:max-w-lg! overflow-hidden rounded-2xl"
      >
        {/* Header */}
        <div className="relative bg-gray-50 dark:bg-muted/30 border-b border-gray-200 dark:border-border px-6 pt-7 pb-6">
          <DialogClose className="absolute top-4 inset-e-4 w-8 h-8 rounded-lg bg-gray-200/70 dark:bg-muted hover:bg-gray-300/70 dark:hover:bg-muted/80 flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
          </DialogClose>

          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${subjectInfo ? `${subjectInfo.bg} ${subjectInfo.color}` : "bg-gray-200 text-gray-600"}`}
            >
              <SubjectIcon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${subjectInfo ? `${subjectInfo.color} ${subjectInfo.bg}` : "text-gray-600 bg-gray-200"}`}
              >
                {exam.subject}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  isTaken
                    ? "text-blue-600 bg-blue-100/80"
                    : "text-gray-500 bg-gray-200/80"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isTaken ? "bg-blue-500" : "bg-gray-400"}`}
                />
                {isTaken ? "تم أداء الامتحان" : "انتهى"}
              </span>
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-foreground">
              {exam.title}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-muted-foreground text-sm mt-1.5">
              {isTaken
                ? "لقد أديت هذا الامتحان بالفعل"
                : "تفاصيل الامتحان السابق"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Details */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            <DetailItem icon={CalendarDays} label="التاريخ" value={exam.date} />
            <DetailItem icon={Clock} label="الوقت" value={exam.time} />
            <DetailItem icon={Clock} label="المدة" value={exam.duration} />
            <DetailItem
              icon={HelpCircle}
              label="عدد الأسئلة"
              value={`${exam.questions} سؤال`}
            />
          </div>

          <Separator className="-mx-6 w-auto my-5" />

          <div
            className={`flex items-start gap-3 p-4 rounded-xl ${
              isTaken
                ? "bg-blue-50 border border-blue-200"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isTaken ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              {isTaken ? (
                <Check className="w-4.5 h-4.5 text-blue-600" />
              ) : (
                <FileText className="w-4.5 h-4.5 text-gray-500" />
              )}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${isTaken ? "text-blue-800" : "text-gray-700"}`}
              >
                {isTaken ? "تم أداء الامتحان" : "حالة الامتحان"}
              </p>
              <p
                className={`text-[13px] mt-1 leading-relaxed ${isTaken ? "text-blue-600" : "text-gray-500"}`}
              >
                {isTaken
                  ? "لقد أديت هذا الامتحان بالفعل. يمكنك مراجعة نتائجك من صفحة النتائج."
                  : "هذا الامتحان قد انتهى. يمكنك مراجعة نتائجك من صفحة النتائج."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-border bg-gray-50/60 dark:bg-muted/30">
          <DialogClose className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted text-gray-700 dark:text-foreground transition-colors cursor-pointer">
            إغلاق
          </DialogClose>
          <Link
            href="/student/results"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>عرض النتائج</span>
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Detail Item ────────────────────────────────────────────────────────────

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-muted/30 border border-gray-100 dark:border-border rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-card border border-gray-100 dark:border-border flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
      </div>
      <div>
        <p className="text-[11px] font-medium text-gray-400 dark:text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 dark:text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mb-5">
        <FileX2 className="w-10 h-10 text-gray-400 dark:text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-2">
        لا توجد امتحانات مطابقة لبحثك
      </h3>
      <p className="text-base text-gray-500 dark:text-muted-foreground max-w-sm">
        حاول تغيير كلمات البحث أو تعديل معايير التصفية للعثور على ما تبحث عنه.
      </p>
    </div>
  );
}

// ── Subject Picker ─────────────────────────────────────────────────────────

function SubjectPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const activeSubject = subjectConfig.find((s) => s.name === value);
  const ActiveIcon = activeSubject?.icon ?? BookOpen;

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-2.5 h-10 px-4 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/30 hover:bg-gray-100 dark:hover:bg-muted hover:border-gray-300 dark:hover:border-muted-foreground/30 text-sm font-medium text-gray-700 dark:text-foreground transition-all cursor-pointer outline-none w-full sm:w-56 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-300">
        <span
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeSubject ? `${activeSubject.bg} ${activeSubject.color}` : "bg-gray-100 text-gray-500"}`}
        >
          <ActiveIcon className="w-3.5 h-3.5" />
        </span>
        <span className="flex-1 text-start truncate">
          {activeSubject ? activeSubject.name : "جميع المواد"}
        </span>
        <svg
          className="w-4 h-4 text-gray-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-64 p-2 rounded-xl"
      >
        {/* All subjects option */}
        <button
          onClick={() => onChange("all")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            value === "all"
              ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
              : "text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted"
          }`}
        >
          <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </span>
          <span className="flex-1 text-start">جميع المواد</span>
          {value === "all" && <Check className="w-4 h-4 text-blue-600" />}
        </button>

        <div className="h-px bg-gray-100 my-1.5" />

        {/* Subject options */}
        {subjectConfig.map((s) => {
          const Icon = s.icon;
          const isActive = value === s.name;
          return (
            <button
              key={s.name}
              onClick={() => onChange(s.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}
              >
                <Icon className={`w-4 h-4 ${s.color}`} />
              </span>
              <span className="flex-1 text-start">{s.name}</span>
              {isActive && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

// ── Filter Badge ───────────────────────────────────────────────────────────

function FilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-sm font-medium border border-blue-200 dark:border-blue-800">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-blue-100 rounded-full p-0.5 transition-colors cursor-pointer"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
