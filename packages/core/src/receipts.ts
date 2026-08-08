/**
 * Mirrors Moss MCP `receiptTexts`: ordered leaf Change texts only.
 * Nested Receipts are flattened depth-first.
 */
export type ReceiptLike = {
  readonly text?: string;
  readonly changes?: readonly ReceiptEntryLike[];
  readonly outcome?: unknown;
};

export type ReceiptEntryLike =
  | { readonly kind: "change"; readonly text: string }
  | (ReceiptLike & { readonly kind: "receipt" })
  | ReceiptLike;

export function receiptTexts(receipt: ReceiptLike): string[] {
  if (!receipt.changes) return [];
  return receipt.changes.flatMap((entry) => {
    if (
      entry &&
      typeof entry === "object" &&
      "kind" in entry &&
      entry.kind === "change" &&
      "text" in entry &&
      typeof entry.text === "string"
    ) {
      return [entry.text];
    }
    return receiptTexts(entry as ReceiptLike);
  });
}
