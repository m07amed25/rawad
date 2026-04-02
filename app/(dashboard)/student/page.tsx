import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">مرحباً، {session.user.name}</h1>
      <p className="text-gray-600 mb-8">أهلاً بك في لوحة تحكم الطالب. يمكنك من هنا متابعة دراستك والوصول إلى كافة المواد.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50/50 hover:bg-blue-50 transition-colors border border-blue-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">المقررات</h3>
          <p className="text-blue-600">عرض المقررات المسجلة والجدول الزمني</p>
        </div>
        <div className="bg-green-50/50 hover:bg-green-50 transition-colors border border-green-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-green-800 mb-2">النتائج</h3>
          <p className="text-green-600">استعراض كشف الدرجات والتقييمات</p>
        </div>
        <div className="bg-purple-50/50 hover:bg-purple-50 transition-colors border border-purple-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-purple-800 mb-2">الإعلانات</h3>
          <p className="text-purple-600">أحدث الأخبار والإعلانات الجامعية</p>
        </div>
      </div>
    </div>
  );
}
