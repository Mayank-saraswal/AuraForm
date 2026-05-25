// apps/web/app/(marketing)/layout.tsx
import { MarketingNav } from "~/components/marketing/nav";
import { MarketingFooter } from "~/components/marketing/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
