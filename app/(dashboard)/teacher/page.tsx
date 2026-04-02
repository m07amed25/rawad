import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TeacherDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">مرحباً، د. {session.user.name}</h1>
      <p className="text-gray-600 mb-8">أهلاً بك في لوحة تحكم المعلم. يمكنك هنا إدارة الكورسات والطلاب.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50/50 hover:bg-blue-50 transition-colors border border-blue-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">إدارة المقررات</h3>
          <p className="text-blue-600">إضافة أو تعديل المقررات الدراسية</p>
        </div>
        <div className="bg-orange-50/50 hover:bg-orange-50 transition-colors border border-orange-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-orange-800 mb-2">نتائج الطلاب</h3>
          <p className="text-orange-600">رصد الدرجات ومتابعة أداء الطلاب</p>
        </div>
        <div className="bg-teal-50/50 hover:bg-teal-50 transition-colors border border-teal-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-teal-800 mb-2">الرسائل</h3>
          <p className="text-teal-600">التواصل مع الطلاب والإدارة</p>
        </div>
      </div>
    </div>
  );
}
