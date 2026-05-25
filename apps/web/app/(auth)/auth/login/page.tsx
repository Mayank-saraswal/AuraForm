// apps/web/app/(auth)/auth/login/page.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { loginSchema, type LoginInput } from "@repo/schemas";
import { signIn } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { RiGoogleLine, RiLoader4Line, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    const result = await signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/dashboard",
    });
    if (result.error) {
      toast.error(result.error.message ?? "Invalid email or password.");
      return;
    }
    router.push("/dashboard");
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    setGoogleLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in to your FormCraft account
      </p>

      <Button
        type="button"
        variant="outline"
        className="mt-8 w-full gap-2"
        onClick={handleGoogle}
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

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password"
              className="text-xs text-[#6C47FF] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass
                ? <RiEyeOffLine className="h-4 w-4" />
                : <RiEyeLine className="h-4 w-4" />
              }
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="mt-2 w-full bg-[#6C47FF] hover:bg-[#5B21B6]"
          disabled={isSubmitting}
        >
          {isSubmitting && <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/auth/register" className="font-medium text-[#6C47FF] hover:underline">
          Create one free
        </Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-8 rounded-lg border border-dashed bg-muted/40 p-4">
        <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Demo credentials
        </p>
        <p className="text-xs text-muted-foreground">
          Email: <code className="font-mono">demo@formcraft.app</code>
        </p>
        <p className="text-xs text-muted-foreground">
          Password: <code className="font-mono">Demo1234!</code>
        </p>
      </div>
    </div>
  );
}
