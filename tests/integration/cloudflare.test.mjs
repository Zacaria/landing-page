import test from "node:test";
import assert from "node:assert/strict";

const origin = process.env.HSC_TEST_ORIGIN || "http://127.0.0.1:8792";
const request = (path, options = {}) =>
  fetch(`${origin}${path}`, { redirect: "manual", ...options });

test("runtime serves homepage with existing security headers", async () => {
  const res = await request("/");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-frame-options"), "DENY");
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("referrer-policy"), "same-origin");
  assert.match(await res.text(), /havesomecode/i);
});

test("about redirects and nested missing routes retain 404", async () => {
  const about = await request("/about");
  assert.equal(about.status, 308);
  assert.equal(about.headers.get("location"), "/#about");
  for (const [path, destination] of [
    ["/about.html", "/about"],
    ["/index.html", "/"],
    ["/404.html", "/404"],
    [
      "/linkedin-editorial-scout-privacy.html",
      "/linkedin-editorial-scout-privacy",
    ],
  ]) {
    const redirect = await request(path);
    assert.equal(redirect.status, 308);
    assert.equal(redirect.headers.get("location"), destination);
  }
  assert.equal((await request("/missing/nested")).status, 404);
});

test("appearance remains dynamic and fails safely without a credential", async () => {
  for (const target of ["site", "cv"]) {
    const res = await request(`/api/appearance?target=${target}`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("x-appearance-status"), "fallback");
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.match(res.headers.get("content-type"), /^text\/css/);
    assert.match(await res.text(), /--/);
  }
  assert.equal((await request("/api/appearance?target=wrong")).status, 400);
  assert.equal(
    (await request("/api/appearance", { method: "POST" })).status,
    405,
  );
});

test("font CORS and CV external link are preserved", async () => {
  const font = await request("/assets/fonts/geist-regular.woff2");
  assert.equal(font.status, 200);
  assert.equal(font.headers.get("access-control-allow-origin"), "*");
  const home = await (await request("/")).text();
  assert.match(home, /https:\/\/cv\.havesomecode\.io\//);
});
