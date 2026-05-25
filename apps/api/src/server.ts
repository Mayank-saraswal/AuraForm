import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";
import { serverRouter, createContext, auth } from "@repo/trpc/server";
import { toNodeHandler } from "better-auth/node";
import { env } from "./env";

export const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // allow embedding (for forms)
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com"],
        connectSrc: ["'self'", "https://api.razorpay.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: env.NODE_ENV === "prod" ? [] : null,
      },
    },
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  env.FRONTEND_URL ?? "http://localhost:3000",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-trpc-source"],
  })
);

// ── Global rate limiter ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,                   // 500 requests per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
  skip: (req) => req.path === "/health",
});

// ── Strict rate limit for public form submission ──────────────────────────────
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 20,                      // 20 submissions per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Submission limit reached. Please try again later." },
  keyGenerator: (req) => {
    // Use x-forwarded-for safely (only trust first IP)
    const forwarded = req.headers["x-forwarded-for"] as string | undefined;
    const rawIp = (forwarded?.split(",")[0] ?? req.ip ?? "unknown").trim();
    return ipKeyGenerator(rawIp);
  },
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(globalLimiter);

// ── Basic security headers ────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "FormCraft API is running." }));
app.get("/health", (req, res) => res.json({ status: "healthy", ts: Date.now() }));

// ── better-auth handler ───────────────────────────────────────────────────────
// Express 5 requires named wildcards (path-to-regexp v8)
app.all("/auth/{*splat}", toNodeHandler(auth));

// ── OpenAPI + Scalar docs ─────────────────────────────────────────────────────
let openApiDocument: ReturnType<typeof generateOpenApiDocument> | null = null;
try {
  openApiDocument = generateOpenApiDocument(serverRouter, {
    title: "FormCraft API",
    version: "1.0.0",
    description: "Industry-grade form builder API. Full OpenAPI 3.0 documentation.",
    baseUrl: env.BASE_URL.concat("/api"),
    tags: [
      "Forms",
      "Public Forms",
      "Fields",
      "Responses",
      "Analytics",
      "Themes",
      "Payments",
    ],
  });
} catch (err) {
  logger.warn("OpenAPI document generation failed — /docs will be unavailable", { error: err });
}

if (openApiDocument) {
  app.get("/openapi.json", (req, res) => res.json(openApiDocument));
  app.use("/docs", apiReference({ url: "/openapi.json", theme: "saturn" }));
}

// ── tRPC (main — all endpoints including public) ───────────────────────────────
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
    onError({ path, error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        logger.error(`tRPC error on ${path ?? "unknown"}`, { error });
      }
    },
  })
);

// ── REST API via OpenAPI middleware (with submit rate limiting) ────────────────
try {
  app.use(
    "/api/responses/submit",
    submitLimiter,
    createOpenApiExpressMiddleware({ router: serverRouter, createContext })
  );
  app.use("/api", createOpenApiExpressMiddleware({ router: serverRouter, createContext }));
} catch (err) {
  logger.warn("OpenAPI middleware initialization failed — REST endpoints will be unavailable", { error: err });
}

// ── Razorpay webhook (raw body needed for signature verification) ─────────────
app.post(
  "/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["x-razorpay-signature"] as string;
    const secret = process.env["RAZORPAY_WEBHOOK_SECRET"] ?? "";
    const expectedSig = require("node:crypto")
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSig) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());
    logger.info("Razorpay webhook received", { event: event.event });

    // Handle events:
    // subscription.charged → extend subscription period
    // subscription.cancelled → set status to cancelled
    // payment.failed → notify user
    res.json({ received: true });
  }
);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

export default app;
