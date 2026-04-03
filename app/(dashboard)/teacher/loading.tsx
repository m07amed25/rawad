/**
 * ───────────────────────────────────────────────────────────────
 *  loading.tsx — Teacher Dashboard Skeleton
 *  يُعرض تلقائياً أثناء تحميل أي صفحة داخل /teacher/*
 *  يستخدم Tailwind animate-pulse لإظهار هيكل عظمي أنيق.
 * ───────────────────────────────────────────────────────────────
 */

export default function TeacherLoading() {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-300" dir="rtl">
      {/* ── Breadcrumb skeleton ─────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-4 rounded bg-gray-100 animate-pulse" />
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
      </div>

      {/* ── Page title skeleton ─────────────────────────────── */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-4 w-72 rounded bg-gray-100 animate-pulse" />
      </div>

      {/* ── Stats cards skeleton (3 cards) ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
            </div>
            <div className="h-7 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-32 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>

      {/* ── Table / main content skeleton ───────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-20 rounded bg-gray-100 animate-pulse ml-auto" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-b-0"
          >
            <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
            </div>
            <div className="h-6 w-16 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
