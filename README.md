# AuraForm — Industry-grade Typeform Competitor

Forms that feel like an experience. Built with Next.js 15, tRPC, Drizzle ORM,
better-auth and Razorpay. Deployed on Vercel + Railway.

---

## Live Demo

| Resource            | URL                                              |
|---------------------|--------------------------------------------------|
| Web application     | https://auraform.vercel.app                     |
| API server          | https://api.auraform.app                        |
| API documentation   | https://api.auraform.app/docs                   |
| OpenAPI JSON        | https://api.auraform.app/openapi.json           |

### Demo credentials

| Field    | Value                   |
|----------|-------------------------|
| Email    | `demo@auraform.app`    |
| Password | `Demo1234!`             |

### Test payment credentials (Razorpay test mode)

| Method    | Details                                              |
|-----------|------------------------------------------------------|
| Card      | `4111 1111 1111 1111` — any CVV — any future date   |
| UPI       | `success@razorpay`                                   |
| Netbanking| Select any bank — use test credentials               |

---

## What is AuraForm?

AuraForm is an India-first, open-source Typeform competitor that makes
form-filling feel like an experience. Key differentiators:

- **Cinematic themes** — 20+ themes including Netflix, WhatsApp, Pink City Jaipur,
  Anime Dark, Discord, macOS, Spotify and more
- **One-question-at-a-time** — full-screen Typeform-style UX with keyboard navigation,
  smooth framer-motion transitions and a progress bar
- **India-first payments** — Razorpay integration for Pro (₹499/mo) and Team (₹1499/mo)
  plans. UPI, cards and netbanking supported
- **Real-time analytics** — completion rate, daily response chart, avg time,
  per-question drop-off
- **QR code sharing** — every published form gets a QR code you can download
  or share via WhatsApp and Twitter
- **CSV export** — one-click download of all responses as a spreadsheet
- **Custom slugs** — `auraform.app/f/your-brand-name`
- **Email notifications** — Resend + React Email templates for creator alerts
  and respondent confirmations
- **Rate limiting + security** — IP hashing, honeypot bot trap, HMAC-verified
  payments, Helmet security headers

---

## Tech Stack

| Layer            | Technology                                                   |
|------------------|--------------------------------------------------------------|
| Monorepo         | Turborepo + pnpm workspaces                                  |
| Frontend         | Next.js 15 (App Router) + React 19 + Tailwind CSS v4        |
| Backend          | Express 5 + tRPC v11                                         |
| Auth             | better-auth (email + Google OAuth)                           |
| Database         | Drizzle ORM + Neon Postgres (serverless)                     |
| Validation       | Zod v4 (shared schemas in `packages/schemas`)                |
| Payments         | Razorpay (Indian gateway — UPI, cards, netbanking)           |
| Email            | Resend + React Email                                         |
| UI               | shadcn/ui (new-york) + react-icons + framer-motion           |
| API Docs         | Scalar (OpenAPI 3.0)                                         |
| Icons            | react-icons (Remix Icons, Tabler Icons, Simple Icons)        |
| State            | Zustand + Immer (form builder) + TanStack Query              |
| Drag and drop    | @dnd-kit/sortable                                            |
| Charts           | Recharts                                                     |
| QR codes         | qrcode.react                                                 |
| Animations       | framer-motion + tw-animate-css                               |
| Deployment       | Vercel (web) + Railway (API)                                 |

---

## Architecture

```
auraform/
├── apps/
│   ├── api/              ← Express + tRPC backend (port 8000)
│   │   └── src/
│   │       ├── env.ts
│   │       ├── index.ts
│   │       └── server.ts  ← Security middleware, rate limiting, Scalar docs
│   └── web/              ← Next.js 15 App Router (port 3000)
│       ├── app/
│       │   ├── (marketing)/   ← Landing, pricing, explore pages
│       │   ├── (auth)/        ← Login, register
│       │   ├── (dashboard)/   ← Creator dashboard (protected)
│       │   └── f/[slug]/      ← Public form filler (no auth)
│       ├── components/
│       │   ├── builder/       ← Form builder canvas, panels, preview
│       │   ├── dashboard/     ← QR modal, forms list
│       │   ├── filler/        ← Typeform-style filler components
│       │   └── marketing/     ← Landing page sections
│       └── stores/            ← Zustand stores (form builder state)
└── packages/
    ├── database/         ← Drizzle ORM schema, migrations, seed script
    │   └── models/       ← users, forms, form_fields, responses, subscriptions
    ├── trpc/             ← Shared tRPC router, context, auth
    │   └── server/
    │       ├── auth.ts        ← better-auth configuration
    │       ├── context.ts     ← Request context with user session
    │       ├── trpc.ts        ← publicProcedure, protectedProcedure, proProcedure
    │       └── routes/        ← forms, fields, responses, themes, payments
    ├── schemas/          ← Shared Zod schemas (used by API and web)
    ├── email/            ← React Email templates + Resend senders
    ├── services/         ← Google OAuth client
    └── logger/           ← Shared logger
```

---

## Local Setup (5 minutes)

### Prerequisites

- Node.js 20+
- pnpm 9+
- A Neon Postgres database (free at neon.tech)
- A Resend account (free at resend.com — 3000 emails/month)
- A Razorpay test account (free at razorpay.com)
- Google OAuth credentials (console.cloud.google.com)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/auraform.git
cd auraform
pnpm install
```

### 2. Configure environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and fill in:

```bash
# Database
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/auraform?sslmode=require"

# App URLs
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/trpc
NEXT_PUBLIC_APP_URL=http://localhost:3000

# better-auth (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET="your-32-char-secret"
BETTER_AUTH_URL=http://localhost:8000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Security
IP_HASH_SALT="your-random-salt"

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL="AuraForm <noreply@auraform.app>"

# Razorpay (use test keys)
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx
```

### 3. Run database migrations

```bash
pnpm db:generate   # generate migration files from schema
pnpm db:migrate    # apply migrations to Neon
```

### 4. Seed demo data

```bash
pnpm db:seed
```

This creates:
- Demo user: `demo@auraform.app` / `Demo1234!` (Pro plan)
- 13 predefined themes
- 5 themed published forms (Netflix, Jaipur, Anime, Startup, Discord)
- 247 realistic responses spread over the last 30 days

### 5. Start the development servers

```bash
pnpm dev
```

Open:
- Web: http://localhost:3000
- API: http://localhost:8000
- API docs: http://localhost:8000/docs

---

## Available Scripts

| Command           | Description                              |
|-------------------|------------------------------------------|
| `pnpm dev`        | Start all apps in development mode       |
| `pnpm build`      | Build all apps for production            |
| `pnpm check-types`| TypeScript type check across all packages|
| `pnpm lint`       | ESLint across all packages               |
| `pnpm db:generate`| Generate Drizzle migration files         |
| `pnpm db:migrate` | Apply migrations to database             |
| `pnpm db:seed`    | Seed demo data                           |
| `pnpm db:studio`  | Open Drizzle Studio GUI                  |

---

## API Documentation

Full interactive API documentation is available at:

**https://api.auraform.app/docs**

The API follows OpenAPI 3.0 specification. The raw spec is at:

**https://api.auraform.app/openapi.json**

### Key endpoints

| Method | Path                              | Auth     | Description                        |
|--------|-----------------------------------|----------|------------------------------------|
| POST   | `/api/forms`                      | Required | Create a new form                  |
| GET    | `/api/forms`                      | Required | List all your forms (paginated)    |
| GET    | `/api/forms/{id}`                 | Required | Get a form with all fields         |
| PATCH  | `/api/forms/{id}`                 | Required | Update form settings               |
| POST   | `/api/forms/{id}/publish`         | Required | Publish a form                     |
| POST   | `/api/forms/{id}/unpublish`       | Required | Unpublish a form                   |
| DELETE | `/api/forms/{id}`                 | Required | Delete a form                      |
| POST   | `/api/fields`                     | Required | Add a field to a form              |
| PATCH  | `/api/fields/{id}`                | Required | Update a field                     |
| POST   | `/api/fields/reorder`             | Required | Reorder fields (drag-and-drop)     |
| POST   | `/api/responses/submit`           | Public   | Submit a form response (rate-limited)|
| GET    | `/api/responses`                  | Required | List responses for a form          |
| GET    | `/api/responses/analytics/{id}`   | Required | Analytics for a form               |
| GET    | `/api/responses/export/{id}`      | Required | Export responses as CSV            |
| GET    | `/api/themes`                     | Public   | List all available themes          |
| POST   | `/api/payments/create-order`      | Required | Create Razorpay order              |
| POST   | `/api/payments/verify`            | Required | Verify and activate payment        |

### Authentication

All protected endpoints require a session cookie. Obtain it via:

```bash
curl -X POST https://api.auraform.app/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@auraform.app","password":"Demo1234!"}'
```

The response sets a `auraform.session_token` cookie automatically.

---

## Form Themes

AuraForm ships with 13 built-in themes (8 free, 5 Pro-only):

| Theme          | Category       | Pro |
|----------------|----------------|-----|
| Netflix        | Streaming      | No  |
| WhatsApp       | Social         | No  |
| Pink City Jaipur| Culture       | No  |
| Anime Dark     | Anime          | No  |
| Discord        | Gaming         | No  |
| Startup        | Startup        | No  |
| India Pride    | Culture        | No  |
| YouTube        | Streaming      | No  |
| Minimal Light  | Minimal        | No  |
| macOS          | OS             | Yes |
| Spotify        | Streaming      | Yes |
| Cyberpunk      | Gaming         | Yes |
| Windows 11     | OS             | Yes |

---

## Security

- **Passwords**: bcrypt (cost factor 12)
- **IP addresses**: SHA-256 HMAC hashed — raw IPs never stored
- **Sessions**: better-auth secure HTTP-only cookies (30-day expiry)
- **Payments**: Razorpay HMAC signature verification before any plan upgrade
- **Bot protection**: honeypot field on all public form submissions
- **Rate limiting**: 500 req/15min global, 20 submissions/hour per IP
- **Headers**: Helmet CSP, X-Frame-Options, Referrer-Policy, HSTS
- **CORS**: allowlist — only configured frontend origin

---

## Hackathon Submission

This project was submitted to the tRPC Monorepo Hackathon 2024.

**Required stack**: Turborepo, tRPC, Zod, Drizzle ORM, Scalar — all used.

**Bonus features implemented**:
- QR code sharing
- CSV export
- Custom form slugs
- Form response limit and expiry
- Password-protected forms
- Public explore page
- 13 form themes + theme gallery
- Clone form
- Razorpay payments
- React Email notifications

**GitHub**: https://github.com/your-username/auraform
**Demo**: https://auraform.vercel.app
**API Docs**: https://api.auraform.app/docs

---

## License

MIT — see LICENSE file for details.
