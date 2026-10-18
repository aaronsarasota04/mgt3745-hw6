// Run with: PROXY_URL=https://<your-worker>.workers.dev node --test proxy/test/
// Confirms the key never appears in a response, on success or on error.
import { test } from "node:test";
import assert from "node:assert/strict";

const url = process.env.PROXY_URL;

test("responses never contain the API key", { skip: !url && "PROXY_URL not set" }, async () => {
  for (const body of ['{"text":"hello"}', "not json", '{"text":""}']) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    const text = await res.text();
    assert.doesNotMatch(text, /AIza[0-9A-Za-z_\-]{20,}/, "response looks like it contains a Google API key");
  }
});
