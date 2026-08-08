import { walkKuruSwapRoot } from "../../capabilityWalk.js";
import { parseKuruSwapOutcome } from "../../mossTypes.js";
import { parseKuruSwapText } from "../../textMatch.js";
import type { AddCheck } from "../types.js";
import type { KuruExpect } from "./context.js";

/**
 * When the Capability tree carries Moss quote floors, cross-check Receipt amountOut.
 * Offline fixture stubs without kuru.swap params → no checks (skip).
 */
export function matchKuruTree(
  capability: unknown,
  texts: readonly string[],
  outcome: unknown,
  expect: KuruExpect,
  add: AddCheck,
): void {
  const tree = walkKuruSwapRoot(capability);
  if (!tree) return;

  const hasFloorFields =
    tree.minimumAmountOut !== undefined ||
    tree.estimatedAmountOut !== undefined;
  if (!hasFloorFields) return;

  const parsedOutcome = parseKuruSwapOutcome(outcome);
  const swapLine = parseKuruSwapText(texts);
  const amountOut =
    parsedOutcome?.amountOut ?? swapLine?.amountOut ?? null;

  if (tree.minimumAmountOut !== undefined) {
    const floor = BigInt(tree.minimumAmountOut);
    if (amountOut === null) {
      add(
        "tree_min_amount_out",
        false,
        `tree minimumAmountOut ${tree.minimumAmountOut} but no Receipt amountOut`,
      );
    } else {
      const ok = BigInt(amountOut) >= floor;
      add(
        "tree_min_amount_out",
        ok,
        `amountOut ${amountOut} ${ok ? ">=" : "<"} tree minimumAmountOut ${tree.minimumAmountOut}`,
      );
    }
  }

  if (
    tree.estimatedAmountOut !== undefined &&
    tree.slippage !== undefined &&
    expect.floor !== null
  ) {
    const treeFloor =
      (BigInt(tree.estimatedAmountOut) * (10_000n - BigInt(tree.slippage))) /
      10_000n;
    const ok = treeFloor === expect.floor;
    add(
      "tree_floor_vs_intent",
      ok,
      `tree floor ${treeFloor.toString()} vs intent floor ${expect.floor.toString()}`,
    );
  }
}
