export type RetryOptions = {
  retries: number;
  timeoutMs: number;
  label: string;
};

export class DiscoveryError extends Error {
  readonly code = "discovery" as const;
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DiscoveryError";
  }
}

export function isTransientError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : String(error);
  // Do not match "[discovery]" — that is our wrapper, not a transport signal.
  return /fetch failed|ECONNRESET|ETIMEDOUT|ECONNREFUSED|timeout|AbortError|network|socket/i.test(
    message,
  );
}

export function rpcRetryConfig(): { retries: number; timeoutMs: number } {
  const timeoutMs = Number(process.env.FORMOSS_RPC_TIMEOUT_MS ?? 45_000);
  const retries = Number(process.env.FORMOSS_RPC_RETRIES ?? 2);
  return {
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 45_000,
    retries: Number.isFinite(retries) && retries >= 0 ? Math.floor(retries) : 2,
  };
}

type RaceOk<T> = { kind: "ok"; value: T; gen: number };
type RaceErr = { kind: "err"; error: unknown; gen: number };
type RaceTimeout = { kind: "timeout"; gen: number };
type RaceResult<T> = RaceOk<T> | RaceErr | RaceTimeout;

/**
 * Retry with a generation token so timed-out attempts cannot poison later
 * retries (late resolve/reject are ignored). Does not cancel underlying RPC
 * (Moss createRuntime has no AbortSignal); it only ignores late results.
 *
 * Transient / timeout → DiscoveryError with [discovery] prefix.
 * Non-transient errors are rethrown as-is.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let generation = 0;
  let lastError: unknown;
  const attempts = options.retries + 1;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const myGen = ++generation;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const raced: RaceResult<T> = await new Promise((resolve) => {
      timer = setTimeout(() => {
        resolve({ kind: "timeout", gen: myGen });
      }, options.timeoutMs);

      void fn().then(
        (value) => resolve({ kind: "ok", value, gen: myGen }),
        (error: unknown) => resolve({ kind: "err", error, gen: myGen }),
      );
    });

    if (timer) clearTimeout(timer);

    // Stale attempt (should be rare with sequential loop; keep for safety).
    if (raced.gen !== myGen) {
      continue;
    }

    if (raced.kind === "ok") {
      return raced.value;
    }

    if (raced.kind === "timeout") {
      // Invalidate any in-flight work from this attempt.
      generation += 1;
      lastError = new Error(`timeout ${options.timeoutMs}ms`);
      (lastError as Error).name = "AbortError";
      if (attempt >= attempts) {
        throw new DiscoveryError(
          `[discovery] ${options.label} failed after ${attempt} attempt(s): timeout ${options.timeoutMs}ms`,
          { cause: lastError },
        );
      }
      continue;
    }

    // err
    lastError = raced.error;
    if (!isTransientError(raced.error)) {
      throw raced.error;
    }
    if (attempt >= attempts) {
      const detail =
        raced.error instanceof Error
          ? raced.error.message
          : String(raced.error);
      throw new DiscoveryError(
        `[discovery] ${options.label} failed after ${attempt} attempt(s): ${detail}`,
        { cause: raced.error },
      );
    }
  }

  throw new DiscoveryError(
    `[discovery] ${options.label} failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    { cause: lastError },
  );
}

export function formatDiscoveryHint(error: unknown): string | undefined {
  if (error instanceof DiscoveryError) {
    return "RPC/discovery failure — not an intent alignment failure";
  }
  if (error instanceof Error && error.message.includes("[discovery]")) {
    return "RPC/discovery failure — not an intent alignment failure";
  }
  if (typeof error === "string" && error.includes("[discovery]")) {
    return "RPC/discovery failure — not an intent alignment failure";
  }
  return undefined;
}
