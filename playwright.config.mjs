import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  reporter: [["list"], ["json", { outputFile: ".local/browser-results.json" }]],
  use: {
    baseURL: "http://127.0.0.1:8793",
    launchOptions: {
      executablePath:
        process.env.HSC_BROWSER_EXECUTABLE || "/usr/bin/brave-browser",
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "node tests/server.mjs",
    port: 8793,
    reuseExistingServer: false,
  },
});
