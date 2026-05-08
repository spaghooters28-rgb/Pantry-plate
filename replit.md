# Pantry & Plate

A full-stack meal planning app with meal discovery, weekly planning, a smart grocery list, pantry tracking, and scheduled recurring groceries.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/meal-planner run dev` — run the React frontend (port 23479, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + TailwindCSS v4 + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-spec/orval.config.ts` — Orval config (mode: single, no schemas option)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks (never edit manually)
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas for server-side validation
- `lib/db/src/schema/` — Drizzle table definitions (meals, ingredients, sides, grocery, pantry, schedule, weekly)
- `artifacts/api-server/src/routes/` — Express route handlers (meals, weekly, grocery, pantry, schedule)
- `artifacts/meal-planner/src/pages/` — React pages (Discover, WeeklyPlan, GroceryList, Pantry, ScheduledItems)
- `artifacts/meal-planner/src/components/layout/AppLayout.tsx` — sidebar + mobile nav layout

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → type-safe hooks and validators; never write API client code by hand
- All DB operations go through Drizzle ORM; raw SQL is avoided
- Paths are not rewritten by the proxy — the API server must handle `/api` prefix itself
- Orval zod output uses `mode: "single"` (not "split") to avoid barrel export issues
- `lib/api-zod/src/index.ts` must only contain `export * from "./generated/api"` (single line)

## Product

- **Discover**: Browse 15+ meals filterable by cuisine, protein type, and gluten-free. Click any meal to see pantry check (what you have vs. what to buy), suggested sides, and add to grocery list.
- **Weekly Plan**: Auto-generate a 7-day meal plan. Swap individual days. Add the entire week's meals to your grocery list in one click. Shows calorie avg per day.
- **Grocery List**: Items grouped by category (Produce, Dairy, Pantry, etc.) with progress bar. Check off items, add custom items (with optional recurring schedule), delete, and clear checked. Smart suggestions based on depleted pantry items.
- **Pantry**: Track 17+ pantry staples with in-stock/depleted toggle. Color-coded status bar. Depleted items prompt grocery suggestions. Shows which meals use each ingredient. Add/delete items.
- **Scheduled Items**: Set up recurring auto-add reminders (weekly, biweekly, every other day, custom interval). Pause/resume/delete. Due items shown with "Add Now" button.

## Seeded Data

- 15 meals across American, Mexican, Asian, Indian, Italian, Mediterranean cuisines
- Ingredients for all meals (120+ items)
- Sides for all meals (32 sides)
- 17 pantry items (16 in stock, 1 depleted — Basil)
- 5 scheduled items (Milk, Eggs, Bread, Greek Yogurt, Bananas)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT run `pnpm dev` at workspace root; use workflow restart instead
- `useListCuisines`/`useListProteins` ARE generated — they exist in the client
- Weekly plan generate = `POST /api/weekly-plan` (not `/api/weekly-plan/generate`)
- API day names are lowercase (`monday`, not `Monday`) — handle in frontend display
- The Orval config must NOT have a `schemas` option at the top level — only inside `output`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
