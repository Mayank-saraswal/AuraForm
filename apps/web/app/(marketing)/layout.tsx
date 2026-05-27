// apps/web/app/(marketing)/layout.tsx
import { FloatingNav } from "~/components/ui/floating-navbar";
import { Home, Info, CreditCard } from "lucide-react";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "About",
      link: "#about",
      icon: <Info className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Pricing",
      link: "/pricing",
      icon: <CreditCard className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <FloatingNav navItems={navItems} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
