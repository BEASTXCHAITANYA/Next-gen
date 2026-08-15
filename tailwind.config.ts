import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        paper: "#f0f0eb",
        accent: "#e6ff00",
        "text-light": "#f5f5f0",
        "text-dark": "#0a0a0a",
      },
      /* Re-runs on each step switch by re-keying the panel grid, so it needs to
         be an animation rather than a transition — there is no "from" state to
         transition out of on a freshly mounted node. */
      keyframes: {
        "panel-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        /* Slower and dimmer than Tailwind's built-in ping, which reads as an
           alert rather than a steady "this is up" heartbeat. */
        "status-ping": {
          "0%": { opacity: "0.55", transform: "scale(1)" },
          "70%": { opacity: "0", transform: "scale(2.4)" },
          "100%": { opacity: "0", transform: "scale(2.4)" },
        },
        /* Live-log dot: the row still awaiting a result, not an alert. */
        "dot-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        /* One-shot: fires once when a dot's tone flips to green, then holds. */
        "dot-resolve": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "panel-in": "panel-in 200ms ease-out both",
        "status-ping": "status-ping 2.4s cubic-bezier(0,0,0.2,1) infinite",
        "dot-pulse": "dot-pulse 1.5s ease-in-out infinite",
        "dot-resolve": "dot-resolve 300ms ease-out",
        "fade-in-up": "fade-in-up 400ms ease-out both",
      },
      fontFamily: {
        display: ["var(--font-display)", "Courier New", "monospace"],
        annotate: ["var(--font-annotate)", "cursive"],
        logo: ["var(--font-logo)", "Impact", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
