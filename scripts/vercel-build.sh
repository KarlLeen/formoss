#!/usr/bin/env bash
# Vercel build: Moss packages + Sealmoss core/web (fixture demos served from /demos).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bash scripts/build-moss.sh
pnpm --filter @sealmoss/core --filter @sealmoss/web run build

test -f packages/web/dist/app.js
test -f demos/catalog.json
echo "Vercel build artifacts ready."
