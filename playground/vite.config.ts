import { defineConfig } from "vite";
import { swcReactRefresh } from "../dist";

export default defineConfig({
  plugins: [swcReactRefresh()],
  server: { open: true },
});
