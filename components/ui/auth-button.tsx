"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AuthButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
}

function AuthButton({
  children,
  loading,
  disabled,
  className,
  ...props
}: AuthButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      suppressHydrationWarning
      className={cn(
        "relative w-full h-11 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold font-cairo text-base border-0 shadow-lg shadow-blue-500/25 transition-all duration-300",
        "hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 hover:-translate-y-px",
        "active:translate-y-0 active:shadow-blue-500/20",
        "disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-blue-500/25",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin size-5" /> : children}
    </Button>
  );
}

export { AuthButton };
