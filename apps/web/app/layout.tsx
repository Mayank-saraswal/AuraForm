import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter, Space_Grotesk, Bebas_Neue, Playfair_Display, Poppins, DM_Sans } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas-neue", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const poppins = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-poppins", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "AuraForm", template: "%s | AuraForm" },
  description: "Forms that feel like an experience. The modern, beautiful form builder for India.",
  keywords: ["form builder", "typeform alternative", "survey tool", "AuraForm"],
  metadataBase: new URL(process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000"),
  openGraph: {
    title: "AuraForm",
    description: "Forms that feel like an experience.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "var(--primary)",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={[
          geistSans.variable,
          inter.variable,
          spaceGrotesk.variable,
          bebasNeue.variable,
          playfair.variable,
          poppins.variable,
          dmSans.variable,
          "font-sans antialiased",
        ].join(" ")}
      >
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
