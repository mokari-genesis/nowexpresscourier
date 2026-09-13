import { Input } from "@/shared/ui/input";
import { FormField } from "./Form";
import { FormFieldWrapper } from "./FormField";
import { useFormContext } from "react-hook-form";
import type { FieldValues, FieldPath } from "react-hook-form";

interface TextInputFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  helperText?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function TextInputField<T extends FieldValues>({
  name,
  label,
  helperText,
  required,
  type = "text",
  placeholder,
  disabled,
}: TextInputFieldProps<T>) {
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
          <Input
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            value={field.value as string}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            ref={field.ref as React.Ref<HTMLInputElement>}
            aria-invalid={!!fieldState.error}
          />
        </FormFieldWrapper>
      )}
    </FormField>
  );
}
