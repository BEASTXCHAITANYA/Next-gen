"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWallet } from "@/lib/useWallet";

const POLYGONSCAN_TX = "https://amoy.polygonscan.com/tx/";

type SubmissionStatus = "pending" | "verified" | "rejected";

type VerificationStatus = "verified" | "pending_imagery" | "failed";

type Submission = {
  id: string;
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  status: SubmissionStatus;
  txHash: string | null;
  verificationStatus: VerificationStatus | null;
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  pending: "border-accent/40 bg-accent/15 text-accent",
  verified: "border-emerald-400/40 bg-emerald-400/15 text-emerald-300",
  rejected: "border-red-400/40 bg-red-400/15 text-red-300",
};

function readString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return null;
}

function readNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

/**
 * The backend doesn't exist yet, so field names aren't settled. Both snake_case
 * and camelCase are accepted and anything unrecognised is dropped rather than
 * rendered as undefined.
 */
function normalizeSubmission(raw: unknown): Submission | null {
  if (typeof raw !== "object" || raw === null) return null;
  const record = raw as Record<string, unknown>;

  const id = readString(record.id, record.submission_id, record.submissionId);
  if (!id) return null;

  const status = String(record.status ?? "pending").toLowerCase();
  const verificationStatus = readString(
    record.verificationStatus,
    record.verification_status
  );

  return {
    id,
    photoUrl: readString(record.photo_url, record.photoUrl, record.photo),
    latitude: readNumber(record.latitude, record.lat),
    longitude: readNumber(record.longitude, record.lng, record.lon),
    status:
      status === "verified" || status === "rejected" ? status : "pending",
    txHash: readString(record.tx_hash, record.txHash),
    verificationStatus:
      verificationStatus === "verified" ||
      verificationStatus === "pending_imagery" ||
      verificationStatus === "failed"
        ? verificationStatus
        : null,
  };
}

function formatCoordinate(value: number | null) {
  return value === null ? "—" : value.toFixed(6);
}

export default function DashboardPage() {
  const { address, connecting, error: walletError, connect } = useWallet();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [serviceDown, setServiceDown] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [checkErrors, setCheckErrors] = useState<Record<string, string>>({});

  const loadSubmissions = useCallback(
    async (wallet: string, signal: AbortSignal) => {
      setLoading(true);
      setServiceDown(false);

      try {
        const response = await fetch(
          `/api/submissions?wallet=${encodeURIComponent(wallet)}`,
          { signal }
        );
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        const body: unknown = await response.json();

        // The route's contract is { submissions: [...] }; a bare array is also
        // accepted. Any other shape means the endpoint isn't returning what we
        // expect, which is a service failure — not a genuinely empty result.
        let rows: unknown[];
        if (Array.isArray(body)) {
          rows = body;
        } else if (
          typeof body === "object" &&
          body !== null &&
          Array.isArray((body as { submissions?: unknown }).submissions)
        ) {
          rows = (body as { submissions: unknown[] }).submissions;
        } else {
          throw new Error("Unexpected response shape from /api/submissions");
        }

        setSubmissions(
          rows
            .map(normalizeSubmission)
            .filter((row): row is Submission => row !== null)
        );
      } catch (err) {
        if (signal.aborted) return;
        // Endpoint may not exist yet — fall back to the empty state.
        console.error("Could not load submissions:", err);
        setSubmissions([]);
        setServiceDown(true);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!address) {
      setSubmissions([]);
      setServiceDown(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    void loadSubmissions(address, controller.signal);
    return () => controller.abort();
  }, [address, loadSubmissions]);

  async function checkVerification(id: string) {
    setCheckingId(id);
    setCheckErrors((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });

    try {
      const response = await fetch(`/api/verify/${encodeURIComponent(id)}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const body: unknown = await response.json();
      const updated = normalizeSubmission(
        (body as { submission?: unknown })?.submission ?? body
      );
      if (!updated) throw new Error("Unexpected response shape");

      setSubmissions((previous) =>
        previous.map((row) => (row.id === id ? updated : row))
      );
    } catch (err) {
      console.error("Verification check failed:", err);
      setCheckErrors((previous) => ({
        ...previous,
        [id]: "Verification service unavailable.",
      }));
    } finally {
      setCheckingId(null);
    }
  }

  return (
    <div className="px-4 py-12 md:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-center text-2xl md:text-3xl">Dashboard</h1>

        {address ? (
          <p
            title={address}
            className="mt-3 break-all text-center text-sm text-text-light/50"
          >
            Submissions for{" "}
            <span className="font-display text-accent">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </span>
          </p>
        ) : (
          <p className="mt-3 text-center text-sm text-text-light/60">
            Connect a wallet to see your restoration submissions.
          </p>
        )}

        {!address ? (
          <EmptyState
            title="Wallet not connected"
            body="Connect your wallet to load the submissions tied to it."
          >
            <button
              type="button"
              onClick={connect}
              disabled={connecting}
              className="rounded-full bg-accent px-6 py-3 font-display text-xs uppercase tracking-wide text-text-dark transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
            {walletError && (
              <p role="alert" className="mt-3 text-xs text-accent">
                {walletError}
              </p>
            )}
          </EmptyState>
        ) : loading ? (
          <p className="mt-16 text-center text-sm text-text-light/50">
            Loading submissions...
          </p>
        ) : submissions.length === 0 ? (
          <EmptyState
            title="No submissions yet — upload your first photo"
            body="Once a site photo is submitted it shows up here with its verification status."
          >
            <Link
              href="/submit"
              className="rounded-full bg-accent px-6 py-3 font-display text-xs uppercase tracking-wide text-text-dark transition-opacity hover:opacity-90"
            >
              Submit a Site
            </Link>
            {serviceDown && (
              <p className="mt-3 text-xs text-text-light/40">
                (Submission service unreachable — showing an empty list.)
              </p>
            )}
          </EmptyState>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {submissions.map((submission) => (
              <li
                key={submission.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="relative aspect-[4/3] w-full bg-background">
                  {submission.photoUrl ? (
                    // Remote host isn't known ahead of time, so next/image's
                    // optimizer (which needs configured remotePatterns) is skipped.
                    // eslint-disable-next-line @next/next/no-img-element
                    // Absolute so the image never contributes height — otherwise
                    // its intrinsic ratio overrides the box's 4:3 and the grid
                    // goes ragged.
                    <img
                      src={submission.photoUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-text-light/30">
                      No photo
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-all text-xs text-text-light/60">
                      {formatCoordinate(submission.latitude)},{" "}
                      {formatCoordinate(submission.longitude)}
                    </p>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 font-display text-[10px] uppercase tracking-wide ${STATUS_STYLES[submission.status]}`}
                    >
                      {STATUS_LABELS[submission.status]}
                    </span>
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    {submission.txHash && (
                      <a
                        href={`${POLYGONSCAN_TX}${submission.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent underline underline-offset-2 hover:opacity-80"
                      >
                        View on PolygonScan
                      </a>
                    )}

                    {submission.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => checkVerification(submission.id)}
                        disabled={checkingId === submission.id}
                        className="w-full rounded-lg border border-white/20 px-3 py-2 font-display text-[10px] uppercase tracking-wide text-text-light transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                      >
                        {checkingId === submission.id
                          ? "Checking..."
                          : "Check Verification Status"}
                      </button>
                    )}

                    {checkErrors[submission.id] && (
                      <p role="alert" className="text-[11px] text-accent">
                        {checkErrors[submission.id]}
                      </p>
                    )}

                    {!checkErrors[submission.id] &&
                      submission.verificationStatus &&
                      submission.verificationStatus !== "failed" && (
                        <p className="text-[11px] text-text-light/60">
                          {submission.verificationStatus === "verified"
                            ? "Verified via satellite imagery"
                            : "Pending imagery — awaiting satellite data"}
                        </p>
                      )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10 flex flex-col items-center text-center">
      {/* Artwork carries its own torn-paper edge, so it needs no frame. */}
      <Image
        src="/images/empty-state.png"
        alt=""
        width={1376}
        height={768}
        sizes="(min-width: 768px) 32rem, 100vw"
        className="h-auto w-full max-w-lg"
        priority
      />
      <h2 className="mt-6 text-lg md:text-xl">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-text-light/60">{body}</p>
      <div className="mt-6 flex flex-col items-center">{children}</div>
    </div>
  );
}
