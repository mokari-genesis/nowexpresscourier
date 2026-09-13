import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exampleRepo } from "@/services/repositories/exampleRepo";
import { exampleKeys } from "./queryKeys";
import type { CreateExamplePayload, UpdateExamplePayload } from "@/shared/types/example";

export function useExampleListQuery(params: { search?: string } = {}) {
  return useQuery({
    queryKey: exampleKeys.list(params),
    queryFn: () => exampleRepo.listExamples(params),
  });
}

export function useExampleQuery(id: string) {
  return useQuery({
    queryKey: exampleKeys.detail(id),
    queryFn: () => exampleRepo.getExample(id),
    enabled: !!id,
  });
}

export function useCreateExampleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExamplePayload) =>
      exampleRepo.createExample(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exampleKeys.lists() });
    },
  });
}

export function useUpdateExampleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExamplePayload;
    }) => exampleRepo.updateExample(id, payload),
    onSuccess: (_data: unknown, variables: { id: string; payload: UpdateExamplePayload }) => {
      queryClient.invalidateQueries({ queryKey: exampleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: exampleKeys.detail(variables.id),
      });
    },
  });
}
