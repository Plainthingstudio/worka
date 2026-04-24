import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devPort = Number(env.VITE_DEV_PORT || env.PORT || "5174");

  return {
    server: {
      host: "localhost",
      port: Number.isFinite(devPort) ? devPort : 5174,
      watch: {
        // Use polling to avoid EMFILE errors
        usePolling: true,
        interval: 1000,
        ignored: ["**/node_modules/**", "**/.git/**"],
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
