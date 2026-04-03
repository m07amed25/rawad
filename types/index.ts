import type { Prisma } from "@prisma/client";

// ─── Exam with full nested relations ─────────────────────────
// Used when displaying an exam with all its questions and options

export type ExamWithQuestions = Prisma.ExamGetPayload<{
  include: {
    questions: {
      include: {
        options: true;
      };
    };
    subjectRef: true;
  };
}>;

// ─── Exam card (student dashboard listing) ───────────────────
// Lightweight select for rendering exam cards on the student dashboard.

export type ExamCardPayload = Prisma.ExamGetPayload<{
  select: {
    id: true;
    title: true;
    subject: true;
    duration: true;
    date: true;
    endDate: true;
    subjectRef: {
      select: {
        id: true;
        name: true;
        academicYear: true;
      };
    };
    questions: {
      select: { id: true };
    };
  };
}>;

// ─── Student result with exam + answers ──────────────────────
// Used in teacher grading views and student result detail pages.

export type StudentResultDetails = Prisma.ResultGetPayload<{
  include: {
    student: {
      select: {
        id: true;
        name: true;
        email: true;
        studentCode: true;
        academicYear: true;
      };
    };
    exam: {
      select: {
        id: true;
        title: true;
        subject: true;
      };
    };
  };
}>;

// ─── Result with answers for detailed grading ────────────────

export type ResultWithAnswers = Prisma.ResultGetPayload<{
  include: {
    student: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    exam: {
      include: {
        questions: {
          include: {
            options: true;
            studentAnswers: true;
          };
        };
      };
    };
  };
}>;

// ─── Subject option (for dropdowns / selects) ────────────────

export type SubjectOption = {
  id: string;
  name: string;
  academicYear: string;
};

// ─── Previous result row (student dashboard table) ───────────

export type PreviousResultRow = Prisma.ResultGetPayload<{
  select: {
    id: true;
    score: true;
    maxScore: true;
    status: true;
    createdAt: true;
    exam: {
      select: {
        title: true;
        subject: true;
        date: true;
      };
    };
  };
}>;
