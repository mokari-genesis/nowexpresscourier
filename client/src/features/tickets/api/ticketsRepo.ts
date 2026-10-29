import { filterTickets, paginateTickets } from "../domain/filters";
import { canTransitionTo } from "../domain/status";
import { typeRequiresPackageLink } from "../domain/typeRules";
import { getSeedTickets, SEED_KPIS, SEED_PACKAGES } from "../data/seedTickets";
import type {
  AddNoteInput,
  CreateTicketInput,
  LinkedPackage,
  Ticket,
  TicketAttachment,
  TicketKpis,
  TicketListFilters,
  TicketListResult,
  TicketStatus,
} from "../types";

const STORAGE_KEY = "nowexpress-tickets-repo";

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function loadTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getSeedTickets();
      saveTickets(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as Ticket[];
    return Array.isArray(parsed) ? parsed : getSeedTickets();
  } catch {
    return getSeedTickets();
  }
}

function saveTickets(tickets: Ticket[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

/** Exported for unit tests. */
export function nextPublicCode(tickets: Ticket[]): string {
  const max = tickets.reduce((current, ticket) => {
    const suffix = ticket.publicCode.split("-").at(-1);
    const value = suffix ? Number(suffix) : 0;
    return Math.max(current, Number.isFinite(value) ? value : 0);
  }, 0);
  return `TKT-2026-${String(max + 1).padStart(4, "0")}`;
}

export interface ListTicketsParams extends TicketListFilters {
  page?: number;
  pageSize?: number;
}

export const ticketsRepo = {
  async listTickets(params: ListTicketsParams = {}): Promise<TicketListResult> {
    const tickets = loadTickets();
    await delay(undefined);

    const filtered = filterTickets(tickets, params).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;

    return {
      items: paginateTickets(filtered, page, pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  async getTicket(id: string): Promise<Ticket | null> {
    const tickets = loadTickets();
    await delay(undefined);
    return tickets.find((ticket) => ticket.id === id) ?? null;
  },

  async getKpis(): Promise<TicketKpis> {
    const tickets = loadTickets();
    await delay(undefined);
    const openCount = tickets.filter(
      (ticket) => ticket.status === "open" || ticket.status === "in_progress"
    ).length;
    const highPriorityCount = tickets.filter(
      (ticket) =>
        ticket.priority === "high" &&
        ticket.status !== "closed" &&
        ticket.status !== "resolved"
    ).length;

    return {
      total: tickets.length,
      openCount,
      highPriorityCount,
      avgResolutionLabel: SEED_KPIS.avgResolutionLabel,
      slaAtRiskCount: SEED_KPIS.slaAtRiskCount,
      fleetEffectivenessLabel: SEED_KPIS.fleetEffectivenessLabel,
    };
  },

  async searchPackages(query: string): Promise<LinkedPackage[]> {
    await delay(undefined);
    const q = query.trim().toLowerCase();
    if (!q) return [...SEED_PACKAGES];
    return SEED_PACKAGES.filter(
      (pkg) =>
        pkg.guideCode.toLowerCase().includes(q) ||
        pkg.clientName.toLowerCase().includes(q)
    ).map((pkg) => ({ ...pkg }));
  },

  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    if (typeRequiresPackageLink(input.type) && !input.linkedPackage) {
      throw new Error(
        "El paquete vinculado es requerido para este tipo de ticket"
      );
    }

    const tickets = loadTickets();
    await delay(undefined);
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      publicCode: nextPublicCode(tickets),
      type: input.type,
      status: "open",
      priority: input.priority,
      title: input.title.trim(),
      description: input.description.trim(),
      summary: input.description.trim().slice(0, 80),
      assignedTo: "Sin asignar",
      channel: "Back-office",
      linkedPackage: input.linkedPackage,
      notes: [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };
    tickets.unshift(ticket);
    saveTickets(tickets);
    return ticket;
  },

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const tickets = loadTickets();
    await delay(undefined);
    const index = tickets.findIndex((ticket) => ticket.id === id);
    if (index === -1) {
      throw new Error("Ticket not found");
    }

    const current = tickets[index];
    if (!canTransitionTo(current.status, status)) {
      throw new Error(
        `Invalid status transition from ${current.status} to ${status}`
      );
    }

    const updated: Ticket = {
      ...current,
      status,
      updatedAt: new Date().toISOString(),
    };
    tickets[index] = updated;
    saveTickets(tickets);
    return updated;
  },

  async addNote(id: string, input: AddNoteInput): Promise<Ticket> {
    const tickets = loadTickets();
    await delay(undefined);
    const index = tickets.findIndex((ticket) => ticket.id === id);
    if (index === -1) {
      throw new Error("Ticket not found");
    }

    const current = tickets[index];
    const note = {
      id: crypto.randomUUID(),
      authorName: "Usuario Demo",
      authorRole: "Ops",
      body: input.body.trim(),
      isInternal: input.isInternal,
      createdAt: new Date().toISOString(),
    };

    const updated: Ticket = {
      ...current,
      notes: [...current.notes, note],
      updatedAt: note.createdAt,
    };
    tickets[index] = updated;
    saveTickets(tickets);
    return updated;
  },

  async addAttachment(
    id: string,
    file: { fileName: string; contentType: string; sizeBytes: number }
  ): Promise<Ticket> {
    const tickets = loadTickets();
    await delay(undefined);
    const index = tickets.findIndex((ticket) => ticket.id === id);
    if (index === -1) {
      throw new Error("Ticket not found");
    }

    const attachment: TicketAttachment = {
      id: crypto.randomUUID(),
      fileName: file.fileName,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      uploadedBy: "Usuario Demo",
      createdAt: new Date().toISOString(),
    };

    const current = tickets[index];
    const updated: Ticket = {
      ...current,
      attachments: [...current.attachments, attachment],
      updatedAt: attachment.createdAt,
    };
    tickets[index] = updated;
    saveTickets(tickets);
    return updated;
  },
};
