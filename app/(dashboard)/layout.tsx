import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, User, Book, Settings, Bell } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) redirect("/auth/sign-in");

  const isTeacher = session.user.role === "TEACHER";
  
  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 hidden md:flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-center">
          <Link href="/" className="font-[family-name:var(--font-aquatico)] text-3xl font-bold tracking-wider text-blue-600 block text-center">
            RΛWΛD
          </Link>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          <Link href={isTeacher ? "/teacher" : "/student"} className="flex items-center gap-3 px-4 py-3 text-blue-700 bg-blue-50/50 hover:bg-blue-50 rounded-xl font-medium transition-colors border border-blue-100">
            <Home className="w-5 h-5 text-blue-600" />
            <span>الرئيسية</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium">
            <Book className="w-5 h-5 text-gray-500" />
            <span>المقررات</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium">
            <User className="w-5 h-5 text-gray-500" />
            <span>الملف الشخصي</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium">
            <Settings className="w-5 h-5 text-gray-500" />
            <span>الإعدادات</span>
          </Link>
        </div>
        <div className="p-4 border-t border-gray-100">
           <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-8 md:px-10 shadow-sm z-10">
          <h2 className="text-xl font-bold text-gray-800">{isTeacher ? "لوحة المعلم" : "لوحة الطالب"}</h2>
          <div className="flex items-center gap-6">
             <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
               <Bell className="w-5 h-5" />
               <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>
             <div className="flex items-center gap-3 pl-2 border-r border-gray-200">
               <div className="text-left hidden sm:block">
                 <p className="text-sm font-semibold text-gray-900 leading-tight">{session.user.name}</p>
                 <p className="text-xs text-gray-500 mt-1">{isTeacher ? "معلم / دكتور" : "طالب"}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                 {session.user.name?.charAt(0)}
               </div>
             </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
