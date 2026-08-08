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

  it("wraps exhausted transient failures as DiscoveryError", async () => {
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

  it("rethrows non-transient errors without DiscoveryError wrapper", async () => {
    await assert.rejects(
      () =>
        withRetry(
          async () => {
            throw new Error("invalid params");
          },
          { retries: 2, timeoutMs: 5_000, label: "action" },
        ),
      (error: unknown) =>
        error instanceof Error &&
        !(error instanceof DiscoveryError) &&
        error.message === "invalid params",
    );
  });

  it("ignores late results after timeout and retries", async () => {
    let starts = 0;
    const value = await withRetry(
      () => {
        starts += 1;
        if (starts === 1) {
          return new Promise((resolve) => {
            setTimeout(() => resolve("late-ok"), 80);
          });
        }
        return Promise.resolve("fresh-ok");
      },
      { retries: 1, timeoutMs: 20, label: "slow rpc" },
    );
    assert.equal(value, "fresh-ok");
    assert.ok(starts >= 2);
    // Allow the late timer to fire; must not throw unhandled.
    await new Promise((r) => setTimeout(r, 100));
  });

  it("detects transient messages", () => {
    assert.equal(isTransientError(new Error("fetch failed")), true);
    assert.equal(isTransientError(new Error("intent mismatch")), false);
    assert.equal(
      isTransientError(new Error("[discovery] already wrapped")),
      false,
    );
  });
});
