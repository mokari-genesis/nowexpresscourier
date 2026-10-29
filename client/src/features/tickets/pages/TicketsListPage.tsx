import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { ROUTES } from "@/app/config/routes";
import { useToast } from "@/shared/hooks/use-toast";
import {
  useTicketKpisQuery,
  useTicketsListQuery,
} from "../api/useTicketQueries";
import { TicketFiltersBar } from "../components/TicketFilters";
import { TicketKpiStrip } from "../components/TicketKpiStrip";
import { TicketStatusBadge } from "../components/TicketStatusBadge";
import { TicketTypeBadge } from "../components/TicketTypeBadge";
import type { TicketListFilters } from "../types";

const DEFAULT_FILTERS: TicketListFilters = {
  search: "",
  type: "all",
  status: "all",
  priority: "all",
};

export function TicketsListPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<TicketListFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const listQuery = useTicketsListQuery({ ...filters, page, pageSize });
  const kpisQuery = useTicketKpisQuery();

  const result = listQuery.data;
  const totalPages = result
    ? Math.max(1, Math.ceil(result.total / result.pageSize))
    : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="Gestión y resolución de incidencias operativas de envíos y paquetes en tránsito."
        children={
          <div className="flex flex-wrap items-center gap-2">
            {kpisQuery.data && (
              <>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {kpisQuery.data.openCount} abiertos
                </span>
                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                  {kpisQuery.data.highPriorityCount} alta prioridad
                </span>
              </>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                toast({
                  title: "Exportar",
                  description: "Disponible en una próxima versión.",
                })
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button asChild>
              <Link to={ROUTES.ticketNew}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo ticket
              </Link>
            </Button>
          </div>
        }
      />

      {kpisQuery.data ? <TicketKpiStrip kpis={kpisQuery.data} /> : null}

      <Card className="shadow-none">
        <CardContent className="space-y-4 pt-6">
          <TicketFiltersBar
            value={filters}
            resultLabel={
              result
                ? `Mostrando ${result.items.length} de ${result.total} tickets`
                : "Cargando…"
            }
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
            onClear={() => {
              setFilters(DEFAULT_FILTERS);
              setPage(1);
            }}
          />

          {listQuery.isLoading ? (
            <LoadingState message="Cargando tickets…" />
          ) : listQuery.isError ? (
            <p className="py-8 text-center text-sm text-destructive">
              No se pudieron cargar los tickets.
            </p>
          ) : !result || result.items.length === 0 ? (
            <EmptyState
              title="No hay tickets"
              description="Ajuste los filtros o cree un nuevo ticket."
              action={
                <Button asChild>
                  <Link to={ROUTES.ticketNew}>Nuevo ticket</Link>
                </Button>
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Título / resumen</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Paquete vinculado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.items.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <Link
                          to={ROUTES.ticketDetail(ticket.id)}
                          className="font-mono text-sm font-semibold text-primary hover:underline"
                        >
                          {ticket.publicCode}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={ROUTES.ticketDetail(ticket.id)}
                          className="block space-y-0.5"
                        >
                          <p className="font-medium leading-snug">
                            {ticket.title}
                          </p>
                          {ticket.summary ? (
                            <p className="text-xs text-muted-foreground">
                              {ticket.summary}
                            </p>
                          ) : null}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <TicketTypeBadge type={ticket.type} />
                      </TableCell>
                      <TableCell>
                        <TicketStatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell>
                        {ticket.linkedPackage ? (
                          <div className="text-sm">
                            <p className="font-mono text-xs font-medium">
                              {ticket.linkedPackage.guideCode}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {ticket.linkedPackage.clientName}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages} ({result.total} resultados)
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
