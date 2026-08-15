"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BrowserProvider, type JsonRpcSigner } from "ethers";

export type WalletContextValue = {
  address: string | null;
  /** Ethers v6 signer for the active account — pass straight to `new Contract(...)`. */
  signer: JsonRpcSigner | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

export const WalletContext = createContext<WalletContextValue | null>(null);

export const NO_METAMASK =
  "MetaMask not detected — please install it to connect a wallet.";

/**
 * MetaMask reports EIP-1193 numeric codes, but ethers wraps the provider error
 * in its own with a string `code` ("ACTION_REJECTED", "UNKNOWN_ERROR", ...) and
 * nests the original under `info.error`. Reading only the outer code misses
 * -32002; reading only the inner one misses ethers' own rejection label. So
 * every position is collected and matched.
 */
function walletErrorCodes(err: unknown): Array<number | string> {
  if (typeof err !== "object" || err === null) return [];
  const e = err as {
    code?: number | string;
    error?: { code?: number | string };
    info?: { error?: { code?: number | string } };
  };
  return [e.code, e.error?.code, e.info?.error?.code].filter(
    (code): code is number | string => code !== undefined && code !== null
  );
}

function messageForError(err: unknown): string {
  const codes = walletErrorCodes(err);

  if (codes.includes(4001) || codes.includes("ACTION_REJECTED")) {
    return "Connection request rejected in MetaMask.";
  }
  if (codes.includes(-32002)) {
    return "MetaMask already has a request open — finish it in the extension.";
  }

  console.error("Wallet connection failed:", err);
  return "Could not connect to MetaMask. Please try again.";
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One BrowserProvider for the app; rebuilt when the chain changes.
  const providerRef = useRef<BrowserProvider | null>(null);

  const getProvider = useCallback(() => {
    if (typeof window.ethereum === "undefined") return null;
    if (!providerRef.current) {
      providerRef.current = new BrowserProvider(window.ethereum);
    }
    return providerRef.current;
  }, []);

  const disconnect = useCallback(() => {
    // MetaMask exposes no programmatic revoke, so this clears local session
    // state only — the site stays authorized until revoked in the extension.
    setAddress(null);
    setSigner(null);
    setError(null);
  }, []);

  // Silent restore on mount plus live account tracking. Registered once for
  // the whole app, so every useWallet() consumer shares this single listener.
  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    let active = true;

    const adopt = async (accounts: string[]) => {
      if (!active) return;

      if (accounts.length === 0) {
        setAddress(null);
        setSigner(null);
        return;
      }

      setAddress(accounts[0]);

      const provider = getProvider();
      if (!provider) return;

      try {
        // Already-authorized accounts resolve without prompting.
        const next = await provider.getSigner(accounts[0]);
        if (active) setSigner(next);
      } catch (err) {
        console.error("Could not derive signer:", err);
        if (active) setSigner(null);
      }
    };

    const readAccounts = () => {
      ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => adopt(accounts))
        .catch(() => {
          /* ignore — user simply isn't connected */
        });
    };

    readAccounts();

    const handleAccountsChanged = (...args: never[]) => {
      setError(null);
      void adopt(args[0] as unknown as string[]);
    };

    // A network switch invalidates the cached provider and any signer from it.
    const handleChainChanged = () => {
      providerRef.current = null;
      readAccounts();
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      active = false;
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [getProvider]);

  const connect = useCallback(async () => {
    setError(null);

    const provider = getProvider();
    if (!provider) {
      setError(NO_METAMASK);
      return;
    }

    setConnecting(true);
    try {
      const next = await provider.getSigner();
      setSigner(next);
      setAddress(await next.getAddress());
    } catch (err) {
      setError(messageForError(err));
    } finally {
      setConnecting(false);
    }
  }, [getProvider]);

  const value = useMemo<WalletContextValue>(
    () => ({ address, signer, connecting, error, connect, disconnect }),
    [address, signer, connecting, error, connect, disconnect]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
