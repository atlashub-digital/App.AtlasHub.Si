import { test } from "node:test";
import assert from "node:assert/strict";
import { features } from "../src/lib/availability.ts";

test("without backend configuration nothing pretends to work", () => {
  assert.deepEqual(features({}), { assessment: false, portal: false });
});

test("assessment needs an https (or local) Core URL", () => {
  assert.equal(features({ WAAS_API_URL: "http://core.example.test" }).assessment, false);
  assert.equal(features({ WAAS_API_URL: "not a url" }).assessment, false);
  assert.equal(features({ WAAS_API_URL: "https://core.example.test" }).assessment, true);
  assert.equal(features({ WAAS_API_URL: "http://127.0.0.1:4000" }).assessment, true);
});

test("portal needs Core and Supabase Auth together", () => {
  const core = { WAAS_API_URL: "https://core.example.test" };
  assert.equal(features(core).portal, false);
  assert.equal(features({ ...core, SUPABASE_URL: "https://auth.example.test" }).portal, false);
  assert.equal(features({ ...core, SUPABASE_URL: "https://auth.example.test", SUPABASE_PUBLISHABLE_KEY: "pk" }).portal, true);
});
