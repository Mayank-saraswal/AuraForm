# FormCraft — Phase 4 Master Build Prompt
# Seed data, email system, API documentation, README
# Paste into Cursor / Windsurf after Phase 3 is verified working.

---

## PROGRESS TRACKER

| Phase | What was built                                              | Status   |
|-------|-------------------------------------------------------------|----------|
| 1     | DB schema, better-auth, all tRPC routers, security          | Done     |
| 2     | Full UI — landing, auth, dashboard, builder, filler,        | Done     |
|       | analytics, pricing + Razorpay, explore page                 | Done     |
| 3     | Field settings panel, preview, forms list, QR modal,        | Done     |
|       | CSV export, theme gallery, form settings drawer             | Done     |
| 4     | THIS PHASE — seed data, emails, API docs, README            | Build    |
| 5     | Deployment, conditional logic, admin, final polish          | Next     |

## PHASE 4 DELIVERABLES

1.  Full seed script — 5 themed forms with all field types, 200+ realistic responses,
    realistic analytics data, demo user with Pro plan
2.  Email templates — 3 React Email templates (response notification,
    welcome email, form submission confirmation)
3.  Resend integration — wire email sending into form submit and register flows
4.  Email router — tRPC procedures for testing email delivery
5.  Scalar API docs — final OpenAPI metadata on all routers, tags, descriptions,
    request/response examples
6.  README.md — complete, judge-ready, with demo credentials, setup guide,
    API docs link, tech stack, architecture diagram in ASCII
7.  `packages/database/seed.ts` — runnable with `pnpm db:seed`
8.  Drizzle config — add seed script to turbo pipeline

---

## ABSOLUTE RULES — SAME AS EVERY PHASE

- react-icons ONLY. Zero lucide-react. Zero emoji in JSX.
- Zod from @repo/schemas — never redefine locally.
- All TypeScript strictly typed — no `any`.
- Seed data must be deterministic — same data every time it is run.
- Email templates must be plain React Email components — no inline CSS frameworks.
- README must be copy-paste ready — judges follow it to run the project in under 5 minutes.

---

## STEP 1 — Install email dependencies

Run from the monorepo root:

```bash
# Email sending
pnpm add resend @react-email/components @react-email/render --filter @repo/api
pnpm add @react-email/components @react-email/render --filter @repo/email

# Seed script dependencies
pnpm add tsx --filter @repo/database -D
pnpm add @faker-js/faker --filter @repo/database -D
pnpm add bcryptjs --filter @repo/database
pnpm add @types/bcryptjs --filter @repo/database -D
```

Add seed script to `packages/database/package.json`:

```json
{
  "scripts": {
    "generate":  "drizzle-kit generate",
    "migrate":   "drizzle-kit migrate",
    "studio":    "drizzle-kit studio",
    "seed":      "tsx seed.ts"
  }
}
```

Add to root `package.json` scripts:

```json
{
  "scripts": {
    "db:seed": "pnpm --filter @repo/database seed"
  }
}
```

---

## STEP 2 — React Email templates

### `packages/email/src/templates/welcome.tsx`

```tsx
import {
  Body, Button, Column, Container, Head, Heading,
  Hr, Html, Img, Link, Preview, Row, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  userName:    string;
  userEmail:   string;
  dashboardUrl: string;
}

export function WelcomeEmail({ userName, userEmail, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to FormCraft — your form builder is ready</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Logo */}
          <Section style={logoSection}>
            <div style={logoBox}>
              <Text style={logoText}>F</Text>
            </div>
            <Text style={logoLabel}>FormCraft</Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={h1}>Welcome, {userName}!</Heading>
            <Text style={paragraph}>
              Your account is ready. You can now create beautiful, cinematic forms
              that your audience will actually want to fill.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Feature highlights */}
          <Section>
            <Heading style={h2}>What you can do right now</Heading>
            <Row>
              <Column style={featureCol}>
                <Text style={featureIcon}>01</Text>
                <Text style={featureTitle}>Create a form</Text>
                <Text style={featureDesc}>
                  Add questions, pick a theme, publish in minutes.
                </Text>
              </Column>
              <Column style={featureCol}>
                <Text style={featureIcon}>02</Text>
                <Text style={featureTitle}>Pick a theme</Text>
                <Text style={featureDesc}>
                  Netflix, Jaipur, Discord, Anime — 20+ themes included.
                </Text>
              </Column>
              <Column style={featureCol}>
                <Text style={featureIcon}>03</Text>
                <Text style={featureTitle}>Share and collect</Text>
                <Text style={featureDesc}>
                  Copy your link or download a QR code. Responses come in live.
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={{ textAlign: "center" as const, margin: "32px 0" }}>
            <Button href={dashboardUrl} style={ctaButton}>
              Open your dashboard
            </Button>
          </Section>

          {/* Demo credentials note */}
          <Section style={demoBox}>
            <Text style={demoTitle}>Your account details</Text>
            <Text style={demoText}>Email: {userEmail}</Text>
            <Text style={demoText}>
              Keep your password safe. You can reset it any time from the login page.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section>
            <Text style={footer}>
              You are receiving this because you created an account at{" "}
              <Link href="https://formcraft.app" style={link}>formcraft.app</Link>.
              If you did not sign up, you can ignore this email.
            </Text>
            <Text style={footer}>
              FormCraft · Jaipur, Rajasthan, India
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const body: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};
const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #e5e7eb",
};
const logoSection: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  padding: "24px 32px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};
const logoBox: React.CSSProperties = {
  width: "32px",
  height: "32px",
  backgroundColor: "#6C47FF",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const logoText: React.CSSProperties = {
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "18px",
  margin: "0",
  lineHeight: "32px",
  textAlign: "center",
};
const logoLabel: React.CSSProperties = {
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "16px",
  margin: "0 0 0 10px",
};
const heroSection: React.CSSProperties = { padding: "40px 32px 24px" };
const h1: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 12px",
  lineHeight: "1.2",
};
const h2: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#111827",
  margin: "24px 32px 16px",
};
const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4b5563",
  margin: "0",
};
const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "0 32px",
};
const featureCol: React.CSSProperties = { padding: "0 16px 0 32px", width: "33%" };
const featureIcon: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#6C47FF",
  margin: "0 0 4px",
  letterSpacing: "2px",
};
const featureTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#111827",
  margin: "0 0 4px",
};
const featureDesc: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "0",
  lineHeight: "1.5",
};
const ctaButton: React.CSSProperties = {
  backgroundColor: "#6C47FF",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "15px",
  textDecoration: "none",
  display: "inline-block",
};
const demoBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px 32px",
  margin: "0 32px 24px",
  border: "1px solid #e5e7eb",
};
const demoTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
  margin: "0 0 8px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const demoText: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "0 0 4px",
  fontFamily: "monospace",
};
const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center",
  padding: "0 32px 24px",
  margin: "0",
  lineHeight: "1.6",
};
const link: React.CSSProperties = { color: "#6C47FF", textDecoration: "none" };
```

### `packages/email/src/templates/response-notification.tsx`

```tsx
import {
  Body, Button, Container, Head, Heading, Hr,
  Html, Preview, Section, Text, Row, Column,
} from "@react-email/components";
import * as React from "react";

interface ResponseNotificationProps {
  creatorName:    string;
  formTitle:      string;
  responseCount:  number;
  completionRate: number;
  responseUrl:    string;
  answers:        Array<{ question: string; answer: string }>;
  submittedAt:    string;
}

export function ResponseNotificationEmail({
  creatorName,
  formTitle,
  responseCount,
  completionRate,
  responseUrl,
  answers,
  submittedAt,
}: ResponseNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>New response for {formTitle} — {responseCount} total responses</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <div style={dot} />
            <Text style={headerLabel}>New Response</Text>
          </Section>

          {/* Title */}
          <Section style={titleSection}>
            <Heading style={h1}>
              Someone filled out your form
            </Heading>
            <Text style={formTitleStyle}>{formTitle}</Text>
            <Text style={meta}>
              Submitted {submittedAt}
            </Text>
          </Section>

          {/* Stats row */}
          <Section style={statsRow}>
            <Row>
              <Column style={statCol}>
                <Text style={statValue}>{responseCount}</Text>
                <Text style={statLabel}>Total responses</Text>
              </Column>
              <Column style={statCol}>
                <Text style={statValue}>{completionRate}%</Text>
                <Text style={statLabel}>Completion rate</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Answers preview (first 5) */}
          {answers.slice(0, 5).length > 0 && (
            <Section style={answersSection}>
              <Heading style={h2}>Response preview</Heading>
              {answers.slice(0, 5).map((a, i) => (
                <div key={i} style={answerRow}>
                  <Text style={questionText}>{a.question}</Text>
                  <Text style={answerText}>{a.answer || "(no answer)"}</Text>
                </div>
              ))}
              {answers.length > 5 && (
                <Text style={moreAnswers}>
                  +{answers.length - 5} more answers in the dashboard
                </Text>
              )}
            </Section>
          )}

          <Hr style={hr} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={responseUrl} style={ctaButton}>
              View all responses
            </Button>
          </Section>

          {/* Footer */}
          <Section>
            <Text style={footer}>
              Hello {creatorName}, you are receiving this because you enabled
              email notifications for this form. Turn them off in your form settings.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};
const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #e5e7eb",
};
const header: React.CSSProperties = {
  backgroundColor: "#6C47FF",
  padding: "20px 32px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};
const dot: React.CSSProperties = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: "rgba(255,255,255,0.6)",
  display: "inline-block",
};
const headerLabel: React.CSSProperties = {
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "14px",
  margin: "0 0 0 10px",
  letterSpacing: "0.5px",
};
const titleSection: React.CSSProperties = { padding: "32px 32px 16px" };
const h1: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 8px",
};
const formTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#6C47FF",
  fontWeight: "600",
  margin: "0 0 6px",
};
const meta: React.CSSProperties = {
  fontSize: "13px",
  color: "#9ca3af",
  margin: "0",
};
const statsRow: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  margin: "0 32px 16px",
  borderRadius: "8px",
  padding: "16px",
  border: "1px solid #e5e7eb",
};
const statCol: React.CSSProperties = { textAlign: "center", width: "50%" };
const statValue: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#111827",
  margin: "0",
};
const statLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const hr: React.CSSProperties = { borderColor: "#e5e7eb", margin: "0 32px" };
const answersSection: React.CSSProperties = { padding: "24px 32px" };
const h2: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
  margin: "0 0 16px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const answerRow: React.CSSProperties = {
  marginBottom: "12px",
  paddingBottom: "12px",
  borderBottom: "1px solid #f3f4f6",
};
const questionText: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0 0 4px",
  textTransform: "uppercase",
  letterSpacing: "0.3px",
};
const answerText: React.CSSProperties = {
  fontSize: "14px",
  color: "#111827",
  fontWeight: "500",
  margin: "0",
};
const moreAnswers: React.CSSProperties = {
  fontSize: "13px",
  color: "#6C47FF",
  margin: "8px 0 0",
  fontStyle: "italic",
};
const ctaSection: React.CSSProperties = {
  textAlign: "center",
  padding: "24px 32px",
};
const ctaButton: React.CSSProperties = {
  backgroundColor: "#6C47FF",
  color: "#ffffff",
  padding: "12px 28px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "14px",
  textDecoration: "none",
};
const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  padding: "0 32px 24px",
  margin: "16px 0 0",
  lineHeight: "1.6",
};
```

### `packages/email/src/templates/form-confirmation.tsx`

```tsx
import {
  Body, Button, Container, Head, Heading, Hr,
  Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface FormConfirmationProps {
  respondentName: string;
  formTitle:      string;
  formOwner:      string;
  exploreUrl:     string;
  createUrl:      string;
}

export function FormConfirmationEmail({
  respondentName,
  formTitle,
  formOwner,
  exploreUrl,
  createUrl,
}: FormConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your response to {formTitle} was received</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={checkmark}>✓</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Response received!</Heading>
            <Text style={paragraph}>
              Hi {respondentName}, your response to{" "}
              <strong>{formTitle}</strong> by{" "}
              <strong>{formOwner}</strong> has been recorded successfully.
            </Text>
            <Text style={paragraph}>
              You do not need to do anything else. If the form creator
              needs more information they will reach out to you directly.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Explore CTA */}
          <Section style={exploreSection}>
            <Text style={exploreTitle}>Enjoyed the form experience?</Text>
            <Text style={exploreDesc}>
              FormCraft lets anyone build beautiful, Typeform-style forms with
              20+ themes — Netflix, Jaipur, Discord, Anime and more.
              Free to start, no credit card required.
            </Text>
            <div style={{ textAlign: "center" as const, marginTop: "16px" }}>
              <Button href={createUrl} style={ctaButton}>
                Create your own form
              </Button>
            </div>
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={footer}>
              You are receiving this confirmation because you submitted a form
              powered by FormCraft. FormCraft does not share your data with
              third parties.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};
const container: React.CSSProperties = {
  maxWidth: "520px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #e5e7eb",
};
const header: React.CSSProperties = {
  backgroundColor: "#10B981",
  padding: "28px",
  textAlign: "center",
};
const checkmark: React.CSSProperties = {
  fontSize: "40px",
  color: "#ffffff",
  margin: "0",
  lineHeight: "1",
};
const content: React.CSSProperties = { padding: "32px" };
const h1: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 16px",
};
const paragraph: React.CSSProperties = {
  fontSize: "15px",
  color: "#4b5563",
  lineHeight: "1.6",
  margin: "0 0 12px",
};
const hr: React.CSSProperties = { borderColor: "#e5e7eb", margin: "0 32px" };
const exploreSection: React.CSSProperties = { padding: "24px 32px" };
const exploreTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
  margin: "0 0 8px",
};
const exploreDesc: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  lineHeight: "1.6",
  margin: "0",
};
const ctaButton: React.CSSProperties = {
  backgroundColor: "#6C47FF",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "13px",
  textDecoration: "none",
};
const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  padding: "16px 32px 24px",
  margin: "0",
  lineHeight: "1.6",
};
```

### `packages/email/src/index.ts` (REPLACE)

```typescript
import { Resend } from "resend";
import { render } from "@react-email/render";
import { WelcomeEmail }              from "./templates/welcome";
import { ResponseNotificationEmail } from "./templates/response-notification";
import { FormConfirmationEmail }     from "./templates/form-confirmation";

export { WelcomeEmail, ResponseNotificationEmail, FormConfirmationEmail };

// ── Singleton Resend client ───────────────────────────────────────────────────
function getResend(): Resend {
  const key = process.env["RESEND_API_KEY"];
  if (!key) throw new Error("RESEND_API_KEY environment variable is not set.");
  return new Resend(key);
}

const FROM = process.env["RESEND_FROM_EMAIL"] ?? "FormCraft <noreply@formcraft.app>";
const APP_URL = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

// ── Email senders ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(opts: {
  toEmail:  string;
  toName:   string;
}): Promise<void> {
  const resend = getResend();
  const html   = await render(
    WelcomeEmail({
      userName:    opts.toName,
      userEmail:   opts.toEmail,
      dashboardUrl: `${APP_URL}/dashboard`,
    })
  );
  await resend.emails.send({
    from:    FROM,
    to:      opts.toEmail,
    subject: `Welcome to FormCraft, ${opts.toName}!`,
    html,
  });
}

export async function sendResponseNotification(opts: {
  creatorEmail:   string;
  creatorName:    string;
  formId:         string;
  formTitle:      string;
  responseCount:  number;
  completionRate: number;
  answers:        Array<{ question: string; answer: string }>;
}): Promise<void> {
  const resend = getResend();
  const html   = await render(
    ResponseNotificationEmail({
      creatorName:    opts.creatorName,
      formTitle:      opts.formTitle,
      responseCount:  opts.responseCount,
      completionRate: opts.completionRate,
      responseUrl:    `${APP_URL}/dashboard/forms/${opts.formId}/responses`,
      answers:        opts.answers,
      submittedAt:    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    })
  );
  await resend.emails.send({
    from:    FROM,
    to:      opts.creatorEmail,
    subject: `New response for "${opts.formTitle}" (${opts.responseCount} total)`,
    html,
  });
}

export async function sendFormConfirmation(opts: {
  toEmail:        string;
  respondentName: string;
  formTitle:      string;
  formOwner:      string;
}): Promise<void> {
  const resend = getResend();
  const html   = await render(
    FormConfirmationEmail({
      respondentName: opts.respondentName,
      formTitle:      opts.formTitle,
      formOwner:      opts.formOwner,
      exploreUrl:     `${APP_URL}/explore`,
      createUrl:      `${APP_URL}/auth/register`,
    })
  );
  await resend.emails.send({
    from:    FROM,
    to:      opts.toEmail,
    subject: `Your response to "${opts.formTitle}" was received`,
    html,
  });
}
```

Add `@repo/email` as a dependency in `apps/api/package.json`:

```json
{
  "dependencies": {
    "@repo/email": "workspace:*"
  }
}
```

---

## STEP 3 — Wire email into tRPC response submit

Open `packages/trpc/server/routes/responses/route.ts`.
Find the `submit` procedure. Replace the comment
`// notifyCreator(form, response).catch(console.error);`
with the actual implementation:

```typescript
// ADD these imports at the top of the responses route file:
import { sendResponseNotification } from "@repo/email";
import { db } from "@repo/database";
import { usersTable } from "@repo/database";
import { eq } from "drizzle-orm";

// REPLACE the notification comment inside the submit mutation with:
if (form.notifyOnResponse) {
  // Fire-and-forget — never block the response
  (async () => {
    try {
      // Get creator details
      const creator = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, form.userId),
        columns: { email: true, fullName: true },
      });
      if (!creator) return;

      const notifyTo = form.notifyEmail ?? creator.email;

      // Build answers preview for the email
      const answersPreview = input.answers
        .slice(0, 8)
        .map((a) => {
          const field = form.fields.find((f) => f.id === a.fieldId);
          const val   = Array.isArray(a.value) ? a.value.join(", ") : String(a.value ?? "");
          return { question: field?.label ?? "Question", answer: val };
        });

      await sendResponseNotification({
        creatorEmail:   notifyTo,
        creatorName:    creator.fullName,
        formId:         form.id,
        formTitle:      form.title,
        responseCount:  form.responseCount + 1,
        completionRate: form.viewCount > 0
          ? Math.round(((form.responseCount + 1) / form.viewCount) * 100)
          : 100,
        answers: answersPreview,
      });
    } catch (emailErr) {
      // Log but never crash the submission
      console.error("Email notification failed:", emailErr);
    }
  })();
}
```

Wire welcome email into better-auth's `onUserCreated` hook.
Open `packages/trpc/server/auth.ts` and add:

```typescript
// ADD this import at the top:
import { sendWelcomeEmail } from "@repo/email";

// ADD inside betterAuth({}) config, after the session block:
hooks: {
  after: [
    {
      matcher: (ctx) => ctx.path === "/sign-up/email",
      handler: async (ctx) => {
        try {
          if (ctx.context?.user) {
            await sendWelcomeEmail({
              toEmail: ctx.context.user.email,
              toName:  ctx.context.user.name ?? "there",
            });
          }
        } catch {
          // Never block registration on email failure
        }
      },
    },
  ],
},
```

---

## STEP 4 — Complete seed script

### `packages/database/seed.ts`

This seeds exactly the data judges will see when they open the demo:
- 1 demo user (Pro plan)
- All 13 predefined themes
- 5 themed forms with all field types covered
- 247 realistic responses distributed across the 5 forms
- Realistic timestamps spread over the last 30 days
- View counts set to produce meaningful completion rates

```typescript
import "dotenv/config";
import { drizzle }  from "drizzle-orm/neon-http";
import { neon }     from "@neondatabase/serverless";
import { eq, sql }  from "drizzle-orm";
import bcrypt       from "bcryptjs";
import * as schema  from "./schema";

// ── DB connection ─────────────────────────────────────────────────────────────
const client = neon(process.env["DATABASE_URL"]!);
const db     = drizzle(client, { schema });

// ── Helpers ───────────────────────────────────────────────────────────────────
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - randomBetween(0, daysAgo));
  d.setHours(randomBetween(8, 22), randomBetween(0, 59));
  return d;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function uuid(): string {
  return crypto.randomUUID();
}

// ── Theme definitions ──────────────────────────────────────────────────────────
const THEMES = [
  {
    name: "Netflix",      slug: "netflix",      category: "streaming",
    isPro: false,
    config: {
      bgColor: "#141414", accentColor: "#E50914", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "bebas-neue", fontSize: "lg",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#E50914",
      questionAnimation: "slide", thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    name: "WhatsApp",     slug: "whatsapp",     category: "social",
    isPro: false,
    config: {
      bgColor: "#075E54", accentColor: "#25D366", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "roboto", fontSize: "md",
      buttonStyle: "pill", progressStyle: "bar", progressColor: "#25D366",
      questionAnimation: "fade", thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Pink City Jaipur", slug: "pink-city", category: "culture",
    isPro: false,
    config: {
      bgColor: "#8B1A4A", accentColor: "#F7A8C4", textColor: "#FFFFFF",
      questionColor: "#FFE4EF", fontFamily: "playfair-display", fontSize: "lg",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#F7A8C4",
      questionAnimation: "fade", thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Anime Dark",   slug: "anime-dark",   category: "anime",
    isPro: false,
    config: {
      bgColor: "#0D0D1A", accentColor: "#7C3AED", textColor: "#E2E8F0",
      questionColor: "#F1F5F9", fontFamily: "noto-sans", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#7C3AED",
      questionAnimation: "pop", thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Discord",      slug: "discord",      category: "gaming",
    isPro: false,
    config: {
      bgColor: "#313338", accentColor: "#5865F2", textColor: "#DBDEE1",
      questionColor: "#FFFFFF", fontFamily: "inter", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#5865F2",
      questionAnimation: "fade", thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    name: "macOS",        slug: "macos",        category: "operating-system",
    isPro: true,
    config: {
      bgColor: "#1C1C1E", accentColor: "#0A84FF", textColor: "#FFFFFF",
      questionColor: "#EBEBF5", fontFamily: "inter", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#0A84FF",
      questionAnimation: "slide", thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Spotify",      slug: "spotify",      category: "streaming",
    isPro: true,
    config: {
      bgColor: "#121212", accentColor: "#1DB954", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "dm-sans", fontSize: "md",
      buttonStyle: "pill", progressStyle: "bar", progressColor: "#1DB954",
      questionAnimation: "slide", thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Startup",      slug: "startup",      category: "startup",
    isPro: false,
    config: {
      bgColor: "#0A0A0A", accentColor: "#FF6B35", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "space-grotesk", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "percentage", progressColor: "#FF6B35",
      questionAnimation: "slide", thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    name: "India Pride",  slug: "india-pride",  category: "culture",
    isPro: false,
    config: {
      bgColor: "#FFFFFF", accentColor: "#FF9933", textColor: "#000080",
      questionColor: "#000080", fontFamily: "poppins", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#138808",
      questionAnimation: "slide", thankYouAnimation: "confetti", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Cyberpunk",    slug: "cyberpunk",    category: "gaming",
    isPro: true,
    config: {
      bgColor: "#0D001A", accentColor: "#00FFFF", textColor: "#00FFFF",
      questionColor: "#FFFFFF", fontFamily: "space-grotesk", fontSize: "md",
      buttonStyle: "square", progressStyle: "bar", progressColor: "#FF00FF",
      questionAnimation: "pop", thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Minimal Light", slug: "minimal-light", category: "minimal",
    isPro: false,
    config: {
      bgColor: "#FAFAFA", accentColor: "#111111", textColor: "#111111",
      questionColor: "#111111", fontFamily: "geist", fontSize: "md",
      buttonStyle: "square", progressStyle: "bar", progressColor: "#111111",
      questionAnimation: "fade", thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
  {
    name: "YouTube",      slug: "youtube",      category: "streaming",
    isPro: false,
    config: {
      bgColor: "#0F0F0F", accentColor: "#FF0000", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "roboto", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#FF0000",
      questionAnimation: "slide", thankYouAnimation: "fireworks", bgOverlayOpacity: 0,
    },
  },
  {
    name: "Windows 11",   slug: "windows-11",   category: "operating-system",
    isPro: true,
    config: {
      bgColor: "#003087", accentColor: "#00ADEF", textColor: "#FFFFFF",
      questionColor: "#FFFFFF", fontFamily: "inter", fontSize: "md",
      buttonStyle: "rounded", progressStyle: "bar", progressColor: "#00ADEF",
      questionAnimation: "slide", thankYouAnimation: "checkmark", bgOverlayOpacity: 0,
    },
  },
] as const;

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
  console.log("Starting FormCraft seed...\n");

  // ── 1. Seed themes ──────────────────────────────────────────────────────────
  console.log("Seeding themes...");
  const themeIdMap: Record<string, string> = {};

  for (const t of THEMES) {
    const id = uuid();
    await db.insert(schema.formThemesTable).values({
      id,
      name:      t.name,
      slug:      t.slug,
      category:  t.category,
      config:    t.config as never,
      isPro:     t.isPro,
      isCustom:  false,
    }).onConflictDoNothing();

    // Fetch the actual ID in case it already existed
    const existing = await db.query.formThemesTable.findFirst({
      where: eq(schema.formThemesTable.slug, t.slug),
      columns: { id: true },
    });
    if (existing) themeIdMap[t.slug] = existing.id;
  }
  console.log(`  ${THEMES.length} themes seeded.\n`);

  // ── 2. Seed demo user ───────────────────────────────────────────────────────
  console.log("Seeding demo user...");
  const passwordHash = await bcrypt.hash("Demo1234!", 12);
  const demoUserId   = uuid();

  await db.insert(schema.usersTable).values({
    id:            demoUserId,
    fullName:      "Demo Creator",
    email:         "demo@formcraft.app",
    emailVerified: true,
    passwordHash,
    plan:          "pro",
  }).onConflictDoNothing();

  const demoUser = await db.query.usersTable.findFirst({
    where: eq(schema.usersTable.email, "demo@formcraft.app"),
    columns: { id: true, fullName: true },
  });
  const userId = demoUser!.id;
  console.log(`  Demo user ready: demo@formcraft.app / Demo1234!\n`);

  // ── 3. Seed 5 themed forms ──────────────────────────────────────────────────
  console.log("Seeding forms...");

  const forms = await seedAllForms(userId, themeIdMap);
  console.log(`  ${forms.length} forms seeded.\n`);

  // ── 4. Seed responses ───────────────────────────────────────────────────────
  console.log("Seeding responses...");
  let totalResponses = 0;

  for (const form of forms) {
    const count = await seedResponses(form);
    console.log(`  ${count} responses for "${form.title}"`);
    totalResponses += count;
  }
  console.log(`\n  Total responses seeded: ${totalResponses}\n`);

  console.log("Seed complete! Open http://localhost:3000 to see it.\n");
  console.log("Demo credentials:");
  console.log("  Email:    demo@formcraft.app");
  console.log("  Password: Demo1234!\n");

  process.exit(0);
}

// ── Form definitions ──────────────────────────────────────────────────────────
async function seedAllForms(
  userId: string,
  themeIdMap: Record<string, string>
): Promise<SeedForm[]> {
  const forms: SeedForm[] = [];

  // ── Form 1: Netflix Watchlist Survey ─────────────────────────────────────
  const form1 = await createForm({
    userId,
    title:       "Netflix Watchlist Survey",
    description: "Help us understand what you love watching. Takes 2 minutes.",
    slug:        "netflix-watchlist",
    themeId:     themeIdMap["netflix"]!,
    visibility:  "public",
    viewCount:   312,
    responseCount: 0,
    thankYouTitle:   "Thanks for watching!",
    thankYouMessage: "Your picks help us recommend better shows.",
  });

  const f1Fields = await createFields(form1.id, [
    {
      type: "welcome_screen", label: "Welcome to the Netflix Watchlist Survey",
      description: "We want to know what you love watching. This takes about 90 seconds.",
      buttonLabel: "Start survey", order: 0, required: false,
    },
    {
      type: "single_select", label: "What is your favourite Netflix genre?",
      required: true, order: 1,
      options: [
        { id: uuid(), label: "Thriller & Crime",  value: "thriller",     order: 0 },
        { id: uuid(), label: "Sci-Fi & Fantasy",  value: "sci-fi",       order: 1 },
        { id: uuid(), label: "Romance & Drama",   value: "romance",      order: 2 },
        { id: uuid(), label: "Comedy",            value: "comedy",       order: 3 },
        { id: uuid(), label: "Documentary",       value: "documentary",  order: 4 },
        { id: uuid(), label: "Horror",            value: "horror",       order: 5 },
        { id: uuid(), label: "Action & Adventure",value: "action",       order: 6 },
      ],
    },
    {
      type: "multi_select", label: "Which original series have you watched?",
      required: true, order: 2,
      options: [
        { id: uuid(), label: "Stranger Things",   value: "stranger_things",  order: 0 },
        { id: uuid(), label: "Money Heist",       value: "money_heist",      order: 1 },
        { id: uuid(), label: "Squid Game",        value: "squid_game",       order: 2 },
        { id: uuid(), label: "Dark",              value: "dark",             order: 3 },
        { id: uuid(), label: "Wednesday",         value: "wednesday",        order: 4 },
        { id: uuid(), label: "Sacred Games",      value: "sacred_games",     order: 5 },
      ],
    },
    {
      type: "rating", label: "How would you rate your overall Netflix experience?",
      description: "1 = terrible, 5 = amazing",
      required: true, order: 3,
    },
    {
      type: "scale", label: "How likely are you to recommend Netflix to a friend?",
      description: "0 = not at all, 10 = extremely likely",
      required: true, order: 4,
    },
    {
      type: "yes_no", label: "Have you used the download feature for offline viewing?",
      required: false, order: 5,
    },
    {
      type: "short_text", label: "What is one show you wish Netflix would bring back?",
      placeholder: "e.g. The OA, Marco Polo...",
      required: false, order: 6,
    },
    {
      type: "email", label: "Enter your email to receive personalised recommendations",
      placeholder: "you@example.com",
      required: false, order: 7,
    },
  ]);

  forms.push({ ...form1, fields: f1Fields, responseTarget: 89 });

  // ── Form 2: Pink City Jaipur Tourism ──────────────────────────────────────
  const form2 = await createForm({
    userId,
    title:        "Pink City Jaipur — Visitor Experience",
    description:  "Tell us about your Jaipur trip. Your feedback shapes the tourism experience.",
    slug:         "jaipur-visitor",
    themeId:      themeIdMap["pink-city"]!,
    visibility:   "public",
    viewCount:    178,
    responseCount: 0,
    thankYouTitle:   "Padharo Mhare Des!",
    thankYouMessage: "Thank you for sharing your Jaipur experience.",
  });

  const f2Fields = await createFields(form2.id, [
    {
      type: "welcome_screen", label: "Welcome to the Pink City Survey",
      description: "Share your Jaipur experience in under 2 minutes.",
      buttonLabel: "Begin", order: 0, required: false,
    },
    {
      type: "single_select", label: "Which city did you travel from to reach Jaipur?",
      required: true, order: 1,
      options: [
        { id: uuid(), label: "Delhi",      value: "delhi",     order: 0 },
        { id: uuid(), label: "Mumbai",     value: "mumbai",    order: 1 },
        { id: uuid(), label: "Bangalore",  value: "bangalore", order: 2 },
        { id: uuid(), label: "Hyderabad",  value: "hyderabad", order: 3 },
        { id: uuid(), label: "Chennai",    value: "chennai",   order: 4 },
        { id: uuid(), label: "Abroad",     value: "abroad",    order: 5 },
        { id: uuid(), label: "Other",      value: "other",     order: 6 },
      ],
    },
    {
      type: "multi_select", label: "Which attractions did you visit?",
      required: true, order: 2,
      options: [
        { id: uuid(), label: "Amber Fort",      value: "amber_fort",     order: 0 },
        { id: uuid(), label: "Hawa Mahal",      value: "hawa_mahal",     order: 1 },
        { id: uuid(), label: "City Palace",     value: "city_palace",    order: 2 },
        { id: uuid(), label: "Jantar Mantar",   value: "jantar_mantar",  order: 3 },
        { id: uuid(), label: "Nahargarh Fort",  value: "nahargarh",      order: 4 },
        { id: uuid(), label: "Johari Bazaar",   value: "johari_bazaar",  order: 5 },
        { id: uuid(), label: "Albert Hall",     value: "albert_hall",    order: 6 },
      ],
    },
    {
      type: "rating", label: "How would you rate the Jaipur street food experience?",
      required: true, order: 3,
    },
    {
      type: "number", label: "How many days did you spend in Jaipur?",
      placeholder: "e.g. 3",
      required: true, order: 4,
      validation: { min: 1, max: 30 },
    },
    {
      type: "single_select", label: "How did you primarily get around Jaipur?",
      required: true, order: 5,
      options: [
        { id: uuid(), label: "Auto-rickshaw",  value: "auto",      order: 0 },
        { id: uuid(), label: "Ola / Uber",     value: "cab",       order: 1 },
        { id: uuid(), label: "Rental bike",    value: "bike",      order: 2 },
        { id: uuid(), label: "Cycle rickshaw", value: "cycle",     order: 3 },
        { id: uuid(), label: "Private car",    value: "car",       order: 4 },
        { id: uuid(), label: "Walked",         value: "walk",      order: 5 },
      ],
    },
    {
      type: "scale", label: "How likely are you to recommend Jaipur to a friend?",
      required: true, order: 6,
    },
    {
      type: "long_text", label: "Any suggestions to improve the tourist experience in Jaipur?",
      placeholder: "Share your honest thoughts...",
      required: false, order: 7,
    },
  ]);

  forms.push({ ...form2, fields: f2Fields, responseTarget: 61 });

  // ── Form 3: Anime Character Poll ──────────────────────────────────────────
  const form3 = await createForm({
    userId,
    title:        "Anime Character Popularity Poll 2024",
    description:  "Vote for your favourite characters across all time and see the live results.",
    slug:         "anime-character-poll",
    themeId:      themeIdMap["anime-dark"]!,
    visibility:   "public",
    viewCount:    543,
    responseCount: 0,
    thankYouTitle:   "Sugoi! Your vote is counted.",
    thankYouMessage: "See you in the next poll, senpai.",
  });

  const f3Fields = await createFields(form3.id, [
    {
      type: "single_select",
      label: "Who is your all-time favourite shonen protagonist?",
      required: true, order: 0,
      options: [
        { id: uuid(), label: "Naruto Uzumaki",    value: "naruto",  order: 0 },
        { id: uuid(), label: "Monkey D. Luffy",   value: "luffy",   order: 1 },
        { id: uuid(), label: "Goku",              value: "goku",    order: 2 },
        { id: uuid(), label: "Izuku Midoriya",    value: "deku",    order: 3 },
        { id: uuid(), label: "Levi Ackermann",    value: "levi",    order: 4 },
        { id: uuid(), label: "Tanjiro Kamado",    value: "tanjiro", order: 5 },
        { id: uuid(), label: "Edward Elric",      value: "edward",  order: 6 },
      ],
    },
    {
      type: "multi_select", label: "Which anime series are you currently watching?",
      required: true, order: 1,
      options: [
        { id: uuid(), label: "One Piece",             value: "one_piece",     order: 0 },
        { id: uuid(), label: "Jujutsu Kaisen",        value: "jjk",           order: 1 },
        { id: uuid(), label: "Demon Slayer",          value: "demon_slayer",  order: 2 },
        { id: uuid(), label: "Attack on Titan",       value: "aot",           order: 3 },
        { id: uuid(), label: "Chainsaw Man",          value: "chainsaw_man",  order: 4 },
        { id: uuid(), label: "Hunter x Hunter",       value: "hxh",           order: 5 },
        { id: uuid(), label: "Vinland Saga",          value: "vinland",       order: 6 },
      ],
    },
    {
      type: "rating", label: "Rate Demon Slayer: Kimetsu no Yaiba overall",
      description: "1 = not for me, 5 = masterpiece",
      required: true, order: 2,
    },
    {
      type: "single_select", label: "Which animation studio do you rate highest?",
      required: true, order: 3,
      options: [
        { id: uuid(), label: "ufotable",        value: "ufotable",  order: 0 },
        { id: uuid(), label: "MAPPA",           value: "mappa",     order: 1 },
        { id: uuid(), label: "Toei Animation",  value: "toei",      order: 2 },
        { id: uuid(), label: "Wit Studio",      value: "wit",       order: 3 },
        { id: uuid(), label: "Bones",           value: "bones",     order: 4 },
        { id: uuid(), label: "A-1 Pictures",    value: "a1",        order: 5 },
      ],
    },
    {
      type: "scale", label: "How would you rate the current 'golden age of anime' (2020–2024)?",
      required: true, order: 4,
    },
    {
      type: "yes_no", label: "Do you prefer dubbed or subbed anime?",
      required: false, order: 5,
    },
    {
      type: "short_text", label: "Name one underrated anime everyone should watch",
      placeholder: "e.g. Vinland Saga, Mushishi...",
      required: false, order: 6,
    },
  ]);

  forms.push({ ...form3, fields: f3Fields, responseTarget: 134 });

  // ── Form 4: Startup Idea Validator (unlisted) ──────────────────────────────
  const form4 = await createForm({
    userId,
    title:        "Startup Idea Validator — FormCraft v2 Features",
    description:  "Help us prioritise what to build next in FormCraft. Takes 3 minutes.",
    slug:         "formcraft-feature-vote",
    themeId:      themeIdMap["startup"]!,
    visibility:   "unlisted",
    viewCount:    88,
    responseCount: 0,
    thankYouTitle:   "Your input is gold.",
    thankYouMessage: "We read every response. Thank you for helping shape FormCraft.",
  });

  const f4Fields = await createFields(form4.id, [
    {
      type: "single_select",
      label: "Which upcoming FormCraft feature excites you most?",
      required: true, order: 0,
      options: [
        { id: uuid(), label: "Conditional logic between questions",   value: "conditional",  order: 0 },
        { id: uuid(), label: "File upload field",                     value: "file_upload",  order: 1 },
        { id: uuid(), label: "Multi-page forms",                      value: "multi_page",   order: 2 },
        { id: uuid(), label: "Team collaboration",                    value: "team",         order: 3 },
        { id: uuid(), label: "Custom domain support",                 value: "domain",       order: 4 },
        { id: uuid(), label: "Zapier / webhook integrations",         value: "webhooks",     order: 5 },
        { id: uuid(), label: "AI-generated forms from a prompt",      value: "ai_gen",       order: 6 },
      ],
    },
    {
      type: "rating", label: "How would you rate FormCraft's current form builder experience?",
      required: true, order: 1,
    },
    {
      type: "scale",
      label: "How likely are you to pay for a Pro plan at ₹499/month?",
      description: "0 = definitely not, 10 = already paid",
      required: true, order: 2,
    },
    {
      type: "single_select",
      label: "Which Typeform feature do you miss most in FormCraft?",
      required: false, order: 3,
      options: [
        { id: uuid(), label: "Hidden fields",        value: "hidden",      order: 0 },
        { id: uuid(), label: "Custom thank-you page",value: "thankyou",    order: 1 },
        { id: uuid(), label: "Payment collection",   value: "payment",     order: 2 },
        { id: uuid(), label: "Calculator fields",    value: "calculator",  order: 3 },
        { id: uuid(), label: "None — FormCraft is better", value: "none", order: 4 },
      ],
    },
    {
      type: "long_text",
      label: "Describe the perfect form builder for your use case",
      placeholder: "I would use it for... the key feature I need is...",
      required: false, order: 4,
    },
    {
      type: "email",
      label: "Email — if you want early access to new features",
      placeholder: "founder@startup.com",
      required: false, order: 5,
    },
  ]);

  forms.push({ ...form4, fields: f4Fields, responseTarget: 42 });

  // ── Form 5: Discord Community Server Feedback ─────────────────────────────
  const form5 = await createForm({
    userId,
    title:        "Gaming Community — Server Feedback Survey",
    description:  "Rate our Discord server and help us make it better for everyone.",
    slug:         "discord-server-feedback",
    themeId:      themeIdMap["discord"]!,
    visibility:   "public",
    viewCount:    195,
    responseCount: 0,
    thankYouTitle:   "GG! Thanks for the feedback.",
    thankYouMessage: "We will post results in #announcements this weekend.",
  });

  const f5Fields = await createFields(form5.id, [
    {
      type: "single_select",
      label: "How long have you been a member of our server?",
      required: true, order: 0,
      options: [
        { id: uuid(), label: "Less than a week",  value: "< 1 week",   order: 0 },
        { id: uuid(), label: "1–4 weeks",         value: "1-4 weeks",  order: 1 },
        { id: uuid(), label: "1–3 months",        value: "1-3 months", order: 2 },
        { id: uuid(), label: "3–12 months",       value: "3-12 months",order: 3 },
        { id: uuid(), label: "Over a year",       value: "> 1 year",   order: 4 },
      ],
    },
    {
      type: "multi_select",
      label: "Which channels do you visit most often?",
      required: true, order: 1,
      options: [
        { id: uuid(), label: "#general",          value: "general",   order: 0 },
        { id: uuid(), label: "#memes",            value: "memes",     order: 1 },
        { id: uuid(), label: "#game-discussion",  value: "game-disc", order: 2 },
        { id: uuid(), label: "#looking-for-group",value: "lfg",       order: 3 },
        { id: uuid(), label: "#announcements",    value: "announce",  order: 4 },
        { id: uuid(), label: "#art-showcase",     value: "art",       order: 5 },
      ],
    },
    {
      type: "rating",
      label: "How would you rate the quality of moderation?",
      description: "1 = needs major improvement, 5 = excellent",
      required: true, order: 2,
    },
    {
      type: "scale",
      label: "How active do you feel this community is?",
      description: "0 = dead server, 10 = super active",
      required: true, order: 3,
    },
    {
      type: "yes_no",
      label: "Have you participated in any of our community events?",
      required: false, order: 4,
    },
    {
      type: "single_select",
      label: "What type of event would you most like to see?",
      required: false, order: 5,
      options: [
        { id: uuid(), label: "Game night / tournament", value: "game_night",   order: 0 },
        { id: uuid(), label: "Art contest",             value: "art_contest",  order: 1 },
        { id: uuid(), label: "Watch party",             value: "watch_party",  order: 2 },
        { id: uuid(), label: "AMA with streamers",      value: "ama",          order: 3 },
        { id: uuid(), label: "Trivia night",            value: "trivia",       order: 4 },
      ],
    },
    {
      type: "long_text",
      label: "Any suggestions for improving the server?",
      placeholder: "I would love to see...",
      required: false, order: 6,
    },
  ]);

  forms.push({ ...form5, fields: f5Fields, responseTarget: 97 });

  return forms;
}

// ── Helpers for creating forms and fields ─────────────────────────────────────
interface SeedForm {
  id:            string;
  title:         string;
  slug:          string;
  userId:        string;
  fields:        Array<typeof schema.formFieldsTable.$inferSelect>;
  responseTarget: number;
}

async function createForm(opts: {
  userId:        string;
  title:         string;
  description:   string;
  slug:          string;
  themeId:       string;
  visibility:    "public" | "unlisted";
  viewCount:     number;
  responseCount: number;
  thankYouTitle: string;
  thankYouMessage: string;
}): Promise<typeof schema.formsTable.$inferSelect> {
  const id = uuid();
  await db.insert(schema.formsTable).values({
    id,
    userId:        opts.userId,
    themeId:       opts.themeId,
    title:         opts.title,
    description:   opts.description,
    slug:          opts.slug,
    status:        "published",
    visibility:    opts.visibility,
    notifyOnResponse: true,
    showBranding:  true,
    viewCount:     opts.viewCount,
    responseCount: 0,
    thankYouTitle: opts.thankYouTitle,
    thankYouMessage: opts.thankYouMessage,
    publishedAt:   new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 2 weeks ago
  }).onConflictDoNothing();

  const form = await db.query.formsTable.findFirst({
    where: eq(schema.formsTable.slug, opts.slug),
  });
  return form!;
}

async function createFields(
  formId: string,
  fields: Array<{
    type:        string;
    label:       string;
    description?: string;
    placeholder?: string;
    buttonLabel?: string;
    required:    boolean;
    order:       number;
    options?:    Array<{ id: string; label: string; value: string; order: number }>;
    validation?: Record<string, unknown>;
  }>
): Promise<Array<typeof schema.formFieldsTable.$inferSelect>> {
  const ids: string[] = [];
  for (const f of fields) {
    const id = uuid();
    await db.insert(schema.formFieldsTable).values({
      id,
      formId,
      type:        f.type as never,
      label:       f.label,
      description: f.description ?? null,
      placeholder: f.placeholder ?? null,
      buttonLabel: f.buttonLabel ?? null,
      required:    f.required,
      order:       f.order,
      options:     f.options as never ?? null,
      validation:  f.validation as never ?? null,
    });
    ids.push(id);
  }

  return db.query.formFieldsTable.findMany({
    where: eq(schema.formFieldsTable.formId, formId),
    orderBy: (t, { asc }) => [asc(t.order)],
  });
}

// ── Response seeding ──────────────────────────────────────────────────────────
async function seedResponses(form: SeedForm): Promise<number> {
  const interactiveFields = form.fields.filter(
    (f) => !["welcome_screen", "thank_you_screen", "statement"].includes(f.type)
  );

  let seeded = 0;

  for (let i = 0; i < form.responseTarget; i++) {
    const responseId = uuid();
    const submittedAt = randomDate(30);

    await db.insert(schema.responsesTable).values({
      id:          responseId,
      formId:      form.id,
      ipHash:      `seed_hash_${i}`,
      userAgent:   pick(USER_AGENTS),
      timeToCompleteMs: randomBetween(45000, 240000),
      submittedAt,
    });

    // Generate realistic answers for each field
    for (const field of interactiveFields) {
      const value = generateAnswer(field);
      if (value === null) continue;

      await db.insert(schema.responseAnswersTable).values({
        id:         uuid(),
        responseId,
        fieldId:    field.id,
        value:      value as never,
      });
    }

    seeded++;
  }

  // Update response count
  await db.update(schema.formsTable)
    .set({ responseCount: seeded })
    .where(eq(schema.formsTable.id, form.id));

  return seeded;
}

// ── Answer generators ─────────────────────────────────────────────────────────
function generateAnswer(
  field: typeof schema.formFieldsTable.$inferSelect
): string | number | boolean | string[] | null {
  const opts = field.options as Array<{ value: string }> | null;

  switch (field.type) {
    case "short_text":
      return pick(SHORT_TEXT_ANSWERS);

    case "long_text":
      return pick(LONG_TEXT_ANSWERS);

    case "email":
      // 60% fill rate for optional email fields
      if (!field.required && Math.random() > 0.6) return null;
      return `user${randomBetween(1, 9999)}@example.com`;

    case "number": {
      const validation = field.validation as { min?: number; max?: number } | null;
      const min = validation?.min ?? 1;
      const max = validation?.max ?? 10;
      return randomBetween(min, max);
    }

    case "single_select":
      if (!opts?.length) return null;
      return pick(opts).value;

    case "multi_select": {
      if (!opts?.length) return null;
      const shuffled = [...opts].sort(() => Math.random() - 0.5);
      const count    = randomBetween(1, Math.min(3, opts.length));
      return shuffled.slice(0, count).map((o) => o.value);
    }

    case "dropdown":
      if (!opts?.length) return null;
      return pick(opts).value;

    case "rating":
      // Weighted towards 4-5 stars (makes analytics look realistic)
      return pick([3, 4, 4, 4, 5, 5, 5, 5, 4, 3, 2, 5, 5]);

    case "scale":
      // Weighted towards 7-10 (NPS-style distribution)
      return pick([6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 7, 8, 5, 10]);

    case "yes_no":
      return Math.random() > 0.35; // 65% say yes

    case "date": {
      const d = randomDate(365);
      return d.toISOString().split("T")[0]!;
    }

    case "checkbox":
      return Math.random() > 0.3;

    case "phone":
      if (!field.required && Math.random() > 0.5) return null;
      return `+91${randomBetween(7000000000, 9999999999)}`;

    case "url":
      if (!field.required && Math.random() > 0.4) return null;
      return pick(["https://github.com", "https://twitter.com", "https://linkedin.com"]);

    default:
      return null;
  }
}

// ── Sample answer pools ───────────────────────────────────────────────────────
const SHORT_TEXT_ANSWERS = [
  "The OA",
  "Dark",
  "Parasyte: The Maxim",
  "Made in Abyss",
  "Steins;Gate",
  "Mob Psycho 100",
  "Ping Pong The Animation",
  "Mushishi",
  "Barakamon",
  "Rainbow",
  "I would love to see better regional Indian content.",
  "More thriller content please!",
  "Please bring back Mindhunter.",
  "Gangs of Wasseypur deserves a sequel.",
  "Better subtitles for regional languages.",
];

const LONG_TEXT_ANSWERS = [
  "I think the experience is great overall but could use improvements in discoverability. I often find great shows by accident rather than through recommendations.",
  "Would love to see more regional content. There are so many great stories from smaller cities that deserve a global platform.",
  "The interface is clean and fast. My main suggestion would be to add a playlist or watchlist feature that syncs across devices better.",
  "I really enjoy the community but feel the event frequency is a bit low. More regular activities would keep members engaged.",
  "Great server overall! I would love to see more watch-together events for anime premieres. The reaction threads are always fun.",
  "The form builder is intuitive. My main ask would be better analytics — specifically per-question drop-off so I can see where people are giving up.",
  "I have been using this for my college research surveys. The Jaipur theme was perfect for our heritage documentation project. Incredible work!",
  "Would love conditional logic so I can skip irrelevant questions based on earlier answers. That would make surveys feel much more personal.",
  "The QR code feature is brilliant. I printed it on our event posters and got 3x more responses than our previous Google Form.",
];

const USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 12; Samsung Galaxy S22) AppleWebKit/537.36 Chrome/119.0.0.0 Mobile Safari/537.36",
];

// ── Run ───────────────────────────────────────────────────────────────────────
seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

---

## STEP 5 — Drizzle config seed command

Add to `packages/database/drizzle.config.ts` — no change needed.
Add to `packages/database/.env` (create if not present):

```bash
DATABASE_URL="your-neon-connection-string"
```

Add to root `turbo.json` pipeline:

```json
{
  "pipeline": {
    "db:seed": {
      "cache": false,
      "env": ["DATABASE_URL"]
    }
  }
}
```

---

## STEP 6 — Scalar API documentation metadata

Open `apps/api/src/server.ts`. Replace the `generateOpenApiDocument` call:

```typescript
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title:       "FormCraft API",
  version:     "1.0.0",
  description: `
## FormCraft — Industry-grade form builder API

FormCraft provides a complete REST + tRPC API for creating, managing and
analysing forms. This documentation covers all public and authenticated endpoints.

### Authentication
Protected endpoints require a valid session cookie obtained via the
\`POST /auth/sign-in/email\` or \`POST /auth/sign-in/social\` endpoints.

### Rate limiting
- **Global**: 500 requests per IP per 15 minutes
- **Form submission**: 20 submissions per IP per hour

### Demo credentials
- Email: \`demo@formcraft.app\`
- Password: \`Demo1234!\`

### Base URL (production)
\`https://api.formcraft.app\`
  `,
  baseUrl:     (process.env["BASE_URL"] ?? "http://localhost:8000").concat("/api"),
  docsUrl:     "/docs",
  tags: [
    {
      name:        "Forms",
      description: "Create, update, publish, unpublish and manage forms. All endpoints require authentication.",
    },
    {
      name:        "Public Forms",
      description: "Access published forms without authentication. Used by the public form filler.",
    },
    {
      name:        "Fields",
      description: "Add, update, delete and reorder fields within a form. All endpoints require authentication.",
    },
    {
      name:        "Responses",
      description: "Submit public form responses (no auth) and retrieve response analytics (auth required).",
    },
    {
      name:        "Analytics",
      description: "Per-form analytics including completion rate, daily stats and field-level analysis.",
    },
    {
      name:        "Themes",
      description: "Browse and retrieve form visual themes. Public endpoints — no authentication required.",
    },
    {
      name:        "Payments",
      description: "Razorpay order creation and payment verification for Pro and Team plan upgrades.",
    },
  ],
  securitySchemes: {
    sessionCookie: {
      type: "apiKey",
      in:   "cookie",
      name: "formcraft.session_token",
    },
  },
  security: [{ sessionCookie: [] }],
});
```

Update the Scalar UI config for a polished look:

```typescript
// REPLACE the existing Scalar middleware with:
app.use(
  "/docs",
  apiReference({
    url:   "/openapi.json",
    theme: "saturn",
    configuration: {
      title:      "FormCraft API Docs",
      favicon:    "/favicon.ico",
      darkMode:   true,
      hideModels: false,
      defaultHttpClient: {
        targetKey:  "javascript",
        clientKey:  "fetch",
      },
      customCss: `
        .scalar-app { font-family: 'Inter', sans-serif; }
        .section-hero { background: linear-gradient(135deg, #6C47FF22, #C026D322); }
      `,
      metaData: {
        title:       "FormCraft API Documentation",
        description: "Complete API reference for the FormCraft form builder platform",
        ogTitle:     "FormCraft API",
      },
    },
  })
);
```

---

## STEP 7 — README.md

Create `README.md` at the monorepo root. This is what judges read first.

```markdown
# FormCraft — Industry-grade Typeform Competitor

Forms that feel like an experience. Built with Next.js 15, tRPC, Drizzle ORM,
better-auth and Razorpay. Deployed on Vercel + Railway.

---

## Live Demo

| Resource            | URL                                              |
|---------------------|--------------------------------------------------|
| Web application     | https://formcraft.vercel.app                     |
| API server          | https://api.formcraft.app                        |
| API documentation   | https://api.formcraft.app/docs                   |
| OpenAPI JSON        | https://api.formcraft.app/openapi.json           |

### Demo credentials

| Field    | Value                   |
|----------|-------------------------|
| Email    | `demo@formcraft.app`    |
| Password | `Demo1234!`             |

### Test payment credentials (Razorpay test mode)

| Method    | Details                                              |
|-----------|------------------------------------------------------|
| Card      | `4111 1111 1111 1111` — any CVV — any future date   |
| UPI       | `success@razorpay`                                   |
| Netbanking| Select any bank — use test credentials               |

---

## What is FormCraft?

FormCraft is an India-first, open-source Typeform competitor that makes
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
- **Custom slugs** — `formcraft.app/f/your-brand-name`
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
formcraft/
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
git clone https://github.com/your-username/formcraft.git
cd formcraft
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
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/formcraft?sslmode=require"

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
RESEND_FROM_EMAIL="FormCraft <noreply@formcraft.app>"

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
- Demo user: `demo@formcraft.app` / `Demo1234!` (Pro plan)
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

**https://api.formcraft.app/docs**

The API follows OpenAPI 3.0 specification. The raw spec is at:

**https://api.formcraft.app/openapi.json**

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
curl -X POST https://api.formcraft.app/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@formcraft.app","password":"Demo1234!"}'
```

The response sets a `formcraft.session_token` cookie automatically.

---

## Form Themes

FormCraft ships with 13 built-in themes (8 free, 5 Pro-only):

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

**GitHub**: https://github.com/your-username/formcraft
**Demo**: https://formcraft.vercel.app
**API Docs**: https://api.formcraft.app/docs

---

## License

MIT — see LICENSE file for details.
```

---

## STEP 8 — Create `.env.example`

Create `.env.example` at the monorepo root:

```bash
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@ep-example.neon.tech/formcraft?sslmode=require"

# ── Application URLs ──────────────────────────────────────────────────────────
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/trpc
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── better-auth ───────────────────────────────────────────────────────────────
# Generate: openssl rand -base64 32
BETTER_AUTH_SECRET="change-this-to-a-random-32-character-string"
BETTER_AUTH_URL=http://localhost:8000

# ── Google OAuth ──────────────────────────────────────────────────────────────
# Get from: console.cloud.google.com → Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ── Security ──────────────────────────────────────────────────────────────────
# Generate: openssl rand -base64 16
IP_HASH_SALT="change-this-to-a-random-salt"

# ── Resend (email) ────────────────────────────────────────────────────────────
# Get from: resend.com → API Keys (free tier: 3000 emails/month)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL="FormCraft <noreply@yourdomain.com>"

# ── Razorpay (payments) ───────────────────────────────────────────────────────
# Get from: dashboard.razorpay.com → Settings → API Keys (use TEST keys locally)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
# This is the PUBLIC key exposed to the browser (must start with NEXT_PUBLIC_)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxxxx
```

---

## STEP 9 — Phase 4 final checklist

```bash
# 1. Install new dependencies
pnpm install

# 2. Run seed script
pnpm db:seed
# Expected output:
#   13 themes seeded.
#   Demo user ready: demo@formcraft.app / Demo1234!
#   5 forms seeded.
#   89 responses for "Netflix Watchlist Survey"
#   61 responses for "Pink City Jaipur — Visitor Experience"
#   134 responses for "Anime Character Popularity Poll 2024"
#   42 responses for "Startup Idea Validator — FormCraft v2 Features"
#   97 responses for "Gaming Community — Server Feedback Survey"
#   Total responses seeded: 423

# 3. Start dev servers
pnpm dev

# 4. Verify demo login works
#    http://localhost:3000/auth/login
#    Email: demo@formcraft.app  Password: Demo1234!

# 5. Verify explore page shows 4 public forms
#    http://localhost:3000/explore

# 6. Verify form filler works with Netflix theme
#    http://localhost:3000/f/netflix-watchlist

# 7. Verify analytics shows real data
#    http://localhost:3000/dashboard/forms/<id>/responses

# 8. Verify Scalar API docs render
#    http://localhost:8000/docs

# 9. Verify OpenAPI JSON is valid
#    http://localhost:8000/openapi.json

# 10. Verify email welcome works (check Resend dashboard)
#     Register a new account at http://localhost:3000/auth/register

# 11. Verify Razorpay checkout opens
#     http://localhost:3000/pricing → click "Upgrade to Pro"
#     Use test card: 4111 1111 1111 1111

# 12. Verify README reads correctly and all links are correct
#     cat README.md
```

---

## PROMPTS REMAINING AFTER PHASE 4

**1 prompt remaining — Phase 5 (the final one).**

| Phase 5 contents                                                     |
|----------------------------------------------------------------------|
| Vercel deployment config (`vercel.json` for web)                     |
| Railway deployment guide for Express API                             |
| Production environment variables setup                               |
| Conditional logic UI in the form filler (skip questions based on     |
| previous answers — the `logic` field in `form_fields` table)         |
| Form password gate UI at `/f/[slug]` for password-protected forms    |
| Responses table — paginated, filterable, sortable at the responses   |
| dashboard page (currently shows charts only)                         |
| Admin dashboard at `/admin` — all users, forms, response counts      |
| Final judge-ready demo checklist — 20-point quality gate             |
| Performance checklist — image optimisation, bundle size, LCP         |
| `CONTRIBUTING.md` and `LICENSE` file                                 |
ENDOFPROMPT