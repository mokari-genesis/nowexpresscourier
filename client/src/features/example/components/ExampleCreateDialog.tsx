import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/components/form/Form";
import { TextInputField } from "@/shared/components/form/TextInputField";
import { TextareaField } from "@/shared/components/form/TextareaField";
import { exampleFormSchema, type ExampleFormValues } from "../schemas/exampleSchema";
import { useCreateExampleMutation } from "../api/useExampleQueries";
import { useToast } from "@/shared/hooks/use-toast";

interface ExampleCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultValues: ExampleFormValues = {
  title: "",
  description: "",
};

export function ExampleCreateDialog({
  open,
  onOpenChange,
}: ExampleCreateDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateExampleMutation();

  const form = useForm<ExampleFormValues>({
    resolver: zodResolver(exampleFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const onSubmit = async (values: ExampleFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast({
        title: "Created",
        description: "Example item has been created.",
      });
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create item.",
        variant: "destructive",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting || createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create example</DialogTitle>
        </DialogHeader>
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4 py-4">
            <TextInputField<ExampleFormValues>
              name="title"
              label="Title"
              required
              placeholder="Enter title"
            />
            <TextareaField<ExampleFormValues>
              name="description"
              label="Description"
              required
              placeholder="Enter description"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
