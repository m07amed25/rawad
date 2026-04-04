"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  Camera,
  Sun,
  Moon,
  Monitor,
  Eye,
  Accessibility,
  Type,
  Palette,
  Bell,
  BellRing,
  Mail as MailIcon,
  Shield,
  KeyRound,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Contrast,
  ShieldCheck,
  FileText,
  BarChart3,
  Clock,
  Home,
  Save,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

// ── Types ──────────────────────────────────────────────────────────────────

type Theme = "light" | "dark" | "system";
type TextSize = "normal" | "large" | "xlarge";

// ── Config ─────────────────────────────────────────────────────────────────

const themeOptions: {
  key: Theme;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    key: "light",
    label: "فاتح",
    icon: Sun,
    description: "مظهر فاتح مريح للعين",
  },
  {
    key: "dark",
    label: "داكن",
    icon: Moon,
    description: "مظهر داكن لتقليل إجهاد العين",
  },
  {
    key: "system",
    label: "تلقائي",
    icon: Monitor,
    description: "يتبع إعدادات النظام",
  },
];

const textSizeOptions: { key: TextSize; label: string; sample: string }[] = [
  { key: "normal", label: "عادي", sample: "أ" },
  { key: "large", label: "كبير", sample: "أ" },
  { key: "xlarge", label: "كبير جداً", sample: "أ" },
];

// ── Settings Page ──────────────────────────────────────────────────────────

export default function TeacherSettingsPage() {
  // Profile
  const [fullName, setFullName] = useState("د. أحمد محمد عبدالله");
  const email = "ahmed.teacher@university.edu";
  const university = "جامعة القاهرة";
  const department = "قسم إدارة الأعمال";

  // Appearance & Accessibility
  const [theme, setTheme] = useState<Theme>("light");
  const [textSize, setTextSize] = useState<TextSize>("normal");
  const [highContrast, setHighContrast] = useState(false);

  // Notifications
  const [notifyExamEnd, setNotifyExamEnd] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handlePasswordSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;
    setPasswordSaved(true);
    setTimeout(() => {
      setPasswordDialogOpen(false);
      setPasswordSaved(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1500);
  };

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmitPassword =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    passwordsMatch &&
    newPassword.length >= 8;

  // Get initials from name
  const initials = fullName
    .split(" ")
    .filter((w) => w.length > 1)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

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
            <BreadcrumbPage>الإعدادات</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-base text-gray-500 mt-1">
          إدارة حسابك وتخصيص تجربتك على المنصة
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" orientation="horizontal">
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 scrollbar-none">
          <TabsList
            variant="default"
            className="h-auto p-1 bg-gray-100/80 rounded-xl w-max md:w-fit gap-0.5"
          >
            <TabsTrigger
              value="profile"
              className="px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium data-active:bg-white data-active:shadow-sm gap-1.5 sm:gap-2 whitespace-nowrap"
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">الملف الشخصي</span>
              <span className="sm:hidden">الملف</span>
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium data-active:bg-white data-active:shadow-sm gap-1.5 sm:gap-2 whitespace-nowrap"
            >
              <Accessibility className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">المظهر وإمكانية الوصول</span>
              <span className="sm:hidden">المظهر</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium data-active:bg-white data-active:shadow-sm gap-1.5 sm:gap-2 whitespace-nowrap"
            >
              <Bell className="w-4 h-4 shrink-0" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium data-active:bg-white data-active:shadow-sm gap-1.5 sm:gap-2 whitespace-nowrap"
            >
              <Shield className="w-4 h-4 shrink-0" />
              الأمان
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* Tab 1: Profile & Academic Info                            */}
        {/* ────────────────────────────────────────────────────────── */}
        <TabsContent value="profile" className="space-y-5 mt-1">
          {/* Avatar Section */}
          <SettingsCard
            icon={Camera}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            title="الصورة الشخصية"
            description="صورتك تظهر في الملف الشخصي ولوحة التحكم"
          >
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200/50">
                {initials}
              </div>
              <div className="space-y-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer">
                  <Camera className="w-4 h-4" />
                  تغيير الصورة
                </button>
                <p className="text-[11px] text-gray-400">
                  JPG أو PNG — بحد أقصى 2 ميجابايت
                </p>
              </div>
            </div>
          </SettingsCard>

          {/* Personal Info */}
          <SettingsCard
            icon={User}
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
            title="المعلومات الشخصية"
            description="بياناتك الأساسية المعروضة على المنصة"
          >
            <div className="space-y-4">
              <InputField
                label="الاسم الكامل"
                icon={User}
                value={fullName}
                onChange={setFullName}
                placeholder="أدخل اسمك الكامل"
              />
              <InputField
                label="البريد الإلكتروني"
                icon={Mail}
                value={email}
                readOnly
                hint="لا يمكن تغيير البريد الإلكتروني — تواصل مع الدعم إذا لزم الأمر"
              />
            </div>
          </SettingsCard>

          {/* Academic Info */}
          <SettingsCard
            icon={GraduationCap}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            title="البيانات الأكاديمية"
            description="تم تحديد هذه البيانات أثناء التسجيل — لتعديلها تواصل مع الإدارة"
          >
            <div className="space-y-4">
              <InputField
                label="الجامعة"
                icon={Building2}
                value={university}
                readOnly
              />
              <InputField
                label="القسم"
                icon={GraduationCap}
                value={department}
                readOnly
              />
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mt-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-[13px] text-amber-700 leading-relaxed">
                البيانات الأكاديمية مرتبطة بنظام الفلترة والامتحانات. لتعديلها،
                يرجى التواصل مع إدارة المنصة عبر نظام الطلبات.
              </p>
            </div>
          </SettingsCard>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white transition-colors cursor-pointer shadow-sm">
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </button>
          </div>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────── */}
        {/* Tab 2: Appearance & Accessibility                         */}
        {/* ────────────────────────────────────────────────────────── */}
        <TabsContent value="appearance" className="space-y-5 mt-1">
          {/* Theme Selector */}
          <SettingsCard
            icon={Palette}
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
            title="المظهر"
            description="اختر المظهر المناسب لك"
          >
            <div className="flex items-center gap-2">
              {themeOptions.map((opt) => {
                const isActive = theme === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setTheme(opt.key)}
                    className={`flex items-center gap-2.5 flex-1 px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-blue-500 bg-blue-50/60"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <opt.icon className="w-4.5 h-4.5" />
                    </div>
                    <span
                      className={`text-sm font-semibold ${isActive ? "text-blue-700" : "text-gray-700"}`}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </SettingsCard>

          {/* Text Size */}
          <SettingsCard
            icon={Type}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
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
                    onClick={() => setTextSize(opt.key)}
                    className={`flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 sm:px-5 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-blue-500 bg-blue-50/60"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`font-bold ${sizeClass} ${isActive ? "text-blue-600" : "text-gray-500"}`}
                    >
                      {opt.sample}
                    </span>
                    <span
                      className={`text-sm font-medium ${isActive ? "text-blue-700" : "text-gray-600"}`}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </SettingsCard>

          {/* High Contrast Toggle */}
          <SettingsCard
            icon={Eye}
            iconColor="text-teal-600"
            iconBg="bg-teal-50"
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
            </div>
          </SettingsCard>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────── */}
        {/* Tab 3: Notifications                                      */}
        {/* ────────────────────────────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-5 mt-1">
          {/* Email Notifications */}
          <SettingsCard
            icon={MailIcon}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            title="إشعارات البريد الإلكتروني"
            description="التحكم في الإشعارات التي تصلك عبر البريد"
          >
            <div className="space-y-3">
              <ToggleRow
                icon={FileText}
                accentColor="blue"
                label="إشعار عند انتهاء امتحان"
                description="إشعار تلقائي عند انتهاء وقت أي امتحان قمت بإنشائه"
                checked={notifyExamEnd}
                onCheckedChange={setNotifyExamEnd}
              />
              <ToggleRow
                icon={BarChart3}
                accentColor="violet"
                label="إرسال تقرير أسبوعي بالنتائج"
                description="ملخص أسبوعي يتضمن إحصائيات أداء الطلاب ونتائج الامتحانات"
                checked={weeklyReport}
                onCheckedChange={setWeeklyReport}
              />
            </div>
          </SettingsCard>

          {/* System Alerts */}
          <SettingsCard
            icon={BellRing}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            title="تنبيهات النظام"
            description="التحكم في تنبيهات التحديثات والصيانة"
          >
            <div className="space-y-3">
              <ToggleRow
                icon={Clock}
                accentColor="amber"
                label="تنبيهات النظام والتحديثات"
                description="إشعارات حول تحديثات المنصة وأوقات الصيانة المجدولة"
                checked={systemAlerts}
                onCheckedChange={setSystemAlerts}
              />
            </div>
          </SettingsCard>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────── */}
        {/* Tab 4: Security                                           */}
        {/* ────────────────────────────────────────────────────────── */}
        <TabsContent value="security" className="space-y-5 mt-1">
          {/* Two-Factor Auth */}
          <SettingsCard
            icon={Smartphone}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
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
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mt-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    المصادقة الثنائية مفعّلة
                  </p>
                  <p className="text-[13px] text-emerald-600 mt-0.5 leading-relaxed">
                    حسابك محمي بطبقة إضافية من الأمان. سيُطلب منك إدخال رمز OTP
                    عند كل تسجيل دخول.
                  </p>
                </div>
              </div>
            )}
          </SettingsCard>

          {/* Change Password */}
          <SettingsCard
            icon={KeyRound}
            iconColor="text-rose-600"
            iconBg="bg-rose-50"
            title="تغيير كلمة المرور"
            description="تحديث كلمة المرور الخاصة بحسابك بشكل دوري لتعزيز الأمان"
          >
            <Dialog
              open={passwordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
            >
              <DialogTrigger className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white transition-colors cursor-pointer shadow-sm">
                <Lock className="w-4 h-4" />
                <span>تغيير كلمة المرور</span>
              </DialogTrigger>
              <DialogContent
                showCloseButton={false}
                className="gap-0! p-0! sm:max-w-md! overflow-hidden rounded-2xl"
              >
                {/* Header */}
                <div className="relative bg-gray-900 px-6 pt-7 pb-6 text-white">
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

                {/* Form */}
                <div className="px-6 py-6 space-y-4">
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

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                  <DialogClose className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer">
                    إلغاء
                  </DialogClose>
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={!canSubmitPassword || passwordSaved}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {passwordSaved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم التحديث</span>
                      </>
                    ) : (
                      <span>تحديث كلمة المرور</span>
                    )}
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            <p className="text-[13px] text-gray-400 mt-3 leading-relaxed">
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
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-gray-900">
            {title}
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
      {/* Card Body */}
      <div className="px-4 sm:px-6 py-4 sm:py-5">{children}</div>
    </div>
  );
}

// ── Input Field ────────────────────────────────────────────────────────────

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  readOnly,
  hint,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 inset-s-0 flex items-center ps-3.5 pointer-events-none">
          <Icon
            className={`w-4 h-4 ${readOnly ? "text-gray-300" : "text-gray-400"}`}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full ps-10 pe-4 py-2.5 rounded-xl border text-sm transition-all ${
            readOnly
              ? "border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed"
              : "border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          }`}
        />
      </div>
      {hint && (
        <p className="text-[11px] text-gray-400 leading-relaxed">{hint}</p>
      )}
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
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    activeBg: "bg-teal-50/60",
    activeBorder: "border-teal-200",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-700",
  },
  indigo: {
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    activeBg: "bg-indigo-50/60",
    activeBorder: "border-indigo-200",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
  },
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    activeBg: "bg-blue-50/60",
    activeBorder: "border-blue-200",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  violet: {
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    activeBg: "bg-violet-50/60",
    activeBorder: "border-violet-200",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    activeBg: "bg-amber-50/60",
    activeBorder: "border-amber-200",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
  },
  emerald: {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    activeBg: "bg-emerald-50/60",
    activeBorder: "border-emerald-200",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
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
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
          checked ? s.iconBg : "bg-gray-100"
        }`}
      >
        <Icon
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${
            checked ? s.iconColor : "text-gray-400"
          }`}
        />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <p
            className={`text-xs sm:text-sm font-semibold ${
              checked ? "text-gray-900" : "text-gray-700"
            }`}
          >
            {label}
          </p>
          <span
            className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold ${
              checked
                ? `${s.badgeBg} ${s.badgeText}`
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {checked ? "مفعّل" : "معطّل"}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Switch */}
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
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
      />
    </div>
  );
}
