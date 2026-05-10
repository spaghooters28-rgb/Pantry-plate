# Threat Model

## Project Overview

Pantry & Plate is a full-stack meal-planning application with a React SPA frontend and an Express API backed by PostgreSQL via Drizzle ORM. Users can register/login, manage pantry and grocery data, generate weekly meal plans, and use AI-powered recipe ingestion and chat features. Some authenticated AI and recipe flows currently write into a shared meal catalog consumed by all users, so the boundary between per-user actions and global application data is security-sensitive. Production scope is `artifacts/api-server`, `artifacts/meal-planner`, and shared libraries under `lib/`; `artifacts/mockup-sandbox` is development-only and should be ignored unless production reachability is demonstrated.

## Assets

- **User accounts and sessions** — usernames, password hashes, session identifiers, and the authenticated state represented by `pp_session`. Compromise enables impersonation and access to all per-user planning data.
- **User meal-planning data** — pantry items, grocery lists, scheduled items, weekly plans, recipe history, and favorites. This data is user-specific and must not be readable or mutable across accounts.
- **Persisted AI conversation content** — chat histories and model outputs stored in the database. These may reveal private preferences, meal habits, or other user-entered content.
- **Application-backed AI spend and availability** — OpenAI-backed generation, chat streaming, and recipe analysis endpoints consume provider quota and server resources. Abuse can raise cost or degrade service.
- **Database integrity** — meals, ingredients, sides, and shared catalog data. Unauthorized or overly broad writes can poison recommendations and corrupt other users' application state.
- **Application secrets** — `DATABASE_URL`, `SESSION_SECRET`, and OpenAI credentials accessed server-side.

## Trust Boundaries

- **Browser to API** — all user input reaches the system through the Express API; the browser is untrusted.
- **API to PostgreSQL** — the API has broad database access. Missing authorization at the route layer becomes direct unauthorized data access or tampering.
- **API to OpenAI** — model calls are privileged server-side actions that spend money and can persist untrusted model output.
- **API to arbitrary remote URLs** — `/api/meals/analyze-recipe` fetches user-supplied URLs from the server. This crosses from untrusted user input into outbound network access.
- **Unauthenticated to authenticated surfaces** — some routes are public while pantry/grocery/history/planning data is intended to be per-user. This boundary must be enforced server-side.
- **Production to dev-only artifacts** — `artifacts/mockup-sandbox` is not part of the production deployment surface under the current assumptions.

## Scan Anchors

- **Production entry points**: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/meal-planner/src/main.tsx`.
- **Highest-risk API areas**: `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/routes/openai/index.ts`, `artifacts/api-server/src/routes/analyze-recipe.ts`, `artifacts/api-server/src/routes/ai-meals.ts`, and authenticated CRUD routes under `grocery.ts`, `pantry.ts`, `history.ts`, `schedule.ts`, and `weekly.ts`.
- **Public surfaces**: health, auth, meal listing/detail, and any route mounted before `requireAuth`; AI meal generation, recipe analysis/save, and OpenAI conversation routes are high-impact even when authenticated because they spend money or touch shared data.
- **Authenticated surfaces**: weekly plan, grocery, pantry, schedule, preferences, history, favorites toggling.
- **Dev-only area to usually ignore**: `artifacts/mockup-sandbox/**`.

## Threat Categories

### Spoofing

Session-based authentication is the sole identity control for protected routes. The API must require a valid session for every route that reads or mutates user-specific data, and route handlers must not rely on frontend gating for protection. Public auth endpoints must also resist login CSRF, credential stuffing, and account farming because a forged or weakly protected login flow can bind a victim browser to an attacker-controlled account before any protected route is reached. Session secrets must be strong and unique in production; development fallbacks must never be used for deployed environments.

### Tampering

Users can create and modify pantry, grocery, schedule, weekly-plan, and recipe data. The server must enforce ownership on every update and delete, derive sensitive relationships from the authenticated user rather than request parameters, and treat AI-generated content as untrusted input before persisting it into shared tables. Shared catalog tables such as meals, ingredients, and sides must not be directly writable by ordinary users unless the data is explicitly scoped to that user or gated by moderation/approval controls.

### Information Disclosure

Per-user planning data and persisted AI conversations must be scoped to the authenticated user on every read. Public routes must not expose private chat histories or other user-owned records by predictable numeric IDs. Error handling and logs must avoid leaking secrets, cookies, or full upstream content from fetched URLs.

### Denial of Service

OpenAI-backed streaming endpoints and server-side fetch functionality are materially more expensive than normal CRUD routes. Public access to those endpoints, missing per-user quotas, or unrestricted outbound fetches can be abused to consume provider quota, tie up workers, or amplify network activity. Expensive routes should require authentication and have bounded input sizes and request rates, but authentication alone is not enough if anyone can self-register unlimited accounts or if throttles are process-local and reset on restart.

### Elevation of Privilege

The main privilege boundary is between one authenticated user and another, with an additional boundary between ordinary users and shared application-wide data. Every route that operates on row IDs must verify the row belongs to `req.session.userId` before returning, updating, or deleting it. AI and recipe-ingestion routes must not permit low-privilege users to create, delete, or modify persisted state that affects other users or the shared dataset without an explicit authorization or moderation boundary.
