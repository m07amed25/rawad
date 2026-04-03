"use client";

import {
  useReducer,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useTransition,
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
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitExam } from "@/app/actions/grading";

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
};

type EssayQuestion = {
  id: string;
  type: "ESSAY";
  text: string;
  maxChars?: number;
  points: number;
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
 * useAntiCheat — Tab-switch detector + copy/cut/paste blocker + keyboard guard.
 * Fires sonner toasts instead of a custom modal.
 */
function useAntiCheat(dispatch: React.Dispatch<ExamAction>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.hidden) {
        dispatch({ type: "INCREMENT_TAB_SWITCH" });
        toast.error(
          "تحذير: تم اكتشاف خروج من صفحة الامتحان. سيتم تسجيل هذه المخالفة.",
          { duration: 6000 },
        );
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

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
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, dispatch]);
}

function useBeforeUnload(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled]);
}

// ─── speakText — Arabic TTS via native SpeechSynthesis API ──────────────────

/**
 * Speaks the given text aloud using the browser's native SpeechSynthesis API.
 * Configured for Arabic (ar-SA). Cancels any ongoing speech before starting.
 */
function speakText(text: string) {
  // Guard: SpeechSynthesis may not be available in all browsers
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancel any currently-playing speech to avoid overlap
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-SA"; // Arabic (Saudi Arabia)
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1;

  // Try to pick an Arabic voice if available
  const voices = window.speechSynthesis.getVoices();
  const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
  if (arabicVoice) utterance.voice = arabicVoice;

  window.speechSynthesis.speak(utterance);
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
}: {
  question: MCQQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="gap-3">
      {question.options.map((option, i) => {
        const isSelected = value === option.id;
        return (
          <label
            key={option.id}
            className={cn(
              "group flex items-center gap-4 rounded-xl border-2 p-4 md:p-5 cursor-pointer transition-all duration-200",
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
              {OPTION_LETTERS[i] ?? String.fromCharCode(65 + i)}
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
}: {
  question: EssayQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  const maxChars = question.maxChars ?? 1000;
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isNearLimit = charCount > maxChars * 0.9;
  const isAtLimit = charCount >= maxChars;

  return (
    <div className="space-y-2">
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
 * Per-question accessibility toolbar. Conditionally shows tools based on
 * the student's disabilityType:
 * - VISUAL / MULTIPLE: Zoom In, Zoom Out, Play Audio (prominent)
 * - LEARNING / MULTIPLE: High Contrast toggle (prominent)
 * - All others: tools hidden behind a settings cog button
 */
function AccessibilityToolbar({
  disabilityType,
  questionText,
  optionsText,
  fontSizeMultiplier,
  setFontSizeMultiplier,
  highContrastMode,
  setHighContrastMode,
}: {
  disabilityType: DisabilityType;
  questionText: string;
  optionsText: string;
  fontSizeMultiplier: number;
  setFontSizeMultiplier: React.Dispatch<React.SetStateAction<number>>;
  highContrastMode: boolean;
  setHighContrastMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // Determine which tools should be prominently visible
  const showVisualTools =
    disabilityType === "VISUAL" || disabilityType === "MULTIPLE";
  const showLearningTools =
    disabilityType === "LEARNING" || disabilityType === "MULTIPLE";

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
    "size-8 rounded-lg flex items-center justify-center transition-all duration-200 border";
  const btnDefault =
    "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700";
  const btnActive = "border-blue-300 bg-blue-50 text-blue-600";

  // Inline toolbar buttons JSX (not a component, to avoid re-mount on render)
  const toolbarButtons = (
    <div
      className="flex items-center gap-1"
      role="toolbar"
      aria-label="أدوات إمكانية الوصول"
    >
      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className={cn(btnBase, btnDefault)}
        title="تكبير النص (A+)"
        aria-label="تكبير النص"
        disabled={fontSizeMultiplier >= 1.5}
      >
        <ZoomIn className="size-3.5" />
      </button>
      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className={cn(btnBase, btnDefault)}
        title="تصغير النص (A-)"
        aria-label="تصغير النص"
        disabled={fontSizeMultiplier <= 0.8}
      >
        <ZoomOut className="size-3.5" />
      </button>
      {/* Play / Stop Audio */}
      <button
        onClick={handlePlayAudio}
        className={cn(btnBase, isSpeaking ? btnActive : btnDefault)}
        title={isSpeaking ? "إيقاف القراءة" : "قراءة السؤال صوتياً"}
        aria-label={isSpeaking ? "إيقاف القراءة" : "قراءة السؤال صوتياً"}
      >
        {isSpeaking ? (
          <VolumeX className="size-3.5" />
        ) : (
          <Volume2 className="size-3.5" />
        )}
      </button>
      {/* High Contrast */}
      <button
        onClick={handleHighContrast}
        className={cn(btnBase, highContrastMode ? btnActive : btnDefault)}
        title={highContrastMode ? "إيقاف التباين العالي" : "تباين عالٍ"}
        aria-label={
          highContrastMode ? "إيقاف التباين العالي" : "تفعيل التباين العالي"
        }
      >
        <Contrast className="size-3.5" />
      </button>
    </div>
  );

  // ── Prominent display for VISUAL / LEARNING / MULTIPLE ──
  if (showVisualTools || showLearningTools) {
    return toolbarButtons;
  }

  // ── Fallback: settings cog for all other students ──
  return (
    <div className="relative">
      <button
        onClick={() => setSettingsOpen((o) => !o)}
        className={cn(btnBase, settingsOpen ? btnActive : btnDefault)}
        title="أدوات إمكانية الوصول"
        aria-label="فتح أدوات إمكانية الوصول"
        aria-expanded={settingsOpen}
      >
        <Settings className="size-3.5" />
      </button>
      {settingsOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          {toolbarButtons}
        </div>
      )}
    </div>
  );
}

// ─── Main Client Component ───────────────────────────────────────────────────

export default function ExamClient({
  exam,
  disabilityType = "NONE",
}: {
  exam: SanitizedExamData;
  disabilityType?: DisabilityType;
}) {
  const { questions } = exam;
  const totalQuestions = questions.length;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // ── Accessibility state ────────────────────────────────────────────────────
  // fontSizeMultiplier: scales question text (1 = normal, max 1.5, min 0.8)
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  // highContrastMode: toggles high-contrast colour scheme for readability
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const router = useRouter();

  // ── Core state via useReducer ──────────────────────────────────────────────
  const [state, dispatch] = useReducer(examReducer, {
    currentIndex: 0,
    answers: {},
    flagged: new Set<string>(),
    submitted: false,
    autoSaveStatus: "idle",
    tabSwitchCount: 0,
    timeLeftSeconds: exam.durationMinutes * 60,
  });

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
  useAntiCheat(dispatch, !submitted);
  useBeforeUnload(!submitted);
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();

  useEffect(() => {
    if (!submitted) enterFullscreen();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    exitFullscreen();

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
        return;
      }

      dispatch({ type: "SUBMIT" });
      toast.success("تم تسليم الامتحان بنجاح", {
        description: "يمكنك رؤية درجتك في صفحة نتائجي.",
      });
      router.push("/student");
    });
  }, [
    exitFullscreen,
    questions,
    answers,
    exam.id,
    exam.durationMinutes,
    timeLeftSeconds,
    tabSwitchCount,
    router,
  ]);

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

            {/* Question meta + Accessibility Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-gray-900">
                  السؤال {currentIndex + 1}
                </span>
                <span className="text-base text-gray-200">/</span>
                <span className="text-base text-gray-400">
                  {totalQuestions}
                </span>

                {/* ── Accessibility Toolbar (per-question) ── */}
                <AccessibilityToolbar
                  disabilityType={disabilityType}
                  questionText={currentQuestion.text}
                  optionsText={
                    currentQuestion.type === "MCQ"
                      ? currentQuestion.options.map((o) => o.text).join(". ")
                      : ""
                  }
                  fontSizeMultiplier={fontSizeMultiplier}
                  setFontSizeMultiplier={setFontSizeMultiplier}
                  highContrastMode={highContrastMode}
                  setHighContrastMode={setHighContrastMode}
                />

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
              <p
                className={cn(
                  "font-medium leading-loose select-none",
                  highContrastMode ? "text-yellow-300" : "text-gray-900",
                )}
              >
                {currentQuestion.text}
              </p>
            </div>

            {/* Answer */}
            {currentQuestion.type === "MCQ" ? (
              <MCQAnswer
                question={currentQuestion}
                value={answers[currentQuestion.id] ?? ""}
                onChange={(v) => setAnswer(currentQuestion.id, v)}
              />
            ) : (
              <EssayAnswer
                question={currentQuestion}
                value={answers[currentQuestion.id] ?? ""}
                onChange={(v) => setAnswer(currentQuestion.id, v)}
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
