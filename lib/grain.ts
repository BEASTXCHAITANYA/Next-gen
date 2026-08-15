/**
 * Tiled fractal-noise grain for the dark sections. Inline rather than an asset
 * because it is a few hundred bytes and needs no network round trip; kept as a
 * plain string for a style prop rather than a Tailwind arbitrary value, since
 * the data URI's quotes and parens would need escaping there.
 *
 * Apply on a `pointer-events-none absolute inset-0` layer at a low opacity.
 */
export const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";
