export type CaptureWritePlan = {
  /** Write the primary --out path. */
  readonly writeOut: boolean;
  /** Write out+".new.json" when comparing and drifting. */
  readonly writeNew: boolean;
  readonly exitCode: 0 | 3;
};

/**
 * Decide what to write after capture + optional --compare.
 * Drift without --force-write: write .new.json only (do not dirty --out).
 */
export function decideCaptureWrite(args: {
  readonly compared: boolean;
  readonly drifted: boolean;
  readonly forceWrite: boolean;
}): CaptureWritePlan {
  if (!args.compared || !args.drifted) {
    return { writeOut: true, writeNew: false, exitCode: 0 };
  }
  if (args.forceWrite) {
    return { writeOut: true, writeNew: true, exitCode: 3 };
  }
  return { writeOut: false, writeNew: true, exitCode: 3 };
}

export function captureNewPath(outPath: string): string {
  return outPath.endsWith(".json")
    ? `${outPath.slice(0, -".json".length)}.new.json`
    : `${outPath}.new.json`;
}
