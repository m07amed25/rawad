import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Sidebar, MobileSidebarTrigger } from "./Sidebar";
import { ProfilePopover } from "./ProfilePopover";
import { DbKeepalive } from "@/components/DbKeepalive";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  const isTeacher = session.user.role === "TEACHER";

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "صباح الخير";
    if (hour < 18) return "مساء الخير";
    return "مساء الخير";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex" dir="rtl">
      <DbKeepalive />
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 dark:bg-background">
        <header className="h-18 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-gray-100 dark:border-border flex items-center justify-between px-6 md:px-10 z-10 sticky top-0">
          {/* Right side — Greeting & Search */}
          <div className="flex items-center gap-5">
            <MobileSidebarTrigger />
            <div className="hidden sm:block">
              <p className="text-sm text-gray-500 dark:text-muted-foreground leading-none">{greeting()}</p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-foreground mt-0.5">
                {isTeacher ? "لوحة المعلم" : "لوحة الطالب"}
              </h2>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-foreground sm:hidden">
              {isTeacher ? "لوحة المعلم" : "لوحة الطالب"}
            </h2>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-3.5 py-2 w-64 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 transition-all">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="بحث..."
                className="bg-transparent text-sm text-gray-700 dark:text-foreground placeholder:text-gray-400 outline-none w-full"
              />
              <kbd className="hidden lg:inline-flex text-[10px] font-medium text-gray-400 dark:text-muted-foreground bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border rounded px-1.5 py-0.5 shrink-0">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Left side — Actions & Profile */}
          <div className="flex items-center gap-2">
            {/* Notification */}
            <button className="relative p-2.5 text-gray-500 dark:text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-card"></span>
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 dark:bg-border mx-1 hidden sm:block" />

            {/* Profile */}
            <ProfilePopover
              user={{
                name: session.user.name,
                email: session.user.email,
                username: session.user.username ?? session.user.name,
                role: session.user.role,
                universityName: session.user.universityName,
                studentCode: session.user.studentCode,
                nationalId: session.user.nationalId,
              }}
            />
          </div>
        </header>
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
