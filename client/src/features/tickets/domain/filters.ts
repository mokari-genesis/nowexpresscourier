import type { Ticket, TicketListFilters } from "../types";

export function matchesTicketFilters(
  ticket: Ticket,
  filters: TicketListFilters
): boolean {
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = [
      ticket.publicCode,
      ticket.title,
      ticket.description,
      ticket.summary ?? "",
      ticket.linkedPackage?.guideCode ?? "",
      ticket.linkedPackage?.clientName ?? "",
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(search)) {
      return false;
    }
  }

  if (filters.type && filters.type !== "all" && ticket.type !== filters.type) {
    return false;
  }

  if (
    filters.status &&
    filters.status !== "all" &&
    ticket.status !== filters.status
  ) {
    return false;
  }

  if (
    filters.priority &&
    filters.priority !== "all" &&
    ticket.priority !== filters.priority
  ) {
    return false;
  }

  return true;
}

export function filterTickets(
  tickets: Ticket[],
  filters: TicketListFilters
): Ticket[] {
  return tickets.filter((ticket) => matchesTicketFilters(ticket, filters));
}

export function paginateTickets(
  tickets: Ticket[],
  page: number,
  pageSize: number
): Ticket[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return tickets.slice(start, start + pageSize);
}
