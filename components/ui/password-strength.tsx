"use client";

import { useMemo } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";

interface PasswordStrengthProps {
  password: string;
}

interface Rule {
  label: string;
  test: (pw: string) => boolean;
}

const rules: Rule[] = [
  { label: "8 أحرف على الأقل", test: (pw) => pw.length >= 8 },
  { label: "حرف كبير (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "حرف صغير (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { label: "رقم (0-9)", test: (pw) => /[0-9]/.test(pw) },
  {
    label: "رمز خاص (!@#$...)",
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

function getStrength(password: string) {
  if (!password) return { score: 0, label: "", color: "" };
  const passed = rules.filter((r) => r.test(password)).length;
  if (passed <= 1) return { score: 1, label: "ضعيفة جداً", color: "red" };
  if (passed === 2) return { score: 2, label: "ضعيفة", color: "orange" };
  if (passed === 3) return { score: 3, label: "متوسطة", color: "yellow" };
  if (passed === 4) return { score: 4, label: "قوية", color: "emerald" };
  return { score: 5, label: "قوية جداً", color: "emerald" };
}

const barColors: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  emerald: "bg-emerald-500",
};

const textColors: Record<string, string> = {
  red: "text-red-500",
  orange: "text-orange-500",
  yellow: "text-yellow-600",
  emerald: "text-emerald-600",
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, color } = useMemo(
    () => getStrength(password),
    [password],
  );

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < score ? barColors[color] : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span
          className={`text-[11px] font-semibold font-cairo whitespace-nowrap transition-colors duration-300 ${textColors[color]}`}
        >
          {label}
        </span>
      </div>

      {/* Rules checklist */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {rules.map((rule) => {
          const passed = rule.test(password);
          return (
            <div
              key={rule.label}
              className={`flex items-center gap-1.5 transition-all duration-200 ${
                passed ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {passed ? (
                <IconCheck className="size-3 shrink-0" />
              ) : (
                <IconX className="size-3 shrink-0" />
              )}
              <span className="text-[11px] font-cairo leading-tight">
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Returns true if the password passes all strength rules */
export function isPasswordStrong(password: string): boolean {
  return rules.every((r) => r.test(password));
}
