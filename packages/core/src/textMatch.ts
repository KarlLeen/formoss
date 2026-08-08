import { NATIVE } from "@themoss/core";

/** Case-insensitive substring presence for addresses / tokens. */
export function textsIncludeToken(
  texts: readonly string[],
  token: string,
): boolean {
  const needle = token === NATIVE ? "native" : token.toLowerCase();
  return texts.some((text) => text.toLowerCase().includes(needle));
}

export function textsIncludeAmount(
  texts: readonly string[],
  amountBase: string,
): boolean {
  return texts.some((text) => text.includes(amountBase));
}

export function textsIncludeAddress(
  texts: readonly string[],
  address: string,
): boolean {
  const needle = address.toLowerCase();
  return texts.some((text) => text.toLowerCase().includes(needle));
}

export type ParsedKuruSwapText = {
  amountIn: string;
  tokenIn: string;
  amountOut: string;
  tokenOut: string;
  sender: string;
  raw: string;
};

/**
 * Moss Kuru leaf:
 * `Kuru Swap: {amountIn} {tokenIn} to {amountOut} {tokenOut} by {sender}`
 */
export function parseKuruSwapText(
  texts: readonly string[],
): ParsedKuruSwapText | null {
  const re =
    /Kuru Swap:\s+(\d+)\s+(\S+)\s+to\s+(\d+)\s+(\S+)\s+by\s+(0x[a-fA-F0-9]{40})/i;
  for (const raw of texts) {
    const match = raw.match(re);
    if (!match) continue;
    return {
      amountIn: match[1]!,
      tokenIn: match[2]!,
      amountOut: match[3]!,
      tokenOut: match[4]!,
      sender: match[5]!,
      raw,
    };
  }
  return null;
}

export type ParsedWmonText = {
  operation: "wrap" | "unwrap";
  amount: string;
  account: string;
  raw: string;
};

/**
 * Moss WMON root / leaf styles:
 * `WMON wrap: {amount} for {account}`
 * `WMON Deposit: {amount} for {account}`
 */
export function parseWmonText(
  texts: readonly string[],
  method: "wrap" | "unwrap",
): ParsedWmonText | null {
  const event = method === "wrap" ? "Deposit" : "Withdrawal";
  const patterns = [
    new RegExp(
      `WMON ${method}:\\s+(\\d+)\\s+for\\s+(0x[a-fA-F0-9]{40})`,
      "i",
    ),
    new RegExp(
      `WMON ${event}:\\s+(\\d+)\\s+for\\s+(0x[a-fA-F0-9]{40})`,
      "i",
    ),
  ];
  for (const raw of texts) {
    for (const re of patterns) {
      const match = raw.match(re);
      if (!match) continue;
      return {
        operation: method,
        amount: match[1]!,
        account: match[2]!,
        raw,
      };
    }
  }
  return null;
}

export type ParsedApprovalText = {
  owner: string;
  spender: string;
  amount: string;
  token: string;
  raw: string;
};

/**
 * `ERC20 Approval: {owner} approved {spender} for {amount} {token}`
 */
export function parseApprovalTexts(
  texts: readonly string[],
): ParsedApprovalText[] {
  const re =
    /ERC20 Approval:\s+(0x[a-fA-F0-9]{40})\s+approved\s+(0x[a-fA-F0-9]{40})\s+for\s+(\d+)\s+(\S+)/i;
  const found: ParsedApprovalText[] = [];
  for (const raw of texts) {
    const match = raw.match(re);
    if (!match) continue;
    found.push({
      owner: match[1]!,
      spender: match[2]!,
      amount: match[3]!,
      token: match[4]!,
      raw,
    });
  }
  return found;
}

/** Final tokenOut credit to recipient, if present among Transfer leaves. */
export function findTokenOutTransferTo(
  texts: readonly string[],
  tokenOut: string,
  recipient: string,
): string | null {
  const tokenNeedle =
    tokenOut === NATIVE ? "native" : tokenOut.toLowerCase();
  const toNeedle = recipient.toLowerCase();
  const re =
    /ERC20 Transfer:\s+(\d+)\s+(\S+)\s+from\s+(0x[a-fA-F0-9]{40})\s+to\s+(0x[a-fA-F0-9]{40})/i;
  for (const raw of texts) {
    const match = raw.match(re);
    if (!match) continue;
    const token = match[2]!.toLowerCase();
    const to = match[4]!.toLowerCase();
    if (token === tokenNeedle && to === toNeedle) return raw;
  }
  return null;
}
