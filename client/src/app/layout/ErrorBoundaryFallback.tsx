import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/app/config/routes";
import { useNavigate } from "react-router-dom";

export function ErrorBoundaryFallback() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Error</h1>
      <p className="max-w-md text-center text-muted-foreground">{message}</p>
      <Button
        onClick={() => {
          navigate(ROUTES.dashboard);
          window.location.reload();
        }}
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
