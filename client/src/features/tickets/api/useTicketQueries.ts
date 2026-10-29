import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddNoteInput,
  CreateTicketInput,
  TicketStatus,
} from "../types";
import { ticketKeys } from "./queryKeys";
import { ticketsRepo, type ListTicketsParams } from "./ticketsRepo";

export function useTicketsListQuery(params: ListTicketsParams) {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => ticketsRepo.listTickets(params),
  });
}

export function useTicketQuery(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketsRepo.getTicket(id),
    enabled: !!id,
  });
}

export function useTicketKpisQuery() {
  return useQuery({
    queryKey: ticketKeys.kpis(),
    queryFn: () => ticketsRepo.getKpis(),
  });
}

export function usePackageSearchQuery(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ticketKeys.packageSearch(query),
    queryFn: () => ticketsRepo.searchPackages(query),
    enabled,
  });
}

export function useCreateTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTicketInput) => ticketsRepo.createTicket(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.kpis() });
    },
  });
}

export function useUpdateTicketStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      ticketsRepo.updateStatus(id, status),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.kpis() });
      queryClient.setQueryData(ticketKeys.detail(ticket.id), ticket);
    },
  });
}

export function useAddTicketNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddNoteInput }) =>
      ticketsRepo.addNote(id, input),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.setQueryData(ticketKeys.detail(ticket.id), ticket);
    },
  });
}

export function useAddTicketAttachmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      file,
    }: {
      id: string;
      file: { fileName: string; contentType: string; sizeBytes: number };
    }) => ticketsRepo.addAttachment(id, file),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.setQueryData(ticketKeys.detail(ticket.id), ticket);
    },
  });
}
