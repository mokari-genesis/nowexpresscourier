import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import type { TicketKpis } from "../types";

interface TicketKpiStripProps {
  kpis: TicketKpis;
}

export function TicketKpiStrip({ kpis }: TicketKpiStripProps) {
  const cards = [
    {
      label: "Total Incidencias",
      value: String(kpis.total),
      hint: "+8 hoy",
      hintClass: "text-emerald-600",
    },
    {
      label: "Tiempo Promedio Resolución",
      value: kpis.avgResolutionLabel,
      hint: "-14% vs ayer",
      hintClass: "text-emerald-600",
    },
    {
      label: "SLA en Riesgo (< 2H)",
      value: String(kpis.slaAtRiskCount),
      hint: "Crítico",
      hintClass: "text-red-600",
      icon: true,
    },
    {
      label: "Efectividad Flota SJO",
      value: kpis.fleetEffectivenessLabel,
      hint: "Cumplimiento",
      hintClass: "text-slate-500",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="shadow-none">
          <CardContent className="space-y-1 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              {card.label}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold tracking-tight">
                {card.value}
              </p>
              {card.icon && (
                <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden />
              )}
            </div>
            <p className={`text-xs font-medium ${card.hintClass}`}>{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
