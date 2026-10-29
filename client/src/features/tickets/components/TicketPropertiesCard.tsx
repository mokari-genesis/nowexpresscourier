import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TYPE_LABELS } from "../domain/labels";
import type { Ticket } from "../types";
import { TicketPriorityBadge } from "./TicketPriorityBadge";

interface TicketPropertiesCardProps {
  ticket: Ticket;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketPropertiesCard({ ticket }: TicketPropertiesCardProps) {
  const rows = [
    { label: "Tipo", value: TYPE_LABELS[ticket.type] },
    {
      label: "Prioridad",
      value: <TicketPriorityBadge priority={ticket.priority} />,
    },
    { label: "Asignado a", value: ticket.assignedTo ?? "Sin asignar" },
    { label: "Creado", value: formatDateTime(ticket.createdAt) },
    { label: "Última actualización", value: formatDateTime(ticket.updatedAt) },
    { label: "Canal origen", value: ticket.channel ?? "—" },
  ];

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Propiedades del ticket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="text-right font-medium">{row.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">Alertas a despachador</span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            Activadas
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
