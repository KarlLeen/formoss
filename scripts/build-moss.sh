#!/usr/bin/env bash
# Build the Moss packages Formoss depends on (after submodule / clone).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
for pkg in core simulator erc system; do
  pnpm --filter "@themoss/$pkg" run build
done
pnpm --filter @themoss/protocol-kuru run build
echo "Moss packages built."
