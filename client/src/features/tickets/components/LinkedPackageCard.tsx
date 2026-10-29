import { ExternalLink, MapPin, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { LinkedPackage } from "../types";

interface LinkedPackageCardProps {
  linkedPackage: LinkedPackage | null;
}

export function LinkedPackageCard({ linkedPackage }: LinkedPackageCardProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          Paquete vinculado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!linkedPackage ? (
          <p className="text-muted-foreground">Sin paquete vinculado.</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold">
                {linkedPackage.guideCode}
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{linkedPackage.statusLabel}</p>
            {linkedPackage.routeLabel && (
              <p>
                <span className="text-muted-foreground">Ruta: </span>
                {linkedPackage.routeLabel}
              </p>
            )}
            <p>
              <span className="text-muted-foreground">Cliente: </span>
              {linkedPackage.clientName}
            </p>
            {linkedPackage.destination && (
              <p className="flex items-start gap-1.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>{linkedPackage.destination}</span>
              </p>
            )}
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed bg-slate-50 text-xs text-muted-foreground">
              Mapa (placeholder demo)
            </div>
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver detalle completo del paquete
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
