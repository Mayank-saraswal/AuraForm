import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  index,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active", "cancelled", "expired", "past_due", "trialing",
]);

export const subscriptionsTable = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    // Razorpay identifiers
    razorpaySubscriptionId: text("razorpay_subscription_id").unique(),
    razorpayCustomerId: text("razorpay_customer_id"),

    plan: varchar("plan", { length: 20 }).notNull(),                   // pro | team
    billingCycle: varchar("billing_cycle", { length: 10 }).notNull(),  // monthly | yearly
    status: subscriptionStatusEnum("status").default("active").notNull(),

    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),

    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
  },
  (t) => ({
    userIdIdx: index("subscriptions_user_id_idx").on(t.userId),
  })
);

export const paymentsTable = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptionsTable.id),

    razorpayOrderId: text("razorpay_order_id").notNull().unique(),
    razorpayPaymentId: text("razorpay_payment_id").unique(),
    razorpaySignature: text("razorpay_signature"),

    amountPaise: integer("amount_paise").notNull(),                    // amount in paise (1 INR = 100 paise)
    currency: varchar("currency", { length: 3 }).default("INR").notNull(),
    status: varchar("status", { length: 20 }).notNull(),               // created | paid | failed | refunded

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("payments_user_id_idx").on(t.userId),
  })
);

export type SelectSubscription = typeof subscriptionsTable.$inferSelect;
export type SelectPayment = typeof paymentsTable.$inferSelect;
