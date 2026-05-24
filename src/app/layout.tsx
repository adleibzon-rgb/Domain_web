import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Domain Scanner — Domain intelligence platform",
    template: "%s | Domain Scanner",
  },
  description:
    "Modern domain intelligence and infrastructure analysis. DNS, WHOIS, SSL, geo, security headers, and monitoring.",
  keywords: [
    "domain scanner",
    "dns",
    "whois",
    "ssl",
    "cybersecurity",
    "infrastructure",
  ],
  openGraph: {
    title: "Domain Scanner",
    description: "Advanced domain intelligence with premium UX",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="gradient-mesh min-h-screen">
            <Header />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
