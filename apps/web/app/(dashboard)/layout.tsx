// apps/web/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "~/auth";
import { DashboardSidebar } from "~/components/dashboard/sidebar";
import { DashboardHeader }  from "~/components/dashboard/header";

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
    <div className="flex h-dvh overflow-hidden bg-background">
      <DashboardSidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
