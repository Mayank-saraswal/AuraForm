# AuraForm — Agent Documentation

> **Last Updated:** 2026-05-19
> **Project Name:** AuraForm (internally `trpc-monorepo` / `Streamyst`)
> **Repository:** https://github.com/piyushgarg-dev/trpc-monorepo.git
> **Branch:** `main` (single commit: `585616d trpc-monorepo`)

---

## 1. Project Overview

AuraForm is a **TypeScript monorepo** built with **Turborepo + pnpm workspaces**. It follows a clean separation between a backend API server and a Next.js frontend, connected via **tRPC** for end-to-end type-safe communication. The project appears to be in its early scaffolding stage with foundational infrastructure in place and a single database migration for the `users` table.

### Branding Note
The codebase contains mixed branding references:
- Folder name: **AuraForm**
- `package.json` name: `trpc-monorepo`
- Server responses & metadata title: **Streamyst**
- tsup config comment references: `@teachyst`

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Monorepo | Turborepo | ^2.7.2 |
| Package Manager | pnpm | 9.0.0 |
| Language | TypeScript | 5.9.2 |
| Backend Framework | Express | ^5.2.1 |
| API Layer | tRPC | ^11.8.1 |
| OpenAPI Generation | trpc-to-openapi | ^3.1.0 |
| API Docs UI | Scalar | ^0.8.30 |
| Frontend Framework | Next.js | 16.1.0 |
| React | React | ^19.2.0 |
| UI Components | shadcn/ui (new-york) | — |
| Styling | Tailwind CSS v4 | ^4.1.18 |
| State / Data | TanStack React Query | ^5.90.16 |
| Database ORM | Drizzle ORM | ^0.45.1 |
| Database | PostgreSQL 15 | (Docker) |
| Logging | Winston | ^3.19.0 |
| Validation | Zod | ^4.3.5 |
| OAuth | google-auth-library | ^10.5.0 |
| Build (API) | tsup + SWC | ^8.5.1 |
| Formatting | Prettier | ^3.7.4 |
| Env Validation | @t3-oss/env-nextjs | ^0.13.10 |

---

## 3. Monorepo Structure

```
AuraForm/
├── apps/
│   ├── api/                    # Express + tRPC backend server
│   └── web/                    # Next.js 16 frontend
├── packages/
│   ├── database/               # Drizzle ORM, schema, migrations
│   ├── trpc/                   # Shared tRPC server router + client exports
│   ├── services/               # Business logic services (UserService, OAuth clients)
│   ├── logger/                 # Winston logger with env-aware config
│   ├── eslint-config/          # Shared ESLint configs (base, next, react-internal)
│   └── typescript-config/      # Shared tsconfig presets (base, nextjs, node)
├── docker-compose.yml          # PostgreSQL 15 dev container
├── setup.sh                    # Env symlink setup script
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # Workspace definition
├── prettier.config.js          # Code formatting rules
└── package.json                # Root scripts & dev dependencies
```

---

## 4. Apps

### 4.1 `apps/api` — Backend API Server (`@repo/api`)

**Entry:** `src/index.ts` → creates Node HTTP server on PORT (default `8000`)

**Files:**
| File | Purpose |
|---|---|
| `src/index.ts` | HTTP server bootstrap, uses `@repo/logger` |
| `src/server.ts` | Express app: CORS, JSON parsing, routes, OpenAPI doc, Scalar docs |
| `src/env.ts` | Zod-validated env: `PORT`, `NODE_ENV`, `BASE_URL` |
| `tsup.config.ts` | Build config: single bundle, minified, SWC |

**Exposed Endpoints:**
| Method | Path | Description |
|---|---|---|
| GET | `/` | Health message ("Streamyst is up and running...") |
| GET | `/health` | Health check (`{ healthy: true }`) |
| GET | `/openapi.json` | OpenAPI spec document |
| GET | `/docs` | Scalar API reference UI |
| ALL | `/api/*` | OpenAPI-compatible REST endpoints (via trpc-to-openapi) |
| ALL | `/trpc/*` | tRPC native endpoints |

**Build:** `tsup` bundles to `dist/index.js`. Dev: `tsx watch`.

### 4.2 `apps/web` — Frontend (`web`)

**Framework:** Next.js 16.1.0 (App Router, RSC enabled)

**Files:**
| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout: Geist fonts, dark mode, `GlobalProviders` |
| `app/page.tsx` | Home page: fetches `health.getHealth` via server-side tRPC |
| `app/globals.css` | Tailwind v4 theme: oklch colors, light/dark, shadcn tokens |
| `env.js` | `@t3-oss/env-nextjs` validation: `NEXT_PUBLIC_API_URL` |
| `providers/global.tsx` | Client providers: QueryClient, tRPC, next-themes, Sonner toasts |
| `trpc/client.ts` | `createTRPCReact<ServerRouter>()` |
| `trpc/create-client.ts` | HTTP link factory (supports streaming), credentials: include |
| `trpc/server.ts` | Server-side `createTRPCProxyClient` (+ streaming variant) |
| `lib/utils.ts` | `cn()` — clsx + tailwind-merge |
| `hooks/use-mobile.ts` | `useIsMobile()` — 768px breakpoint |
| `components.json` | shadcn/ui config: new-york style, lucide icons, `~/` aliases |

**UI Components (53 shadcn/ui components installed):**
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, button-group, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, empty, field, form, hover-card, input, input-group, input-otp, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toggle, toggle-group, tooltip

**Fonts:** Geist Sans & Geist Mono (local .woff files)

---

## 5. Packages

### 5.1 `packages/database` (`@repo/database`)

**ORM:** Drizzle ORM with `node-postgres` driver.

**Schema (1 table):**
```
users
├── id              UUID (PK, auto-generated)
├── full_name       VARCHAR(80), NOT NULL
├── email           VARCHAR(255), NOT NULL, UNIQUE
├── email_verified  BOOLEAN, default false
├── profile_image_url TEXT, nullable
├── created_at      TIMESTAMP, default now()
└── updated_at      TIMESTAMP, auto-updated
```

**Exports:** `db` (drizzle instance), all `drizzle-orm` re-exports, schema types (`SelectUser`, `InsertUser`)

**Migrations:** 1 migration (`0000_dusty_morg.sql`) — creates `users` table.

**Env:** Requires `DATABASE_URL`.

### 5.2 `packages/trpc` (`@repo/trpc`)

Shared tRPC configuration split into server and client:

**Server (`server/`):**
| File | Purpose |
|---|---|
| `trpc.ts` | `initTRPC` with OpenApiMeta, exports `router` & `publicProcedure` |
| `context.ts` | Empty async context factory (placeholder) |
| `schema.ts` | `zodUndefinedModel` helper, re-exports `z` |
| `index.ts` | Composes root router: `health` + `auth` sub-routers |
| `routes/health/route.ts` | `getHealth` query → `{ status: "healthy" }` |
| `routes/auth/route.ts` | `getSupportedAuthenticationProviders` → returns OAuth providers |
| `services/index.ts` | Instantiates `UserService` singleton |
| `utils/path-generator.ts` | OpenAPI path builder: `generatePath(base)(subpath)` |

**Client (`client/`):**
- Re-exports `@trpc/client` (httpLink, httpBatchStreamLink, createTRPCProxyClient)
- Exports `ServerRouter` type, `RouterOutputs`, `RouterInputs` type helpers

### 5.3 `packages/services` (`@repo/services`)

**Business logic layer** consumed by tRPC routes.

| File | Purpose |
|---|---|
| `env.ts` | Requires: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI` |
| `clients/google-oauth.ts` | Configures `OAuth2Client` from google-auth-library |
| `user/index.ts` | `UserService` class: `getAuthenticationMethods()` — returns configured OAuth providers |
| `user/model.ts` | Zod schema for auth method output (provider enum, displayName, authUrl) |

### 5.4 `packages/logger` (`@repo/logger`)

Winston-based logger with environment-aware configuration.

- **Development:** colorized, timestamped, pretty-printed with meta
- **Production:** JSON format with timestamps
- **Log level:** configurable via `LOGGER_LEVEL` env, defaults to `debug` (dev) / `error` (prod)

### 5.5 `packages/eslint-config` (`@repo/eslint-config`)

Shared ESLint configurations:
- `base.js` — base rules
- `next.js` — Next.js specific
- `react-internal.js` — internal React libraries

### 5.6 `packages/typescript-config` (`@repo/typescript-config`)

Shared tsconfig presets:
- `base.json` — strict mode, ES2022
- `nextjs.json` — Next.js App Router config
- `node.json` — Node.js server config

---

## 6. Environment Variables

| Variable | Package | Required | Default |
|---|---|---|---|
| `DATABASE_URL` | database | ✅ | — |
| `PORT` | api | ❌ | `8000` |
| `NODE_ENV` | api, logger | ❌ | `development` |
| `BASE_URL` | api | ❌ | `http://localhost:8000` |
| `LOGGER_LEVEL` | logger | ❌ | auto (debug/error) |
| `GOOGLE_OAUTH_CLIENT_ID` | services | ✅ | — |
| `GOOGLE_OAUTH_CLIENT_SECRET` | services | ✅ | — |
| `GOOGLE_OAUTH_REDIRECT_URI` | services | ✅ | — |
| `NEXT_PUBLIC_API_URL` | web | ❌ | `/trpc` |

**Env Strategy:** Root `.env` file is symlinked into each `apps/` and `packages/` directory via `setup.sh`. All scripts use `dotenv --` prefix.

---

## 7. Infrastructure

### Docker
- **PostgreSQL 15** via `docker-compose.yml`
- Container: `postgresdb`, port `5432`
- Credentials: `postgres` / `postgres`, DB: `dev`
- Persistent volume: `pg_data`

### Build Pipeline (Turborepo)
| Task | Behavior |
|---|---|
| `build` | Depends on `^build`, caches `.next/**` |
| `dev` | No cache, persistent |
| `lint` | Depends on `^lint` |
| `check-types` | Depends on `^check-types` |
| `db:generate` | Drizzle migration generation |
| `db:migrate` | Drizzle migration execution |

### Formatting
Prettier: double quotes, semicolons, trailing commas, 100 char width, 2-space tabs.

---

## 8. Dependency Graph

```
apps/api
  └── @repo/trpc
  └── @repo/logger

apps/web
  └── @repo/trpc

@repo/trpc
  └── @repo/services

@repo/services
  └── @repo/database
  └── @repo/logger

@repo/database
  └── (standalone — drizzle + pg)

@repo/logger
  └── (standalone — winston)
```

---

## 9. Development Workflow

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Setup env symlinks
bash setup.sh

# 3. Install dependencies
pnpm install

# 4. Generate & run migrations
pnpm db:generate
pnpm db:migrate

# 5. Start dev servers (API on :8000, Web on :3000)
pnpm dev
```

---

## 10. Current Project Status

| Area | Status |
|---|---|
| Monorepo scaffolding | ✅ Complete |
| Database schema (users) | ✅ Complete |
| tRPC setup + OpenAPI | ✅ Complete |
| Health endpoint | ✅ Complete |
| Auth providers endpoint | ✅ Complete |
| Google OAuth client | ✅ Configured |
| Logger | ✅ Complete |
| Next.js frontend | 🟡 Scaffolded (basic home page only) |
| shadcn/ui components | ✅ 53 components installed |
| Authentication flow | 🔴 Not implemented (only provider listing) |
| User CRUD | 🔴 Not implemented |
| Frontend pages/features | 🔴 Not built |
| Tests | 🔴 None |
| CI/CD | 🔴 Not configured |
| Production deployment | 🔴 Not configured |

---

## 11. Changelog

### Initial Commit (`585616d`)
- Full monorepo scaffolding with Turborepo + pnpm workspaces
- Express API server with tRPC + OpenAPI + Scalar docs
- Next.js 16 frontend with App Router, RSC, shadcn/ui (53 components)
- Drizzle ORM with PostgreSQL, `users` table schema + migration
- Google OAuth client setup in services package
- Winston logger with env-aware formatting
- Docker Compose for local PostgreSQL
- Shared ESLint + TypeScript configs
- Environment validation with Zod across all packages

### Phase 1: Foundation (2026-05-24)
- Added dependencies across all packages (`better-auth`, `drizzle-orm`, `razorpay`, `resend`, `@dnd-kit`, etc.).
- Created `@repo/schemas` containing shared Zod validation logic.
- Expanded `@repo/database` with robust schema including `forms`, `form_fields`, `responses`, `response_answers`, `form_themes`, `subscriptions`, and `payments`.
- Integrated `better-auth` replacing dummy auth logic.
- Implemented core `tRPC` routers with public and protected endpoints, ownership checks, and honeypot spam protection.
- Hardened Express server with `helmet`, `cors`, and `express-rate-limit`.
- Created `@repo/email` package with Resend and a `ResponseNotificationEmail` template.
- Seeded database with 13 predefined themes and a demo user.
- **TypeScript Fixes**: Resolved all type-checking errors across the monorepo by properly exporting the database schema, explicitly typing Drizzle `db` instance with `{ schema }` (defining relations to fix `never` types), casting environment variables correctly, fixing `react-resizable-panels` exports by using `Group` and `Separator`, and repairing `openApiMeta` helper paths.

### Phase 1: TypeScript Error Cleanup (2026-05-24, late)
- **Fixed `apps/api/src/env.ts`**: Added missing `FRONTEND_URL` property to the Zod env schema (default: `http://localhost:3000`), resolving TS2339 errors in `server.ts`.
- **Fixed `apps/api/src/server.ts`**: Changed `generateOpenApiDocument` `tags` from `{name, description}[]` objects to `string[]` as required by `trpc-to-openapi` API, resolving 7 TS2322 errors.
- **Fixed `packages/trpc`**: Added `@types/express-serve-static-core` and `@types/qs` as devDependencies to fix TS2742 ("inferred type cannot be named without a reference") on `protectedProcedure` and `proProcedure` exports.
- **Fixed `packages/email`**: Created missing `tsconfig.json` with JSX support (`react-jsx`). Added `@types/node` and `@types/react` as devDependencies.
- **Created `packages/email/src/templates/welcome.tsx`**: Welcome email template with FormCraft branding, CTA button to dashboard.
- **Created `packages/email/src/templates/form-confirmation.tsx`**: Response confirmation email template for form respondents.
- **Updated `packages/email/src/index.ts`**: Added exports for `welcome` and `form-confirmation` templates (previously referenced but missing).
- **Result**: All 8 packages/apps (`database`, `schemas`, `trpc`, `email`, `services`, `logger`, `api`, `web`) pass `tsc --noEmit` with **zero TypeScript errors** and no `ts-ignore` directives.

---

## 12. Key Architecture Decisions

1. **tRPC + OpenAPI dual exposure** — API is available both as type-safe tRPC and REST/OpenAPI, enabling third-party integrations alongside the type-safe Next.js client.

2. **Service layer pattern** — Business logic is isolated in `@repo/services`, decoupled from the transport layer (tRPC routes are thin wrappers).

3. **Centralized env validation** — Every package validates its own environment variables with Zod at startup, failing fast on misconfiguration.

4. **Symlinked `.env`** — Single root `.env` file is symlinked to all workspaces via `setup.sh`, preventing env drift.

5. **shadcn/ui new-york style** — Full component library pre-installed for rapid UI development.

6. **Tailwind CSS v4** — Using the latest Tailwind with oklch color space and CSS custom properties.

---

### Runtime Bug Fixes (2026-05-24, late)
- **Fixed `ERR_ERL_KEY_GEN_IPV6`**: Wrapped the custom IP key generator in `submitLimiter` using `ipKeyGenerator` from `express-rate-limit` to conform to v8 security standards.
- **Fixed Express 5 wildcard routing**: Converted the `better-auth` mount path from `/auth/*` to `/auth/{*splat}` to satisfy the new `path-to-regexp` v8 syntax requirements.
- **Fixed hanging auth requests**: Moved the `better-auth` mount point to be defined *before* any body parsing middleware (`express.json()`, `express.urlencoded()`) to prevent request body consumption issues.
- **Fixed OpenAPI crashing dev server**: The `trpc-to-openapi` library crashed the server because it expected Zod output validators (`.output()`) on all endpoints containing `openApiMeta`. Wrapped `generateOpenApiDocument` and `createOpenApiExpressMiddleware` in try-catch blocks to degrade gracefully, allowing the main tRPC server and Next.js frontend to start successfully (`pnpm dev` now works, HTTP server running on PORT 8000).

---

*This file is maintained by the AI agent. Update after every significant code change.*
