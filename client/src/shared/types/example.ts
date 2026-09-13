export interface ExampleItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface CreateExamplePayload {
  title: string;
  description: string;
}

export type UpdateExamplePayload = Partial<CreateExamplePayload>;
