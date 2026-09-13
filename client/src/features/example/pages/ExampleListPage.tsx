import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { ROUTES } from "@/app/config/routes";
import type { ExampleItem } from "@/shared/types/example";
import { useExampleListQuery } from "../api/useExampleQueries";
import { ExampleCreateDialog } from "../components/ExampleCreateDialog";

export function ExampleListPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: items = [], isLoading, isError } = useExampleListQuery({ search });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Example"
        description="List of example items. Use search to filter."
        children={
          <Button onClick={() => setCreateOpen(true)}>Create item</Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Input
              placeholder="Search by title or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <p className="py-8 text-center text-sm text-destructive">
              Failed to load items.
            </p>
          ) : items.length === 0 ? (
            <EmptyState
              title={search ? "No results" : "No items yet"}
              description={
                search
                  ? "Try a different search."
                  : "Create your first example item."
              }
              action={
                !search ? (
                  <Button onClick={() => setCreateOpen(true)}>Create item</Button>
                ) : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: ExampleItem) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {item.description}
                    </TableCell>
                    <TableCell>
                      <Button variant="link" size="sm" asChild>
                        <Link to={ROUTES.exampleDetail(item.id)}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ExampleCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
