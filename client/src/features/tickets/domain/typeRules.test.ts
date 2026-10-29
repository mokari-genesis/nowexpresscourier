import { describe, expect, it } from "vitest";
import { typeRequiresPackageLink } from "./typeRules";

describe("typeRequiresPackageLink", () => {
  it("requires package for extraviado and fuerza_tarea", () => {
    expect(typeRequiresPackageLink("extraviado")).toBe(true);
    expect(typeRequiresPackageLink("fuerza_tarea")).toBe(true);
  });

  it("does not require package for reclamo and paquetes_a_ticket", () => {
    expect(typeRequiresPackageLink("reclamo")).toBe(false);
    expect(typeRequiresPackageLink("paquetes_a_ticket")).toBe(false);
  });
});
