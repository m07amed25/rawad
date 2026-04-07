"use client";

import {
  useReducer,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useTransition,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Flag,
  ChevronRight,
  ChevronLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  Maximize,
  Eye,
  ShieldAlert,
  CircleDot,
  PenLine,
  Save,
  Loader2,
  PanelRightOpen,
  PanelRightClose,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  Contrast,
  Hand,
  Play,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitExam } from "@/app/actions/grading";
import { reportCheatViolation } from "@/app/actions/proctoring";
import { startExamAttempt } from "@/app/actions/exams";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Disability type (matches Prisma DisabilityType enum) ─────────────────────

export type DisabilityType =
  | "NONE"
  | "HEARING"
  | "MOTOR"
  | "VISUAL"
  | "LEARNING"
  | "MULTIPLE";

// ─── Types (shared with Server Component) ────────────────────────────────────

type SanitizedOption = {
  id: string;
  text: string;
};

type MCQQuestion = {
  id: string;
  type: "MCQ";
  text: string;
  options: SanitizedOption[];
  points: number;
  signLanguageUrl?: string | null;
};

type EssayQuestion = {
  id: string;
  type: "ESSAY";
  text: string;
  maxChars?: number;
  points: number;
  signLanguageUrl?: string | null;
};

type Question = MCQQuestion | EssayQuestion;

export type SanitizedExamData = {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  durationMinutes: number;
  totalPoints: number;
  questions: Question[];
};

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

type ExamState = {
  currentIndex: number;
  answers: Record<string, string>;
  flagged: Set<string>;
  submitted: boolean;
  autoSaveStatus: AutoSaveStatus;
  tabSwitchCount: number;
  timeLeftSeconds: number;
};

type ExamAction =
  | { type: "SET_ANSWER"; questionId: string; value: string }
  | { type: "TOGGLE_FLAG"; questionId: string }
  | { type: "GO_TO_QUESTION"; index: number }
  | { type: "SUBMIT" }
  | { type: "SET_AUTO_SAVE_STATUS"; status: AutoSaveStatus }
  | { type: "INCREMENT_TAB_SWITCH" }
  | { type: "TICK_TIMER" }
  | { type: "RESTORE_STATE"; payload: SerializableExamState };

// Serializable shape for sessionStorage persistence
type SerializableExamState = {
  answers: Record<string, string>;
  flagged: string[];
  currentIndex: number;
  timeLeftSeconds: number;
  tabSwitchCount: number;
};

const STORAGE_KEY_PREFIX = "exam_state_";
const AUTO_SAVE_DEBOUNCE_MS = 1500;
const OPTION_LETTERS = ["أ", "ب", "ج", "د", "هـ", "و"];

function examReducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
        autoSaveStatus: "saving",
      };
    case "TOGGLE_FLAG": {
      const next = new Set(state.flagged);
      if (next.has(action.questionId)) next.delete(action.questionId);
      else next.add(action.questionId);
      return { ...state, flagged: next };
    }
    case "GO_TO_QUESTION":
      return { ...state, currentIndex: action.index };
    case "SUBMIT":
      return { ...state, submitted: true };
    case "SET_AUTO_SAVE_STATUS":
      return { ...state, autoSaveStatus: action.status };
    case "INCREMENT_TAB_SWITCH":
      return { ...state, tabSwitchCount: state.tabSwitchCount + 1 };
    case "TICK_TIMER":
      return {
        ...state,
        timeLeftSeconds: Math.max(0, state.timeLeftSeconds - 1),
      };
    case "RESTORE_STATE":
      return {
        ...state,
        answers: action.payload.answers,
        flagged: new Set(action.payload.flagged),
        currentIndex: action.payload.currentIndex,
        timeLeftSeconds: action.payload.timeLeftSeconds,
        tabSwitchCount: action.payload.tabSwitchCount,
      };
    default:
      return state;
  }
}

/**
 * useExamTimer — Dispatches TICK_TIMER every second. Calls onExpire on expiry.
 */
function useExamTimer(
  dispatch: React.Dispatch<ExamAction>,
  timeLeftSeconds: number,
  submitted: boolean,
  onExpire: () => void,
) {
  const hasExpired = timeLeftSeconds <= 0;
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (submitted || hasExpired) return;
    const id = setInterval(() => dispatch({ type: "TICK_TIMER" }), 1000);
    return () => clearInterval(id);
  }, [submitted, hasExpired, dispatch]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (hasExpired && !submitted) {
      toast.error("انتهى وقت الامتحان", {
        description: "تم تسليم الامتحان تلقائياً.",
      });
      onExpireRef.current();
    }
  }, [hasExpired, submitted]);

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isLow = timeLeftSeconds <= 300 && timeLeftSeconds > 60;
  const isCritical = timeLeftSeconds <= 60;

  return { formatted, isLow, isCritical };
}

/**
 * useAutoSave — Debounced sessionStorage sync. Restores state on mount.
 */
function useAutoSave(
  examId: string,
  state: ExamState,
  dispatch: React.Dispatch<ExamAction>,
) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const storageKey = STORAGE_KEY_PREFIX + examId;

  // Restore from sessionStorage once on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const parsed: SerializableExamState = JSON.parse(raw);
      if (parsed && typeof parsed.answers === "object") {
        dispatch({ type: "RESTORE_STATE", payload: parsed });
        toast.info("تم استعادة إجاباتك السابقة", {
          description: "تم حفظ تقدمك تلقائياً من جلستك السابقة.",
        });
      }
    } catch {
      // Corrupted — start fresh
    }
  }, [storageKey, dispatch]);

  // Persist on every meaningful state change (debounced)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (state.submitted) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const data: SerializableExamState = {
          answers: state.answers,
          flagged: Array.from(state.flagged),
          currentIndex: state.currentIndex,
          timeLeftSeconds: state.timeLeftSeconds,
          tabSwitchCount: state.tabSwitchCount,
        };
        sessionStorage.setItem(storageKey, JSON.stringify(data));
        dispatch({ type: "SET_AUTO_SAVE_STATUS", status: "saved" });
      } catch {
        dispatch({ type: "SET_AUTO_SAVE_STATUS", status: "error" });
      }
    }, AUTO_SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    state.answers,
    state.flagged,
    state.currentIndex,
    state.timeLeftSeconds,
    state.tabSwitchCount,
    state.submitted,
    storageKey,
    dispatch,
  ]);

  // Wipe storage once submitted
  useEffect(() => {
    if (state.submitted) sessionStorage.removeItem(storageKey);
  }, [state.submitted, storageKey]);
}

/**
 * useProctoring — Full browser lockdown with debounced server-side violation reporting.
 * Monitors: visibility change (tab switch), fullscreen exit, context menu, copy/paste, keyboard shortcuts.
 * Reports violations to the server action which logs to DB and emails the teacher.
 */
const VIOLATION_DEBOUNCE_MS = 5000; // 5s debounce per violation type

function useProctoring(
  dispatch: React.Dispatch<ExamAction>,
  examId: string,
  enabled: boolean,
  setFullscreenOverlay: (show: boolean) => void,
  isSubmittingRef?: React.MutableRefObject<boolean>,
) {
  const lastReportedRef = useRef<Record<string, number>>({});

  const reportViolation = useCallback(
    (violationType: "TAB_SWITCH" | "EXITED_FULLSCREEN") => {
      const now = Date.now();
      const lastTime = lastReportedRef.current[violationType] ?? 0;

      // Debounce: skip if same violation type was reported within the window
      if (now - lastTime < VIOLATION_DEBOUNCE_MS) return;
      lastReportedRef.current[violationType] = now;

      dispatch({ type: "INCREMENT_TAB_SWITCH" });

      // Fire-and-forget server call — don't block UI
      reportCheatViolation({ examId, violationType }).catch(() => {
        // Silently ignore network errors — violation is still tracked locally
      });
    },
    [examId, dispatch],
  );

  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.hidden) {
        reportViolation("TAB_SWITCH");
        toast.error(
          "تحذير: تم اكتشاف خروج من صفحة الامتحان. تم تسجيل المخالفة وإبلاغ المحاضر.",
          { duration: 6000 },
        );
      }
    };

    const handleFullscreenChange = () => {
      // If we are intentionally submitting, skip violation
      if (isSubmittingRef?.current) {
        // Do not log violation, do not show overlay
        return;
      }
      if (!document.fullscreenElement) {
        reportViolation("EXITED_FULLSCREEN");
        setFullscreenOverlay(true);
        toast.error("تحذير: تم الخروج من وضع ملء الشاشة. تم تسجيل المخالفة.", {
          duration: 6000,
        });
      } else {
        setFullscreenOverlay(false);
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handlePaste = (e: ClipboardEvent) => e.preventDefault();
    const handleCut = (e: ClipboardEvent) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl/Cmd + C/V/X/A/U/S/P
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "x", "a", "u", "s", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
      if (e.key === "F12") e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, reportViolation, setFullscreenOverlay, isSubmittingRef]);
}

function useBeforeUnload(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled]);
}

function useTeacherSync(
  examId: string,
  enabled: boolean,
  onMessage: (msg: { content: string; sender: string }) => void,
  onForceEnd: () => void,
) {
  const lastCheckRef = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      try {
        const since = lastCheckRef.current;
        const url = since
          ? `/api/exams/${examId}/student-poll?since=${encodeURIComponent(since)}`
          : `/api/exams/${examId}/student-poll`;

        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        if (data.isForceEnded) {
          onForceEnd();
          return;
        }

        if (data.messages && data.messages.length > 0) {
          data.messages.forEach(
            (msg: { timestamp: string; content: string; sender: string }) => {
              onMessage(msg);
            },
          );
          // Update the timestamp to the newest message's time
          const newest = data.messages[data.messages.length - 1].timestamp;
          lastCheckRef.current = newest;
        }
      } catch {
        // Silently fail, retry on next poll
      }
    };

    // Initial check + interval
    const timeoutId = setTimeout(poll, 2000); // Initial check after 2s
    const intervalId = setInterval(poll, 5000); // Poll every 5s

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [examId, enabled, onMessage, onForceEnd]);
}

/**
 * Speaks the given text aloud using the browser's native SpeechSynthesis API.
 * Configured for Arabic (ar-SA). Cancels any ongoing speech before starting.
 */
function speakText(text: string) {
  // Guard: SpeechSynthesis may not be available in all browsers
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const synth = window.speechSynthesis;

  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-SA"; // Arabic (Saudi Arabia)
  utterance.rate = 0.9;
  utterance.pitch = 1;

  // Try to pick an Arabic voice if available
  const voices = synth.getVoices();
  const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
  if (arabicVoice) utterance.voice = arabicVoice;

  // speak() must be called synchronously within the user gesture —
  // wrapping in setTimeout breaks the gesture chain and Chrome blocks it.
  synth.speak(utterance);

  // Chrome workaround: after cancel(), the queue can get stuck in a paused
  // state. Calling resume() nudges it to actually start the new utterance.
  synth.resume();
}

/**
 * Stops any ongoing speech synthesis.
 */
function stopSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* blocked by browser */
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }, []);

  return { isFullscreen, enterFullscreen, exitFullscreen };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AutoSaveIndicator({ status }: { status: AutoSaveStatus }) {
  if (status === "idle") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium transition-opacity duration-300",
        status === "saving" && "text-gray-400",
        status === "saved" && "text-emerald-600",
        status === "error" && "text-red-500",
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 className="size-3 animate-spin" />
          <span className="hidden sm:inline">جارٍ الحفظ...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Save className="size-3" />
          <span className="hidden sm:inline">تم الحفظ</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertTriangle className="size-3" />
          <span className="hidden sm:inline">خطأ</span>
        </>
      )}
    </span>
  );
}

// ─── MCQ ─────────────────────────────────────────────────────────────────────

function MCQAnswer({
  question,
  value,
  onChange,
  isVisual = false,
}: {
  question: MCQQuestion;
  value: string;
  onChange: (v: string) => void;
  isVisual?: boolean;
}) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="gap-3">
      {question.options.map((option, i) => {
        const isSelected = value === option.id;
        const optionLabel = OPTION_LETTERS[i] ?? String.fromCharCode(65 + i);
        return (
          // Wrap in a div so the audio button is OUTSIDE the <label>.
          // A <button> inside a <label> cannot stop the label from
          // activating its associated input, even with stopPropagation.
          <div key={option.id} className="flex items-center gap-2">
            <label
              className={cn(
                "group flex flex-1 items-center gap-4 rounded-xl border-2 p-4 md:p-5 cursor-pointer transition-all duration-200",
                isSelected
                  ? "border-blue-500 bg-blue-50/80 shadow-sm shadow-blue-100"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50",
              )}
            >
              <span
                className={cn(
                  "size-11 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200",
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500",
                )}
              >
                {optionLabel}
              </span>

              <RadioGroupItem value={option.id} className="sr-only" />

              <span
                className={cn(
                  "text-base md:text-lg font-medium leading-relaxed flex-1",
                  isSelected ? "text-blue-900" : "text-gray-700",
                )}
              >
                {option.text}
              </span>

              {isSelected && (
                <CheckCircle2 className="size-5 text-blue-600 shrink-0" />
              )}
            </label>

            {/* Per-option audio button — VISUAL disability only */}
            {isVisual && (
              <button
                type="button"
                onClick={() =>
                  speakText(`الخيار ${optionLabel}: ${option.text}`)
                }
                className={cn(
                  "size-10 shrink-0 rounded-xl border flex items-center justify-center transition-all duration-200",
                  "border-purple-200 bg-purple-50 text-purple-600",
                  "hover:bg-purple-100 hover:border-purple-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
                )}
                aria-label={`قراءة الإجابة ${optionLabel}: ${option.text}`}
                title={`قراءة الإجابة (${i + 1})`}
              >
                <Play className="size-4 fill-purple-400" />
              </button>
            )}
          </div>
        );
      })}
    </RadioGroup>
  );
}

// ─── Essay ───────────────────────────────────────────────────────────────────

function EssayAnswer({
  question,
  value,
  onChange,
  isVisual = false,
}: {
  question: EssayQuestion;
  value: string;
  onChange: (v: string) => void;
  isVisual?: boolean;
}) {
  const maxChars = question.maxChars ?? 1000;
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isNearLimit = charCount > maxChars * 0.9;
  const isAtLimit = charCount >= maxChars;

  return (
    <div className="space-y-2">
      {/* Read-back button for VISUAL users */}
      {isVisual && (
        <div aria-live="polite" className="flex justify-end mb-1">
          <button
            type="button"
            onClick={() =>
              value.trim() ? speakText(value) : speakText("لم تكتب إجابة بعد.")
            }
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200",
              "border-purple-200 bg-purple-50 text-purple-700",
              "hover:bg-purple-100 hover:border-purple-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
            )}
            aria-label="قراءة إجابتك المكتوبة صوتياً"
            title="قراءة إجابتك (A)"
          >
            <Volume2 className="size-3.5 shrink-0" />
            قراءة إجابتك
          </button>
        </div>
      )}
      <Textarea
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxChars) onChange(e.target.value);
        }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        placeholder="اكتب إجابتك هنا..."
        className={cn(
          "min-h-52 text-lg leading-loose resize-y rounded-xl border-2 p-5 transition-all duration-200 focus:shadow-sm",
          isAtLimit
            ? "border-red-300 focus-visible:ring-red-200"
            : "border-gray-100 focus:border-blue-300",
        )}
        dir="rtl"
      />
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "text-sm tabular-nums font-medium",
              isAtLimit
                ? "text-red-500"
                : isNearLimit
                  ? "text-amber-500"
                  : "text-gray-400",
            )}
          >
            {charCount.toLocaleString("ar-SA")} /{" "}
            {maxChars.toLocaleString("ar-SA")} حرف
          </span>
          <span className="text-sm text-gray-300">|</span>
          <span className="text-sm text-gray-400 tabular-nums">
            {wordCount.toLocaleString("ar-SA")} كلمة
          </span>
        </div>
        {isAtLimit && (
          <span className="text-sm text-red-500 flex items-center gap-1">
            <AlertTriangle className="size-3.5" />
            الحد الأقصى
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Question Grid Item ──────────────────────────────────────────────────────

function QuestionGridItem({
  index,
  isAnswered,
  isFlagged,
  isCurrent,
  questionType,
  onClick,
}: {
  index: number;
  isAnswered: boolean;
  isFlagged: boolean;
  isCurrent: boolean;
  questionType: "MCQ" | "ESSAY";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative size-11 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center",
        isCurrent
          ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
          : isAnswered
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-500",
      )}
    >
      {index + 1}
      {isFlagged && (
        <span className="absolute -top-1 -left-1 size-3 rounded-full bg-amber-400 border-2 border-white" />
      )}
      {questionType === "ESSAY" && !isCurrent && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-violet-400" />
      )}
    </button>
  );
}

// ─── Review Summary (inside AlertDialog) ─────────────────────────────────────

function ReviewSummary({
  questions,
  answers,
  flagged,
}: {
  questions: Question[];
  answers: Record<string, string>;
  flagged: Set<string>;
}) {
  const answered = Object.keys(answers).length;
  const unanswered = questions.length - answered;

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700 tabular-nums">
            {answered}
          </p>
          <p className="text-sm text-emerald-600 mt-0.5">مُجاب</p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
          <p className="text-2xl font-bold text-gray-500 tabular-nums">
            {unanswered}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">بدون إجابة</p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
          <p className="text-2xl font-bold text-amber-600 tabular-nums">
            {flagged.size}
          </p>
          <p className="text-sm text-amber-600 mt-0.5">مُعلّم للمراجعة</p>
        </div>
      </div>

      {/* Per-question status list */}
      <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        {questions.map((q, i) => {
          const isAns = q.id in answers;
          const isFlag = flagged.has(q.id);
          return (
            <div
              key={q.id}
              className="flex items-center gap-3 px-4 py-2.5 text-sm"
            >
              <span className="text-gray-400 tabular-nums w-6 text-center font-medium">
                {i + 1}
              </span>
              <span className="flex-1 text-gray-600 truncate text-sm">
                {q.text.slice(0, 50)}…
              </span>
              <div className="flex items-center gap-2">
                {isFlag && (
                  <Flag className="size-3 text-amber-400 fill-amber-200" />
                )}
                {isAns ? (
                  <Badge
                    variant="default"
                    className="bg-emerald-100 text-emerald-700 border-0 text-xs"
                  >
                    مُجاب
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-400 text-xs">
                    فارغ
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {unanswered > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-100 p-3.5">
          <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 leading-relaxed">
            يوجد <strong>{unanswered}</strong> سؤال بدون إجابة. يمكنك العودة
            لإكمال الإجابة أو تسليم الامتحان الآن.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Accessibility Toolbar ───────────────────────────────────────────────────

/**
 * Extracts a YouTube video ID from common YouTube URL patterns.
 * Returns null if not a YouTube URL.
 */
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1);
    }
  } catch {
    // not a valid URL
  }
  return null;
}

/**
 * Per-question accessibility toolbar – always visible for all students.
 * Provides: Zoom In/Out, TTS audio, High Contrast, and Sign Language video.
 */
function AccessibilityToolbar({
  questionText,
  optionsText,
  signLanguageUrl,
  fontSizeMultiplier,
  setFontSizeMultiplier,
  highContrastMode,
  setHighContrastMode,
}: {
  questionText: string;
  optionsText: string;
  signLanguageUrl?: string | null;
  fontSizeMultiplier: number;
  setFontSizeMultiplier: React.Dispatch<React.SetStateAction<number>>;
  highContrastMode: boolean;
  setHighContrastMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [signLangOpen, setSignLangOpen] = useState(false);

  // Track speech synthesis state
  useEffect(() => {
    const checkSpeaking = () =>
      setIsSpeaking(window.speechSynthesis?.speaking ?? false);
    const interval = setInterval(checkSpeaking, 200);
    return () => clearInterval(interval);
  }, []);

  // Zoom In handler — max 1.5x
  const handleZoomIn = () =>
    setFontSizeMultiplier((prev) => Math.min(prev + 0.1, 1.5));
  // Zoom Out handler — min 0.8x
  const handleZoomOut = () =>
    setFontSizeMultiplier((prev) => Math.max(prev - 0.1, 0.8));

  // Read the question + its options aloud
  const handlePlayAudio = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const fullText = optionsText
        ? `${questionText}. الخيارات: ${optionsText}`
        : questionText;
      speakText(fullText);
      setIsSpeaking(true);
    }
  };

  // Toggle high contrast
  const handleHighContrast = () => setHighContrastMode((prev) => !prev);

  // Shared button styles
  const btnBase =
    "size-9 rounded-xl flex items-center justify-center transition-all duration-200 border shadow-sm";
  const btnDefault =
    "border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200";
  const btnActive = "border-blue-300 bg-blue-50 text-blue-600 shadow-blue-100";

  // Build the sign language video embed content
  const signLangVideoContent = useMemo(() => {
    if (!signLanguageUrl) return null;
    const youtubeId = getYouTubeId(signLanguageUrl);
    if (youtubeId) {
      return (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
          title="فيديو لغة الإشارة"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full aspect-video rounded-lg"
        />
      );
    }
    return (
      <video
        src={signLanguageUrl}
        controls
        className="w-full aspect-video rounded-lg"
        aria-label="فيديو لغة الإشارة"
      >
        متصفحك لا يدعم تشغيل الفيديو.
      </video>
    );
  }, [signLanguageUrl]);

  // Always render prominently for all students
  return (
    <TooltipProvider>
      <div
        className="flex items-center gap-2 rounded-xl border border-blue-100 bg-linear-to-l from-blue-50/80 to-slate-50/80 px-3 py-2 shadow-sm"
        role="toolbar"
        aria-label="أدوات إمكانية الوصول"
      >
        <span className="text-xs font-semibold text-blue-500 ml-1 select-none whitespace-nowrap">
          أدوات المساعدة
        </span>

        <span className="h-5 w-px bg-blue-200/60" />

        {/* Zoom In */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={handleZoomIn}
                className={cn(btnBase, btnDefault)}
                aria-label="تكبير النص"
                disabled={fontSizeMultiplier >= 1.5}
              />
            }
          >
            <ZoomIn className="size-4" />
          </TooltipTrigger>
          <TooltipContent>تكبير النص (A+)</TooltipContent>
        </Tooltip>

        {/* Zoom Out */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={handleZoomOut}
                className={cn(btnBase, btnDefault)}
                aria-label="تصغير النص"
                disabled={fontSizeMultiplier <= 0.8}
              />
            }
          >
            <ZoomOut className="size-4" />
          </TooltipTrigger>
          <TooltipContent>تصغير النص (A-)</TooltipContent>
        </Tooltip>

        {/* Play / Stop Audio */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={handlePlayAudio}
                className={cn(btnBase, isSpeaking ? btnActive : btnDefault)}
                aria-label={
                  isSpeaking ? "إيقاف القراءة" : "قراءة السؤال صوتياً"
                }
              />
            }
          >
            {isSpeaking ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </TooltipTrigger>
          <TooltipContent>
            {isSpeaking ? "إيقاف القراءة" : "قراءة السؤال صوتياً"}
          </TooltipContent>
        </Tooltip>

        {/* High Contrast */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={handleHighContrast}
                className={cn(
                  btnBase,
                  highContrastMode ? btnActive : btnDefault,
                )}
                aria-label={
                  highContrastMode
                    ? "إيقاف التباين العالي"
                    : "تفعيل التباين العالي"
                }
              />
            }
          >
            <Contrast className="size-4" />
          </TooltipTrigger>
          <TooltipContent>
            {highContrastMode ? "إيقاف التباين العالي" : "تباين عالٍ"}
          </TooltipContent>
        </Tooltip>

        {/* Sign Language Video (only if URL provided) */}
        {signLanguageUrl && (
          <Dialog open={signLangOpen} onOpenChange={setSignLangOpen}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <DialogTrigger
                    render={
                      <button
                        className={cn(
                          btnBase,
                          signLangOpen ? btnActive : btnDefault,
                        )}
                        aria-label="عرض فيديو لغة الإشارة"
                      />
                    }
                  />
                }
              >
                <Hand className="size-4" />
              </TooltipTrigger>
              <TooltipContent>فيديو لغة الإشارة</TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>فيديو لغة الإشارة</DialogTitle>
                <DialogDescription>
                  ترجمة السؤال إلى لغة الإشارة
                </DialogDescription>
              </DialogHeader>
              {signLangVideoContent}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
}

export default function ExamClient({
  exam,
  disabilityType = "NONE",
  startTime = null,
}: {
  exam: SanitizedExamData;
  disabilityType?: DisabilityType;
  startTime?: string | null;
}) {
  const { questions } = exam;
  const totalQuestions = questions.length;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  // highContrastMode: toggles high-contrast colour scheme for readability
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const router = useRouter();

  const [state, dispatch] = useReducer(
    examReducer,
    undefined,
    (): ExamState => {
      const totalSeconds = exam.durationMinutes * 60;
      let initialTimeLeft = totalSeconds;
      if (startTime) {
        const startedAt = new Date(startTime).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        initialTimeLeft = Math.max(0, totalSeconds - elapsed);
      }
      return {
        currentIndex: 0,
        answers: {},
        flagged: new Set<string>(),
        submitted: false,
        autoSaveStatus: "idle",
        tabSwitchCount: 0,
        timeLeftSeconds: initialTimeLeft,
      };
    },
  );

  const {
    currentIndex,
    answers,
    flagged,
    submitted,
    autoSaveStatus,
    tabSwitchCount,
    timeLeftSeconds,
  } = state;

  // Derived values
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  useAutoSave(exam.id, state, dispatch);

  // Fullscreen gate state: exam only starts after student explicitly enters fullscreen
  const [examStarted, setExamStarted] = useState(false);
  // Overlay shown when student exits fullscreen mid-exam
  const [showFullscreenOverlay, setShowFullscreenOverlay] = useState(false);

  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  // Safe Exit Ref for intentional submission
  const isSubmittingRef = useRef(false);

  useProctoring(
    dispatch,
    exam.id,
    examStarted && !submitted,
    setShowFullscreenOverlay,
    isSubmittingRef,
  );
  useBeforeUnload(examStarted && !submitted);

  // Handle "Start Exam in Fullscreen" button
  const handleStartExam = useCallback(async () => {
    try {
      // 1. Initialize the exam attempt in the database
      // Using toast.promise to manage the async state visually
      await toast.promise(startExamAttempt(exam.id), {
        loading: "جارٍ استهلال الامتحان...",
        success: (result) => {
          if (result?.error) throw new Error(result.error);
          return "تم استهلال الامتحان بنجاح";
        },
        error: (err) =>
          err.message || "فشل بدء الامتحان، يرجى المحاولة مرة أخرى",
      });

      // 2. Request fullscreen and start the timer
      await document.documentElement.requestFullscreen();
      setExamStarted(true);
    } catch (error: unknown) {
      console.error("[handleStartExam] Error:", error);
      // Success/Error logic is handled by toast.promise, but we catch
      // to avoid requestFullscreen if the server action fails.
    }
  }, [exam.id]);

  const currentQuestionRef = useRef(currentQuestion);
  const currentAnswerRef = useRef(answers[currentQuestion.id] ?? "");
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
    currentAnswerRef.current = answers[currentQuestion.id] ?? "";
  });

  useEffect(() => {
    if (disabilityType !== "VISUAL") return;

    const handleAudioKeyDown = (e: KeyboardEvent) => {
      // Never conflict with anti-cheat modifier combos
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const tag = (e.target as HTMLElement).tagName;
      const q = currentQuestionRef.current;
      const { key } = e;

      // Q / 0 — read question (works even while focused in textarea)
      if (key === "q" || key === "Q" || key === "0") {
        e.preventDefault();
        speakText(q.text);
        return;
      }

      // A — read back essay answer (only while NOT typing, to avoid conflict)
      if (
        (key === "a" || key === "A") &&
        tag !== "TEXTAREA" &&
        tag !== "INPUT"
      ) {
        if (q.type === "ESSAY") {
          e.preventDefault();
          const ans = currentAnswerRef.current;
          speakText(ans.trim() ? ans : "لم تكتب إجابة بعد.");
        }
        return;
      }

      // 1–4 — read MCQ option (only when not typing)
      if (tag !== "TEXTAREA" && tag !== "INPUT" && q.type === "MCQ") {
        const idx = parseInt(key) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < q.options.length) {
          e.preventDefault();
          speakText(`الخيار ${OPTION_LETTERS[idx]}: ${q.options[idx].text}`);
        }
      }
    };

    document.addEventListener("keydown", handleAudioKeyDown);
    return () => document.removeEventListener("keydown", handleAudioKeyDown);
  }, [disabilityType]);

  // ── Stable action helpers ──────────────────────────────────────────────────
  const setAnswer = useCallback(
    (qId: string, v: string) =>
      dispatch({ type: "SET_ANSWER", questionId: qId, value: v }),
    [],
  );
  const toggleFlag = useCallback(
    (qId: string) => dispatch({ type: "TOGGLE_FLAG", questionId: qId }),
    [],
  );
  const goTo = useCallback(
    (i: number) => {
      if (i >= 0 && i < totalQuestions)
        dispatch({ type: "GO_TO_QUESTION", index: i });
    },
    [totalQuestions],
  );
  const handleSubmit = useCallback(() => {
    setShowSubmitDialog(false);
    // Raise the safe exit flag
    isSubmittingRef.current = true;

    // Gracefully exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.log(err));
    }

    startSubmitTransition(async () => {
      // Build the payload from answers state
      const payload = questions.map((q) => {
        const value = answers[q.id];
        if (q.type === "MCQ") {
          return {
            questionId: q.id,
            selectedOptionId: value || null,
            textAnswer: null,
          };
        }
        return {
          questionId: q.id,
          selectedOptionId: null,
          textAnswer: value || null,
        };
      });

      // Calculate elapsed time in seconds
      const elapsedSeconds = exam.durationMinutes * 60 - timeLeftSeconds;

      const result = await submitExam(
        exam.id,
        payload,
        elapsedSeconds,
        tabSwitchCount,
      );

      if (result.error) {
        toast.error(result.error);
        // Lower the safe exit flag if submission failed
        isSubmittingRef.current = false;
        return;
      }

      dispatch({ type: "SUBMIT" });
      toast.success("تم تسليم الامتحان بنجاح", {
        description: "يمكنك رؤية درجتك في صفحة نتائجي.",
      });
      router.push("/student");
    });
  }, [
    questions,
    answers,
    exam.id,
    exam.durationMinutes,
    timeLeftSeconds,
    tabSwitchCount,
    router,
    isSubmittingRef,
  ]);

  // Sync with teacher broadcast and invigilation actions
  const handleTeacherMessage = useCallback(
    (msg: { content: string; sender: string }) => {
      toast.info(`رسالة من ${msg.sender}`, {
        description: msg.content,
        duration: 10000,
        icon: <PenLine className="size-4" />,
      });
    },
    [],
  );

  const handleForceEnd = useCallback(() => {
    toast.error("تم إنهاء الامتحان قسراً", {
      description:
        "تم إنهاء محاولة الامتحان الخاصة بك من قبل المراقبة. تم تسليم إجاباتك الحالية.",
      duration: Infinity,
    });
    // In force-end, we call handleSubmit directly.
    // handleSubmit handles clearing storage, submitting to DB, and redirecting.
    handleSubmit();
  }, [handleSubmit]);

  useTeacherSync(
    exam.id,
    examStarted && !submitted,
    handleTeacherMessage,
    handleForceEnd,
  );

  const {
    formatted: timerText,
    isLow,
    isCritical,
  } = useExamTimer(dispatch, timeLeftSeconds, submitted, handleSubmit);

  // Clipboard prevention handler for the exam container
  const preventClipboard = useMemo(
    () => ({
      onCopy: (e: React.ClipboardEvent) => e.preventDefault(),
      onCut: (e: React.ClipboardEvent) => e.preventDefault(),
      onPaste: (e: React.ClipboardEvent) => e.preventDefault(),
    }),
    [],
  );

  if (!isMounted) return null;

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-gray-50/50 p-6">
        <Toaster position="top-center" dir="rtl" />
        <div className="w-full max-w-md text-center">
          <div className="mx-auto size-24 rounded-2xl bg-blue-50 flex items-center justify-center mb-8 shadow-sm shadow-blue-100">
            <Maximize className="size-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {exam.title}
          </h1>
          <p className="text-gray-500 text-base mb-4">
            {exam.subject} • {exam.instructor}
          </p>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 mb-8 text-right">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-sm text-amber-700 leading-relaxed">
                <p className="font-bold">تعليمات الامتحان:</p>
                <ul className="space-y-1 list-disc pr-4">
                  <li>يجب أن يعمل الامتحان في وضع ملء الشاشة طوال المدة.</li>
                  <li>
                    سيتم تسجيل أي مغادرة للصفحة أو خروج من ملء الشاشة كمخالفة.
                  </li>
                  <li>سيتم إبلاغ المحاضر فوراً عند رصد أي مخالفة.</li>
                  <li>النسخ واللصق وقائمة السياق معطّلة أثناء الامتحان.</li>
                </ul>
              </div>
            </div>
          </div>
          <Button
            size="lg"
            onClick={handleStartExam}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-base px-8 py-6"
          >
            <Maximize className="size-5" />
            بدء الامتحان في وضع ملء الشاشة
          </Button>
        </div>
      </div>
    );
  }

  // ── Submitted Screen ──────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-gray-50/50 p-6">
        <Toaster position="top-center" dir="rtl" />
        <div className="w-full max-w-md text-center">
          <div className="mx-auto size-24 rounded-2xl bg-emerald-50 flex items-center justify-center mb-8 shadow-sm shadow-emerald-100">
            <CheckCircle2 className="size-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            تم تسليم الامتحان بنجاح
          </h1>
          <p className="text-gray-500 text-base mb-10">
            تم حفظ جميع إجاباتك بنجاح. يمكنك مغادرة الصفحة.
          </p>

          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600 tabular-nums">
                {answeredCount}
              </p>
              <p className="text-sm text-gray-400 mt-1">مُجاب</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-400 tabular-nums">
                {unansweredCount}
              </p>
              <p className="text-sm text-gray-400 mt-1">بدون إجابة</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 tabular-nums">
                {totalQuestions}
              </p>
              <p className="text-sm text-gray-400 mt-1">الإجمالي</p>
            </div>
          </div>

          {tabSwitchCount > 0 && (
            <div className="inline-flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-5 py-3 text-sm text-red-600">
              <Eye className="size-4" />
              تم رصد {tabSwitchCount} مغادرة للصفحة
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen select-none bg-white overflow-hidden"
      {...preventClipboard}
    >
      <Toaster position="top-center" dir="rtl" />

      {/* ── Fullscreen Enforcement Overlay ── */}
      {showFullscreenOverlay && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm">
          <div className="w-full max-w-md text-center p-6">
            <div className="mx-auto size-20 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
              <ShieldAlert className="size-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              تم إيقاف الامتحان
            </h2>
            <p className="text-gray-300 text-base mb-8 leading-relaxed">
              يجب العودة لوضع ملء الشاشة لاستكمال الحل. تم تسجيل هذه المخالفة
              وإبلاغ المحاضر.
            </p>
            <Button
              size="lg"
              onClick={enterFullscreen}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white text-base px-8 py-6"
            >
              <Maximize className="size-5" />
              العودة لوضع ملء الشاشة
            </Button>
          </div>
        </div>
      )}

      {/* ── Sticky Header ── */}
      <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 md:px-6 z-30">
        <div className="flex items-center justify-between gap-3">
          {/* Exam info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <BookOpen className="size-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {exam.title}
              </h1>
              <p className="text-sm text-gray-400 truncate">
                {exam.subject} • {exam.instructor}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <AutoSaveIndicator status={autoSaveStatus} />

            {tabSwitchCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5">
                <ShieldAlert className="size-3" />
                {tabSwitchCount}
              </span>
            )}

            {!isFullscreen && (
              <button
                onClick={enterFullscreen}
                className="size-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                title="وضع ملء الشاشة"
              >
                <Maximize className="size-3.5" />
              </button>
            )}

            {/* Timer */}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-sm font-bold tabular-nums transition-all duration-300",
                isCritical
                  ? "bg-red-600 text-white animate-pulse shadow-md shadow-red-200"
                  : isLow
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-gray-50 text-gray-700 border border-gray-200",
              )}
            >
              <Clock className="size-3.5" />
              {timerText}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-l from-blue-600 to-blue-400 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm tabular-nums text-gray-400 shrink-0 font-medium">
            {answeredCount}/{totalQuestions}
          </span>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Sidebar: Question Grid ── */}
        <aside
          className={cn(
            "shrink-0 border-l border-gray-100 bg-gray-50/30 flex-col transition-all duration-300 hidden lg:flex",
            sidebarOpen ? "w-64" : "w-0 overflow-hidden border-l-0",
          )}
        >
          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  خريطة الأسئلة
                </p>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="size-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <PanelRightClose className="size-3.5" />
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {questions.map((q, i) => (
                  <QuestionGridItem
                    key={q.id}
                    index={i}
                    isAnswered={q.id in answers}
                    isFlagged={flagged.has(q.id)}
                    isCurrent={i === currentIndex}
                    questionType={q.type}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="space-y-2 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  دليل الألوان
                </p>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="size-3 rounded bg-blue-600" />
                    السؤال الحالي
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="size-3 rounded bg-emerald-100" />
                    تمت الإجابة
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="size-3 rounded bg-gray-100" />
                    بدون إجابة
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="size-3 rounded-full bg-amber-400" />
                    مُعلّم للمراجعة
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  الإحصائيات
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-white border border-gray-100 py-2.5 shadow-sm">
                    <p className="text-lg font-bold text-emerald-600 tabular-nums">
                      {answeredCount}
                    </p>
                    <p className="text-xs text-gray-400">مُجاب</p>
                  </div>
                  <div className="rounded-xl bg-white border border-gray-100 py-2.5 shadow-sm">
                    <p className="text-lg font-bold text-gray-400 tabular-nums">
                      {unansweredCount}
                    </p>
                    <p className="text-xs text-gray-400">متبقي</p>
                  </div>
                  <div className="rounded-xl bg-white border border-gray-100 py-2.5 shadow-sm">
                    <p className="text-lg font-bold text-amber-500 tabular-nums">
                      {flagged.size}
                    </p>
                    <p className="text-xs text-gray-400">مُعلّم</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* ── Main Question Area ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-10">
            {/* Toggle sidebar when collapsed */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
              >
                <PanelRightOpen className="size-3.5" />
                عرض خريطة الأسئلة
              </button>
            )}

            {/* Question meta */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-gray-900">
                  السؤال {currentIndex + 1}
                </span>
                <span className="text-base text-gray-200">/</span>
                <span className="text-base text-gray-400">
                  {totalQuestions}
                </span>

                <Badge
                  variant="secondary"
                  className={cn(
                    "text-sm gap-1",
                    currentQuestion.type === "MCQ"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-violet-50 text-violet-600",
                  )}
                >
                  {currentQuestion.type === "MCQ" ? (
                    <>
                      <CircleDot className="size-3" />
                      اختيار من متعدد
                    </>
                  ) : (
                    <>
                      <PenLine className="size-3" />
                      مقالي
                    </>
                  )}
                </Badge>

                <Badge variant="outline" className="text-sm text-gray-400">
                  {currentQuestion.points} درجة
                </Badge>
              </div>

              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-all duration-200",
                  flagged.has(currentQuestion.id)
                    ? "bg-amber-50 text-amber-600 border border-amber-200 shadow-sm shadow-amber-50"
                    : "text-gray-400 hover:text-amber-500 hover:bg-amber-50 border border-transparent",
                )}
              >
                <Flag
                  className={cn(
                    "size-3.5",
                    flagged.has(currentQuestion.id) && "fill-amber-200",
                  )}
                />
                <span className="hidden sm:inline">
                  {flagged.has(currentQuestion.id) ? "مُعلّم" : "علّم للمراجعة"}
                </span>
              </button>
            </div>

            {/* ── Accessibility Toolbar (per-question) ── */}
            <div className="mb-5">
              <AccessibilityToolbar
                questionText={currentQuestion.text}
                optionsText={
                  currentQuestion.type === "MCQ"
                    ? currentQuestion.options.map((o) => o.text).join(". ")
                    : ""
                }
                signLanguageUrl={currentQuestion.signLanguageUrl}
                fontSizeMultiplier={fontSizeMultiplier}
                setFontSizeMultiplier={setFontSizeMultiplier}
                highContrastMode={highContrastMode}
                setHighContrastMode={setHighContrastMode}
              />
            </div>

            {/* Question text (select-none to block text selection) */}
            {/* Applies fontSizeMultiplier and high-contrast styles */}
            <div
              className={cn(
                "rounded-2xl px-6 py-7 md:px-8 md:py-8 mb-8 border transition-colors duration-200",
                highContrastMode
                  ? "bg-gray-950 border-yellow-400"
                  : "bg-linear-to-bl from-gray-50 to-gray-50/50 border-gray-100",
              )}
              data-high-contrast={highContrastMode || undefined}
              style={{ fontSize: `${fontSizeMultiplier}rem` }}
            >
              <div className="flex items-start gap-4">
                <p
                  className={cn(
                    "font-medium leading-loose select-none flex-1",
                    highContrastMode ? "text-yellow-300" : "text-gray-900",
                  )}
                >
                  {currentQuestion.text}
                </p>

                {/* "قراءة السؤال" button — VISUAL disability only */}
                {disabilityType === "VISUAL" && (
                  <div aria-live="polite" className="shrink-0">
                    <button
                      type="button"
                      onClick={() => speakText(currentQuestion.text)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
                        highContrastMode
                          ? "border-yellow-400 bg-yellow-950 text-yellow-300 hover:bg-yellow-900"
                          : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300",
                      )}
                      aria-label="قراءة السؤال صوتياً"
                      title="قراءة السؤال (Q أو 0)"
                    >
                      <Volume2 className="size-3.5 shrink-0" />
                      قراءة السؤال
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Keyboard shortcut hint — VISUAL disability only */}
            {disabilityType === "VISUAL" && (
              <div
                className={cn(
                  "mb-5 flex items-center gap-3 rounded-xl border px-4 py-2.5 text-xs",
                  highContrastMode
                    ? "border-yellow-500/40 bg-yellow-950/60 text-yellow-400"
                    : "border-purple-100 bg-purple-50/70 text-purple-700",
                )}
                role="note"
                aria-label="اختصارات لوحة المفاتيح للتنقل الصوتي"
              >
                <Keyboard className="size-3.5 shrink-0" />
                <span className="font-semibold ml-1">اختصارات صوتية:</span>
                {currentQuestion.type === "MCQ" ? (
                  <span>
                    <kbd className="rounded bg-white/70 border border-purple-200 px-1 font-mono">
                      Q
                    </kbd>
                    {" أو "}
                    <kbd className="rounded bg-white/70 border border-purple-200 px-1 font-mono">
                      0
                    </kbd>
                    {" قراءة السؤال — "}
                    <kbd className="rounded bg-white/70 border border-purple-200 px-1 font-mono">
                      1
                    </kbd>
                    {"–"}
                    <kbd className="rounded bg-white/70 border border-purple-200 px-1 font-mono">
                      4
                    </kbd>
                    {" قراءة الخيار المقابل"}
                  </span>
                ) : (
                  <span>
                    <kbd className="rounded bg-white/70 border border-purple-200 px-1 font-mono">
                      Q
                    </kbd>
                    {" أو "}
                    <kbd className="rounded bg-white/70 border border-purple-200 px-1 font-mono">
                      0
                    </kbd>
                    {" قراءة السؤال — "}
                    <kbd className="rounded bg-white/70 border border-purple-200 px-1 font-mono">
                      A
                    </kbd>
                    {" قراءة إجابتك"}
                  </span>
                )}
              </div>
            )}

            {/* Answer */}
            {currentQuestion.type === "MCQ" ? (
              <MCQAnswer
                question={currentQuestion}
                value={answers[currentQuestion.id] ?? ""}
                onChange={(v) => setAnswer(currentQuestion.id, v)}
                isVisual={disabilityType === "VISUAL"}
              />
            ) : (
              <EssayAnswer
                question={currentQuestion}
                value={answers[currentQuestion.id] ?? ""}
                onChange={(v) => setAnswer(currentQuestion.id, v)}
                isVisual={disabilityType === "VISUAL"}
              />
            )}

            {/* Mobile question grid */}
            <div className="lg:hidden mt-10 mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                التنقل بين الأسئلة
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {questions.map((q, i) => (
                  <QuestionGridItem
                    key={q.id}
                    index={i}
                    isAnswered={q.id in answers}
                    isFlagged={flagged.has(q.id)}
                    isCurrent={i === currentIndex}
                    questionType={q.type}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => goTo(currentIndex - 1)}
                disabled={isFirst}
                className="gap-1.5 text-gray-600"
              >
                <ChevronRight className="size-4" />
                السابق
              </Button>

              <div className="flex items-center gap-2">
                {/* Review & Submit */}
                <AlertDialog
                  open={showSubmitDialog}
                  onOpenChange={setShowSubmitDialog}
                >
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant={isLast ? "default" : "outline"}
                        size="lg"
                        className={cn(
                          "gap-2",
                          isLast
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "text-gray-500 border-gray-200",
                        )}
                      >
                        <Send className="size-3.5" />
                        {isLast ? "مراجعة وتسليم" : "تسليم"}
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        مراجعة وتسليم الامتحان
                      </AlertDialogTitle>
                      <AlertDialogDescription className="sr-only">
                        مراجعة الإجابات قبل التسليم النهائي
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <ReviewSummary
                      questions={questions}
                      answers={answers}
                      flagged={flagged}
                    />

                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isSubmitting}>
                        العودة للامتحان
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isSubmitting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-4" />
                        )}
                        {isSubmitting ? "جارٍ التسليم..." : "تأكيد التسليم"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {!isLast && (
                  <Button
                    size="lg"
                    onClick={() => goTo(currentIndex + 1)}
                    className="gap-1.5"
                  >
                    التالي
                    <ChevronLeft className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
