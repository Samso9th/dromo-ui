import { LayoutTemplate, Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  RESUME_TEMPLATES,
  templateUnlocked,
  getTemplate,
} from "@/lib/templates";
import { PLAN_LABEL } from "@/lib/credits";
import type { Plan } from "@/lib/api/types";

/** Resume template picker. Shows template names + descriptions; gated templates show a lock. */
export function TemplatePicker({
  value,
  plan,
  onChange,
  disabled,
}: {
  value: string;
  plan: Plan;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const selected = getTemplate(value);
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className="h-9 w-[13rem] gap-2"
        aria-label="Resume template"
      >
        <LayoutTemplate className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-left">{selected.name}</span>
      </SelectTrigger>
      <SelectContent className="max-h-[22rem]">
        {RESUME_TEMPLATES.map((t) => {
          const locked = !templateUnlocked(t, plan);
          return (
            <SelectItem
              key={t.id}
              value={t.id}
              disabled={locked}
              className="py-2"
            >
              <div className="flex w-full items-center justify-between gap-4 pr-1">
                <span className="flex flex-col">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {t.description}
                  </span>
                </span>
                {locked && (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" /> {PLAN_LABEL[t.minPlan]}
                  </span>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
