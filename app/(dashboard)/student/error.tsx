"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the error for monitoring (replace with your error reporting service)
  useEffect(() => {
    console.error("[Student Error Boundary]", error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center"
      dir="rtl"
    >
      {/* ── Icon ────────────────────────────────────────────── */}
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
        <AlertTriangle className="w-10 h-10 text-red-500" strokeWidth={1.5} />
      </div>

      {/* ── Message ─────────────────────────────────────────── */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        عذراً، حدث خطأ غير متوقع
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى، وإذا استمرت المشكلة تواصل مع
        الدعم الفني.
      </p>

      {/* ── Error digest (dev only) ─────────────────────────── */}
      {error.digest && (
        <p className="text-xs text-gray-400 mb-4 font-mono" dir="ltr">
          Error ID: {error.digest}
        </p>
      )}

      {/* ── Retry button ────────────────────────────────────── */}
      <Button onClick={reset} variant="outline" className="gap-2">
        <RotateCcw className="size-4" />
        حاول مرة أخرى
      </Button>
    </div>
  );
}
