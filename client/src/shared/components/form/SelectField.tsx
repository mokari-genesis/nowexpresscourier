import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { FormField } from "./Form";
import { FormFieldWrapper } from "./FormField";
import { useFormContext } from "react-hook-form";
import type { FieldValues, FieldPath } from "react-hook-form";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options: SelectOption[];
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  helperText,
  required,
  placeholder = "Select…",
  disabled,
  options,
}: SelectFieldProps<T>) {
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
          <Select
            value={(field.value as string) ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger aria-invalid={!!fieldState.error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      )}
    </FormField>
  );
}
