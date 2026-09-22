import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kid-friendly cool palette + a warm "coin" accent for tokens.
        coin: {
          DEFAULT: "#F5B301",
          soft: "#FDE9A8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "70%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        floatUp: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-120px) scale(1.4)", opacity: "0" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
        confetti: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(420px) rotate(540deg)", opacity: "0" },
        },
      },
      animation: {
        pop: "pop 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        floatUp: "floatUp 1s ease-out forwards",
        wiggle: "wiggle 0.5s ease-in-out",
        shake: "shake 0.4s ease-in-out",
        confetti: "confetti 1.2s ease-in forwards",
      },
    },
  },
  plugins: [],
};

export default config;
