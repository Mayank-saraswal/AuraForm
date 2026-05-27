// apps/web/components/dashboard/sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import { signOut } from "next-auth/react";
import {
  RiDashboardLine, RiRamLine, RiSettings3Line,
  RiLogoutBoxLine, RiGlobalLine, RiPaletteLine,
} from "react-icons/ri";
import { TbForms, TbChartInfographic } from "react-icons/tb";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

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
  user: { name?: string | null; email?: string | null; image?: string | null; id: string };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const initials = (user.name ?? user.email ?? "U")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Sidebar variant="sidebar">
      {/* Logo */}
      <SidebarHeader className="h-[60px] border-b justify-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <RiRamLine className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">AuraForm</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={label}>
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {BOTTOM_NAV.map(({ href, label, icon: Icon, badge }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild tooltip={label}>
                    <Link href={href} className="flex justify-between w-full">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon />}
                        <span>{label}</span>
                      </div>
                      {badge && (
                        <Badge variant="default" className="h-4 px-1.5 text-[10px]">{badge}</Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User profile + signout */}
      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{user.name ?? "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
          >
            <RiLogoutBoxLine className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
