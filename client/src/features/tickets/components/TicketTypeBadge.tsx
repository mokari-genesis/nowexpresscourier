import { cn } from "@/shared/utils/cn";
import { TYPE_LABELS } from "../domain/labels";
import type { TicketType } from "../types";

interface TicketTypeBadgeProps {
  type: TicketType;
  className?: string;
}

export function TicketTypeBadge({ type, className }: TicketTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700",
        className
      )}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}
