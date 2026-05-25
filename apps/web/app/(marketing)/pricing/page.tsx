// apps/web/app/(marketing)/pricing/page.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "~/trpc/client";
import { useSession } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  RiCheckLine, RiCloseLine, RiLoader4Line, RiShieldLine,
} from "react-icons/ri";
import { SiRazorpay } from "react-icons/si";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "For individuals just getting started",
    features: [
      { label: "3 active forms",             included: true },
      { label: "100 responses per form",      included: true },
      { label: "8 field types",               included: true },
      { label: "Basic themes (8)",            included: true },
      { label: "CSV export",                  included: true },
      { label: "Custom URL slug",             included: false },
      { label: "QR code sharing",             included: false },
      { label: "Remove FormCraft branding",   included: false },
      { label: "All premium themes (20+)",    included: false },
      { label: "Password-protected forms",    included: false },
      { label: "Priority support",            included: false },
    ],
    cta:    "Get started free",
    ctaHref: "/auth/register",
    color:  "#6B7280",
    plan:   "free" as const,
  },
  {
    name: "Pro",
    monthlyPrice: 499,
    yearlyPrice: 3999,
    description: "For creators and solo makers",
    features: [
      { label: "Unlimited active forms",      included: true },
      { label: "Unlimited responses",         included: true },
      { label: "All 14 field types",          included: true },
      { label: "All 20+ premium themes",      included: true },
      { label: "CSV export",                  included: true },
      { label: "Custom URL slug",             included: true },
      { label: "QR code sharing",             included: true },
      { label: "Remove FormCraft branding",   included: true },
      { label: "Password-protected forms",    included: true },
      { label: "Form expiry and limits",      included: true },
      { label: "Priority email support",      included: false },
    ],
    cta:    "Upgrade to Pro",
    color:  "#6C47FF",
    plan:   "pro" as const,
    popular: true,
  },
  {
    name: "Team",
    monthlyPrice: 1499,
    yearlyPrice: 11999,
    description: "For teams and growing businesses",
    features: [
      { label: "Everything in Pro",           included: true },
      { label: "5 team members",              included: true },
      { label: "Shared form library",         included: true },
      { label: "API access",                  included: true },
      { label: "White-label forms",           included: true },
      { label: "Conditional logic",           included: true },
      { label: "Webhook integrations",        included: true },
      { label: "Admin dashboard",             included: true },
      { label: "Priority phone support",      included: true },
      { label: "SLA guarantee",               included: true },
      { label: "Custom domain",               included: true },
    ],
    cta:    "Upgrade to Team",
    color:  "#C026D3",
    plan:   "team" as const,
  },
];

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

export default function PricingPage() {
  const [cycle, setCycle]       = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading]   = useState<string | null>(null);
  const { data: session }       = useSession();
  const router                  = useRouter();

  const createOrderMutation  = trpc.payments.createOrder.useMutation();
  const verifyPaymentMutation = trpc.payments.verifyPayment.useMutation();

  async function handleUpgrade(plan: "pro" | "team") {
    if (!session) { router.push("/auth/register"); return; }
    setLoading(plan);

    try {
      // Load Razorpay script
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }

      const order = await createOrderMutation.mutateAsync({ plan, billingCycle: cycle });

      const orderData = order as {
        keyId: string; amount: number; currency: string; orderId: string;
      };

      const rzp = new window.Razorpay({
        key:              orderData.keyId,
        amount:           orderData.amount,
        currency:         orderData.currency,
        order_id:         orderData.orderId,
        name:             "FormCraft",
        description:      `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan \u2014 ${cycle}`,
        image:            "/icon.png",
        prefill: {
          name:  session.user.name,
          email: session.user.email,
        },
        theme: { color: plan === "pro" ? "#6C47FF" : "#C026D3" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id:   string;
          razorpay_signature:  string;
        }) => {
          await verifyPaymentMutation.mutateAsync({
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            plan,
            billingCycle:      cycle,
          });
          toast.success(`Welcome to FormCraft ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`);
          router.push("/dashboard");
        },
      });

      rzp.open();
    } catch (e: unknown) {
      toast.error((e as { message?: string }).message ?? "Payment failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-[#050505] px-4 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-white/50"
          >
            Start free. Upgrade when you need more. Cancel anytime.
          </motion.p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setCycle("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                cycle === "monthly" ? "bg-white text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("yearly")}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                cycle === "yearly" ? "bg-white text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Yearly
              <Badge className="bg-[#10B981] text-white text-[10px] h-4 px-1.5">Save 33%</Badge>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? "border-[#6C47FF] bg-[#6C47FF]/5"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#6C47FF] text-white">Most popular</Badge>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-white/50">{plan.description}</p>
              </div>

              <div className="mt-6">
                {plan.monthlyPrice === 0 ? (
                  <div className="text-4xl font-bold text-white">Free</div>
                ) : (
                  <div className="flex items-end gap-1">
                    <div className="text-4xl font-bold text-white">
                      \u20B9{cycle === "monthly" ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}
                    </div>
                    <div className="mb-1 text-sm text-white/40">/month</div>
                  </div>
                )}
                {cycle === "yearly" && plan.yearlyPrice > 0 && (
                  <p className="mt-1 text-xs text-white/40">
                    \u20B9{plan.yearlyPrice} billed yearly
                  </p>
                )}
              </div>

              <div className="my-6 h-px bg-white/10" />

              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm">
                    {f.included
                      ? <RiCheckLine className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#10B981]" />
                      : <RiCloseLine className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/20" />
                    }
                    <span className={f.included ? "text-white/80" : "text-white/30"}>{f.label}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.monthlyPrice === 0 ? (
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/auth/register">{plan.cta}</Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2"
                    style={{ background: plan.color }}
                    onClick={() => handleUpgrade(plan.plan as "pro" | "team")}
                    disabled={loading === plan.plan}
                  >
                    {loading === plan.plan
                      ? <RiLoader4Line className="h-4 w-4 animate-spin" />
                      : <SiRazorpay className="h-4 w-4" />
                    }
                    {plan.cta}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/30">
          <div className="flex items-center gap-2 text-sm">
            <SiRazorpay className="h-5 w-5" />
            Secured by Razorpay
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RiShieldLine className="h-5 w-5" />
            Cancel anytime
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RiCheckLine className="h-5 w-5" />
            UPI, cards, netbanking accepted
          </div>
        </div>

        {/* Test card */}
        <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2">
            Test payment credentials
          </p>
          <p className="text-xs text-white/30">
            Card: <code className="font-mono">4111 1111 1111 1111</code> &nbsp;&middot;&nbsp;
            UPI: <code className="font-mono">success@razorpay</code> &nbsp;&middot;&nbsp;
            Any CVV and future date
          </p>
        </div>
      </div>
    </div>
  );
}
