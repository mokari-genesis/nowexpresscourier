import type {
  ExampleItem,
  CreateExamplePayload,
  UpdateExamplePayload,
} from "@/shared/types/example";

const STORAGE_KEY = "skeletor-example-repo";

function loadItems(): ExampleItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSeedData();
    const parsed = JSON.parse(raw) as ExampleItem[];
    return Array.isArray(parsed) ? parsed : getSeedData();
  } catch {
    return getSeedData();
  }
}

function getSeedData(): ExampleItem[] {
  const seed: ExampleItem[] = [
    {
      id: "1",
      title: "First example",
      description: "Description for the first example item.",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      title: "Second example",
      description: "Description for the second example item.",
      createdAt: "2024-01-02T00:00:00Z",
    },
  ];
  return seed;
}

function saveItems(items: ExampleItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface ListExamplesParams {
  search?: string;
}

export const exampleRepo = {
  async listExamples(params: ListExamplesParams = {}): Promise<ExampleItem[]> {
    const items = loadItems();
    await delay(undefined);
    const { search } = params;
    if (!search?.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  },

  async getExample(id: string): Promise<ExampleItem | null> {
    const items = loadItems();
    await delay(undefined);
    return items.find((item) => item.id === id) ?? null;
  },

  async createExample(payload: CreateExamplePayload): Promise<ExampleItem> {
    const items = loadItems();
    await delay(undefined);
    const newItem: ExampleItem = {
      id: crypto.randomUUID(),
      title: payload.title,
      description: payload.description,
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    saveItems(items);
    return newItem;
  },

  async updateExample(
    id: string,
    payload: UpdateExamplePayload
  ): Promise<ExampleItem | null> {
    const items = loadItems();
    await delay(undefined);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...payload };
    saveItems(items);
    return items[index];
  },
};
