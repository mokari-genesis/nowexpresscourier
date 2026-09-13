export const exampleKeys = {
  all: ["example"] as const,
  lists: () => [...exampleKeys.all, "list"] as const,
  list: (params: { search?: string }) =>
    [...exampleKeys.lists(), params] as const,
  details: () => [...exampleKeys.all, "detail"] as const,
  detail: (id: string) => [...exampleKeys.details(), id] as const,
};
