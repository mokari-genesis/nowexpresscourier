export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_TYPES = [
  "reclamo",
  "extraviado",
  "fuerza_tarea",
  "paquetes_a_ticket",
] as const;

export type TicketType = (typeof TICKET_TYPES)[number];

export const TICKET_PRIORITIES = ["low", "medium", "high"] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export interface LinkedPackage {
  guideCode: string;
  clientName: string;
  statusLabel: string;
  routeLabel?: string;
  sender?: string;
  destination?: string;
}

export interface TicketNote {
  id: string;
  authorName: string;
  authorRole: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  publicCode: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  title: string;
  description: string;
  summary?: string;
  assignedTo?: string;
  channel?: string;
  linkedPackage: LinkedPackage | null;
  notes: TicketNote[];
  attachments: TicketAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketListFilters {
  search?: string;
  type?: TicketType | "all";
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
}

export interface CreateTicketInput {
  type: TicketType;
  title: string;
  description: string;
  priority: TicketPriority;
  linkedPackage: LinkedPackage | null;
}

export interface AddNoteInput {
  body: string;
  isInternal: boolean;
}

export interface TicketListResult {
  items: Ticket[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TicketKpis {
  total: number;
  openCount: number;
  highPriorityCount: number;
  avgResolutionLabel: string;
  slaAtRiskCount: number;
  fleetEffectivenessLabel: string;
}
