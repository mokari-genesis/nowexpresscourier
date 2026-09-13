import * as React from "react";
import { Label } from "@/shared/ui/label";

interface FormFieldProps {
  label?: string;
  helperText?: string;
  children: React.ReactNode;
  error?: { message?: string };
  required?: boolean;
}

export function FormFieldWrapper({
  label,
  helperText,
  children,
  error,
  required,
}: FormFieldProps) {
  const id = React.useId();

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
          {label}
        </Label>
      )}
      {React.isValidElement(children) && id
        ? React.cloneElement(children as React.ReactElement<{ id?: string }>, { id })
        : children}
      {error?.message && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {helperText && !error?.message && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
