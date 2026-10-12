import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const manifest = JSON.parse(
  await readFile(new URL("./renderer-manifest.json", import.meta.url)),
);
for (const [name, expected] of Object.entries(manifest.files)) {
  const bytes = await readFile(new URL("../" + name, import.meta.url));
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual !== expected) throw new Error(`Shared renderer drift: ${name}`);
}
console.log(
  `Verified ${Object.keys(manifest.files).length} shared renderer/baseline pins`,
);
