import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useAuth } from "@/features/auth/context/AuthContext";

export function DashboardPage() {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email ?? "User"}. Role: {role ?? "—"}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the sidebar to navigate. This is a generic template dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
