import { beforeEach, describe, expect, it } from "vitest";
import { getSeedTickets } from "../data/seedTickets";
import { nextPublicCode, ticketsRepo } from "./ticketsRepo";
import type { Ticket } from "../types";

const STORAGE_KEY = "nowexpress-tickets-repo";

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "1",
    publicCode: "TKT-2026-0149",
    type: "reclamo",
    status: "open",
    priority: "medium",
    title: "Sample",
    description: "Description long enough for create",
    linkedPackage: null,
    notes: [],
    attachments: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("nextPublicCode", () => {
  it("increments from the highest existing suffix", () => {
    expect(
      nextPublicCode([
        makeTicket({ publicCode: "TKT-2026-0142" }),
        makeTicket({ publicCode: "TKT-2026-0149" }),
      ])
    ).toBe("TKT-2026-0150");
  });

  it("starts at 0001 when there are no tickets", () => {
    expect(nextPublicCode([])).toBe("TKT-2026-0001");
  });
});

describe("ticketsRepo", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getSeedTickets()));
  });

  it("rejects create without package for extraviado", async () => {
    await expect(
      ticketsRepo.createTicket({
        type: "extraviado",
        title: "Paquete perdido",
        description: "Descripción con más de veinte caracteres.",
        priority: "high",
        linkedPackage: null,
      })
    ).rejects.toThrow(/paquete vinculado/i);
  });

  it("creates sequential public codes after seed", async () => {
    const ticket = await ticketsRepo.createTicket({
      type: "reclamo",
      title: "Nuevo reclamo",
      description: "Descripción con más de veinte caracteres.",
      priority: "low",
      linkedPackage: null,
    });

    expect(ticket.publicCode).toBe("TKT-2026-0150");
  });

  it("computes KPIs from actual ticket state without seed floors", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        makeTicket({
          id: "a",
          status: "open",
          priority: "high",
          publicCode: "TKT-2026-0001",
        }),
        makeTicket({
          id: "b",
          status: "closed",
          priority: "low",
          publicCode: "TKT-2026-0002",
        }),
      ])
    );

    const kpis = await ticketsRepo.getKpis();
    expect(kpis.total).toBe(2);
    expect(kpis.openCount).toBe(1);
    expect(kpis.highPriorityCount).toBe(1);
  });
});
