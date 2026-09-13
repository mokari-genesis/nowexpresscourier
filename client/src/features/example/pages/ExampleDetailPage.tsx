import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Form } from "@/shared/components/form/Form";
import { TextInputField } from "@/shared/components/form/TextInputField";
import { TextareaField } from "@/shared/components/form/TextareaField";
import { LoadingState } from "@/shared/components/LoadingState";
import { ROUTES } from "@/app/config/routes";
import { useExampleQuery, useUpdateExampleMutation } from "../api/useExampleQueries";
import { exampleFormSchema, type ExampleFormValues } from "../schemas/exampleSchema";
import { useToast } from "@/shared/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export function ExampleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: item, isLoading, isError } = useExampleQuery(id ?? "");
  const updateMutation = useUpdateExampleMutation();

  const form = useForm<ExampleFormValues>({
    resolver: zodResolver(exampleFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
    values: item
      ? { title: item.title, description: item.description }
      : undefined,
  });

  const onSubmit = async (values: ExampleFormValues) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id, payload: values });
      toast({
        title: "Saved",
        description: "Example item has been updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save.",
        variant: "destructive",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting || updateMutation.isPending;

  if (!id) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Missing item ID.</p>
        <Button asChild variant="outline">
          <Link to={ROUTES.example}>Back to list</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="Loading item…" />;
  }

  if (isError || !item) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Item not found.</p>
        <Button asChild variant="outline">
          <Link to={ROUTES.example}>Back to list</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.example} aria-label="Back to list">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit example</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={onSubmit}>
            <div className="space-y-4">
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
            <div className="mt-6 flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={ROUTES.example}>Cancel</Link>
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
