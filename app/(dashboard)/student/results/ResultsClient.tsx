"use client";

import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  Clock,
  CalendarDays,
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
  BookOpen,
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  Target,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// ── Types ──────────────────────────────────────────────────────────────────

type ResultStatus = "passed" | "failed" | "grading";

export interface ResultData {
  id: string;
  examName: string;
  subject: string;
  score: number;
  totalScore: number;
  status: ResultStatus;
  date: string;
  correctAnswers: number;
  wrongAnswers: number;
  duration: string;
}

// ── Subject Config ─────────────────────────────────────────────────────────

const subjectConfig = [
  {
    name: "الرياضيات",
    icon: Calculator,
    color: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
    accent: "blue",
  },
  {
    name: "الفيزياء",
    icon: Atom,
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
    accent: "violet",
  },
  {
    name: "اللغة العربية",
    icon: Languages,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    accent: "amber",
  },
  {
    name: "الكيمياء",
    icon: FlaskConical,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    accent: "emerald",
  },
  {
    name: "اللغة الإنجليزية",
    icon: Globe,
    color: "text-rose-600",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
    accent: "rose",
  },
  {
    name: "علم الأحياء",
    icon: Dna,
    color: "text-teal-600",
    bg: "bg-teal-50",
    ring: "ring-teal-200",
    accent: "teal",
  },
];

// ── Status Config ──────────────────────────────────────────────────────────

const statusConfig = {
  passed: {
    label: "ناجح",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    ringColor: "stroke-emerald-500",
    trailColor: "stroke-emerald-100",
  },
  failed: {
    label: "راسب",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    ringColor: "stroke-red-500",
    trailColor: "stroke-red-100",
  },
  grading: {
    label: "قيد التصحيح",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    ringColor: "stroke-amber-400",
    trailColor: "stroke-amber-100",
  },
};

const statusTabs = [
  { key: "all", label: "الكل" },
  { key: "passed", label: "ناجح" },
  { key: "failed", label: "راسب" },
  { key: "grading", label: "قيد التصحيح" },
] as const;

// ── Circular Score Ring ────────────────────────────────────────────────────

function ScoreRing({
  score,
  total,
  status,
  size = 100,
  strokeWidth = 8,
}: {
  score: number;
  total: number;
  status: ResultStatus;
  size?: number;
  strokeWidth?: number;
}) {
  const cfg = statusConfig[status];
  const isGrading = status === "grading";
  const percentage = isGrading ? 0 : (score / total) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Trail */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cfg.trailColor}
        />
        {/* Progress */}
        {!isGrading && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cfg.ringColor}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              transition: "stroke-dashoffset 0.8s ease-out",
            }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isGrading ? (
          <span className="text-sm font-semibold text-amber-600">—</span>
        ) : (
          <>
            <span className="text-2xl font-bold text-gray-900 leading-none">
              {score}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5">من {total}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Stats Overview Cards ───────────────────────────────────────────────────

function StatsOverview({ results }: { results: ResultData[] }) {
  const graded = results.filter((r) => r.status !== "grading");
  const totalExams = results.length;
  const passedCount = results.filter((r) => r.status === "passed").length;
  const failedCount = results.filter((r) => r.status === "failed").length;
  const gradingCount = results.filter((r) => r.status === "grading").length;
  const avgScore =
    graded.length > 0
      ? Math.round(graded.reduce((sum, r) => sum + r.score, 0) / graded.length)
      : 0;
  const highestScore =
    graded.length > 0 ? Math.max(...graded.map((r) => r.score)) : 0;

  const stats = [
    {
      label: "إجمالي الامتحانات",
      value: totalExams,
      icon: BarChart3,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "المعدل العام",
      value: `${avgScore}%`,
      icon: Target,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "أعلى درجة",
      value: highestScore,
      icon: Award,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "ناجح",
      value: passedCount,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "راسب",
      value: failedCount,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "قيد التصحيح",
      value: gradingCount,
      icon: Clock,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-400 truncate">
              {stat.label}
            </p>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Subject Picker ─────────────────────────────────────────────────────────

function SubjectPicker({
  value,
  onChange,
  results,
}: {
  value: string;
  onChange: (v: string) => void;
  results: ResultData[];
}) {
  const [open, setOpen] = useState(false);

  const countsMap = useMemo(() => {
    const map: Record<string, number> = {};
    results.forEach((r) => {
      map[r.subject] = (map[r.subject] ?? 0) + 1;
    });
    return map;
  }, [results]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-pointer text-sm font-medium text-gray-700">
        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
        <span>{value === "all" ? "جميع المواد" : value}</span>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <button
          onClick={() => {
            onChange("all");
            setOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${value === "all" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-500" />
            </div>
            <span>جميع المواد</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{results.length}</span>
            {value === "all" && <Check className="w-4 h-4 text-blue-600" />}
          </div>
        </button>
        {subjectConfig.map((s) => {
          const Icon = s.icon;
          const count = countsMap[s.name] ?? 0;
          if (count === 0) return null;
          const isActive = value === s.name;
          return (
            <button
              key={s.name}
              onClick={() => {
                onChange(s.name);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <span>{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{count}</span>
                {isActive && <Check className="w-4 h-4 text-blue-600" />}
              </div>
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
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200">
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

// ── Result Card ────────────────────────────────────────────────────────────

function ResultCard({ result }: { result: ResultData }) {
  const status = statusConfig[result.status];
  const subjectInfo = subjectConfig.find((s) => s.name === result.subject);
  const SubjectIcon = subjectInfo?.icon ?? BookOpen;
  const isGrading = result.status === "grading";
  const totalAnswers = result.correctAnswers + result.wrongAnswers;
  const correctPct =
    totalAnswers > 0
      ? Math.round((result.correctAnswers / totalAnswers) * 100)
      : 0;

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5">
      {/* Card Header */}
      <div className="flex items-start justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${subjectInfo ? `${subjectInfo.bg} ${subjectInfo.color}` : "bg-blue-50 text-blue-600"}`}
          >
            <SubjectIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 leading-snug">
              {result.examName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-xs font-medium ${subjectInfo ? subjectInfo.color : "text-blue-600"}`}
              >
                {result.subject}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {result.date}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${status.bg} ${status.text} border ${status.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Score + Metrics Row */}
      <div className="flex items-center gap-4 px-5 pb-4">
        <ScoreRing
          score={result.score}
          total={result.totalScore}
          status={result.status}
          size={72}
          strokeWidth={6}
        />

        <div className="flex-1 grid grid-cols-3 gap-2">
          {/* Score */}
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-[10px] font-medium text-gray-400 mb-0.5">
              الدرجة
            </p>
            {isGrading ? (
              <p className="text-sm font-bold text-amber-600">—</p>
            ) : (
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-lg font-black text-gray-900">
                  {result.score}
                </span>
                <span className="text-[10px] text-gray-400">
                  /{result.totalScore}
                </span>
              </div>
            )}
          </div>
          {/* Correct */}
          <div className="bg-emerald-50/60 rounded-xl p-2.5 text-center">
            <p className="text-[10px] font-medium text-emerald-500 mb-0.5">
              صحيحة
            </p>
            {isGrading ? (
              <p className="text-sm font-bold text-gray-400">—</p>
            ) : (
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-lg font-black text-emerald-700">
                  {result.correctAnswers}
                </span>
                <span className="text-[10px] text-emerald-400">
                  {correctPct}%
                </span>
              </div>
            )}
          </div>
          {/* Wrong */}
          <div className="bg-red-50/60 rounded-xl p-2.5 text-center">
            <p className="text-[10px] font-medium text-red-400 mb-0.5">خاطئة</p>
            {isGrading ? (
              <p className="text-sm font-bold text-gray-400">—</p>
            ) : (
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-lg font-black text-red-600">
                  {result.wrongAnswers}
                </span>
                <span className="text-[10px] text-red-400">
                  {100 - correctPct}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50/60 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{result.duration}</span>
        </div>
        {!isGrading && (
          <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer group/btn">
            <span>عرض نموذج الإجابة</span>
            <Eye className="w-3.5 h-3.5 transition-transform group-hover/btn:-translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <FileX2 className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        لا توجد نتائج
      </h3>
      <p className="text-base text-gray-500 max-w-xs">
        لم يتم العثور على نتائج تطابق معايير البحث الخاصة بك. حاول تغيير
        الفلاتر.
      </p>
    </div>
  );
}

// ── Page Component ─────────────────────────────────────────────────────────

export default function ResultsClient({ results }: { results: ResultData[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.get("q") ?? "";
  const statusFilter = searchParams.get("status") ?? "all";
  const subjectFilter = searchParams.get("subject") ?? "all";

  // Search bar focus state + keyboard shortcut
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

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

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      if (statusFilter !== "all" && result.status !== statusFilter)
        return false;
      if (subjectFilter !== "all" && result.subject !== subjectFilter)
        return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          result.examName.toLowerCase().includes(q) ||
          result.subject.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [results, query, statusFilter, subjectFilter]);

  const passedCount = results.filter((r) => r.status === "passed").length;
  const failedCount = results.filter((r) => r.status === "failed").length;
  const gradingCount = results.filter((r) => r.status === "grading").length;

  const hasActiveFilters =
    query !== "" || statusFilter !== "all" || subjectFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">نتائجي</h1>
        <p className="text-base text-gray-500 mt-1">
          تابع نتائج امتحاناتك وأدائك الأكاديمي
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview results={results} />

      {/* Search & Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div
            className={`relative flex-1 w-full transition-all duration-200 ${searchFocused ? "ring-2 ring-blue-200" : ""} rounded-xl`}
          >
            <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              placeholder="ابحث في النتائج..."
              value={query}
              onChange={(e) => updateParams({ q: e.target.value })}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full ps-10 pe-20 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:border-blue-300 transition-colors"
            />
            <div className="absolute inset-e-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  onClick={() => updateParams({ q: "" })}
                  className="p-0.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 rounded border border-gray-200">
                /
              </kbd>
            </div>
          </div>

          {/* Subject Picker */}
          <SubjectPicker
            value={subjectFilter}
            onChange={(v) => updateParams({ subject: v })}
            results={results}
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            const count =
              tab.key === "all"
                ? results.length
                : tab.key === "passed"
                  ? passedCount
                  : tab.key === "failed"
                    ? failedCount
                    : gradingCount;
            return (
              <button
                key={tab.key}
                onClick={() => updateParams({ status: tab.key })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span
                  className={`ms-1.5 text-xs ${isActive ? "text-gray-500" : "text-gray-400"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {query && (
              <FilterBadge
                label={`"${query}"`}
                onRemove={() => updateParams({ q: "" })}
              />
            )}
            {statusFilter !== "all" && (
              <FilterBadge
                label={statusConfig[statusFilter as ResultStatus].label}
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
        <p className="text-base text-gray-500">
          عرض{" "}
          <span className="font-semibold text-gray-900">
            {filteredResults.length}
          </span>{" "}
          نتيجة
        </p>
      </div>

      {/* Result Cards Grid or Empty State */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredResults.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
