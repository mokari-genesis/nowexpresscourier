import * as React from "react";
import {
  FormProvider as RHFFormProvider,
  useFormContext,
  Controller,
  type UseFormReturn,
  type FieldValues,
  type DefaultValues,
  type Resolver,
  type Control,
  type FieldPath,
} from "react-hook-form";

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function Form<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: FormProps<T>) {
  return (
    <RHFFormProvider {...form}>
      <form
        className={className}
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {children}
      </form>
    </RHFFormProvider>
  );
}

export function useFormContextSafe<T extends FieldValues>() {
  return useFormContext<T>();
}

interface FormFieldContextValue<T extends FieldValues> {
  name: FieldPath<T>;
}

const FormFieldContext = React.createContext<FormFieldContextValue<FieldValues> | null>(null);

export function useFormField<T extends FieldValues>() {
  const ctx = React.useContext(FormFieldContext) as FormFieldContextValue<T> | null;
  if (!ctx) {
    throw new Error("useFormField must be used within FormField");
  }
  return ctx;
}

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  children: (props: {
    field: { value: unknown; onChange: (value: unknown) => void; onBlur: () => void; ref: React.Ref<unknown> };
    fieldState: { error?: { message?: string } };
    formState: { isSubmitting: boolean };
  }) => React.ReactNode;
}

export function FormField<T extends FieldValues>({
  name,
  control,
  children,
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState, formState }) => (
        <FormFieldContext.Provider value={{ name: name as FieldPath<FieldValues> }}>
          {children({
            field: {
              ...field,
              value: field.value ?? "",
              onChange: field.onChange,
            },
            fieldState: {
              error: fieldState.error as { message?: string } | undefined,
            },
            formState: { isSubmitting: formState.isSubmitting },
          })}
        </FormFieldContext.Provider>
      )}
    />
  );
}

export type { UseFormReturn, FieldValues, DefaultValues, Resolver };
