import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { LoadingState } from "@/shared/components/LoadingState";
import { ROUTES } from "@/app/config/routes";
import { useToast } from "@/shared/hooks/use-toast";
import {
  useAddTicketAttachmentMutation,
  useAddTicketNoteMutation,
  useTicketQuery,
  useUpdateTicketStatusMutation,
} from "../api/useTicketQueries";
import { LinkedPackageCard } from "../components/LinkedPackageCard";
import { TicketAttachments } from "../components/TicketAttachments";
import { TicketNotesThread } from "../components/TicketNotesThread";
import { TicketPropertiesCard } from "../components/TicketPropertiesCard";
import { TicketStatusBadge } from "../components/TicketStatusBadge";
import { TicketTypeBadge } from "../components/TicketTypeBadge";
import { STATUS_LABELS } from "../domain/labels";
import { getPrimaryTransitionAction } from "../domain/status";

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const ticketQuery = useTicketQuery(id ?? "");
  const statusMutation = useUpdateTicketStatusMutation();
  const noteMutation = useAddTicketNoteMutation();
  const attachmentMutation = useAddTicketAttachmentMutation();

  if (!id) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Falta el ID del ticket.</p>
        <Button asChild variant="outline">
          <Link to={ROUTES.tickets}>Volver</Link>
        </Button>
      </div>
    );
  }

  if (ticketQuery.isLoading) {
    return <LoadingState message="Cargando ticket…" />;
  }

  const ticket = ticketQuery.data;
  if (ticketQuery.isError || !ticket) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Ticket no encontrado.</p>
        <Button asChild variant="outline">
          <Link to={ROUTES.tickets}>Volver</Link>
        </Button>
      </div>
    );
  }

  const primaryAction = getPrimaryTransitionAction(ticket.status);

  const handleStatusChange = async () => {
    if (!primaryAction) return;
    try {
      await statusMutation.mutateAsync({
        id: ticket.id,
        status: primaryAction.nextStatus,
      });
      toast({
        title: "Estado actualizado",
        description: `Ticket movido a ${STATUS_LABELS[primaryAction.nextStatus]}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to={ROUTES.tickets} aria-label="Volver a tickets">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <p className="font-mono text-sm font-semibold text-muted-foreground">
              {ticket.publicCode}
            </p>
          </div>
          <h1 className="max-w-3xl text-2xl font-bold tracking-tight">
            {ticket.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketTypeBadge type={ticket.type} />
            <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              SLA: demo
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              toast({
                title: "Editar",
                description: "Edición completa llega con el backend.",
              })
            }
          >
            Editar
          </Button>
          {primaryAction ? (
            <Button
              type="button"
              onClick={handleStatusChange}
              disabled={statusMutation.isPending}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {statusMutation.isPending ? "Actualizando…" : primaryAction.label}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Descripción de la incidencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-slate-700">
                {ticket.description}
              </p>
              {ticket.linkedPackage?.destination ? (
                <div className="rounded-md border bg-slate-50 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ubicación / destino
                  </p>
                  <p className="mt-1">{ticket.linkedPackage.destination}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardContent className="pt-6">
              <TicketNotesThread
                notes={ticket.notes}
                isSubmitting={noteMutation.isPending}
                onAddNote={async (values) => {
                  try {
                    await noteMutation.mutateAsync({
                      id: ticket.id,
                      input: values,
                    });
                    toast({ title: "Nota agregada" });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "No se pudo agregar la nota.",
                      variant: "destructive",
                    });
                    throw error;
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardContent className="pt-6">
              <TicketAttachments
                attachments={ticket.attachments}
                isUploading={attachmentMutation.isPending}
                onUpload={async (file) => {
                  try {
                    await attachmentMutation.mutateAsync({
                      id: ticket.id,
                      file,
                    });
                    toast({
                      title: "Archivo adjunto",
                      description: `${file.fileName} agregado (demo local).`,
                    });
                  } catch {
                    toast({
                      title: "Error",
                      description: "No se pudo adjuntar el archivo.",
                      variant: "destructive",
                    });
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <TicketPropertiesCard ticket={ticket} />
          <LinkedPackageCard linkedPackage={ticket.linkedPackage} />
        </aside>
      </div>
    </div>
  );
}
