import type { ListTicketsParams } from "./ticketsRepo";

export const ticketKeys = {
  all: ["tickets"] as const,
  lists: () => [...ticketKeys.all, "list"] as const,
  list: (params: ListTicketsParams) => [...ticketKeys.lists(), params] as const,
  details: () => [...ticketKeys.all, "detail"] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
  kpis: () => [...ticketKeys.all, "kpis"] as const,
  packageSearch: (query: string) =>
    [...ticketKeys.all, "packages", query] as const,
};
