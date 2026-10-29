import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Form } from "@/shared/components/form/Form";
import { TextInputField } from "@/shared/components/form/TextInputField";
import { TextareaField } from "@/shared/components/form/TextareaField";
import { SelectField } from "@/shared/components/form/SelectField";
import { ROUTES } from "@/app/config/routes";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/utils/cn";
import { useCreateTicketMutation } from "../api/useTicketQueries";
import { PackageLinkField } from "../components/PackageLinkField";
import { typeRequiresPackageLink } from "../domain/typeRules";
import { PRIORITY_LABELS, TYPE_LABELS } from "../domain/labels";
import {
  createTicketSchema,
  type CreateTicketFormValues,
} from "../schemas/ticketSchema";
import { TICKET_PRIORITIES, TICKET_TYPES } from "../types";

const defaultValues: CreateTicketFormValues = {
  type: "reclamo",
  title: "",
  description: "",
  priority: "medium",
  linkedPackage: null,
};

export function TicketCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateTicketMutation();

  const form = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues,
  });

  const selectedType = form.watch("type");
  const packageRequired = typeRequiresPackageLink(selectedType);

  const onSubmit = async (values: CreateTicketFormValues) => {
    try {
      const ticket = await createMutation.mutateAsync(values);
      toast({
        title: "Ticket creado",
        description: `${ticket.publicCode} registrado correctamente.`,
      });
      navigate(ROUTES.ticketDetail(ticket.id));
    } catch {
      toast({
        title: "Error",
        description: "No se pudo crear el ticket.",
        variant: "destructive",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting || createMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.tickets} aria-label="Volver a tickets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo ticket</h1>
          <p className="text-sm text-muted-foreground">
            Registrar una nueva incidencia operativa o solicitud de logística.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Datos de la incidencia</CardTitle>
          </CardHeader>
          <CardContent>
            <Form form={form} onSubmit={onSubmit}>
              <div className="space-y-5">
                <SelectField<CreateTicketFormValues>
                  name="type"
                  label="Tipo de ticket"
                  required
                  placeholder="Seleccionar tipo..."
                  helperText="Define el flujo de atención y el SLA asignado en matriz de despacho."
                  options={TICKET_TYPES.map((type) => ({
                    value: type,
                    label: TYPE_LABELS[type],
                  }))}
                />

                <TextInputField<CreateTicketFormValues>
                  name="title"
                  label="Título"
                  required
                  placeholder="Ej. Paquete no localizado en sorting hub central."
                />

                <TextareaField<CreateTicketFormValues>
                  name="description"
                  label="Descripción detallada"
                  required
                  placeholder="Detalle la incidencia, contexto y evidencia disponible."
                />

                <Controller
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Prioridad</p>
                      <div className="inline-flex rounded-md border p-1">
                        {TICKET_PRIORITIES.map((priority) => (
                          <button
                            key={priority}
                            type="button"
                            className={cn(
                              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                              field.value === priority
                                ? priority === "high"
                                  ? "bg-red-600 text-white"
                                  : priority === "medium"
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-700 text-white"
                                : "text-muted-foreground hover:bg-slate-50"
                            )}
                            onClick={() => field.onChange(priority)}
                          >
                            {PRIORITY_LABELS[priority]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name="linkedPackage"
                  render={({ field, fieldState }) => (
                    <PackageLinkField
                      value={field.value}
                      required={packageRequired}
                      error={fieldState.error?.message}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Autoguardado (demo) — sin persistencia de borradores
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      toast({
                        title: "Borrador",
                        description: "Disponible en una próxima versión.",
                      })
                    }
                  >
                    Guardar como borrador
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Creando…" : "Crear ticket"}
                  </Button>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reglas de asignación SLA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Alta prioridad:</span>{" "}
                atención operativa en menos de 45 min.
              </p>
              <p>
                <span className="font-medium text-foreground">Fuerza Tarea:</span>{" "}
                escalamiento a despacho regional y supervisor de ruta.
              </p>
              <p>
                <span className="font-medium text-foreground">Extraviado:</span>{" "}
                bloqueo preventivo de liquidación en scanners.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Centro de operaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Región:</span> CR-SJO
              </p>
              <p>
                <span className="text-muted-foreground">Unidad:</span> Mesa de
                Control 2
              </p>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span>Capacidad actual</span>
                  <span>14 / 20</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[70%] rounded-full bg-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
