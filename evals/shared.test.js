// One test, run against both builds, so they face an identical check.
// Replace the example with the EARS row you chose. Keep both builds in the loop.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as bolt from "./impl/bolt.js";
import * as aistudio from "./impl/aistudio.js";

const builds = { bolt, aistudio };

for (const [name, impl] of Object.entries(builds)) {
  test(`${name}: <EARS row ID> <short description>`, () => {
    // Example only: replace with the behavior your EARS row requires.
    const result = impl.featureUnderTest("<input>");
    assert.equal(result, "<expected output>");
  });
}
