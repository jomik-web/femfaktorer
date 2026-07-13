import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FemFaktorer -- forstå personligheten din",
  description:
    "En norsk personlighetstest basert på offentlig tilgjengelig forskning på femfaktormodellen (Big Five). Ingen kategorier, ingen diagnoser -- bare nyanser.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
