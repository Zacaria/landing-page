import {
  readFile,
  writeFile,
  mkdir,
  cp,
  rename,
  rm,
  lstat,
  realpath,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { renderIndex, renderArticle } from "./render.mjs";
import { validateSnapshot } from "./schema.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export async function build({
  snapshotPath = path.join(root, "content/published.json"),
  output = path.join(root, "dist"),
  assetRoot = root,
} = {}) {
  // Validate and render everything before touching last-known-good output.
  const raw = await readFile(snapshotPath, "utf8");
  if (Buffer.byteLength(raw) > 8 * 1024 * 1024)
    throw new Error("Published snapshot is too large");
  const snapshot = validateSnapshot(JSON.parse(raw));
  const index = renderIndex(snapshot);
  const articles = snapshot.articles.map((a) => [
    a.slug,
    renderArticle(a, snapshot),
  ]);
  const assetPaths = [
    ...new Set([
      ...snapshot.articles.flatMap((a) =>
        a.blocks.filter((b) => b.asset).map((b) => b.asset),
      ),
      ...snapshot.projects.filter((p) => p.image).map((p) => p.image),
    ]),
  ];
  const assetCopies = [];
  for (const asset of assetPaths) {
    const file = path.join(assetRoot, asset);
    const info = await lstat(file);
    if (
      !info.isFile() ||
      info.size > 10 * 1024 * 1024 ||
      (await realpath(file)) !== file
    )
      throw new Error("Missing, symlinked or oversized frozen asset");
    const bytes = await readFile(file);
    const ext = path.extname(asset);
    const magic =
      ext === ".png"
        ? bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : ext === ".jpg"
          ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
          : ext === ".gif"
            ? /^GIF8[79]a$/.test(bytes.subarray(0, 6).toString())
            : bytes.subarray(0, 4).toString() === "RIFF" &&
              bytes.subarray(8, 12).toString() === "WEBP";
    if (
      !magic ||
      createHash("sha256").update(bytes).digest("hex") !==
        path.basename(asset, ext)
    )
      throw new Error("Frozen asset format/digest mismatch");
    assetCopies.push([asset, bytes]);
  }
  const stage = `${output}.staging`;
  const backup = `${output}.previous`;
  await rm(stage, { recursive: true, force: true });
  await mkdir(stage, { recursive: true });
  try {
    await cp(path.join(root, "client/assets"), path.join(stage, "assets"), {
      recursive: true,
    });
    await cp(
      path.join(root, "licenses"),
      path.join(stage, "assets/fonts/licenses"),
      {
        recursive: true,
      },
    );
    for (const page of [
      "404.html",
      "about.html",
      "linkedin-editorial-scout-privacy.html",
      "robots.txt",
    ])
      await cp(path.join(root, "client", page), path.join(stage, page));
    await writeFile(path.join(stage, "index.html"), index);
    if (articles.length) await mkdir(path.join(stage, "blog"));
    for (const [slug, html] of articles)
      await writeFile(path.join(stage, "blog", `${slug}.html`), html);
    for (const [asset, bytes] of assetCopies) {
      const dest = path.join(stage, asset);
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, bytes);
    }
    const urls = ["/", ...snapshot.articles.map((a) => `/blog/${a.slug}`)];
    await writeFile(
      path.join(stage, "sitemap.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>https://www.havesomecode.io${url}</loc></url>`).join("")}</urlset>\n`,
    );
    await rm(backup, { recursive: true, force: true });
    try {
      await rename(output, backup);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    try {
      await rename(stage, output);
    } catch (error) {
      try {
        await rename(backup, output);
      } catch {
        /* First build has no backup. */
      }
      throw error;
    }
    await rm(backup, { recursive: true, force: true });
    return { revision: snapshot.revision, articles: articles.length, output };
  } catch (error) {
    await rm(stage, { recursive: true, force: true });
    throw error;
  }
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    console.log(JSON.stringify(await build()));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
