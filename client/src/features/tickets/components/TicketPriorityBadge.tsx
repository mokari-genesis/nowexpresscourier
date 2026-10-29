import { cn } from "@/shared/utils/cn";
import { PRIORITY_LABELS } from "../domain/labels";
import type { TicketPriority } from "../types";

const STYLES: Record<TicketPriority, string> = {
  low: "border-slate-200 bg-slate-50 text-slate-600",
  medium: "border-blue-200 bg-blue-50 text-blue-700",
  high: "border-red-200 bg-red-50 text-red-700",
};

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

export function TicketPriorityBadge({
  priority,
  className,
}: TicketPriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold",
        STYLES[priority],
        className
      )}
    >
      {priority === "high" ? `! ${PRIORITY_LABELS[priority]}` : PRIORITY_LABELS[priority]}
    </span>
  );
}
