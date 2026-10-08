import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import dashboard from "../src/data/mockups/dashboard.json" with { type: "json" };
import library from "../src/data/mockups/agent-library.json" with { type: "json" };
import catalog from "../src/data/catalog.json" with { type: "json" };

// Visual Pack V1 · 1:1 screens: copy and links stay inside the canvas, the plate exists and every
// internal link is a real route (simulator links point to packs that exist in the catalog).
const routes = ["/", "/biblioteca", "/packs", "/assessment", "/login", "/portal"];
const slugs = new Set(catalog.packs.map((p) => p.slug));
for (const s of [dashboard, library]) {
  test(`${s.id}: plate, copy and links are consistent`, () => {
    assert.ok(existsSync(`public${s.bg}`), `missing plate ${s.bg}`);
    assert.ok(s.items.length > 40);
    for (const it of s.items) {
      assert.ok(it.x >= 0 && it.x < s.W && it.y >= -10 && it.y < s.H, `${it.t} outside canvas`);
      assert.match(it.c, /^#[0-9a-f]{6}$/);
    }
    for (const l of s.links) {
      const [x1, y1, x2, y2] = l.r;
      assert.ok(x1 < x2 && y1 < y2 && x2 <= s.W && y2 <= s.H, `${l.label} rect`);
      if (l.href.startsWith("https://atlashub.si/")) continue;
      const sim = l.href.match(/^\/simulador\/([a-z-]+)$/);
      if (sim) assert.ok(slugs.has(sim[1]), `unknown pack ${sim[1]}`);
      else assert.ok(routes.includes(l.href), `unknown route ${l.href}`);
    }
  });
}
