import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dine Fasetter -- Flere sider av deg",
  description:
    "Bli litt klokere på hvem du egentlig er. En norsk personlighetstest basert på offentlig tilgjengelig forskning på femfaktormodellen (Big Five).",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
