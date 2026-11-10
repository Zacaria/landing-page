import { createHash } from "node:crypto";
import { createWorker } from "../../worker/index.mjs";

const document = JSON.stringify({
  site: { theme: "vercel", band: "contrast", type: "geist" },
  cv: { theme: "teknium", band: "soft", type: "uncommon" },
});
const version = createHash("sha256").update(document).digest("hex");
const worker = createWorker(async (url, options) => {
  if (
    url !== "https://api.eu-central-1.aws.neon.tech/sql" ||
    options.method !== "POST"
  )
    throw new Error("Unexpected upstream");
  return Response.json({ rows: [[version, document]] });
});
export default {
  fetch(request, env) {
    if (new URL(request.url).pathname === "/__test-apex") {
      request = new Request("https://havesomecode.io/about?x=1");
    }
    return worker.fetch(request, {
      ...env,
      HSC_APPEARANCE_DATABASE_URL:
        "postgresql://reader:fixture@ep-test.eu-central-1.aws.neon.tech/neondb?sslmode=require",
    });
  },
};
