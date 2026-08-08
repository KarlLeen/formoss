import { isAddress, parseUnits } from "viem";
import type { WorkbenchIntent } from "../intent.js";
import { parseWmonText } from "../textMatch.js";
import { isJsonRecord, lower } from "./helpers.js";
import type { AlignRule } from "./types.js";

export const wmonRules: readonly AlignRule[] = [
  {
    id: "wmon",
    when: (ctx) => ctx.intent.protocol === "wmon",
    run: (ctx, add) => {
      const intent = ctx.intent as Extract<WorkbenchIntent, { protocol: "wmon" }>;
      const { texts, outcome } = ctx;
      const recipient = intent.expect?.recipient ?? intent.account;
      const expected = parseUnits(intent.params.amount, 18).toString();

      const wmonLine = parseWmonText(texts, intent.method);
      add(
        "text_wmon_line",
        wmonLine !== null,
        wmonLine
          ? wmonLine.raw
          : `missing leaf matching WMON ${intent.method}/event for account`,
      );

      if (wmonLine) {
        add(
          "text_wmon_amount",
          wmonLine.amount === expected,
          `text amount want ${expected}, got ${wmonLine.amount}`,
        );
        add(
          "text_wmon_account",
          lower(wmonLine.account) === lower(recipient),
          `text account want ${recipient}, got ${wmonLine.account}`,
        );
      }

      const nativeMention = texts.some((text) =>
        /Native MON Transfer:/i.test(text),
      );
      add(
        "text_native_transfer",
        nativeMention,
        nativeMention
          ? "Native MON Transfer leaf present"
          : "missing Native MON Transfer leaf",
      );

      if (!isJsonRecord(outcome)) {
        add("outcome_shape", false, "WMON outcome is not an object");
        return;
      }

      const account =
        typeof outcome.account === "string"
          ? outcome.account
          : typeof outcome.sender === "string"
            ? outcome.sender
            : null;

      const amountField =
        typeof outcome.amount === "string" ? outcome.amount : null;

      const okShape =
        account !== null &&
        isAddress(account, { strict: false }) &&
        amountField !== null &&
        (outcome.operation === intent.method ||
          outcome.operation === undefined);

      add("outcome_shape", okShape, "WMON outcome fields");
      if (!okShape || !account || !amountField) return;

      add(
        "recipient",
        lower(account) === lower(recipient),
        `account want ${recipient}, got ${account}`,
      );

      if (!intent.expect?.amountIn) {
        add(
          "amount",
          amountField === expected,
          `amount want ${expected}, got ${amountField}`,
        );
      }

      if (wmonLine) {
        add(
          "dual_wmon_amount",
          amountField === wmonLine.amount,
          `outcome amount ${amountField} vs text ${wmonLine.amount}`,
        );
        add(
          "dual_wmon_account",
          lower(account) === lower(wmonLine.account),
          `outcome account ${account} vs text ${wmonLine.account}`,
        );
      }
    },
  },
];
