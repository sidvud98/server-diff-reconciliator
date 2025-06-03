import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: false, // Disable Hot Module Replacement
  },
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "./src"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@server": path.resolve(__dirname, "./server"),
      "@serverconstants": path.resolve(__dirname, "./server/constants"),
    },
  },
});
