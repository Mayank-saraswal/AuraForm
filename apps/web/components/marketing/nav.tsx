// apps/web/components/marketing/nav.tsx
"use client";
import Link from "next/link";
import { useSession } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { RiRamLine, RiMenuLine, RiCloseLine } from "react-icons/ri";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Themes",   href: "/#themes" },
  { label: "Pricing",  href: "/pricing" },
  { label: "Explore",  href: "/explore" },
];

export function MarketingNav() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C47FF]">
            <RiRamLine className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">FormCraft</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <Button asChild size="sm" className="bg-[#6C47FF] hover:bg-[#5B21B6]">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="bg-[#6C47FF] hover:bg-[#5B21B6]">
                <Link href="/auth/register">Get started free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-md p-2 text-white/70 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <RiCloseLine className="h-5 w-5" /> : <RiMenuLine className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-black/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              {session ? (
                <Button asChild size="sm" className="bg-[#6C47FF]">
                  <Link href="/dashboard">Open Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-[#6C47FF]">
                    <Link href="/auth/register">Get started free</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
