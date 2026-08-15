import type { Metadata } from "next";
import { Bungee, Caveat, Inter, Special_Elite } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WalletProvider } from "@/lib/WalletProvider";
import "./globals.css";

const display = Special_Elite({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

// Reserved for handwritten annotations; no consumer yet.
const annotate = Caveat({
  subsets: ["latin"],
  variable: "--font-annotate",
  display: "swap",
});

// Scoped to the navbar wordmark only, not the sitewide font-display token
// (Special Elite, applied to headings/buttons/badges) — Bungee's blocky
// stencil-like letterforms are a logotype treatment, not a body/heading face.
const logo = Bungee({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-logo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CARBON_REEF",
  description: "Tokenized carbon credits for coastal reef restoration.",
  icons: { icon: "/images/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${annotate.variable} ${logo.variable} ${inter.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-background text-text-light">
        <WalletProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
