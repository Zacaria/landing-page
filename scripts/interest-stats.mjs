// Usage: node scripts/interest-stats.mjs [--local]
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { STATS_SQL, weeklyStats } from "../workers/interest/stats.mjs";

const cwd = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../workers/interest",
);
const target = process.argv.includes("--local") ? "--local" : "--remote";
const output = execFileSync(
  "npx",
  [
    "-y",
    "wrangler@4.158.0",
    "d1",
    "execute",
    "hsc-interest",
    target,
    "--json",
    "--command",
    STATS_SQL,
  ],
  { cwd, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
);
const rows = JSON.parse(output)[0].results;
const { activeConfirmed, weeks } = weeklyStats(rows);
console.log(`Confirmed and active: ${activeConfirmed}`);
console.log("week (Monday)  requested  confirmed  unsubscribed");
for (const w of weeks)
  console.log(
    `${w.week}     ${String(w.requested).padStart(9)}  ${String(w.confirmed).padStart(9)}  ${String(w.unsubscribed).padStart(12)}`,
  );
if (weeks.length === 0) console.log("(no sign-ups yet)");
