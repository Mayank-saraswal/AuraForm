// apps/web/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "~/auth";
import { DashboardSidebar } from "~/components/dashboard/sidebar";
import { DashboardHeader }  from "~/components/dashboard/header";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? undefined,
    image: session.user.image ?? null,
  };

  return (
    <SidebarProvider>
      <DashboardSidebar user={user} />
      <SidebarInset className="flex flex-col overflow-hidden bg-background">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
