import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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

  return (
    <div className="space-y-6">
      {/* ── Hero Card ──────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Cover gradient — taller with pattern */}
        <div className="h-44 md:h-52 bg-linear-to-bl from-blue-600 via-indigo-600 to-violet-600 relative">
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_50%,white_2px,transparent_2px)] bg-size-[32px_32px]" />
          {/* Decorative shapes */}
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute top-6 right-12 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        </div>

        {/* Profile row */}
        <div className="px-6 md:px-10 pb-8 -mt-16 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-white shrink-0">
              {initials}
            </div>

            {/* Name block */}
            <div className="flex-1 pt-2 sm:pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  <GraduationCap className="w-3.5 h-3.5" />
                  طالب
                </span>
                {user.emailVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    موثّق
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1.5">
                @{user.username ?? user.name}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>انضم في {joinDate}</span>
                </div>
                {user.universityName && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <University className="w-3.5 h-3.5" />
                    <span>{user.universityName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 sm:pb-2">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-sm">
                <Pencil className="w-4 h-4" />
                <span>تعديل البيانات</span>
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer">
                <KeyRound className="w-4 h-4" />
                <span>تغيير كلمة المرور</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Grid — 3 columns ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1 — Personal Info */}
        <InfoCard
          title="المعلومات الشخصية"
          titleIcon={User}
          titleIconColor="text-blue-600"
          titleIconBg="bg-blue-50"
          rows={[
            {
              icon: Mail,
              label: "البريد الإلكتروني",
              value: user.email,
              copyable: true,
            },
            {
              icon: IdCard,
              label: "الرقم القومي",
              value: user.nationalId ?? "—",
              mono: true,
            },
          ]}
        />

        {/* Card 2 — Academic Info */}
        <InfoCard
          title="البيانات الأكاديمية"
          titleIcon={BookUser}
          titleIconColor="text-violet-600"
          titleIconBg="bg-violet-50"
          rows={[
            {
              icon: University,
              label: "اسم الجامعة",
              value: user.universityName ?? "—",
            },
            {
              icon: Hash,
              label: "كود الطالب",
              value: user.studentCode ?? "—",
              mono: true,
            },
          ]}
        />

        {/* Card 3 — Accessibility / Disability */}
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
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${disability.bg} shrink-0`}
              >
                <Shield className={`w-6 h-6 ${disability.color}`} />
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
              <p className="text-[13px] text-gray-500 leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                يتم توفير ترتيبات خاصة بناءً على نوع الإعاقة المسجل. إذا كنت
                بحاجة إلى تحديث هذه المعلومات، يرجى التواصل مع إدارة الجامعة.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


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
          />
        ))}
      </div>
    </div>
  );
}


function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-gray-400 mb-0.5">{label}</p>
        <p
          className={`text-sm font-semibold text-gray-800 truncate ${mono ? "font-mono tracking-wide" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
