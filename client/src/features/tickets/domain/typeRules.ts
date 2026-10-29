import type { TicketType } from "../types";

const TYPES_REQUIRING_PACKAGE: ReadonlySet<TicketType> = new Set([
  "extraviado",
  "fuerza_tarea",
]);

export function typeRequiresPackageLink(type: TicketType): boolean {
  return TYPES_REQUIRING_PACKAGE.has(type);
}
