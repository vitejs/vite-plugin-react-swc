import { defineConfig } from "vite";
import react from "@vitejs/react-plugin-swc";

export default defineConfig({
  plugins: [react()],
  server: { open: true },
});
