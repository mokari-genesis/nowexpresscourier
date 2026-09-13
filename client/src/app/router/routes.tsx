import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "@/app/config/routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppShell } from "@/app/layout/AppShell";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ExampleListPage } from "@/features/example/pages/ExampleListPage";
import { ExampleDetailPage } from "@/features/example/pages/ExampleDetailPage";
import { NotFoundPage } from "@/app/layout/NotFoundPage";
import { ErrorBoundaryFallback } from "@/app/layout/ErrorBoundaryFallback";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={ROUTES.login} replace />,
  },
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: ROUTES.app,
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundaryFallback />,
    children: [
      { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "example", element: <ExampleListPage /> },
      { path: "example/:id", element: <ExampleDetailPage /> },
    ],
  },
  {
    path: ROUTES.notFound,
    element: <NotFoundPage />,
  },
]);
