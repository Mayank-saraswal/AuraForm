// apps/web/components/marketing/footer.tsx
import Link from "next/link";
import { RiFormLine, RiGithubLine, RiTwitterXLine } from "react-icons/ri";

const LINKS = {
  Product: [
    { label: "Features",  href: "/#features" },
    { label: "Themes",    href: "/#themes" },
    { label: "Pricing",   href: "/pricing" },
    { label: "Explore",   href: "/explore" },
    { label: "API Docs",  href: "/api-docs" },
  ],
  Company: [
    { label: "About",     href: "/about" },
    { label: "Blog",      href: "/blog" },
    { label: "Privacy",   href: "/privacy" },
    { label: "Terms",     href: "/terms" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#050505] px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C47FF]">
                <RiFormLine className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold text-white">FormCraft</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
              Forms that feel like an experience. Built for India.
              Powered by Razorpay, Resend, and Next.js.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="https://github.com" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors">
                <RiGithubLine className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors">
                <RiTwitterXLine className="h-5 w-5" />
              </a>
            </div>
          </div>

          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">
                {section}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-white/50 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            {new Date().getFullYear()} FormCraft. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Payments secured by Razorpay. Emails by Resend.
          </p>
        </div>
      </div>
    </footer>
  );
}
