import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn } from "@/shared/utils/cn";

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
      />
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-[margin] duration-200",
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        <Topbar onMenuClick={() => setSidebarCollapsed((c) => !c)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
