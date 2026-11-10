import test from "node:test";
import assert from "node:assert/strict";
import { appearanceCss } from "../../scripts/appearance.mjs";

test("apex redirect preserves path and query in workerd", async () => {
  const response = await fetch("http://127.0.0.1:8793/__test-apex", {
    redirect: "manual",
  });
  assert.equal(response.status, 301);
  assert.equal(
    response.headers.get("location"),
    "https://www.havesomecode.io/about?x=1",
  );
});

test("worker forwards selected site and CV settings in the real runtime", async () => {
  for (const [target, choice] of Object.entries({
    site: { theme: "vercel", band: "contrast", type: "geist" },
    cv: { theme: "teknium", band: "soft", type: "uncommon" },
  })) {
    for (const suffix of ["", "/"]) {
      const response = await fetch(
        `http://127.0.0.1:8793/api/appearance${suffix}?target=${target}`,
      );
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-appearance-status"), "selected");
      assert.equal(
        response.headers.get("cache-control"),
        "public, max-age=60, s-maxage=60",
      );
      assert.equal(await response.text(), appearanceCss(choice, target));
    }
  }
});
