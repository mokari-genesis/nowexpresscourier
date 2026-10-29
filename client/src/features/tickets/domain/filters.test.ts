import { describe, expect, it } from "vitest";
import { filterTickets, paginateTickets } from "./filters";
import type { Ticket } from "../types";

function makeTicket(overrides: Partial<Ticket>): Ticket {
  return {
    id: "1",
    publicCode: "TKT-2026-0001",
    type: "reclamo",
    status: "open",
    priority: "medium",
    title: "Sample",
    description: "Description",
    linkedPackage: {
      guideCode: "GUIA-100",
      clientName: "Acme",
      statusLabel: "En tránsito",
    },
    notes: [],
    attachments: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("filterTickets", () => {
  const tickets = [
    makeTicket({
      id: "1",
      publicCode: "TKT-2026-0142",
      title: "Envío retenido",
      type: "reclamo",
      status: "in_progress",
      priority: "high",
    }),
    makeTicket({
      id: "2",
      publicCode: "TKT-2026-0143",
      title: "Paquete extraviado",
      type: "extraviado",
      status: "open",
      priority: "medium",
      linkedPackage: {
        guideCode: "GUIA-200",
        clientName: "Beta SA",
        statusLabel: "Perdido",
      },
    }),
  ];

  it("filters by search across code and title", () => {
    expect(filterTickets(tickets, { search: "0142" })).toHaveLength(1);
    expect(filterTickets(tickets, { search: "extraviado" })).toHaveLength(1);
    expect(filterTickets(tickets, { search: "beta" })).toHaveLength(1);
  });

  it("filters by type status and priority", () => {
    expect(filterTickets(tickets, { type: "reclamo" })).toHaveLength(1);
    expect(filterTickets(tickets, { status: "open" })).toHaveLength(1);
    expect(filterTickets(tickets, { priority: "high" })).toHaveLength(1);
  });

  it("treats all as no filter", () => {
    expect(
      filterTickets(tickets, {
        type: "all",
        status: "all",
        priority: "all",
      })
    ).toHaveLength(2);
  });
});

describe("paginateTickets", () => {
  it("returns the requested page slice", () => {
    const items = Array.from({ length: 5 }, (_, index) =>
      makeTicket({ id: String(index + 1), publicCode: `TKT-${index + 1}` })
    );

    expect(paginateTickets(items, 1, 2).map((t) => t.id)).toEqual(["1", "2"]);
    expect(paginateTickets(items, 2, 2).map((t) => t.id)).toEqual(["3", "4"]);
    expect(paginateTickets(items, 3, 2).map((t) => t.id)).toEqual(["5"]);
  });
});
