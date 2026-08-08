import type { AlignRule } from "./types.js";

export const commonRules: readonly AlignRule[] = [
  {
    id: "protocol_method",
    when: {},
    run: (ctx, add) => {
      add(
        "protocol_method",
        ctx.protocol === ctx.intent.protocol &&
          ctx.method === ctx.intent.method,
        `expected ${ctx.intent.protocol}.${ctx.intent.method}, got ${ctx.protocol}.${ctx.method}`,
      );
    },
  },
  {
    id: "receipt_texts",
    when: {},
    run: (ctx, add) => {
      add(
        "receipt_texts_present",
        ctx.texts.length > 0,
        ctx.texts.length > 0
          ? `${ctx.texts.length} ordered leaf text(s)`
          : "no Receipt leaf texts — refuse to verify",
      );
      for (const [index, text] of ctx.texts.entries()) {
        add(
          `text_${index}_nonempty`,
          text.trim().length > 0,
          text.trim().length > 0 ? text : `leaf[${index}] empty`,
        );
      }
    },
  },
];
