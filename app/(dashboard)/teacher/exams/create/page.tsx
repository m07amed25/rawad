import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, BookOpen } from "lucide-react";
import { getTeacherSubjects } from "@/app/actions/subjects";
import CreateExamForm from "./CreateExamForm";

export default async function CreateExamPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/student");
  }

  const subjects = await getTeacherSubjects();

  if (subjects.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
          <div className="mx-auto flex items-center justify-center size-14 rounded-xl bg-amber-100 text-amber-600">
            <AlertTriangle className="size-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            لا توجد مواد دراسية
          </h2>
          <p className="text-sm text-gray-600">
            يجب عليك إضافة المواد الدراسية أولاً قبل إنشاء امتحان. قم بإضافة
            المواد من صفحة الإعدادات.
          </p>
          <Link
            href="/teacher/settings/subjects"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <BookOpen className="size-4" />
            إضافة المواد الدراسية
          </Link>
        </div>
      </div>
    );
  }

  return <CreateExamForm subjects={subjects} />;
}
