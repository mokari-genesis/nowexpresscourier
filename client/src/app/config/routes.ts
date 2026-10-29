/**
 * Route path constants. Use these for navigation and route definitions.
 */

export const ROUTES = {
  login: "/login",
  app: "/app",
  dashboard: "/app/dashboard",
  example: "/app/example",
  exampleDetail: (id: string) => `/app/example/${id}`,
  tickets: "/app/tickets",
  ticketNew: "/app/tickets/new",
  ticketDetail: (id: string) => `/app/tickets/${id}`,
  notFound: "*",
} as const;
