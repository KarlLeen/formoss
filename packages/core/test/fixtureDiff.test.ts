import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { diffFixtures, parsePipelineFixture } from "../dist/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../");

describe("diffFixtures", () => {
  it("reports equal for identical fixtures", () => {
    const fixture = parsePipelineFixture(
      JSON.parse(
        readFileSync(join(root, "demos/fixtures/kuru-swap-ok.json"), "utf8"),
      ),
    );
    const diff = diffFixtures(fixture, fixture);
    assert.equal(diff.ok, true);
    assert.equal(diff.hint, null);
    assert.match(diff.detail, /unchanged/);
  });

  it("flags text/outcome drift with Receipt convention hint", () => {
    const baseline = parsePipelineFixture(
      JSON.parse(
        readFileSync(join(root, "demos/fixtures/kuru-swap-ok.json"), "utf8"),
      ),
    );
    const next = parsePipelineFixture({
      ...baseline,
      simulate: {
        ...baseline.simulate,
        texts: [...baseline.simulate.texts, "NEW LEAF"],
        receiptOutcome: {
          ...(baseline.simulate.receiptOutcome as Record<string, unknown>),
          amountOut: "999",
        },
      },
    });
    const diff = diffFixtures(baseline, next);
    assert.equal(diff.ok, false);
    assert.equal(diff.textsEqual, false);
    assert.equal(diff.outcomeEqual, false);
    assert.equal(diff.addedTexts.length, 1);
    assert.match(diff.hint ?? "", /Fixture texts\/outcome/);
  });

  it("flags warnings and capability drift", () => {
    const baseline = parsePipelineFixture(
      JSON.parse(
        readFileSync(join(root, "demos/fixtures/kuru-swap-ok.json"), "utf8"),
      ),
    );
    const next = parsePipelineFixture({
      ...baseline,
      capability: { kind: "changed" },
      simulate: {
        ...baseline.simulate,
        warnings: ["new warning"],
      },
    });
    const diff = diffFixtures(baseline, next);
    assert.equal(diff.ok, false);
    assert.equal(diff.warningsEqual, false);
    assert.equal(diff.capabilityEqual, false);
  });
});
