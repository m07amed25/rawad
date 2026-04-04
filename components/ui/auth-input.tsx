"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

interface AuthInputProps extends React.ComponentProps<"input"> {
  label: string;
  error?: boolean;
  errorMessage?: string;
  icon?: React.ReactNode;
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  (
    { className, label, error, errorMessage, icon, id, type, ...props },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = error || !!errorMessage;
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative space-y-1.5">
        <Label
          htmlFor={inputId}
          className="text-xs font-medium text-gray-600 font-cairo"
        >
          {label}
        </Label>
        <div className="relative">
          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          <Input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            suppressHydrationWarning
            className={cn(
              "h-10 rounded-xl border-gray-200 bg-gray-50/80 px-3.5 text-sm font-cairo placeholder:text-gray-400 focus-visible:bg-white focus-visible:border-blue-500 focus-visible:ring-blue-500/20 transition-all duration-200",
              icon && "pr-10",
              isPassword && "pl-10",
              hasError &&
                "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500/20",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <IconEyeOff className="size-4" />
              ) : (
                <IconEye className="size-4" />
              )}
            </button>
          )}
        </div>
        {errorMessage && (
          <p className="text-[11px] text-red-500 font-cairo mt-0.5">
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);
AuthInput.displayName = "AuthInput";

export { AuthInput };
