// apps/web/app/(auth)/layout.tsx
import Link from "next/link";
import { RiRamLine } from "react-icons/ri";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hero-mesh hidden flex-col items-start justify-between p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C47FF]">
            <RiRamLine className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">FormCraft</span>
        </Link>
        <blockquote className="max-w-sm">
          <p className="text-2xl font-medium leading-snug text-white">
            &ldquo;The best tool I&apos;ve found for collecting data from students.
            The themes are incredible.&rdquo;
          </p>
          <footer className="mt-4 text-sm text-white/50">
            Priya Mehta — Product Manager, Bangalore
          </footer>
        </blockquote>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6C47FF]">
              <RiRamLine className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-semibold">FormCraft</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
