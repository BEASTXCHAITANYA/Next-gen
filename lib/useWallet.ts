"use client";

import { useContext } from "react";
import { WalletContext, type WalletContextValue } from "./WalletProvider";

/**
 * Live wallet state shared across the app. Must be called from a client
 * component rendered inside <WalletProvider> (mounted in app/layout.tsx).
 */
export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);

  if (context === null) {
    throw new Error(
      "useWallet() was called outside <WalletProvider>. Wrap the tree in " +
        "<WalletProvider> (see app/layout.tsx) and make sure the calling " +
        "component has the \"use client\" directive."
    );
  }

  return context;
}
