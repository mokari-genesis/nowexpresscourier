import { describe, expect, it } from "vitest";
import { createTicketSchema } from "./ticketSchema";

describe("createTicketSchema", () => {
  it("accepts a valid reclamo without package", () => {
    const result = createTicketSchema.safeParse({
      type: "reclamo",
      title: "Incidencia de prueba",
      description: "Descripción con más de veinte caracteres.",
      priority: "medium",
      linkedPackage: null,
    });

    expect(result.success).toBe(true);
  });

  it("requires package for extraviado", () => {
    const result = createTicketSchema.safeParse({
      type: "extraviado",
      title: "Paquete no localizado",
      description: "Descripción con más de veinte caracteres.",
      priority: "high",
      linkedPackage: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes("linkedPackage"))
      ).toBe(true);
    }
  });

  it("rejects short descriptions", () => {
    const result = createTicketSchema.safeParse({
      type: "reclamo",
      title: "Corto",
      description: "muy corto",
      priority: "low",
      linkedPackage: null,
    });

    expect(result.success).toBe(false);
  });
});
