"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Sun,
  Moon,
  Monitor,
  Eye,
  Accessibility,
  Type,
  Palette,
  Bell,
  BellRing,
  Mail,
  Shield,
  KeyRound,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Contrast,
  MonitorSmartphone,
  FileText,
  BarChart3,
  Clock,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { changePassword } from "@/app/actions/settings";

// ── Types ──────────────────────────────────────────────────────────────────

type ThemeKey = "light" | "dark" | "system";
type TextSize = "normal" | "large" | "xlarge";

// ── Config ─────────────────────────────────────────────────────────────────

const themeOptions: {
  key: ThemeKey;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "light", label: "فاتح", icon: Sun },
  { key: "dark", label: "داكن", icon: Moon },
  { key: "system", label: "تلقائي", icon: Monitor },
];

const textSizeOptions: { key: TextSize; label: string; sample: string }[] = [
  { key: "normal", label: "عادي", sample: "أ" },
  { key: "large", label: "كبير", sample: "أ" },
  { key: "xlarge", label: "كبير جداً", sample: "أ" },
];

const TEXT_SIZE_KEY = "rawad:textSize";
const NOTIF_KEY = "rawad:student:notifications";

// ── Helpers (module-level, no DOM side-effects) ───────────────────────────

const textSizeMap: Record<TextSize, string> = {
  normal: "100%",
  large: "112.5%",
  xlarge: "125%",
};

// ── Settings Page ──────────────────────────────────────────────────────────

export default function SettingsPage() {
  // ── Theme
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ── Appearance
  const [textSize, setTextSizeState] = useState<TextSize>("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  // ── Notifications
  const [notifyNewExams, setNotifyNewExams] = useState(true);
  const [notifyResults, setNotifyResults] = useState(true);
  const [notifyExamReminders, setNotifyExamReminders] = useState(true);

  // ── Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // ── Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [passwordSaved, setPasswordSaved] = useState(false);

  // ── Hydration + restore from localStorage ────────────────────────────────

  useEffect(() => {
    setMounted(true);

    const savedSize = localStorage.getItem(TEXT_SIZE_KEY) as TextSize | null;
    if (savedSize && ["normal", "large", "xlarge"].includes(savedSize)) {
      setTextSizeState(savedSize);
      document.documentElement.style.fontSize = textSizeMap[savedSize];
    }

    try {
      const saved = localStorage.getItem(NOTIF_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifyNewExams(parsed.notifyNewExams ?? true);
        setNotifyResults(parsed.notifyResults ?? true);
        setNotifyExamReminders(parsed.notifyExamReminders ?? true);
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleTextSize(size: TextSize) {
    setTextSizeState(size);
    document.documentElement.style.fontSize = textSizeMap[size];
    localStorage.setItem(TEXT_SIZE_KEY, size);
  }

  function saveNotifications(
    updates: Partial<{
      notifyNewExams: boolean;
      notifyResults: boolean;
      notifyExamReminders: boolean;
    }>,
  ) {
    const merged = {
      notifyNewExams,
      notifyResults,
      notifyExamReminders,
      ...updates,
    };
    localStorage.setItem(NOTIF_KEY, JSON.stringify(merged));
  }

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmitPassword =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    passwordsMatch &&
    newPassword.length >= 8;

  function handlePasswordSubmit() {
    if (!canSubmitPassword) return;
    startTransition(async () => {
      const result = await changePassword({ currentPassword, newPassword });
      if (result.error) {
        toast.error(result.error);
      } else {
        setPasswordSaved(true);
        toast.success("تم تغيير كلمة المرور بنجاح");
        setTimeout(() => {
          setPasswordDialogOpen(false);
          setPasswordSaved(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }, 1500);
      }
    });
  }

  const activeTheme = (mounted ? theme : "system") as ThemeKey;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">
          الإعدادات
        </h1>
        <p className="text-base text-gray-500 dark:text-muted-foreground mt-1">
          تخصيص تجربتك وإدارة حسابك
        </p>
      </div>

      <Tabs defaultValue="accessibility" orientation="horizontal">
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 scrollbar-none">
          <TabsList
            variant="default"
            className="h-auto p-1 bg-gray-100/80 dark:bg-muted rounded-xl w-max md:w-fit gap-0.5"
          >
            <TabsTrigger
              value="accessibility"
              className="px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium data-active:bg-white dark:data-active:bg-card data-active:shadow-sm gap-1.5 sm:gap-2 whitespace-nowrap"
            >
              <Accessibility className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">إمكانية الوصول والمظهر</span>
              <span className="sm:hidden">المظهر</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium data-active:bg-white dark:data-active:bg-card data-active:shadow-sm gap-1.5 sm:gap-2 whitespace-nowrap"
            >
              <Bell className="w-4 h-4 shrink-0" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium data-active:bg-white dark:data-active:bg-card data-active:shadow-sm gap-1.5 sm:gap-2 whitespace-nowrap"
            >
              <Shield className="w-4 h-4 shrink-0" />
              الأمان
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Tab 1: Appearance ─────────────────────────────────────────── */}
        <TabsContent value="accessibility" className="space-y-5 mt-1">
          <SettingsCard
            icon={Palette}
            iconColor="text-violet-600"
            iconBg="bg-violet-50 dark:bg-violet-950/40"
            title="المظهر"
            description="اختر المظهر المناسب لك"
          >
            <div className="flex items-center gap-2">
              {themeOptions.map((opt) => {
                const isActive = activeTheme === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setTheme(opt.key)}
                    className={`flex items-center gap-2.5 flex-1 px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40"
                        : "border-gray-200 dark:border-border bg-white dark:bg-card hover:border-gray-300 dark:hover:border-muted-foreground/30 hover:bg-gray-50 dark:hover:bg-accent"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600" : "bg-gray-100 dark:bg-muted text-gray-500 dark:text-muted-foreground"}`}
                    >
                      <opt.icon className="w-[18px] h-[18px]" />
                    </div>
                    <span
                      className={`text-sm font-semibold ${isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-foreground"}`}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Type}
            iconColor="text-amber-600"
            iconBg="bg-amber-50 dark:bg-amber-950/40"
            title="حجم الخط"
            description="اضبط حجم الخط لتسهيل القراءة"
          >
            <div className="grid grid-cols-3 gap-2">
              {textSizeOptions.map((opt) => {
                const isActive = textSize === opt.key;
                const sizeClass =
                  opt.key === "normal"
                    ? "text-base"
                    : opt.key === "large"
                      ? "text-xl"
                      : "text-2xl";
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleTextSize(opt.key)}
                    className={`flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 sm:px-5 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40"
                        : "border-gray-200 dark:border-border bg-white dark:bg-card hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`font-bold ${sizeClass} ${isActive ? "text-blue-600" : "text-gray-500 dark:text-muted-foreground"}`}
                    >
                      {opt.sample}
                    </span>
                    <span
                      className={`text-sm font-medium ${isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-muted-foreground"}`}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </SettingsCard>

          <SettingsCard
            icon={Eye}
            iconColor="text-teal-600"
            iconBg="bg-teal-50 dark:bg-teal-950/40"
            title="خيارات إمكانية الوصول"
            description="تخصيصات إضافية لتسهيل الاستخدام"
          >
            <div className="space-y-3">
              <ToggleRow
                icon={Contrast}
                accentColor="teal"
                label="تباين عالي"
                description="زيادة التباين بين الألوان لتحسين وضوح المحتوى"
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
              <ToggleRow
                icon={MonitorSmartphone}
                accentColor="indigo"
                label="تحسينات قارئ الشاشة"
                description="تبسيط التخطيط لتوافق أفضل مع قارئات الشاشة"
                checked={screenReaderMode}
                onCheckedChange={setScreenReaderMode}
              />
            </div>
          </SettingsCard>
        </TabsContent>

        {/* ── Tab 2: Notifications ───────────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-5 mt-1">
          <SettingsCard
            icon={Mail}
            iconColor="text-blue-600"
            iconBg="bg-blue-50 dark:bg-blue-950/40"
            title="إشعارات البريد الإلكتروني"
            description="التحكم في الإشعارات التي تصلك عبر البريد"
          >
            <div className="space-y-3">
              <ToggleRow
                icon={FileText}
                accentColor="blue"
                label="امتحانات جديدة متاحة"
                description="إشعار عند إضافة امتحان جديد يمكنك التقدم له"
                checked={notifyNewExams}
                onCheckedChange={(v) => {
                  setNotifyNewExams(v);
                  saveNotifications({ notifyNewExams: v });
                }}
              />
              <ToggleRow
                icon={BarChart3}
                accentColor="violet"
                label="تم نشر النتائج"
                description="إشعار فور نشر نتائج امتحان قمت بتقديمه"
                checked={notifyResults}
                onCheckedChange={(v) => {
                  setNotifyResults(v);
                  saveNotifications({ notifyResults: v });
                }}
              />
            </div>
          </SettingsCard>

          <SettingsCard
            icon={BellRing}
            iconColor="text-amber-600"
            iconBg="bg-amber-50 dark:bg-amber-950/40"
            title="تنبيهات النظام"
            description="التحكم في التنبيهات والتذكيرات"
          >
            <div className="space-y-3">
              <ToggleRow
                icon={Clock}
                accentColor="amber"
                label="تذكير قبل انتهاء الامتحان"
                description="تنبيه قبل انتهاء وقت الامتحان بـ 5 دقائق"
                checked={notifyExamReminders}
                onCheckedChange={(v) => {
                  setNotifyExamReminders(v);
                  saveNotifications({ notifyExamReminders: v });
                }}
              />
            </div>
          </SettingsCard>
        </TabsContent>

        {/* ── Tab 3: Security ────────────────────────────────────────────── */}
        <TabsContent value="security" className="space-y-5 mt-1">
          <SettingsCard
            icon={Smartphone}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            title="المصادقة الثنائية (OTP)"
            description="طبقة حماية إضافية لحسابك عبر رمز يُرسل بالبريد عند تسجيل الدخول"
          >
            <div className="space-y-3">
              <ToggleRow
                icon={ShieldCheck}
                accentColor="emerald"
                label="تفعيل المصادقة الثنائية"
                description="سيتم إرسال رمز تحقق إلى بريدك الإلكتروني عند كل تسجيل دخول"
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>
            {twoFactorEnabled && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl mt-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-[18px] h-[18px] text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                    المصادقة الثنائية مفعّلة
                  </p>
                  <p className="text-[13px] text-emerald-600 dark:text-emerald-500 mt-0.5 leading-relaxed">
                    حسابك محمي بطبقة إضافية من الأمان.
                  </p>
                </div>
              </div>
            )}
          </SettingsCard>

          <SettingsCard
            icon={KeyRound}
            iconColor="text-rose-600"
            iconBg="bg-rose-50 dark:bg-rose-950/40"
            title="تغيير كلمة المرور"
            description="تحديث كلمة المرور الخاصة بحسابك بشكل دوري لتعزيز الأمان"
          >
            <Dialog
              open={passwordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
            >
              <DialogTrigger className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 dark:bg-primary hover:bg-gray-800 dark:hover:bg-primary/90 text-white transition-colors cursor-pointer shadow-sm">
                <Lock className="w-4 h-4" />
                <span>تغيير كلمة المرور</span>
              </DialogTrigger>
              <DialogContent
                showCloseButton={false}
                className="gap-0! p-0! sm:max-w-md! overflow-hidden rounded-2xl"
              >
                <div className="relative bg-gray-900 dark:bg-muted px-6 pt-7 pb-6 text-white">
                  <DialogClose className="absolute top-4 inset-e-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
                    <span className="sr-only">إغلاق</span>
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </DialogClose>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/10">
                      <KeyRound className="w-5 h-5" />
                    </div>
                  </div>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">
                      تغيير كلمة المرور
                    </DialogTitle>
                    <DialogDescription className="text-gray-300 text-sm mt-1.5">
                      أدخل كلمة المرور الحالية ثم اختر كلمة مرور جديدة
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <div className="px-6 py-6 space-y-4 bg-card">
                  <PasswordField
                    label="كلمة المرور الحالية"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="أدخل كلمة المرور الحالية"
                  />
                  <PasswordField
                    label="كلمة المرور الجديدة"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="8 أحرف على الأقل"
                  />
                  <PasswordField
                    label="تأكيد كلمة المرور الجديدة"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                  />
                  {confirmPassword && !passwordsMatch && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>كلمتا المرور غير متطابقتين</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/50">
                  <DialogClose className="px-5 py-2.5 rounded-xl text-sm font-medium bg-background border border-border hover:bg-accent text-foreground transition-colors cursor-pointer">
                    إلغاء
                  </DialogClose>
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={!canSubmitPassword || isPending || passwordSaved}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 dark:bg-primary hover:bg-gray-800 text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : passwordSaved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم الحفظ</span>
                      </>
                    ) : (
                      <span>حفظ كلمة المرور</span>
                    )}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            <p className="text-[13px] text-gray-400 dark:text-muted-foreground mt-3 leading-relaxed">
              يُنصح بتغيير كلمة المرور كل 3 أشهر واستخدام مزيج من الأحرف
              والأرقام والرموز.
            </p>
          </SettingsCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Settings Card ──────────────────────────────────────────────────────────

function SettingsCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-border">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-foreground">
            {title}
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-400 dark:text-muted-foreground mt-0.5 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
      <div className="px-4 sm:px-6 py-4 sm:py-5">{children}</div>
    </div>
  );
}

// ── Color Map ──────────────────────────────────────────────────────────────

type AccentColor = "teal" | "indigo" | "blue" | "violet" | "amber" | "emerald";

const accentStyles: Record<
  AccentColor,
  {
    iconBg: string;
    iconColor: string;
    activeBg: string;
    activeBorder: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  teal: {
    iconBg: "bg-teal-100 dark:bg-teal-900/50",
    iconColor: "text-teal-600",
    activeBg: "bg-teal-50/60 dark:bg-teal-950/40",
    activeBorder: "border-teal-200 dark:border-teal-900",
    badgeBg: "bg-teal-100 dark:bg-teal-900/60",
    badgeText: "text-teal-700 dark:text-teal-400",
  },
  indigo: {
    iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
    iconColor: "text-indigo-600",
    activeBg: "bg-indigo-50/60 dark:bg-indigo-950/40",
    activeBorder: "border-indigo-200 dark:border-indigo-900",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900/60",
    badgeText: "text-indigo-700 dark:text-indigo-400",
  },
  blue: {
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600",
    activeBg: "bg-blue-50/60 dark:bg-blue-950/40",
    activeBorder: "border-blue-200 dark:border-blue-900",
    badgeBg: "bg-blue-100 dark:bg-blue-900/60",
    badgeText: "text-blue-700 dark:text-blue-400",
  },
  violet: {
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    iconColor: "text-violet-600",
    activeBg: "bg-violet-50/60 dark:bg-violet-950/40",
    activeBorder: "border-violet-200 dark:border-violet-900",
    badgeBg: "bg-violet-100 dark:bg-violet-900/60",
    badgeText: "text-violet-700 dark:text-violet-400",
  },
  amber: {
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600",
    activeBg: "bg-amber-50/60 dark:bg-amber-950/40",
    activeBorder: "border-amber-200 dark:border-amber-900",
    badgeBg: "bg-amber-100 dark:bg-amber-900/60",
    badgeText: "text-amber-700 dark:text-amber-400",
  },
  emerald: {
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600",
    activeBg: "bg-emerald-50/60 dark:bg-emerald-950/40",
    activeBorder: "border-emerald-200 dark:border-emerald-900",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/60",
    badgeText: "text-emerald-700 dark:text-emerald-400",
  },
};

// ── Toggle Row ─────────────────────────────────────────────────────────────

function ToggleRow({
  icon: Icon,
  accentColor,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ElementType;
  accentColor: AccentColor;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  const s = accentStyles[accentColor];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onCheckedChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCheckedChange(!checked);
        }
      }}
      className={`flex items-center gap-3 sm:gap-4 w-full rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border transition-colors duration-200 cursor-pointer text-start ${
        checked
          ? `${s.activeBg} ${s.activeBorder}`
          : "bg-white dark:bg-card border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-muted-foreground/40 hover:bg-gray-50/50 dark:hover:bg-accent"
      }`}
    >
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${checked ? s.iconBg : "bg-gray-100 dark:bg-muted"}`}
      >
        <Icon
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${checked ? s.iconColor : "text-gray-400 dark:text-muted-foreground"}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <p
            className={`text-xs sm:text-sm font-semibold ${checked ? "text-gray-900 dark:text-foreground" : "text-gray-700 dark:text-foreground/80"}`}
          >
            {label}
          </p>
          <span
            className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold ${checked ? `${s.badgeBg} ${s.badgeText}` : "bg-gray-100 dark:bg-muted text-gray-400 dark:text-muted-foreground"}`}
          >
            {checked ? "مفعّل" : "معطّل"}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-gray-400 dark:text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
      <div
        className="shrink-0 relative z-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}

// ── Password Field ─────────────────────────────────────────────────────────

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-foreground/80">
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-input text-sm text-gray-800 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus:outline-none focus:border-blue-400 dark:focus:border-primary focus:ring-2 focus:ring-blue-100 dark:focus:ring-primary/20 transition-all"
      />
    </div>
  );
}
