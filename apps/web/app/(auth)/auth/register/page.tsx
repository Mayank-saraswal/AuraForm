// apps/web/app/(auth)/auth/register/page.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { registerSchema, type RegisterInput } from "@repo/schemas";
import { signIn } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { RiGoogleLine, RiLoader4Line, RiEyeLine, RiEyeOffLine, RiCheckLine } from "react-icons/ri";
import { useState } from "react";
import { trpc } from "~/trpc/client";

const PASSWORD_RULES = [
  { label: "At least 8 characters",   test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",     test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",     test: (p: string) => /[a-z]/.test(p) },
  { label: "One number",               test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const password = watch("password", "");

  const registerMutation = trpc.auth.register.useMutation();

  async function onSubmit(data: RegisterInput) {
    try {
      // Step 1: Create user via API
      try {
        await registerMutation.mutateAsync({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        });
      } catch (err: any) {
        toast.error(err.message || "Registration failed. Please try again.");
        return;
      }

      // Step 2: Sign in with credentials
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Account created but sign-in failed. Please log in manually.");
        router.push("/auth/login");
        return;
      }

      toast.success("Account created! Welcome to AuraForm.");
      router.push("/dashboard");
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Free forever. No credit card required.
      </p>

      <Button
        type="button"
        variant="outline"
        className="mt-8 w-full gap-2"
        onClick={async () => {
          setGoogleLoading(true);
          await signIn("google", { callbackUrl: "/dashboard" });
          setGoogleLoading(false);
        }}
        disabled={googleLoading}
      >
        {googleLoading
          ? <RiLoader4Line className="h-4 w-4 animate-spin" />
          : <RiGoogleLine className="h-4 w-4" />
        }
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" placeholder="Priya Mehta" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="Create a strong password"
              className="pr-10"
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPass ? <RiEyeOffLine className="h-4 w-4" /> : <RiEyeLine className="h-4 w-4" />}
            </button>
          </div>
          {/* Password strength indicator */}
          {password.length > 0 && (
            <ul className="mt-1 flex flex-col gap-1">
              {PASSWORD_RULES.map((rule) => (
                <li key={rule.label} className={`flex items-center gap-1.5 text-xs
                  ${rule.test(password) ? "text-[#10B981]" : "text-muted-foreground"}`}>
                  <RiCheckLine className={`h-3 w-3 ${rule.test(password) ? "opacity-100" : "opacity-20"}`} />
                  {rule.label}
                </li>
              ))}
            </ul>
          )}
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          className="mt-2 w-full bg-[var(--color-foreground)] text-[var(--color-background)] hover:bg-[var(--color-foreground)]/90"
          disabled={isSubmitting}
        >
          {isSubmitting && <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-[var(--color-foreground)] underline hover:text-[var(--color-muted-foreground)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
