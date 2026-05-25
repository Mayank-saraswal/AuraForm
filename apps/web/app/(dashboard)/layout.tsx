// apps/web/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@repo/trpc/server";
import { DashboardSidebar } from "~/components/dashboard/sidebar";
import { DashboardHeader }  from "~/components/dashboard/header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <DashboardSidebar user={session.user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
