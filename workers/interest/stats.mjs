// Weekly interest-list numbers (Europe/Paris, Monday to Sunday). Reads timestamps only, never addresses.
const TEST_EXCLUSION =
  "email NOT LIKE '%@havesomecode.io' AND email NOT LIKE '%@example.com'";
export const STATS_SQL = `SELECT status, created_at, confirmed_at, unsubscribed_at FROM subscriptions WHERE list = 'havesomecode-conseil-ia' AND ${TEST_EXCLUSION}`;

const parisParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
});

export function parisWeek(isoTimestamp) {
  const parts = Object.fromEntries(
    parisParts
      .formatToParts(new Date(isoTimestamp))
      .map((p) => [p.type, p.value]),
  );
  const back = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(
    parts.weekday,
  );
  const monday = new Date(
    Date.UTC(+parts.year, +parts.month - 1, +parts.day - back),
  );
  return monday.toISOString().slice(0, 10);
}

export function weeklyStats(rows) {
  const weeks = new Map();
  const bump = (timestamp, key) => {
    if (!timestamp) return;
    const week = parisWeek(timestamp);
    const entry = weeks.get(week) ?? {
      week,
      requested: 0,
      confirmed: 0,
      unsubscribed: 0,
    };
    entry[key] += 1;
    weeks.set(week, entry);
  };
  for (const row of rows) {
    bump(row.created_at, "requested");
    bump(row.confirmed_at, "confirmed");
    bump(row.unsubscribed_at, "unsubscribed");
  }
  return {
    activeConfirmed: rows.filter((r) => r.status === "confirmed").length,
    weeks: [...weeks.values()].sort((a, b) => b.week.localeCompare(a.week)),
  };
}
