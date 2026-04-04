export default function StudentLoading() {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-300" dir="rtl">
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded bg-gray-200 dark:bg-muted animate-pulse" />
        <div className="h-4 w-4 rounded bg-gray-100 dark:bg-muted/60 animate-pulse" />
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-muted animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded bg-gray-100 dark:bg-muted/60 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-muted animate-pulse" />
              <div className="h-4 w-16 rounded bg-gray-100 dark:bg-muted/60 animate-pulse" />
            </div>
            <div className="h-7 w-20 rounded bg-gray-200 dark:bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-gray-100 dark:bg-muted/60 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-36 rounded bg-gray-200 dark:bg-muted animate-pulse" />
                <div className="h-3 w-20 rounded bg-gray-100 dark:bg-muted/60 animate-pulse" />
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-muted/60 animate-pulse" />
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 rounded bg-gray-100 dark:bg-muted/60 animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-gray-100 dark:bg-muted/60 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
