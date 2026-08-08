/** Process / pipeline exit codes for CLI and Web. */
export const ExitCode = {
  OK: 0,
  WARNING: 2,
  ALIGN_FAIL: 3,
  ACTION_FAIL: 4,
  USAGE: 1,
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];

export type PipelineStatus =
  | "ok"
  | "warning"
  | "align_fail"
  | "action_fail"
  | "usage";

export function statusToExitCode(status: PipelineStatus): ExitCode {
  switch (status) {
    case "ok":
      return ExitCode.OK;
    case "warning":
      return ExitCode.WARNING;
    case "align_fail":
      return ExitCode.ALIGN_FAIL;
    case "action_fail":
      return ExitCode.ACTION_FAIL;
    case "usage":
      return ExitCode.USAGE;
  }
}
