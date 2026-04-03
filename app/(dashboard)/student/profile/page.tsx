import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  IdCard,
  GraduationCap,
  University,
  Accessibility,
  Pencil,
  KeyRound,
  Shield,
  BookUser,
  User,
  Calendar,
  Hash,
  CheckCircle2,
  Building2,
  BookOpen,
  Layers,
  TrendingUp,
  FileText,
  BarChart3,
  AlertCircle,
} from "lucide-react";

// ── Disability type mapping ────────────────────────────────────────────────

const disabilityLabels: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  VISUAL: {
    label: "بصرية",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  HEARING: {
    label: "سمعية",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  MOTOR: {
    label: "حركية",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  MULTIPLE: {
    label: "متعدد الإعاقات",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  LEARNING: {
    label: "صعوبات تعلم",
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
  NONE: {
    label: "لا يوجد",
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
};

// ── Academic year display mapping ──────────────────────────────────────────

const academicYearLabels: Record<string, { label: string; year: string }> = {
  الأولى: { label: "الفرقة الأولى", year: "1" },
  الثانية: { label: "الفرقة الثانية", year: "2" },
  الثالثة: { label: "الفرقة الثالثة", year: "3" },
  الرابعة: { label: "الفرقة الرابعة", year: "4" },
};

// ── Page ───────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  const user = session.user;
  const initials = user.name
    ?.split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("");

  const disability =
    disabilityLabels[user.disabilityType ?? "NONE"] ?? disabilityLabels.NONE;
  const hasDisability = user.disabilityType && user.disabilityType !== "NONE";

  const joinDate = new Date(user.createdAt).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const academicYearInfo = user.academicYear
    ? academicYearLabels[user.academicYear]
    : null;

  // Fetch student stats
  const [totalExams, passedExams, failedExams] = await Promise.all([
    prisma.result.count({ where: { studentId: user.id } }),
    prisma.result.count({
      where: { studentId: user.id, status: "PASSED" },
    }),
    prisma.result.count({
      where: { studentId: user.id, status: "FAILED" },
    }),
  ]);

  const successRate =
    totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

  // Profile completion
  const profileFields = [
    user.name,
    user.email,
    user.nationalId,
    user.universityName,
    user.college,
    user.academicYear,
    user.studentCode,
  ];
  const filledFields = profileFields.filter(Boolean).length;
  const completionPercent = Math.round(
    (filledFields / profileFields.length) * 100,
  );

  return (
    <div className="space-y-6">
      {/* ── Hero Card ──────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Cover gradient */}
        <div className="h-40 md:h-48 bg-linear-to-bl from-blue-600 via-indigo-600 to-violet-600 relative overflow-hidden">
          {/* Layered patterns for depth */}
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_30%_50%,white_2px,transparent_2px)] bg-size-[32px_32px]" />
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_70%_20%,white_1px,transparent_1px)] bg-size-[20px_20px]" />
          {/* Soft glows */}
          <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-4 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl" />
          {/* Diagonal light streak */}
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/3 to-transparent" />
        </div>

        {/* Profile section */}
        <div className="px-6 md:px-10 pb-8 -mt-14 relative">
          {/* Top row: Avatar + Name + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Avatar */}
            <div className="relative shrink-0 self-start">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-linear-to-br from-blue-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg shadow-indigo-600/20 ring-4 ring-white">
                {initials}
              </div>
              {user.emailVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-[3px] border-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 sm:pb-1">
              {/* Name & badges */}
              <h1 className="text-2xl md:text-[1.7rem] font-extrabold text-gray-900 tracking-tight leading-tight">
                {user.name}
              </h1>

              <p className="text-sm text-gray-400 mt-0.5 font-en">
                @{user.username ?? user.name}
              </p>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                  <GraduationCap className="w-3.5 h-3.5" />
                  طالب
                </span>
                {academicYearInfo && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                    <Layers className="w-3.5 h-3.5" />
                    {academicYearInfo.label}
                  </span>
                )}
                {user.emailVerified && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    موثّق
                  </span>
                )}
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  انضم في {joinDate}
                </span>
                {user.universityName && (
                  <span className="inline-flex items-center gap-1.5">
                    <University className="w-3.5 h-3.5" />
                    {user.universityName}
                  </span>
                )}
                {user.college && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {user.college}
                  </span>
                )}
                {user.studentCode && (
                  <span className="inline-flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    <span className="font-mono">{user.studentCode}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:pb-1 shrink-0">
              <Link
                href="/student/settings"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-all shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/25"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>تعديل البيانات</span>
              </Link>
              <Link
                href="/student/settings"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>كلمة المرور</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Bar ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="إجمالي الاختبارات"
          value={totalExams.toString()}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          icon={CheckCircle2}
          label="ناجح"
          value={passedExams.toString()}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          icon={AlertCircle}
          label="راسب"
          value={failedExams.toString()}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
        <StatCard
          icon={TrendingUp}
          label="نسبة النجاح"
          value={`${successRate}%`}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
      </div>

      {/* ── Profile Completion ────────────────────────────────────── */}
      {completionPercent < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              أكمل بياناتك الشخصية
            </h3>
            <p className="text-xs text-amber-700 mt-0.5">
              ملفك الشخصي مكتمل بنسبة {completionPercent}% — أضف المعلومات
              المتبقية للحصول على أفضل تجربة
            </p>
            {/* Progress bar */}
            <div className="mt-2.5 h-2 w-full max-w-xs bg-amber-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
          <Link
            href="/student/complete-profile"
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 border border-amber-300 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors shrink-0"
          >
            أكمل البيانات
          </Link>
        </div>
      )}

      {/* ── Info Grid — 2 columns ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1 — Personal Info */}
        <InfoCard
          title="المعلومات الشخصية"
          titleIcon={User}
          titleIconColor="text-blue-600"
          titleIconBg="bg-blue-50"
          rows={[
            {
              icon: User,
              label: "الاسم الكامل",
              value: user.name,
            },
            {
              icon: Mail,
              label: "البريد الإلكتروني",
              value: user.email,
              badge: user.emailVerified
                ? {
                    text: "موثّق",
                    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  }
                : {
                    text: "غير موثّق",
                    color: "bg-red-50 text-red-600 border-red-200",
                  },
            },
            {
              icon: IdCard,
              label: "الرقم القومي",
              value: user.nationalId ?? "—",
              mono: true,
            },
            {
              icon: Hash,
              label: "كود الطالب",
              value: user.studentCode ?? "—",
              mono: true,
            },
            {
              icon: Calendar,
              label: "تاريخ الانضمام",
              value: joinDate,
            },
          ]}
        />

        {/* Card 2 — Academic Info (all fields) */}
        <InfoCard
          title="البيانات الأكاديمية"
          titleIcon={BookUser}
          titleIconColor="text-violet-600"
          titleIconBg="bg-violet-50"
          rows={[
            {
              icon: University,
              label: "الجامعة",
              value: user.universityName ?? "—",
            },
            {
              icon: Building2,
              label: "الكلية",
              value: user.college ?? "—",
            },
            {
              icon: BookOpen,
              label: "القسم",
              value: user.department ?? "—",
            },
            {
              icon: Layers,
              label: "الفرقة الدراسية",
              value: academicYearInfo?.label ?? "—",
              badge: academicYearInfo
                ? {
                    text: `السنة ${academicYearInfo.year}`,
                    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
                  }
                : undefined,
            },
          ]}
        />
      </div>

      {/* ── Bottom Row: Accessibility + Performance ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card — Accessibility / Disability */}
        <div
          className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${
            hasDisability ? "border-violet-200" : "border-gray-200"
          }`}
        >
          {/* Card header */}
          <div
            className={`flex items-center gap-3 px-6 py-4 border-b ${hasDisability ? "border-violet-100 bg-violet-50/40" : "border-gray-100"}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${hasDisability ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-500"}`}
            >
              <Accessibility className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              الاحتياجات الخاصة
            </h2>
          </div>

          {/* Card body */}
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${disability.bg} shrink-0`}
              >
                <Shield className={`w-7 h-7 ${disability.color}`} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 mb-1">
                  نوع الإعاقة
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-full ${disability.bg} ${disability.color} border ${disability.border}`}
                >
                  {disability.label}
                </span>
              </div>
            </div>

            {hasDisability && (
              <div className="space-y-3">
                <p className="text-[13px] text-gray-500 leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                  يتم توفير ترتيبات خاصة بناءً على نوع الإعاقة المسجل. إذا كنت
                  بحاجة إلى تحديث هذه المعلومات، يرجى التواصل مع إدارة الجامعة.
                </p>
                <div className="flex items-center gap-2 text-xs text-violet-600 bg-violet-50 rounded-lg px-3 py-2 border border-violet-100">
                  <Shield className="w-4 h-4" />
                  <span>يتم مراعاة حالتك تلقائيًا عند تقديم الاختبارات</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card — Performance Overview */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              نظرة عامة على الأداء
            </h2>
          </div>

          <div className="px-6 py-5 space-y-5">
            {totalExams > 0 ? (
              <>
                {/* Success rate visual */}
                <div className="text-center">
                  <div className="relative w-28 h-28 mx-auto">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="10"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke={successRate >= 50 ? "#10b981" : "#ef4444"}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(successRate / 100) * 314} 314`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {successRate}%
                      </span>
                      <span className="text-[10px] text-gray-400">
                        نسبة النجاح
                      </span>
                    </div>
                  </div>
                </div>

                {/* Breakdown bars */}
                <div className="space-y-3">
                  <ProgressRow
                    label="ناجح"
                    count={passedExams}
                    total={totalExams}
                    color="bg-emerald-500"
                    textColor="text-emerald-700"
                  />
                  <ProgressRow
                    label="راسب"
                    count={failedExams}
                    total={totalExams}
                    color="bg-rose-500"
                    textColor="text-rose-700"
                  />
                  <ProgressRow
                    label="قيد التصحيح"
                    count={totalExams - passedExams - failedExams}
                    total={totalExams}
                    color="bg-amber-500"
                    textColor="text-amber-700"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  لم تقم بأي اختبار بعد
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ستظهر هنا إحصائيات أدائك بعد تقديم اختبارك الأول
                </p>
                <Link
                  href="/student/exams"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-4"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  تصفح الاختبارات المتاحة
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">
            {value}
          </p>
          <p className="text-[11px] font-medium text-gray-400 mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ── Progress Row ───────────────────────────────────────────────────────────

function ProgressRow({
  label,
  count,
  total,
  color,
  textColor,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  textColor: string;
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-semibold ${textColor} w-20 shrink-0`}>
        {label}
      </span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-600 w-8 text-left">
        {count}
      </span>
    </div>
  );
}

// ── Info Card ──────────────────────────────────────────────────────────────

function InfoCard({
  title,
  titleIcon: TitleIcon,
  titleIconColor,
  titleIconBg,
  rows,
}: {
  title: string;
  titleIcon: React.ElementType;
  titleIconColor: string;
  titleIconBg: string;
  rows: {
    icon: React.ElementType;
    label: string;
    value: string;
    copyable?: boolean;
    mono?: boolean;
    badge?: { text: string; color: string };
  }[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div
          className={`w-9 h-9 rounded-xl ${titleIconBg} flex items-center justify-center`}
        >
          <TitleIcon className={`w-5 h-5 ${titleIconColor}`} />
        </div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {rows.map((row) => (
          <InfoRow
            key={row.label}
            icon={row.icon}
            label={row.label}
            value={row.value}
            copyable={row.copyable}
            mono={row.mono}
            badge={row.badge}
          />
        ))}
      </div>
    </div>
  );
}

// ── Info Row ───────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
  badge?: { text: string; color: string };
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-gray-400 mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-semibold text-gray-800 truncate ${mono ? "font-mono tracking-wide" : ""}`}
          >
            {value}
          </p>
          {badge && (
            <span
              className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
            >
              {badge.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
