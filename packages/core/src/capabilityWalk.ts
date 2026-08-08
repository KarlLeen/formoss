import {
  isCapabilitySkeleton,
  type CapabilitySkeleton,
} from "./mossTypes.js";

export type ApproveNode = {
  readonly protocol: string;
  readonly method: "approve";
  readonly spender: string;
  readonly token: string;
  readonly amount: string;
};

/** Moss Kuru swap capability params used for tree↔evidence checks. */
export type KuruSwapTreeParams = {
  readonly slippage?: number;
  readonly estimatedAmountOut?: string;
  readonly minimumAmountOut?: string;
  readonly tokenIn?: string;
  readonly tokenOut?: string;
  readonly path?: readonly string[];
};

/**
 * Depth-first walk of a Moss Capability tree; collect erc20.approve nodes.
 */
export function walkApproves(capability: unknown): ApproveNode[] {
  const found: ApproveNode[] = [];
  walk(capability, found);
  return found;
}

/**
 * Read the root `kuru.swap` capability params (Moss may stash quote floors here).
 * Returns null when the root is not a kuru.swap skeleton (e.g. offline stub).
 */
export function walkKuruSwapRoot(capability: unknown): KuruSwapTreeParams | null {
  if (!isCapabilitySkeleton(capability)) return null;
  if (capability.protocol !== "kuru" || capability.method !== "swap") {
    return null;
  }
  const p = capability.params;
  const slippage =
    typeof p.slippage === "number"
      ? p.slippage
      : typeof p.slippage === "string" && /^\d+$/.test(p.slippage)
        ? Number(p.slippage)
        : undefined;
  const estimatedAmountOut =
    typeof p.estimatedAmountOut === "string" && /^\d+$/.test(p.estimatedAmountOut)
      ? p.estimatedAmountOut
      : typeof p.estimatedAmountOut === "bigint"
        ? p.estimatedAmountOut.toString()
        : undefined;
  const minimumAmountOut =
    typeof p.minimumAmountOut === "string" && /^\d+$/.test(p.minimumAmountOut)
      ? p.minimumAmountOut
      : typeof p.minimumAmountOut === "bigint"
        ? p.minimumAmountOut.toString()
        : undefined;
  const tokenIn = typeof p.tokenIn === "string" ? p.tokenIn : undefined;
  const tokenOut = typeof p.tokenOut === "string" ? p.tokenOut : undefined;
  let path: readonly string[] | undefined;
  if (Array.isArray(p.path) && p.path.every((x) => typeof x === "string")) {
    path = p.path as string[];
  } else if (Array.isArray(p.route)) {
    // Moss may expose route as market legs; keep token refs if string-like.
    const tokens = p.route.filter((x): x is string => typeof x === "string");
    if (tokens.length > 0) path = tokens;
  }
  return {
    ...(slippage !== undefined ? { slippage } : {}),
    ...(estimatedAmountOut !== undefined ? { estimatedAmountOut } : {}),
    ...(minimumAmountOut !== undefined ? { minimumAmountOut } : {}),
    ...(tokenIn !== undefined ? { tokenIn } : {}),
    ...(tokenOut !== undefined ? { tokenOut } : {}),
    ...(path !== undefined ? { path } : {}),
  };
}

function walk(node: unknown, found: ApproveNode[]): void {
  if (!isCapabilitySkeleton(node)) {
    // Still descend into non-skeleton objects that may nest capabilities.
    if (node !== null && typeof node === "object" && !Array.isArray(node)) {
      const children = (node as { children?: unknown }).children;
      if (Array.isArray(children)) {
        for (const child of children) walk(child, found);
      }
    }
    return;
  }

  const cap: CapabilitySkeleton = node;
  if (cap.method === "approve") {
    const spender = cap.params.spender;
    const token = cap.params.token;
    const amount = cap.params.amount;
    if (
      typeof spender === "string" &&
      typeof token === "string" &&
      (typeof amount === "string" || typeof amount === "number")
    ) {
      found.push({
        protocol: cap.protocol,
        method: "approve",
        spender,
        token,
        amount: String(amount),
      });
    }
  }

  for (const child of cap.children) walk(child, found);
}
