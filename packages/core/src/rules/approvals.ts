import { KURU_ROUTER_ADDRESS } from "@themoss/protocol-kuru";
import { walkApproves } from "../capabilityWalk.js";
import { parseApprovalTexts } from "../textMatch.js";
import { lower } from "./helpers.js";
import type { AlignRule } from "./types.js";

export const approvalRules: readonly AlignRule[] = [
  {
    id: "approvals",
    when: () => true,
    run: (ctx, add) => {
      const approvals = parseApprovalTexts(ctx.texts);
      const treeApproves = walkApproves(ctx.capability);
      const expectSpender = ctx.intent.expect?.spender;

      if (approvals.length > 0) {
        const ownerOk = approvals.every(
          (row) => lower(row.owner) === lower(ctx.intent.account),
        );
        add(
          "approval_owner",
          ownerOk,
          ownerOk
            ? `${approvals.length} approval leaf(s); owner matches account`
            : `approval owner mismatch (want ${ctx.intent.account})`,
        );
      }

      for (const [index, node] of treeApproves.entries()) {
        const match = approvals.find(
          (row) =>
            lower(row.spender) === lower(node.spender) &&
            lower(row.owner) === lower(ctx.intent.account),
        );
        add(
          `approval_spender_${index}`,
          match !== undefined,
          match
            ? `tree approve spender ${node.spender} evidenced in Receipt`
            : `tree approve spender ${node.spender} missing from ERC20 Approval leaves`,
        );

        if (ctx.intent.protocol === "kuru") {
          const routerOk = lower(node.spender) === lower(KURU_ROUTER_ADDRESS);
          add(
            `approval_kuru_router_${index}`,
            routerOk,
            routerOk
              ? `spender is Kuru router ${KURU_ROUTER_ADDRESS}`
              : `spender ${node.spender} is not Kuru router ${KURU_ROUTER_ADDRESS}`,
          );
        }
      }

      if (expectSpender) {
        const inTexts = approvals.some(
          (row) => lower(row.spender) === lower(expectSpender),
        );
        add(
          "expect_spender_text",
          inTexts,
          inTexts
            ? `expect.spender ${expectSpender} found in Approval leaves`
            : `expect.spender ${expectSpender} missing from Approval leaves`,
        );

        if (treeApproves.length > 0) {
          const inTree = treeApproves.some(
            (node) => lower(node.spender) === lower(expectSpender),
          );
          add(
            "expect_spender_tree",
            inTree,
            inTree
              ? `expect.spender ${expectSpender} present in Capability tree`
              : `expect.spender ${expectSpender} not among tree approve spenders`,
          );
        }
      }
    },
  },
];
