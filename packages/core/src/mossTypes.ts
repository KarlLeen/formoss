import { isAddress } from "viem";
import { isJsonRecord } from "./rules/helpers.js";

/** Minimal Capability tree shape used by Sealmoss (walk / fixtures). */
export type CapabilitySkeleton = {
  readonly kind: "capability";
  readonly protocol: string;
  readonly method: string;
  readonly params: Record<string, unknown>;
  readonly children: readonly (CapabilitySkeleton | TransactionSkeleton | unknown)[];
};

export type TransactionSkeleton = {
  readonly kind: "transaction";
  readonly transaction?: unknown;
};

export type KuruSwapOutcome = {
  readonly operation: "swap";
  readonly protocol: "kuru";
  readonly sender: string;
  readonly tokenIn: string;
  readonly tokenOut: string;
  readonly amountIn: string;
  readonly amountOut: string;
};

export type WmonOutcome = {
  readonly operation?: "wrap" | "unwrap";
  readonly account: string;
  readonly amount: string;
};

export function isCapabilitySkeleton(value: unknown): value is CapabilitySkeleton {
  if (!isJsonRecord(value)) return false;
  return (
    value.kind === "capability" &&
    typeof value.protocol === "string" &&
    typeof value.method === "string" &&
    isJsonRecord(value.params) &&
    Array.isArray(value.children)
  );
}

export function parseKuruSwapOutcome(value: unknown): KuruSwapOutcome | null {
  if (!isJsonRecord(value)) return null;
  if (
    value.operation !== "swap" ||
    value.protocol !== "kuru" ||
    typeof value.sender !== "string" ||
    !isAddress(value.sender, { strict: false }) ||
    typeof value.tokenIn !== "string" ||
    typeof value.tokenOut !== "string" ||
    typeof value.amountIn !== "string" ||
    typeof value.amountOut !== "string"
  ) {
    return null;
  }
  return {
    operation: "swap",
    protocol: "kuru",
    sender: value.sender,
    tokenIn: value.tokenIn,
    tokenOut: value.tokenOut,
    amountIn: value.amountIn,
    amountOut: value.amountOut,
  };
}

export function parseWmonOutcome(value: unknown): WmonOutcome | null {
  if (!isJsonRecord(value)) return null;
  const account =
    typeof value.account === "string"
      ? value.account
      : typeof value.sender === "string"
        ? value.sender
        : null;
  const amount = typeof value.amount === "string" ? value.amount : null;
  if (
    account === null ||
    !isAddress(account, { strict: false }) ||
    amount === null
  ) {
    return null;
  }
  if (
    value.operation !== undefined &&
    value.operation !== "wrap" &&
    value.operation !== "unwrap"
  ) {
    return null;
  }
  return {
    operation: value.operation as "wrap" | "unwrap" | undefined,
    account,
    amount,
  };
}
