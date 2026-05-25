import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";
import { router, protectedProcedure } from "../../trpc";
import { db } from "@repo/database";
import { paymentsTable, subscriptionsTable, usersTable } from "@repo/database";
import { createRazorpayOrderSchema, verifyRazorpayPaymentSchema } from "@repo/schemas";
import { eq } from "drizzle-orm";
import { openApiMeta } from "../../utils/path-generator";

// Price map in paise (1 INR = 100 paise)
const PRICES = {
  pro_monthly: 49900,    // ₹499/month
  pro_yearly: 399900,    // ₹3999/year (save ~₹2000)
  team_monthly: 149900,  // ₹1499/month
  team_yearly: 1199900,  // ₹11999/year
} as const;

function getRazorpay() {
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env["RAZORPAY_KEY_ID"],
    key_secret: process.env["RAZORPAY_KEY_SECRET"],
  });
}

export const paymentsRouter = router({
  createOrder: protectedProcedure
    .meta(openApiMeta("POST", "/payments/create-order", ["Payments"], true))
    .input(createRazorpayOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const razorpay = getRazorpay();
      const key = `${input.plan}_${input.billingCycle}` as keyof typeof PRICES;
      const amount = PRICES[key];

      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `receipt_${ctx.user.id}_${Date.now()}`,
        notes: { userId: ctx.user.id, plan: input.plan, billingCycle: input.billingCycle },
      });

      // Record order intent
      await db.insert(paymentsTable).values({
        userId: ctx.user.id,
        razorpayOrderId: order.id,
        amountPaise: amount,
        currency: "INR",
        status: "created",
      });

      return {
        orderId: order.id,
        amount,
        currency: "INR",
        keyId: process.env["RAZORPAY_KEY_ID"],
      };
    }),

  verifyPayment: protectedProcedure
    .meta(openApiMeta("POST", "/payments/verify", ["Payments"], true))
    .input(verifyRazorpayPaymentSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify HMAC signature — critical security check
      const generatedSignature = crypto
        .createHmac("sha256", process.env["RAZORPAY_KEY_SECRET"] ?? "")
        .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== input.razorpaySignature) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Payment verification failed. Invalid signature.",
        });
      }

      // Update payment record
      await db
        .update(paymentsTable)
        .set({
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
          status: "paid",
        })
        .where(eq(paymentsTable.razorpayOrderId, input.razorpayOrderId));

      // Create subscription record
      const now = new Date();
      const periodEnd = new Date(now);
      if (input.billingCycle === "monthly") periodEnd.setMonth(periodEnd.getMonth() + 1);
      else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

      await db.insert(subscriptionsTable).values({
        userId: ctx.user.id,
        plan: input.plan,
        billingCycle: input.billingCycle,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });

      // Upgrade user plan
      await db
        .update(usersTable)
        .set({ plan: input.plan as "pro" | "team" })
        .where(eq(usersTable.id, ctx.user.id));

      return { success: true, plan: input.plan };
    }),

  getSubscription: protectedProcedure
    .query(async ({ ctx }) => {
      return db.query.subscriptionsTable.findFirst({
        where: eq(subscriptionsTable.userId, ctx.user.id),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });
    }),
});
