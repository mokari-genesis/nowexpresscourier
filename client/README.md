# Skeletor Vite

Production-ready Vite + React + TypeScript starter with a generic, domain-agnostic architecture. Use this repo as the foundation for any frontend app.

## Stack

- **Vite** + **React** + **TypeScript** (strict)
- **TanStack React Query** – server state
- **React Hook Form** + **Zod** + **@hookform/resolvers** – forms
- **React Router v6** – routing, nested routes, guards
- **shadcn/ui** + **Tailwind CSS** – UI
- **Vitest** + **React Testing Library** + **jsdom** – tests
- **ESLint** + **Prettier** – code quality

Data fetching uses **native fetch** (no axios). No MSW; repositories can use in-memory data or static JSON and return Promises.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign in with any email/password and a role (template auth; state in localStorage).

## Scripts

| Script                 | Description                |
| ---------------------- | -------------------------- |
| `npm run dev`          | Start dev server           |
| `npm run build`        | Production build           |
| `npm run preview`      | Preview production build   |
| `npm run typecheck`    | TypeScript check (no emit) |
| `npm run lint`         | ESLint                     |
| `npm run format`       | Prettier (write)           |
| `npm run format:check` | Prettier (check)           |
| `npm run test`         | Vitest (watch)             |
| `npm run test:run`     | Vitest (single run)        |

## Project structure

The codebase is **domain-agnostic** and organized by responsibility. Use this layout as the default for new code.

### Directory tree

```
src/
├── app/                          # App shell, routing, global config
│   ├── config/                   # Centralized config (env, routes, roles)
│   │   ├── env.ts                # Vite env access (e.g. VITE_API_BASE_URL)
│   │   ├── routes.ts             # Route path constants (ROUTES.*)
│   │   └── roles.ts              # Role enum + type (ADMIN, USER, READONLY)
│   ├── layout/                   # Shell UI used by protected routes
│   │   ├── AppShell.tsx          # Sidebar + Topbar + <Outlet />
│   │   ├── Sidebar.tsx           # Nav links, role-based visibility, collapsible
│   │   ├── Topbar.tsx            # User menu, logout
│   │   ├── NotFoundPage.tsx      # 404
│   │   └── ErrorBoundaryFallback.tsx
│   ├── providers/                # Global providers (wiring only)
│   │   └── AuthTokenProvider.tsx  # Injects auth token into HTTP client
│   └── router/
│       ├── routes.tsx            # createBrowserRouter, route definitions
│       ├── ProtectedRoute.tsx    # Redirects unauthenticated → /login
│       └── RoleGate.tsx          # Renders children only if user has allowed role
│
├── shared/                       # Reusable across features (no business logic)
│   ├── ui/                       # shadcn-style primitives (Button, Card, Input, …)
│   ├── components/               # Generic UI: PageHeader, EmptyState, LoadingState
│   │   └── form/                 # RHF + Zod form helpers
│   │       ├── Form.tsx          # FormProvider wrapper + submit
│   │       ├── FormField.tsx     # Label + error + helper text
│   │       ├── TextInputField.tsx
│   │       ├── TextareaField.tsx
│   │       └── SelectField.tsx
│   ├── hooks/                    # useDebounce, useLocalStorage, useQueryParams, useToast
│   ├── utils/                    # cn(), formatters, validators
│   └── types/                    # Shared TS types (e.g. example item shape)
│
├── features/                     # One folder per feature (domain slice)
│   ├── auth/
│   │   ├── context/              # AuthContext (user, role, login, logout)
│   │   └── pages/                # LoginPage
│   ├── dashboard/
│   │   └── pages/                # DashboardPage
│   └── example/                  # Example CRUD feature (reference implementation)
│       ├── api/                  # React Query: keys + hooks
│       │   ├── queryKeys.ts
│       │   └── useExampleQueries.ts
│       ├── components/           # ExampleCreateDialog, etc.
│       ├── pages/                # ExampleListPage, ExampleDetailPage
│       └── schemas/              # Zod schemas (exampleFormSchema)
│
├── services/                     # Data access (no React)
│   ├── http/                     # Fetch wrapper (baseUrl, JSON, ApiError, auth token)
│   │   └── client.ts
│   └── repositories/             # Promise-based APIs (in-memory, JSON, or HTTP)
│       └── exampleRepo.ts        # listExamples, getExample, createExample, updateExample
│
├── main.tsx
├── index.css
└── vite-env.d.ts

tests/
├── setupTests.ts                 # Imports @testing-library/jest-dom
└── helpers/
    └── renderWithProviders.tsx   # QueryClient + AuthProvider + Router
```

### Where things go

| Layer         | Purpose                                                                                                                                             | Examples                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **app/**      | Bootstrap, routing, layout, and app-wide config. No feature logic.                                                                                  | Route definitions, ProtectedRoute, AppShell, ROUTES, ROLES, env |
| **shared/**   | UI primitives, generic components, hooks, and utils used by multiple features. No domain types or API calls.                                        | Button, PageHeader, Form, useDebounce, cn, shared types         |
| **features/** | One folder per feature. Pages, feature-specific components, hooks, Zod schemas, and (if needed) an `api/` subfolder for React Query keys and hooks. | auth, dashboard, example (pages, components, schemas, api/)     |
| **services/** | Data access only: HTTP client and repositories. No React, no UI. Called from feature `api/` hooks or (rarely) from pages.                           | client.ts, exampleRepo.ts                                       |
| **tests/**    | Global test setup and helpers (e.g. renderWithProviders). Feature tests can live next to source (e.g. `ProtectedRoute.test.tsx`) or under `tests/`. | setupTests.ts, helpers/                                         |

### Feature folder pattern

For a new feature (e.g. `orders`), add under `src/features/orders/`:

- **pages/** – Route-level components (e.g. `OrderListPage.tsx`, `OrderDetailPage.tsx`).
- **components/** – Feature-specific UI (dialogs, cards, tables).
- **hooks/** – Feature-specific hooks (optional).
- **schemas/** – Zod schemas for forms and validation.
- **api/** – Only if the feature has server state: `queryKeys.ts` and `useXxxQueries.ts` (or similar) that call repositories or the HTTP client.

Keep **shared** for things used by more than one feature; keep **services** for fetch/repositories only.

---

## How to add a route / page

1. **Define the path** in `src/app/config/routes.ts` (e.g. `myFeature: "/app/my-feature"`).
2. **Create the page** under `src/features/<feature>/pages/` (e.g. `MyFeaturePage.tsx`).
3. **Register the route** in `src/app/router/routes.tsx`:
   - For a **protected** route under the app shell, add a child of the `/app` route:
     ```tsx
     { path: "my-feature", element: <MyFeaturePage /> }
     ```
   - For a **public** route, add a new top-level route with `path` and `element`.
4. **Optional:** Add a nav link in `src/app/layout/Sidebar.tsx` (and use `RoleGate` if the link is role-restricted).

---

## How to add a feature

1. Create a folder under `src/features/<featureName>/` with **pages/**, **components/**, **hooks/** (optional), **schemas/**, and **api/** (only if the feature has server state).
2. Keep **shared** types in `src/shared/types/`; feature-only types can live next to the feature.
3. Call **repositories** or the **http client** from `src/services/` inside feature `api/` hooks; avoid calling them directly from pages when you want cache/invalidation.

---

## React Query and repositories

- **Repositories** (`src/services/repositories/`) expose Promise-based functions (e.g. `listExamples`, `getExample`, `createExample`). They can use in-memory data, static JSON, or the **http client** (`src/services/http/client.ts`).
- **Query keys** live in `features/<feature>/api/queryKeys.ts` and follow a small hierarchy (e.g. `all`, `lists`, `list(params)`, `details`, `detail(id)`).
- **Hooks** in `features/<feature>/api/` use `useQuery` / `useMutation` and call the repository. On success, mutations **invalidate** the relevant query keys so lists and details stay in sync.
- The **http client** uses `VITE_API_BASE_URL`, sends JSON, and can attach an auth token via `setAuthTokenGetter` (wired in `AuthTokenProvider`).

---

## Forms (React Hook Form + Zod)

- Use **react-hook-form** as the only form solution.
- Validate with **Zod** and **@hookform/resolvers/zod**:
  ```ts
  import { zodResolver } from "@hookform/resolvers/zod";
  const form = useForm<MyValues>({
    resolver: zodResolver(mySchema),
    defaultValues: { ... },
  });
  ```
- Use the shared **Form** and field components from `src/shared/components/form/`:
  - **Form** – wraps `FormProvider` and handles `onSubmit`.
  - **TextInputField**, **TextareaField**, **SelectField** – use `FormField` + `FormFieldWrapper` for label, error, and helper text.
- **UX rules:** Disable submit while submitting; show Zod field errors; toast on success and inline or toast on failure; set `defaultValues` and `reset` when opening/closing dialogs.

---

## Testing

- **Setup:** `tests/setupTests.ts` imports `@testing-library/jest-dom`. Vitest is configured with `globals: true`, `environment: "jsdom"`, and the same path alias `@/` as the app.
- **Helpers:** `tests/helpers/renderWithProviders.tsx` provides `renderWithProviders(ui, { initialRoute, queryClient })` with `QueryClientProvider`, `AuthProvider`, and `BrowserRouter` / `MemoryRouter`.
- **Patterns:**
  - Mock `@/features/auth/context/AuthContext` (e.g. `useAuth`) for auth-dependent behavior.
  - Mock repositories (e.g. `exampleRepo.listExamples`) to control data and assert calls.
  - Use `initialRoute` for route-dependent tests; assert redirects by checking that protected content is not in the document.
- Run: `npm run test` (watch) or `npm run test:run` (single run).

---

## Environment variables

- All env keys are **Vite** env: prefix with `VITE_` to expose them to the client.
- Declare types in `src/vite-env.d.ts` and read via `import.meta.env.VITE_*`.
- Centralize access in `src/app/config/env.ts` (e.g. `env.apiBaseUrl`) so the rest of the app does not touch `import.meta.env` directly.

---

## Naming conventions

- **Components / pages:** PascalCase (e.g. `ExampleListPage`, `ExampleCreateDialog`).
- **Hooks:** `use` prefix (e.g. `useExampleListQuery`, `useDebounce`).
- **Files:** PascalCase for components/pages, camelCase for utilities/hooks (e.g. `useExampleQueries.ts`, `exampleRepo.ts`).
- **Routes:** constants in `ROUTES`; paths are kebab-style under `/app` (e.g. `/app/example`, `/app/example/:id`).
- **Query keys:** factory object (e.g. `exampleKeys.list(params)`) for type-safe, consistent keys.

---

## Auth (template)

- **AuthContext** exposes `user`, `role`, `isAuthenticated`, plus `login` / `logout`. State is persisted in `localStorage` for the template.
- **ProtectedRoute** redirects unauthenticated users to `/login`.
- **RoleGate** renders children only when the user has one of the allowed roles (e.g. `ADMIN`). Use it for nav items or sections that are role-restricted.
- Roles are generic and extendable in `src/app/config/roles.ts` (e.g. `ADMIN`, `USER`, `READONLY`).

---

## Quality bar

After `npm install`, the following must succeed:

- `npm run typecheck`
- `npm run lint`
- `npm run test:run`
