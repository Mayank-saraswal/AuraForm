// apps/web/components/dashboard/header.tsx
"use client";
import { RiAddLine } from "react-icons/ri";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard":             "Overview",
  "/dashboard/forms":       "My Forms",
  "/dashboard/analytics":   "Analytics",
  "/dashboard/themes":      "Themes",
  "/dashboard/settings":    "Settings",
};

export function DashboardHeader({ user }: { user: { name?: string | null } }) {
  const pathname = usePathname();
  const title    = TITLES[pathname] ?? "Dashboard";

  return (
    <header className="flex h-[60px] items-center justify-between border-b bg-background px-6">
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <Button asChild size="sm" className="gap-1.5 bg-[#6C47FF] hover:bg-[#5B21B6]">
          <Link href="/dashboard/forms/new">
            <RiAddLine className="h-4 w-4" />
            New form
          </Link>
        </Button>
      </div>
    </header>
  );
}
