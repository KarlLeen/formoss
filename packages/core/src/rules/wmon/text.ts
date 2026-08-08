import type { WorkbenchIntent } from "../../intent.js";
import { parseWmonText } from "../../textMatch.js";
import { lower } from "../helpers.js";
import type { AddCheck } from "../types.js";

type WmonIntent = Extract<WorkbenchIntent, { protocol: "wmon" }>;

export function matchWmonTexts(
  intent: WmonIntent,
  texts: readonly string[],
  recipient: string,
  expected: string,
  add: AddCheck,
): ReturnType<typeof parseWmonText> {
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

  return wmonLine;
}
