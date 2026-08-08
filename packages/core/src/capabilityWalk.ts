export type ApproveNode = {
  readonly protocol: string;
  readonly method: "approve";
  readonly spender: string;
  readonly token: string;
  readonly amount: string;
};

type CapLike = {
  readonly kind?: string;
  readonly protocol?: string;
  readonly method?: string;
  readonly params?: unknown;
  readonly children?: readonly unknown[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Depth-first walk of a Moss Capability tree; collect erc20.approve nodes.
 */
export function walkApproves(capability: unknown): ApproveNode[] {
  const found: ApproveNode[] = [];
  walk(capability, found);
  return found;
}

function walk(node: unknown, found: ApproveNode[]): void {
  if (!isRecord(node)) return;
  const cap = node as CapLike;

  if (
    cap.kind === "capability" &&
    cap.method === "approve" &&
    typeof cap.protocol === "string" &&
    isRecord(cap.params)
  ) {
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

  if (Array.isArray(cap.children)) {
    for (const child of cap.children) walk(child, found);
  }
}
