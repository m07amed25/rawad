"use client";
import React from "react";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const [isSignout, setSignout] = React.useState(false);
  
  return (
    <button 
      disabled={isSignout}
      onClick={async () => {
         setSignout(true);
         await authClient.signOut();
         router.push("/auth/sign-in");
         router.refresh();
      }}
      className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium border border-transparent hover:border-red-100"
    >
      <LogOut className="w-5 h-5" />
      <span>{isSignout ? "جاري الخروج..." : "تسجيل الخروج"}</span>
    </button>
  );
}
