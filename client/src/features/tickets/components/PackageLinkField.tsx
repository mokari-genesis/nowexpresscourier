import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { usePackageSearchQuery } from "../api/useTicketQueries";
import type { LinkedPackage } from "../types";

interface PackageLinkFieldProps {
  value: LinkedPackage | null;
  required?: boolean;
  error?: string;
  onChange: (value: LinkedPackage | null) => void;
}

export function PackageLinkField({
  value,
  required,
  error,
  onChange,
}: PackageLinkFieldProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchQuery = usePackageSearchQuery(query, open || query.length > 0);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Vincular paquete
        {required ? <span className="text-destructive"> *</span> : null}
      </label>

      {value ? (
        <div className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
          <div>
            <p className="text-sm font-medium">
              {value.guideCode} · {value.clientName}
            </p>
            <p className="text-xs text-muted-foreground">{value.statusLabel}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Quitar paquete"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Buscar por guía o cliente..."
          />
          {open && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-white shadow-md">
              {searchQuery.isLoading || searchQuery.isFetching ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Buscando…
                </p>
              ) : (
                <>
                  {(searchQuery.data ?? []).map((pkg) => (
                    <button
                      key={pkg.guideCode}
                      type="button"
                      className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => {
                        onChange(pkg);
                        setQuery("");
                        setOpen(false);
                      }}
                    >
                      <span className="font-medium">
                        {pkg.guideCode} · {pkg.clientName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {pkg.statusLabel}
                      </span>
                    </button>
                  ))}
                  {(searchQuery.data ?? []).length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      Sin resultados
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Requerido para Fuerza Tarea y Extraviado.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
