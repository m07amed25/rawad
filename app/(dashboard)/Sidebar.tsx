"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  BarChart3,
  UserCircle,
  Settings,
  LayoutGrid,
  Menu,
} from "lucide-react";
import { SignOutButton } from "./SignOutButton";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const studentNavItems = [
  {
    label: "لوحة الطالب",
    href: "/student",
    icon: LayoutDashboard,
  },
  {
    label: "الامتحانات",
    href: "/student/exams",
    icon: FileText,
  },
  {
    label: "نتائجي",
    href: "/student/results",
    icon: BarChart3,
  },
  {
    label: "الملف الشخصي",
    href: "/student/profile",
    icon: UserCircle,
  },
  {
    label: "الإعدادات",
    href: "/student/settings",
    icon: Settings,
  },
];

const teacherNavItems = [
  {
    label: "لوحة القيادة",
    href: "/teacher",
    icon: LayoutDashboard,
  },
  {
    label: "إنشاء الامتحانات",
    href: "/teacher/exams/create",
    icon: FilePlus,
  },
  {
    label: "إدارة الامتحانات",
    href: "/teacher/exams",
    icon: LayoutGrid,
  },
  {
    label: "النتائج",
    href: "/teacher/results",
    icon: BarChart3,
  },
  {
    label: "الإعدادات",
    href: "/teacher/settings",
    icon: Settings,
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const navItems = useMemo(
    () => (pathname.startsWith("/teacher") ? teacherNavItems : studentNavItems),
    [pathname],
  );

  return (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <Image
            src="/images/logo.png"
            alt="logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span
            className="text-2xl font-black tracking-wide text-neutral-800"
            style={{ fontFamily: "var(--font-aquatico)" }}
          >
            Rawad
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? "text-blue-700 bg-blue-50 border border-blue-100 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-100">
        <SignOutButton />
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-l border-gray-200 hidden md:flex flex-col shadow-sm h-screen sticky top-0 overflow-hidden">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
        <Menu className="w-6 h-6" />
      </SheetTrigger>
      <SheetContent side="right" className="w-64 p-0 flex flex-col">
        <SheetTitle className="sr-only">القائمة</SheetTitle>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
