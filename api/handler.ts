import type { VercelRequest, VercelResponse } from "@vercel/node";
// Source import: Vercel bundles this with @sealmoss/core (built in vercel-build).
import { dispatch } from "../packages/web/src/app.js";

/**
 * Single Vercel entry: HTML + /api/* (fixture-only by default).
 * Path is passed via rewrite query `sealmossPath` so platform rewrites do not drop it.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const raw = req.query.sealmossPath;
  const pathname =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? raw[0]
        : undefined;
  await dispatch(req, res, pathname ? { pathname } : undefined);
}
