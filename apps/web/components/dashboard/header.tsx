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

import { SidebarTrigger } from "~/components/ui/sidebar";

export function DashboardHeader({ user }: { user: { name?: string | null } }) {
  const pathname = usePathname();
  const title    = TITLES[pathname] ?? "Dashboard";

  return (
    <header className="flex h-[60px] items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
          <Link href="/dashboard/forms/new">
            <RiAddLine className="h-4 w-4" />
            New form
          </Link>
        </Button>
      </div>
    </header>
  );
}
