import type { TicketPriority, TicketStatus, TicketType } from "../types";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Abierto",
  in_progress: "En progreso",
  resolved: "Resuelto",
  closed: "Cerrado",
};

export const TYPE_LABELS: Record<TicketType, string> = {
  reclamo: "Reclamo",
  extraviado: "Extraviado",
  fuerza_tarea: "Fuerza Tarea",
  paquetes_a_ticket: "Paquetes a ticket",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};
