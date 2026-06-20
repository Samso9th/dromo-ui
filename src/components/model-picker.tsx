import { Cpu, Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  creditsFor,
  modelUnlocked,
  PLAN_LABEL,
  requiredPlan,
} from "@/lib/credits";
import type { AiModel, Plan } from "@/lib/api/types";

/**
 * Per-session model picker. Always shows the REAL model name (never the internal
 * economy/standard/premium tier words). Each row shows a credit burn-rate badge;
 * models above the user's plan are locked with an "Upgrade" hint.
 */
export function ModelPicker({
  models,
  value,
  plan,
  onChange,
  disabled,
}: {
  models: AiModel[];
  value: string;
  plan: Plan;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const selected = models.find((m) => m.id === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-9 w-[15rem] gap-2" aria-label="AI model">
        <Cpu className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-left">
          {selected?.name ?? "Select model"}
        </span>
        {selected && (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            ~{creditsFor(selected, "tailor")} cr
          </span>
        )}
      </SelectTrigger>
      <SelectContent className="max-h-[22rem]">
        {models.map((m) => {
          const locked = !modelUnlocked(m, plan);
          return (
            <SelectItem
              key={m.id}
              value={m.id}
              disabled={locked}
              className="py-2"
            >
              <div className="flex w-full items-center justify-between gap-4 pr-1">
                <span className="flex flex-col">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {m.note}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  {locked ? (
                    <>
                      <Lock className="h-3 w-3" /> {PLAN_LABEL[requiredPlan(m)]}
                    </>
                  ) : (
                    <>~{creditsFor(m, "tailor")} cr</>
                  )}
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
