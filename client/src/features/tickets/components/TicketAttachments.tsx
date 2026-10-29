import type { ChangeEvent } from "react";
import { Download, FileText, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { TicketAttachment } from "../types";

interface TicketAttachmentsProps {
  attachments: TicketAttachment[];
  isUploading?: boolean;
  onUpload: (file: {
    fileName: string;
    contentType: string;
    sizeBytes: number;
  }) => Promise<void>;
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function TicketAttachments({
  attachments,
  isUploading,
  onUpload,
}: TicketAttachmentsProps) {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await onUpload({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });
    event.target.value = "";
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Archivos adjuntos ({attachments.length})
        </h2>
        <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Subiendo…" : "Subir archivo"}
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>

      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin archivos adjuntos.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {attachments.map((file) => {
            const isImage = file.contentType.startsWith("image/");
            return (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-lg border bg-white p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  {isImage ? (
                    <ImageIcon className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.sizeBytes)} · {file.uploadedBy}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Descargar ${file.fileName}`}
                  onClick={() => undefined}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
