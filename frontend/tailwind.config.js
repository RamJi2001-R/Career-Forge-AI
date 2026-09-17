/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "light black" — soft graphite, pure black nahi
        base: {
          DEFAULT: "#1d1f22", //for background, primary surface
          surface: "#292725", // for secondary surfaces, cards, modals
          // raised: "#415475", // for raised elements like buttons, inputs
          border: "#3A3D43",
        },
        ink: {
          DEFAULT: "#F1EFE9", // warm off-white text
          muted: "#9A9791",
          faint: "#6E6B66",
        },
        accent: {
          DEFAULT: "#daa262", // for primary actions, links
          soft: "#f0933c", // for hover states, highlights
          deep: "#C77DBE", // for active states, focus rings
        },
        glow: "#ce8541", // background radial-glow ke liye deep purple
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "ping-slow": "ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        "ping-slow": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "75%, 100%": { transform: "scale(1.5)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
