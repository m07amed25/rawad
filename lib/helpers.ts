import { PASSING_THRESHOLD } from "@/constants";
import type { ResultStatus } from "@prisma/client";

// ─── Grade Calculation ───────────────────────────────────────

/**
 * Returns "PASSED" if `totalScore / maxScore >= PASSING_THRESHOLD`, else "FAILED".
 * Returns "FAILED" if maxScore is 0 to avoid division-by-zero.
 */
export function calculateGrade(
  totalScore: number,
  maxScore: number,
): Extract<ResultStatus, "PASSED" | "FAILED"> {
  if (maxScore <= 0) return "FAILED";
  return totalScore / maxScore >= PASSING_THRESHOLD ? "PASSED" : "FAILED";
}

// ─── Arabic Date Formatting ──────────────────────────────────

/**
 * Formats a Date to an Arabic locale date string (e.g. "٢٠٢٦/٤/٣").
 * Uses "ar-SA" locale with Gregorian calendar for consistent RTL output.
 */
export function formatArabicDate(date: Date): string {
  return date.toLocaleDateString("ar-SA", {
    calendar: "gregory",
  });
}

/**
 * Formats a Date to an Arabic locale time string (e.g. "٠٣:٣٠ م").
 */
export function formatArabicTime(
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return date.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}

/**
 * Formats a Date to both date and time combined in Arabic.
 */
export function formatArabicDateTime(date: Date): string {
  return `${formatArabicDate(date)} ${formatArabicTime(date)}`;
}

// ─── Time Parsing ────────────────────────────────────────────

/**
 * Converts a duration in seconds to an Arabic string.
 * e.g. 125 → "٢ دقيقة ٥ ثانية", 60 → "١ دقيقة", 45 → "٤٥ ثانية"
 */
export function parseTimeTaken(seconds: number): string {
  if (seconds < 0) seconds = 0;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];

  if (minutes > 0) {
    parts.push(`${minutes} دقيقة`);
  }

  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds} ثانية`);
  }

  return parts.join(" و ");
}

// ─── Percentage ──────────────────────────────────────────────

/**
 * Calculates and rounds a percentage. Returns 0 if maxScore is 0.
 */
export function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
}
