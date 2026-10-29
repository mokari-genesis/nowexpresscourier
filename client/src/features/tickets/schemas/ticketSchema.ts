import { z } from "zod";
import { TICKET_PRIORITIES, TICKET_TYPES } from "../types";
import { typeRequiresPackageLink } from "../domain/typeRules";
import type { TicketType } from "../types";

const linkedPackageSchema = z.object({
  guideCode: z.string().min(1),
  clientName: z.string().min(1),
  statusLabel: z.string().min(1),
  routeLabel: z.string().optional(),
  sender: z.string().optional(),
  destination: z.string().optional(),
});

export const createTicketSchema = z
  .object({
    type: z.enum(TICKET_TYPES),
    title: z
      .string()
      .min(1, "El título es requerido")
      .max(120, "Máximo 120 caracteres"),
    description: z
      .string()
      .min(20, "La descripción debe tener al menos 20 caracteres")
      .max(4000, "Descripción demasiado larga"),
    priority: z.enum(TICKET_PRIORITIES),
    linkedPackage: linkedPackageSchema.nullable(),
  })
  .superRefine((values, ctx) => {
    if (
      typeRequiresPackageLink(values.type as TicketType) &&
      !values.linkedPackage
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["linkedPackage"],
        message: "El paquete vinculado es requerido para este tipo",
      });
    }
  });

export type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

export const addNoteSchema = z.object({
  body: z
    .string()
    .min(1, "La nota no puede estar vacía")
    .max(2000, "Nota demasiado larga"),
  isInternal: z.boolean().default(true),
});

export type AddNoteFormValues = z.infer<typeof addNoteSchema>;
