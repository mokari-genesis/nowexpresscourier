import { z } from "zod";

export const exampleFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description too long"),
});

export type ExampleFormValues = z.infer<typeof exampleFormSchema>;
