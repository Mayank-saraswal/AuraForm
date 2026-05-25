// apps/web/components/dashboard/sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import { signOut } from "~/lib/auth-client";
import {
  RiDashboardLine, RiFormLine, RiSettings3Line,
  RiLogoutBoxLine, RiGlobalLine, RiPaletteLine,
} from "react-icons/ri";
import { TbForms, TbChartInfographic } from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";

const NAV = [
  { href: "/dashboard",           label: "Overview",      icon: RiDashboardLine },
  { href: "/dashboard/forms",     label: "My Forms",      icon: TbForms },
  { href: "/dashboard/analytics", label: "Analytics",     icon: TbChartInfographic },
  { href: "/dashboard/themes",    label: "Themes",        icon: RiPaletteLine },
  { href: "/dashboard/settings",  label: "Settings",      icon: RiSettings3Line },
];

const BOTTOM_NAV = [
  { href: "/explore",    label: "Explore",    icon: RiGlobalLine, badge: null },
  { href: "/pricing",    label: "Upgrade",    icon: null as React.ElementType | null, badge: "Pro" },
];

interface SidebarProps {
  user: { name?: string | null; email?: string; image?: string | null; id: string };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const initials = (user.name ?? user.email ?? "U")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="hidden md:flex h-full w-[240px] flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-[60px] items-center gap-2.5 border-b px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#6C47FF]">
          <RiFormLine className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold">FormCraft</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3">
          <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Workspace
          </p>
          <ul className="flex flex-col gap-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-[#6C47FF]/10 text-[#6C47FF] font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 px-3">
          <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Platform
          </p>
          <ul className="flex flex-col gap-0.5">
            {BOTTOM_NAV.map(({ href, label, icon: Icon, badge }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                  {label}
                  {badge && (
                    <Badge className="ml-auto h-4 px-1.5 text-[10px] bg-[#6C47FF] text-white">{badge}</Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User profile + signout */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="bg-[#6C47FF]/20 text-[#6C47FF] text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{user.name ?? "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={async () => { await signOut(); router.push("/"); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
          >
            <RiLogoutBoxLine className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
