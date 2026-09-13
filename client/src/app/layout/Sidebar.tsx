import * as React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, List, Settings, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { ROUTES } from "@/app/config/routes";
import { RoleGate } from "@/app/router/RoleGate";
import { ROLES } from "@/app/config/roles";
import { Button } from "@/shared/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const navItems = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.example, label: "Example", icon: List },
  {
    to: "/app/admin",
    label: "Admin",
    icon: Settings,
    allowedRoles: [ROLES.ADMIN] as const,
  },
];

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-200 md:flex md:flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4 md:px-4">
        {!collapsed && (
          <span className="truncate font-semibold">Skeletor</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const content = (
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );

          if ("allowedRoles" in item && item.allowedRoles) {
            return (
              <RoleGate
                key={item.to}
                allowedRoles={[...item.allowedRoles]}
              >
                {content}
              </RoleGate>
            );
          }
          return <React.Fragment key={item.to}>{content}</React.Fragment>;
        })}
      </nav>
    </aside>
  );
}
