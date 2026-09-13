/// <reference types="react" />

/**
 * Type declarations for modules that may not ship ESM types or that need augmentation.
 * Remove or simplify once package types resolve correctly.
 */

declare module "@tanstack/query-core" {
  export class QueryClient {
    constructor(options?: {
      defaultOptions?: {
        queries?: { retry?: number; staleTime?: number };
        mutations?: { retry?: number };
      };
    });
    invalidateQueries(options?: { queryKey?: readonly unknown[] }): Promise<void>;
    getMutationCache(): unknown;
  }
}

declare module "react-hook-form" {
  export type FieldValues = Record<string, unknown>;
  export type FieldPath<T extends FieldValues> = keyof T & string;
  export type Resolver<T extends FieldValues> = (values: T) => { values: T; errors: Record<string, { message?: string }> };
  export type Control<T extends FieldValues> = unknown;
  export type UseFormReturn<T extends FieldValues> = {
    control: Control<T>;
    handleSubmit: (onValid: (values: T) => void | Promise<void>) => (e?: import("react").BaseSyntheticEvent) => Promise<void>;
    formState: { isSubmitting: boolean; errors: Record<string, { message?: string }> };
    watch: (name: FieldPath<T>) => unknown;
    setValue: (name: FieldPath<T>, value: unknown, opts?: { shouldValidate?: boolean }) => void;
    trigger: (name?: FieldPath<T>) => Promise<boolean>;
    reset: (values?: Partial<T>) => void;
    register: (name: FieldPath<T>) => { ref: (el: unknown) => void };
  };
  export type DefaultValues<T extends FieldValues> = Partial<T>;
  export type ControllerRenderProps<T extends FieldValues, N extends FieldPath<T>> = {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    ref: import("react").Ref<unknown>;
  };
  export type FieldError = { message?: string };

  export function FormProvider<T extends FieldValues>(props: { children: import("react").ReactNode } & UseFormReturn<T>): import("react").ReactNode;
  export function useFormContext<T extends FieldValues>(): UseFormReturn<T>;
  export function useForm<T extends FieldValues>(options?: {
    resolver?: Resolver<T>;
    defaultValues?: DefaultValues<T>;
    values?: Partial<T>;
  }): UseFormReturn<T>;
  export const Controller: import("react").ComponentType<{
    name: FieldPath<FieldValues>;
    control: Control<FieldValues>;
    render: (props: {
      field: { value: unknown; onChange: (value: unknown) => void; onBlur: () => void; ref: import("react").Ref<unknown> };
      fieldState: { error?: FieldError };
      formState: { isSubmitting: boolean };
    }) => import("react").ReactNode;
  }>;
}

declare module "@hookform/resolvers/zod" {
  import type { Resolver } from "react-hook-form";

  export function zodResolver<T>(schema: { parse: (v: unknown) => T }): Resolver<T>;
}
