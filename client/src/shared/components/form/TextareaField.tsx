import { Textarea } from "@/shared/ui/textarea";
import { FormField } from "./Form";
import { FormFieldWrapper } from "./FormField";
import { useFormContext } from "react-hook-form";
import type { FieldValues, FieldPath } from "react-hook-form";

interface TextareaFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  helperText,
  required,
  placeholder,
  disabled,
  rows = 3,
}: TextareaFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormField name={name} control={control}>
      {({ field, fieldState }) => (
        <FormFieldWrapper
          label={label}
          helperText={helperText}
          error={fieldState.error}
          required={required}
        >
          <Textarea
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            value={field.value as string}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            ref={field.ref as React.Ref<HTMLTextAreaElement>}
            aria-invalid={!!fieldState.error}
          />
        </FormFieldWrapper>
      )}
    </FormField>
  );
}
