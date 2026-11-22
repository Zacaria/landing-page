// IndexNow: tells Bing (and other IndexNow engines) about the sitemap URLs.
// The key is public by design; build.mjs serves it at /<key>.txt.
import { fileURLToPath } from "node:url";

export const INDEXNOW_KEY = "dc1f39b8892659e02ab2b3d72243fb7c";
export const SITE = "https://www.havesomecode.io";

export function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((url) => url.startsWith(`${SITE}/`));
}

export function indexNowPayload(urlList) {
  return {
    host: new URL(SITE).host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList,
  };
}

// Vercel reports a deployment as successful a little before the production
// domain serves it, so wait for the key file.
async function waitForKey(attempts = 20, delayMs = 15000) {
  for (let i = 1; ; i++) {
    const response = await fetch(`${SITE}/${INDEXNOW_KEY}.txt`, {
      cache: "no-store",
    });
    const text = (await response.text()).trim();
    if (response.status === 200 && text === INDEXNOW_KEY) return;
    if (i >= attempts)
      throw new Error(`Key file not served (HTTP ${response.status})`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

async function main() {
  await waitForKey();
  const sitemap = await fetch(`${SITE}/sitemap.xml`);
  if (sitemap.status !== 200)
    throw new Error(`Sitemap unavailable (HTTP ${sitemap.status})`);
  const urlList = sitemapUrls(await sitemap.text());
  if (!urlList.length) throw new Error("Sitemap lists no URL");
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowPayload(urlList)),
  });
  console.log(`IndexNow HTTP ${response.status} for ${urlList.length} URLs`);
  for (const url of urlList) console.log(`  ${url}`);
  if (response.status !== 200 && response.status !== 202)
    throw new Error(`IndexNow refused: ${await response.text()}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
