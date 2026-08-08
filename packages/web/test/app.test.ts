import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { resolveDemosDir } from "../src/app.js";

describe("resolveDemosDir", () => {
  it("finds demos/catalog.json from repo cwd", () => {
    const dir = resolveDemosDir();
    assert.equal(existsSync(join(dir, "catalog.json")), true);
  });

  it("honors SEALMOSS_DEMOS_DIR", () => {
    const prev = process.env.SEALMOSS_DEMOS_DIR;
    const target = join(process.cwd(), "demos");
    process.env.SEALMOSS_DEMOS_DIR = target;
    try {
      assert.equal(resolveDemosDir(), resolve(target));
    } finally {
      if (prev === undefined) delete process.env.SEALMOSS_DEMOS_DIR;
      else process.env.SEALMOSS_DEMOS_DIR = prev;
    }
  });
});
