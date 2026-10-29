import { cn } from "@/shared/utils/cn";
import { STATUS_LABELS } from "../domain/labels";
import type { TicketStatus } from "../types";

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: "border-blue-200 bg-blue-50 text-blue-700",
  in_progress: "border-amber-200 bg-amber-50 text-amber-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  closed: "border-slate-200 bg-slate-100 text-slate-600",
};

const DOT_STYLES: Record<TicketStatus, string> = {
  open: "bg-blue-600",
  in_progress: "bg-amber-600",
  resolved: "bg-emerald-600",
  closed: "bg-slate-500",
};

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-semibold",
        STATUS_STYLES[status],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLES[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
