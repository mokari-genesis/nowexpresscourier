import type { TicketStatus } from "../types";
import { STATUS_LABELS } from "./labels";

const TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ["in_progress"],
  in_progress: ["resolved"],
  resolved: ["closed"],
  closed: [],
};

export function getAllowedNextStatuses(status: TicketStatus): TicketStatus[] {
  return TRANSITIONS[status];
}

export function canTransitionTo(
  from: TicketStatus,
  to: TicketStatus
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function getPrimaryTransitionAction(
  status: TicketStatus
): { nextStatus: TicketStatus; label: string } | null {
  const next = TRANSITIONS[status][0];
  if (!next) return null;

  const labels: Record<TicketStatus, string> = {
    open: "Abrir",
    in_progress: "Marcar en progreso",
    resolved: "Resolver ticket",
    closed: "Cerrar ticket",
  };

  return {
    nextStatus: next,
    label: labels[next] ?? `Mover a ${STATUS_LABELS[next]}`,
  };
}
