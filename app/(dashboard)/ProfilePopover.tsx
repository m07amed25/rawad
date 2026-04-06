"use client";

import {
  ChevronDown,
  Mail,
  GraduationCap,
  University,
  IdCard,
  LogOut,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React from "react";

interface ProfilePopoverProps {
  user: {
    name: string;
    email: string;
    username: string;
    role: string;
    universityName?: string | null;
    studentCode?: string | null;
    nationalId?: string | null;
    image?: string | null;
  };
}

export function ProfilePopover({ user }: ProfilePopoverProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const isTeacher = user.role === "TEACHER";

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-3 ps-3 pe-1 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-accent transition-colors cursor-pointer outline-none">
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white dark:ring-border overflow-hidden relative">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            user.name?.charAt(0)
          )}
        </div>
        <div className="text-start hidden sm:block">
          <p className="text-sm font-semibold text-gray-900 dark:text-foreground leading-tight">
            {user.name}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-muted-foreground mt-0.5">
            {isTeacher ? "معلم / دكتور" : "طالب"}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-muted-foreground hidden sm:block" />
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-80 p-0 rounded-xl"
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0 overflow-hidden relative">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              user.name?.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">@{user.username}</p>
            <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              {isTeacher ? "معلم / دكتور" : "طالب"}
            </span>
          </div>
        </div>

        <Separator />

        {/* Info */}
        <div className="p-3 space-y-1">
          <InfoRow icon={Mail} label="البريد الإلكتروني" value={user.email} />
          {user.universityName && (
            <InfoRow
              icon={University}
              label="الجامعة"
              value={user.universityName}
            />
          )}
          {user.studentCode && (
            <InfoRow
              icon={GraduationCap}
              label="الرقم الجامعي"
              value={user.studentCode}
            />
          )}
          {user.nationalId && (
            <InfoRow
              icon={IdCard}
              label="الرقم الوطني"
              value={user.nationalId}
            />
          )}
        </div>

        <Separator />

        {/* Sign Out */}
        <div className="p-2">
          <button
            disabled={isSigningOut}
            onClick={async () => {
              setIsSigningOut(true);
              await authClient.signOut();
              router.push("/auth/sign-in");
              router.refresh();
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{isSigningOut ? "جاري الخروج..." : "تسجيل الخروج"}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-accent transition-colors">
      <Icon className="w-4 h-4 text-gray-400 dark:text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 dark:text-muted-foreground">{label}</p>
        <p className="text-sm text-gray-700 dark:text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
