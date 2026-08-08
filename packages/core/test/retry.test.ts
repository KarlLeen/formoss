import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DiscoveryError,
  isTransientError,
  withRetry,
} from "../dist/index.js";

describe("withRetry / discovery", () => {
  it("retries transient errors then succeeds", async () => {
    let n = 0;
    const value = await withRetry(
      async () => {
        n += 1;
        if (n < 3) throw new Error("fetch failed");
        return "ok";
      },
      { retries: 2, timeoutMs: 5_000, label: "test" },
    );
    assert.equal(value, "ok");
    assert.equal(n, 3);
  });

  it("wraps exhausted failures as DiscoveryError", async () => {
    await assert.rejects(
      () =>
        withRetry(
          async () => {
            throw new Error("fetch failed");
          },
          { retries: 1, timeoutMs: 5_000, label: "market discovery" },
        ),
      (error: unknown) =>
        error instanceof DiscoveryError &&
        error.message.includes("[discovery]") &&
        error.message.includes("market discovery"),
    );
  });

  it("detects transient messages", () => {
    assert.equal(isTransientError(new Error("fetch failed")), true);
    assert.equal(isTransientError(new Error("intent mismatch")), false);
  });
});
