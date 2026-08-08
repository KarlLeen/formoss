export type FlagSpec =
  | { readonly kind: "value"; readonly name: string }
  | { readonly kind: "boolean"; readonly name: string };

export type ParsedFlags = {
  readonly values: Record<string, string>;
  readonly booleans: Record<string, boolean>;
};

/**
 * Tiny argv flag parser shared by `run` / `capture`.
 * Value flags consume the next token; unknown flags throw.
 */
export function parseFlags(
  args: readonly string[],
  specs: readonly FlagSpec[],
): ParsedFlags {
  const valueNames = new Set(
    specs.filter((s) => s.kind === "value").map((s) => s.name),
  );
  const boolNames = new Set(
    specs.filter((s) => s.kind === "boolean").map((s) => s.name),
  );
  const values: Record<string, string> = {};
  const booleans: Record<string, boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--help" || arg === "-h") {
      booleans.help = true;
      continue;
    }
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    const name = arg.slice(2);
    if (boolNames.has(name)) {
      booleans[name] = true;
      continue;
    }
    if (valueNames.has(name)) {
      const next = args[++i];
      if (next === undefined || next.startsWith("--")) {
        throw new Error(`Missing value for --${name}`);
      }
      values[name] = next;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { values, booleans };
}
