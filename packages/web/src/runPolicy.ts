export type RunPolicyInput = {
  readonly fixture?: string;
  readonly live?: boolean;
};

export type RunPolicyEnv = {
  readonly allowLive: boolean;
};

/**
 * Web /api/run gate: fixture-only by default.
 * Live RPC requires SEALMOSS_WEB_ALLOW_LIVE=1 and body.live === true.
 */
export function assertRunAllowed(
  input: RunPolicyInput,
  env: RunPolicyEnv,
): { mode: "fixture" | "live" } {
  const hasFixture =
    typeof input.fixture === "string" && input.fixture.trim().length > 0;
  if (hasFixture) {
    return { mode: "fixture" };
  }
  if (input.live === true && env.allowLive) {
    return { mode: "live" };
  }
  throw new Error(
    "fixture required (set live:true and SEALMOSS_WEB_ALLOW_LIVE=1 for RPC)",
  );
}

export function webAllowLiveFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.SEALMOSS_WEB_ALLOW_LIVE === "1";
}
