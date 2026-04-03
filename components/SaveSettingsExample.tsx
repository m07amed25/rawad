"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

// ── Example: how to call any server action and show a toast ──

interface SaveSettingsExampleProps {
  /** The server action to call — must return { success: boolean; message: string } */
  action: () => Promise<{ success: boolean; message: string }>;
}

export function SaveSettingsExample({ action }: SaveSettingsExampleProps) {
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await action();

        if (result.success) {
          // ✅ Success toast
          toast.success(result.message);
        } else {
          // ❌ Business-logic error toast
          toast.error(result.message);
        }
      } catch {
        // 🔥 Unexpected error toast
        toast.error("حدث خطأ غير متوقع. حاول مرة أخرى.");
      }
    });
  };

  return (
    <Button onClick={handleSave} disabled={isPending} className="gap-2">
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Save className="size-4" />
      )}
      {isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
    </Button>
  );
}
