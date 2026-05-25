import { z } from "zod";

export const planSchema = z.enum(["free", "pro", "team"]);

export const createRazorpayOrderSchema = z.object({
  plan: z.enum(["pro", "team"]),
  billingCycle: z.enum(["monthly", "yearly"]),
});

export const verifyRazorpayPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  plan: z.enum(["pro", "team"]),
  billingCycle: z.enum(["monthly", "yearly"]),
});

export type Plan = z.infer<typeof planSchema>;
export type CreateOrderInput = z.infer<typeof createRazorpayOrderSchema>;
