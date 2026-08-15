"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav";
import { useWallet } from "@/lib/useWallet";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Navbar() {
  // Wallet state is owned by <WalletProvider>, so it stays in sync with every
  // other consumer (the submit form's gating, for one) off a single listener.
  const { address, connecting, error, connect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:gap-6 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {/* favicon.png is the mark on an opaque white square, not a
              transparent PNG — rendered directly it showed as a white tile
              floating on the black bar. favicon-mark-cutout.png is a derived
              alpha version (same technique as the hero's brush marks): white
              canvas dropped, the dark fill remapped to text-light since a
              black mark would otherwise sit black-on-black against this bar,
              and the leaf kept at its own yellow. */}
          <Image
            src="/images/favicon-mark-cutout.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className="font-logo text-base tracking-tight sm:text-lg">
            <span className="text-text-light">CARBON_</span>
            <span className="text-accent">REEF</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-text-light/70 transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={connect}
            disabled={connecting || Boolean(address)}
            title={address ?? undefined}
            className="shrink-0 whitespace-nowrap rounded-full bg-accent px-3 py-2 font-display text-[10px] uppercase tracking-wide text-text-dark transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-100 sm:px-5 sm:text-xs"
          >
            {address
              ? shortenAddress(address)
              : connecting
                ? "Connecting..."
                : "Connect Wallet"}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            className="rounded border border-white/20 px-2.5 py-2 text-text-light md:hidden"
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
        </div>
      </nav>

      {error && (
        <p role="alert" className="px-4 pb-2 text-center text-xs text-accent">
          {error}
        </p>
      )}

      {menuOpen && (
        <ul className="border-t border-white/10 px-6 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-text-light/70 hover:text-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
