import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = ["Uploading", "Parsing", "Structuring"] as const;

export function ParsingStages({ done }: { done?: boolean }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (done) {
      setIdx(STAGES.length);
      return;
    }
    const t = setInterval(
      () => setIdx((i) => Math.min(i + 1, STAGES.length - 1)),
      900,
    );
    return () => clearInterval(t);
  }, [done]);

  return (
    <div
      className="mx-auto w-full max-w-sm space-y-3"
      role="status"
      aria-live="polite"
    >
      {STAGES.map((label, i) => {
        const state =
          i < idx
            ? "done"
            : i === idx && !done
              ? "active"
              : i < idx || done
                ? "done"
                : "pending";
        return (
          <div
            key={label}
            className={cn(
              "flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm transition-colors",
              state === "active" && "shadow-[var(--shadow-soft)]",
              state === "pending" && "opacity-50",
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {state === "done" ? (
                <Check className="h-4 w-4" />
              ) : state === "active" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              )}
            </span>
            <span className="font-medium">
              {label}
              {state === "active" && (
                <span className="text-muted-foreground"> your resume…</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
