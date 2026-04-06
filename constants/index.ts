export const ACADEMIC_YEARS = [
  "الفرقة الأولى",
  "الفرقة الثانية",
  "الفرقة الثالثة",
  "الفرقة الرابعة",
] as const;

export type AcademicYear = (typeof ACADEMIC_YEARS)[number];

export const STUDENT_ACADEMIC_YEARS = [
  "الأولى",
  "الثانية",
  "الثالثة",
  "الرابعة",
] as const;

export type StudentAcademicYear = (typeof STUDENT_ACADEMIC_YEARS)[number];

export const ROLES = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const EXAM_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  ENDED: "ENDED",
} as const;

export type ExamStatus = (typeof EXAM_STATUS)[keyof typeof EXAM_STATUS];

export const RESULT_STATUS = {
  PASSED: "PASSED",
  FAILED: "FAILED",
  UNDER_GRADING: "UNDER_GRADING",
} as const;

export type ResultStatus = (typeof RESULT_STATUS)[keyof typeof RESULT_STATUS];

export const PASSING_THRESHOLD = 0.5;
