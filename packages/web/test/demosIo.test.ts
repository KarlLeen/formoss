import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  loadCatalog,
  resolveFixture,
  safeDemoPath,
} from "../src/demosIo.js";

// Compiled to dist-test/test/*.js → four levels up to repo root.
const demosDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../demos",
);

describe("demosIo fixture paths", () => {
  it("loads catalog keys used by /api/run", () => {
    const catalog = loadCatalog(demosDir);
    const fixture = resolveFixture(demosDir, catalog, "offline");
    assert.equal(fixture.kind, "simulate_result");
    assert.ok(fixture.simulate.texts.length > 0);
  });

  it("accepts relative .json paths under demos/", () => {
    const catalog = loadCatalog(demosDir);
    const fixture = resolveFixture(
      demosDir,
      catalog,
      "fixtures/kuru-swap-ok.json",
    );
    assert.equal(fixture.simulate.protocol, "kuru");
  });

  it("rejects path traversal", () => {
    const catalog = loadCatalog(demosDir);
    assert.throws(
      () => resolveFixture(demosDir, catalog, "../package.json"),
      /escapes demos/,
    );
    assert.throws(
      () => safeDemoPath(demosDir, "fixtures/../../package.json"),
      /escapes demos/,
    );
  });

  it("rejects unknown catalog keys that are not .json paths", () => {
    const catalog = loadCatalog(demosDir);
    assert.throws(
      () => resolveFixture(demosDir, catalog, "no-such-fixture"),
      /unknown fixture/,
    );
  });
});
