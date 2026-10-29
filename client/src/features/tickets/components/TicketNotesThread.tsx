import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Form } from "@/shared/components/form/Form";
import {
  addNoteSchema,
  type AddNoteFormValues,
} from "../schemas/ticketSchema";
import type { TicketNote } from "../types";

interface TicketNotesThreadProps {
  notes: TicketNote[];
  isSubmitting?: boolean;
  onAddNote: (values: AddNoteFormValues) => Promise<void>;
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("es-CR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketNotesThread({
  notes,
  isSubmitting,
  onAddNote,
}: TicketNotesThreadProps) {
  const form = useForm<AddNoteFormValues>({
    resolver: zodResolver(addNoteSchema),
    defaultValues: { body: "", isInternal: true },
  });

  const handleSubmit = async (values: AddNoteFormValues) => {
    await onAddNote(values);
    // Only clear after a successful add; callers must rethrow on failure.
    form.reset({ body: "", isInternal: true });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Historial y notas internas
      </h2>

      <ol className="space-y-4 border-l border-slate-200 pl-4">
        {notes.length === 0 ? (
          <li className="text-sm text-muted-foreground">Sin notas aún.</li>
        ) : (
          notes.map((note) => (
            <li key={note.id} className="relative space-y-1">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-400" />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{note.authorName}</span>
                <span className="text-muted-foreground">{note.authorRole}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(note.createdAt)}
                </span>
                {note.isInternal && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                    Interna
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700">{note.body}</p>
            </li>
          ))
        )}
      </ol>

      <div className="rounded-lg border bg-slate-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Agregar nueva nota
        </p>
        <Form form={form} onSubmit={handleSubmit}>
          <Textarea
            {...form.register("body")}
            placeholder="Escriba una actualización operativa..."
            rows={3}
          />
          {form.formState.errors.body && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.body.message}
            </p>
          )}
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" {...form.register("isInternal")} />
            Visibilidad interna solamente
          </label>
          <div className="mt-3 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Agregando…" : "Agregar nota"}
            </Button>
          </div>
        </Form>
      </div>
    </section>
  );
}
