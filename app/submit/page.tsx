"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/useWallet";

const MAX_BYTES = 10 * 1024 * 1024;

/** "locating" until the browser answers; then either auto-filled or manual. */
type GeoStatus = "locating" | "auto" | "manual";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/** Thrown when the server responded (non-2xx), as opposed to a network failure. */
class ResponseError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Returns a finite number, or null for blank/non-numeric input. */
function parseCoordinate(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function SubmitPage() {
  const router = useRouter();
  const { address, connecting, error: walletError, connect } = useWallet();

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("locating");
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  // Set when the user opts out of the auto-captured reading to correct it.
  const [manualOverride, setManualOverride] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Held in a ref so unmount cleanup never reads a stale URL from a closure.
  const previewUrlRef = useRef<string | null>(null);

  const replacePhoto = useCallback((file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      setPhoto(null);
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPhoto(file);
    setPreview(url);
  }, []);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    []
  );

  const acceptFile = useCallback(
    (file: File | null | undefined) => {
      setPhotoError(null);
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setPhotoError("That file isn't an image — upload a JPG, PNG, or WebP.");
        return;
      }
      if (file.size > MAX_BYTES) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        setPhotoError(`That image is ${mb} MB — the limit is 10 MB.`);
        return;
      }

      replacePhoto(file);
    },
    [replacePhoto]
  );

  // Auto-capture coordinates once on load; any failure drops to manual entry.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoStatus("manual");
      setGeoMessage(
        "This browser can't share your location — enter the site coordinates manually."
      );
      return;
    }

    let active = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return;
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setGeoStatus("auto");
      },
      (error) => {
        if (!active) return;
        setGeoStatus("manual");
        setGeoMessage(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied — enter the site coordinates manually."
            : error.code === error.TIMEOUT
              ? "Location lookup timed out — enter the site coordinates manually."
              : "Location is unavailable right now — enter the site coordinates manually."
        );
      },
      { timeout: 10_000, maximumAge: 60_000 }
    );

    return () => {
      active = false;
    };
  }, []);

  const latitudeValue = parseCoordinate(latitude);
  const longitudeValue = parseCoordinate(longitude);
  const hasValidCoordinates =
    latitudeValue !== null &&
    longitudeValue !== null &&
    latitudeValue >= -90 &&
    latitudeValue <= 90 &&
    longitudeValue >= -180 &&
    longitudeValue <= 180;

  // Editable either because geolocation failed, or because the user chose to
  // correct a reading that did land.
  const coordinatesEditable = geoStatus === "manual" || manualOverride;

  // Only complain about bad coordinates once something has been typed.
  const coordinateError =
    coordinatesEditable &&
    (latitude.trim() !== "" || longitude.trim() !== "") &&
    !hasValidCoordinates
      ? "Enter latitude between -90 and 90, and longitude between -180 and 180."
      : null;

  const disabled =
    !address || connecting || submitting || !photo || !hasValidCoordinates;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || !photo || !address) return;

    setSubmitError(null);
    setSubmitting(true);

    try {
      const body = new FormData();
      body.append("photo", photo);
      body.append("latitude", latitude.trim());
      body.append("longitude", longitude.trim());
      body.append("walletAddress", address);

      const response = await fetch("/api/submit", { method: "POST", body });

      if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        try {
          const data = await response.json();
          if (typeof data?.error === "string" && data.error.trim() !== "") {
            message = data.error;
          } else if (typeof data?.message === "string" && data.message.trim() !== "") {
            message = data.message;
          }
        } catch {
          // Body wasn't JSON — keep the status-based message.
        }
        throw new ResponseError(response.status, message);
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Submission failed:", err);
      // fetch() only rejects on a genuine network failure (offline, DNS,
      // CORS preflight, etc.); a non-2xx response resolves and is handled
      // above as a ResponseError with the server's real status/message.
      setSubmitError(
        err instanceof ResponseError
          ? `${err.status}: ${err.message}`
          : "Verification service unavailable — please try again shortly."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 py-12 md:py-20">
      <div className="mx-auto w-full max-w-lg">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-paper p-2 md:h-28 md:w-28">
          <Image
            src="/images/mascot.png"
            alt=""
            width={224}
            height={248}
            sizes="112px"
            className="h-full w-full object-contain"
            priority
          />
        </div>

        <h1 className="text-center text-2xl md:text-3xl">Submit a Site</h1>
        <p className="mt-3 text-center text-sm text-text-light/60">
          Upload a site photo and confirm its coordinates. Both are checked
          against satellite data before any credits are minted.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-8"
        >
          {/* Wallet */}
          <div className="mb-6">
            <span className="mb-2 block font-display text-xs uppercase tracking-wide text-text-light/70">
              Wallet
            </span>
            {address ? (
              <p
                title={address}
                className="break-all rounded-lg border border-white/10 bg-background px-4 py-3 font-display text-sm text-accent"
              >
                {shortenAddress(address)}
              </p>
            ) : (
              <button
                type="button"
                onClick={connect}
                disabled={connecting}
                className="w-full rounded-lg border border-accent px-4 py-3 font-display text-xs uppercase tracking-wide text-accent transition-colors hover:bg-accent hover:text-text-dark disabled:opacity-60"
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
            {walletError && (
              <p role="alert" className="mt-2 text-xs text-accent">
                {walletError}
              </p>
            )}
          </div>

          {/* Photo */}
          <div className="mb-6">
            <span className="mb-2 block font-display text-xs uppercase tracking-wide text-text-light/70">
              Site Photo
            </span>

            <label
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                acceptFile(event.dataTransfer.files?.[0]);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center transition-colors ${
                dragging
                  ? "border-accent bg-accent/10"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => acceptFile(event.target.files?.[0])}
              />

              {preview ? (
                <>
                  {/* Blob URL can't go through next/image's optimizer. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Selected site photo"
                    className="max-h-48 w-auto max-w-full rounded-md object-contain"
                  />
                  <span className="mt-3 break-all text-xs text-text-light/60">
                    {photo?.name} — click or drop to replace
                  </span>
                </>
              ) : (
                <>
                  <span className="font-display text-sm text-text-light">
                    Drop a photo here
                  </span>
                  <span className="mt-1 text-xs text-text-light/50">
                    or click to browse — images only, up to 10 MB
                  </span>
                </>
              )}
            </label>

            {photoError && (
              <p role="alert" className="mt-2 text-xs text-accent">
                {photoError}
              </p>
            )}
          </div>

          {/* Coordinates */}
          <div className="mb-6">
            <span className="mb-2 block font-display text-xs uppercase tracking-wide text-text-light/70">
              Coordinates
            </span>

            {geoStatus === "locating" && (
              <p className="mb-2 text-xs text-text-light/50">
                Locating you...
              </p>
            )}
            {geoMessage && (
              <p className="mb-2 text-xs text-text-light/60">{geoMessage}</p>
            )}
            {geoStatus === "auto" && !manualOverride && (
              <p className="mb-2 text-xs text-text-light/50">
                Detected from your device.{" "}
                <button
                  type="button"
                  onClick={() => setManualOverride(true)}
                  className="text-accent underline underline-offset-2 hover:opacity-80"
                >
                  Enter coordinates manually instead
                </button>
              </p>
            )}
            {manualOverride && (
              <p className="mb-2 text-xs text-text-light/60">
                Editing manually — confirm these match the restoration site.
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-text-light/50">
                  Latitude
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={latitude}
                  readOnly={!coordinatesEditable}
                  onChange={(event) => setLatitude(event.target.value)}
                  placeholder={coordinatesEditable ? "-6.235000" : ""}
                  className="w-full rounded-lg border border-white/10 bg-background px-3 py-2.5 text-sm text-text-light outline-none placeholder:text-text-light/25 read-only:text-text-light/60 focus:border-accent"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-text-light/50">
                  Longitude
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={longitude}
                  readOnly={!coordinatesEditable}
                  onChange={(event) => setLongitude(event.target.value)}
                  placeholder={coordinatesEditable ? "106.994000" : ""}
                  className="w-full rounded-lg border border-white/10 bg-background px-3 py-2.5 text-sm text-text-light outline-none placeholder:text-text-light/25 read-only:text-text-light/60 focus:border-accent"
                />
              </label>
            </div>

            {coordinateError && (
              <p role="alert" className="mt-2 text-xs text-accent">
                {coordinateError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-full bg-accent px-6 py-3.5 font-display text-xs uppercase tracking-wide text-text-dark transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Submitting..." : "Submit for Verification"}
          </button>

          {!address && (
            <p className="mt-3 text-center text-xs text-text-light/50">
              Connect a wallet to submit.
            </p>
          )}

          {submitError && (
            <p role="alert" className="mt-3 text-center text-xs text-accent">
              {submitError}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
