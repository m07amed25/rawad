import { z } from "zod";
import { QuestionType, DisabilityType } from "@prisma/client";
import { ACADEMIC_YEARS, STUDENT_ACADEMIC_YEARS } from "@/constants";

// ═══════════════════════════════════════════════════════════════
//  Subject Schemas
// ═══════════════════════════════════════════════════════════════

/** Single subject row (used in both client form & server action) */
export const subjectItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "اسم المادة مطلوب").max(200),
  academicYear: z.enum(ACADEMIC_YEARS, {
    message: "السنة الدراسية غير صالحة",
  }),
});

/** Array wrapper for the update-subjects server action */
export const updateSubjectsSchema = z
  .array(subjectItemSchema)
  .min(1, "يجب إضافة مادة واحدة على الأقل");

/** Client-side form schema wrapping subjects in a form object */
export const subjectsFormSchema = z.object({
  subjects: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "اسم المادة مطلوب"),
        academicYear: z.enum(ACADEMIC_YEARS, {
          message: "اختر السنة الدراسية",
        }),
      }),
    )
    .min(1, "يجب إضافة مادة واحدة على الأقل"),
});

export type SubjectInput = z.infer<typeof subjectItemSchema>;
export type SubjectsFormValues = z.infer<typeof subjectsFormSchema>;

// ═══════════════════════════════════════════════════════════════
//  Exam Schemas — Server Action
// ═══════════════════════════════════════════════════════════════

/** Option within a question (server-side — includes isCorrect) */
const serverOptionSchema = z.object({
  text: z.string().trim().min(1, "نص الخيار مطلوب").max(1000),
  isCorrect: z.boolean(),
});

/** Question (server-side — uses QuestionType enum) */
const serverQuestionSchema = z
  .object({
    text: z.string().trim().min(1, "نص السؤال مطلوب").max(5000),
    type: z.nativeEnum(QuestionType),
    score: z.number().positive("الدرجة يجب أن تكون أكبر من صفر"),
    options: z.array(serverOptionSchema).default([]),
  })
  .refine(
    (q) => {
      if (q.type === "MCQ") {
        if (q.options.length < 2) return false;
        const correctCount = q.options.filter((o) => o.isCorrect).length;
        return correctCount === 1;
      }
      return true;
    },
    {
      message:
        "سؤال الاختيار من متعدد يجب أن يحتوي على خيارين على الأقل وإجابة صحيحة واحدة فقط",
    },
  );

/** Full exam payload validated by the createFullExam server action */
export const createExamServerSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "عنوان الامتحان يجب أن يكون 3 أحرف على الأقل")
    .max(200),
  subject: z.string().trim().max(200).optional().default(""),
  subjectId: z.string().uuid("يجب اختيار المادة الدراسية"),
  duration: z
    .number()
    .int()
    .min(1, "المدة يجب أن تكون دقيقة واحدة على الأقل")
    .max(600, "المدة لا يمكن أن تتجاوز 600 دقيقة"),
  date: z.coerce.date({ message: "تاريخ الامتحان غير صالح" }),
  endDate: z.coerce
    .date({ message: "وقت انتهاء الامتحان غير صالح" })
    .optional()
    .nullable(),
  questions: z
    .array(serverQuestionSchema)
    .min(1, "الامتحان يجب أن يحتوي على سؤال واحد على الأقل")
    .max(200, "الامتحان لا يمكن أن يحتوي على أكثر من 200 سؤال"),
});

export type CreateExamServerInput = z.infer<typeof createExamServerSchema>;

// ═══════════════════════════════════════════════════════════════
//  Exam Schemas — Client Form
// ═══════════════════════════════════════════════════════════════

/** Option for client-side form (no isCorrect — handled via correctOption index) */
const clientOptionSchema = z.object({
  text: z.string().min(1, "نص الخيار مطلوب"),
});

/** Question for client-side form (includes correctOption index) */
const clientQuestionSchema = z
  .object({
    text: z.string().min(1, "نص السؤال مطلوب"),
    type: z.enum(["MCQ", "ESSAY"]),
    score: z.coerce.number().min(1, "الدرجة يجب أن تكون 1 على الأقل"),
    options: z
      .array(clientOptionSchema)
      .default([{ text: "" }, { text: "" }, { text: "" }, { text: "" }]),
    correctOption: z.coerce.number().default(0),
  })
  .superRefine((q, ctx) => {
    if (q.type === "MCQ") {
      if (q.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "يجب إضافة خيارين على الأقل",
          path: ["options"],
        });
      }
      q.options.forEach((opt, i) => {
        if (!opt.text.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "نص الخيار مطلوب",
            path: ["options", i, "text"],
          });
        }
      });
      if (q.correctOption < 0 || q.correctOption >= q.options.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "يجب تحديد الإجابة الصحيحة",
          path: ["correctOption"],
        });
      }
    }
  });

/** Full client-side exam creation form schema */
export const examFormSchema = z.object({
  title: z.string().min(3, "اسم الامتحان يجب أن يكون 3 أحرف على الأقل"),
  subject: z.string().min(1, "يجب اختيار المادة"), // stores subjectId (UUID)
  date: z.string().min(1, "تاريخ الامتحان مطلوب"),
  startTime: z.string().min(1, "وقت بداية الامتحان مطلوب"),
  endTime: z.string().min(1, "وقت نهاية الامتحان مطلوب"),
  duration: z.coerce
    .number()
    .min(1, "مدة الامتحان يجب أن تكون دقيقة واحدة على الأقل"),
  isPublished: z.boolean().default(false),
  selectionMode: z.enum(["all", "year", "manual"]).default("all"),
  selectedYear: z.string().optional(),
  studentIds: z.array(z.string()).min(1, "يجب اختيار طالب واحد على الأقل"),
  questions: z
    .array(clientQuestionSchema)
    .min(1, "يجب إضافة سؤال واحد على الأقل"),
});

export type ExamFormValues = z.infer<typeof examFormSchema>;

// ═══════════════════════════════════════════════════════════════
//  Grading / Submission Schemas
// ═══════════════════════════════════════════════════════════════

export const studentAnswerSchema = z.object({
  questionId: z.string().uuid("معرف السؤال غير صالح"),
  selectedOptionId: z
    .string()
    .uuid("معرف الخيار غير صالح")
    .optional()
    .nullable(),
  textAnswer: z.string().max(10000).optional().nullable(),
});

export const submitExamSchema = z.object({
  examId: z.string().uuid("معرف الامتحان غير صالح"),
  answers: z
    .array(studentAnswerSchema)
    .min(1, "يجب الإجابة على سؤال واحد على الأقل"),
  timeTaken: z
    .number()
    .int()
    .min(0, "الوقت المستغرق غير صالح")
    .max(86400, "الوقت المستغرق غير صالح"),
  violationsCount: z
    .number()
    .int()
    .min(0, "عدد المخالفات غير صالح")
    .max(9999)
    .default(0),
});

export type SubmitExamInput = z.infer<typeof submitExamSchema>;

// ═══════════════════════════════════════════════════════════════
//  Profile Schemas
// ═══════════════════════════════════════════════════════════════

export const studentProfileSchema = z.object({
  university: z
    .string()
    .trim()
    .min(2, "يرجى إدخال اسم الجامعة")
    .max(150, "اسم الجامعة طويل جداً"),
  department: z
    .string()
    .trim()
    .min(2, "يرجى إدخال اسم القسم")
    .max(150, "اسم القسم طويل جداً"),
  academicYear: z.enum(STUDENT_ACADEMIC_YEARS, {
    message: "يرجى اختيار الفرقة الدراسية",
  }),
  disabilityType: z.nativeEnum(DisabilityType, {
    message: "نوع الإعاقة غير صالح",
  }),
});

export const teacherProfileSchema = z.object({
  university: z
    .string()
    .trim()
    .min(2, "يرجى إدخال اسم الجامعة")
    .max(150, "اسم الجامعة طويل جداً"),
  department: z
    .string()
    .trim()
    .min(2, "يرجى إدخال اسم القسم")
    .max(150, "اسم القسم طويل جداً"),
});

export const completeAcademicProfileSchema = z.object({
  universityName: z
    .string()
    .trim()
    .min(2, "يرجى إدخال اسم الجامعة")
    .max(150, "اسم الجامعة طويل جداً"),
  college: z
    .string()
    .trim()
    .min(2, "يرجى إدخال اسم الكلية")
    .max(100, "اسم الكلية طويل جداً"),
  department: z
    .string()
    .trim()
    .max(100, "اسم القسم طويل جداً")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  academicYear: z.enum(STUDENT_ACADEMIC_YEARS, {
    message: "يرجى اختيار الفرقة الدراسية",
  }),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
export type TeacherProfileInput = z.infer<typeof teacherProfileSchema>;
export type CompleteAcademicProfileInput = z.infer<
  typeof completeAcademicProfileSchema
>;
