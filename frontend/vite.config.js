import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite ka kaam: dev server chalana (fast hot-reload) aur production build banana
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
