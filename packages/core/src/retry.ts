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
  return /fetch failed|ECONNRESET|ETIMEDOUT|ECONNREFUSED|timeout|AbortError|network|socket|\[discovery\]/i.test(
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

function abortError(timeoutMs: number): Error {
  const error = new Error(`timeout ${timeoutMs}ms`);
  error.name = "AbortError";
  return error;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let lastError: unknown;
  const attempts = options.retries + 1;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(abortError(options.timeoutMs)),
            options.timeoutMs,
          );
        }),
      ]);
      return result;
    } catch (error) {
      lastError = error;
      const transient = isTransientError(error);
      if (!transient || attempt >= attempts) {
        const detail =
          error instanceof Error ? error.message : String(error);
        throw new DiscoveryError(
          `[discovery] ${options.label} failed after ${attempt} attempt(s): ${detail}`,
          { cause: error },
        );
      }
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  throw new DiscoveryError(
    `[discovery] ${options.label} failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    { cause: lastError },
  );
}

export function formatDiscoveryHint(error: unknown): string | undefined {
  if (error instanceof DiscoveryError || (typeof error === "string" && error.includes("[discovery]"))) {
    return "链上/RPC 发现问题（discovery），不是意图对齐失败（align）";
  }
  if (error instanceof Error && error.message.includes("[discovery]")) {
    return "链上/RPC 发现问题（discovery），不是意图对齐失败（align）";
  }
  return undefined;
}
