"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { OTHER_OPTION } from "@/constants/academic-data";

export interface SearchableSelectProps {
  /** The list of selectable options */
  options: readonly string[];
  /** Current value (controlled) */
  value: string;
  /** Called when the value changes */
  onChange: (value: string) => void;
  /** Placeholder shown when nothing is selected */
  placeholder?: string;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** Text shown when no results match the query */
  emptyText?: string;
  /** Label for the "Other" freeform option. Set `false` to disable. */
  allowOther?: boolean;
  /** Placeholder for the custom "Other" text input */
  otherPlaceholder?: string;
  /** Custom value when "Other" was entered manually */
  customValue?: string;
  /** Called when the custom "Other" text changes */
  onCustomValueChange?: (value: string) => void;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Error state */
  hasError?: boolean;
  /** Additional class for the trigger button */
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "اختر...",
  searchPlaceholder = "ابحث...",
  emptyText = "لا توجد نتائج",
  allowOther = true,
  otherPlaceholder = "أدخل القيمة...",
  customValue = "",
  onCustomValueChange,
  disabled = false,
  hasError = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isOther = value === OTHER_OPTION;

  // Normalise Arabic text for matching (strip tashkeel & normalise alef/taa)
  const normalise = (text: string) =>
    text
      .replace(/[\u064B-\u065F\u0670]/g, "") // strip tashkeel
      .replace(/[أإآ]/g, "ا") // normalise alef
      .replace(/ة/g, "ه") // normalise taa marbouta
      .toLowerCase()
      .trim();

  const filtered = React.useMemo(() => {
    if (!query) return [...options];
    const q = normalise(query);
    return options.filter((opt) => normalise(opt).includes(q));
  }, [options, query]);

  const displayValue = isOther
    ? customValue || OTHER_OPTION
    : value || placeholder;

  // Focus the search input whenever the popover opens
  React.useEffect(() => {
    if (open) {
      // Small delay so the portal is rendered
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery("");
    }
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5">
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-gray-50/50 px-4 py-3 text-sm transition-all",
            "focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasError
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200",
            !value && "text-gray-400",
            value && "text-gray-800",
            className,
          )}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" />
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner
            side="bottom"
            align="start"
            sideOffset={4}
            className="isolate z-50 w-[var(--anchor-width)]"
          >
            <PopoverPrimitive.Popup
              className={cn(
                "flex max-h-72 w-full origin-(--transform-origin) flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg",
                "duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
                "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              )}
            >
              {/* Search input */}
              <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                  dir="rtl"
                />
              </div>

              {/* Options list */}
              <div className="overflow-y-auto overscroll-contain p-1">
                {filtered.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-gray-400">
                    {emptyText}
                  </p>
                )}

                {filtered.map((option) => {
                  const isSelected = value === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        onChange(option);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{option}</span>
                    </button>
                  );
                })}

                {/* "Other" option */}
                {allowOther && (
                  <>
                    <div className="mx-2 my-1 border-t border-gray-100" />
                    <button
                      type="button"
                      onClick={() => {
                        onChange(OTHER_OPTION);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        isOther
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isOther ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span>{OTHER_OPTION}</span>
                    </button>
                  </>
                )}
              </div>
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {/* Freeform text input when "Other" is selected */}
      {isOther && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomValueChange?.(e.target.value)}
          placeholder={otherPlaceholder}
          disabled={disabled}
          dir="rtl"
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm text-gray-800 placeholder:text-gray-400",
            "focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasError ? "border-red-300" : "border-gray-200",
          )}
        />
      )}
    </div>
  );
}
