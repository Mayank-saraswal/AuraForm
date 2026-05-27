// apps/web/app/(auth)/layout.tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2 bg-[var(--color-background)]">
      {/* Left panel — branding */}
      <div className="hidden flex-col items-start justify-between p-12 lg:flex relative overflow-hidden bg-[#050505]">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        <Link href="/" className="flex items-center gap-2.5 z-10 hover:opacity-80 transition-opacity">
          <img src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=64&h=64&auto=format&fit=crop" alt="Logo" className="w-8 h-8 rounded-md object-cover" />
          <span className="text-xl font-bold tracking-tight text-[var(--color-foreground)]">AuraForm</span>
        </Link>
        <blockquote className="max-w-md z-10">
          <p className="text-3xl leading-snug text-[var(--color-foreground)] font-medium">
            "AuraForm transformed our data collection into a <span className="font-serif italic font-normal">Seamless</span> experience."
          </p>
          <footer className="mt-6 text-sm text-[var(--color-muted-foreground)]">
            Elena Rossi — Data Analyst, Milan
          </footer>
        </blockquote>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <Link href="/" className="absolute top-8 left-8 text-sm flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors hidden lg:flex">
          <ChevronLeft size={16} /> Back to home
        </Link>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=64&h=64&auto=format&fit=crop" alt="Logo" className="w-7 h-7 rounded-md object-cover" />
            <span className="text-base font-bold tracking-tight text-[var(--color-foreground)]">AuraForm</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
