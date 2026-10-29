import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from "../domain/labels";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_TYPES,
  type TicketListFilters,
  type TicketPriority,
  type TicketStatus,
  type TicketType,
} from "../types";

interface TicketFiltersProps {
  value: TicketListFilters;
  resultLabel: string;
  onChange: (next: TicketListFilters) => void;
  onClear: () => void;
}

export function TicketFiltersBar({
  value,
  resultLabel,
  onChange,
  onClear,
}: TicketFiltersProps) {
  const hasActiveFilters =
    !!value.search?.trim() ||
    (value.type && value.type !== "all") ||
    (value.status && value.status !== "all") ||
    (value.priority && value.priority !== "all");

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={value.search ?? ""}
          onChange={(event) =>
            onChange({ ...value, search: event.target.value })
          }
          placeholder="Buscar por código o título..."
          className="sm:max-w-xs"
        />

        <Select
          value={value.type ?? "all"}
          onValueChange={(type) =>
            onChange({ ...value, type: type as TicketType | "all" })
          }
        >
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tipo: Todos</SelectItem>
            {TICKET_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.status ?? "all"}
          onValueChange={(status) =>
            onChange({ ...value, status: status as TicketStatus | "all" })
          }
        >
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Estado: Todos</SelectItem>
            {TICKET_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.priority ?? "all"}
          onValueChange={(priority) =>
            onChange({
              ...value,
              priority: priority as TicketPriority | "all",
            })
          }
        >
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Prioridad: Todas</SelectItem>
            {TICKET_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            Limpiar filtros
          </Button>
        )}
        <span>{resultLabel}</span>
      </div>
    </div>
  );
}
