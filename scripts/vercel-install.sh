#!/usr/bin/env bash
# Vercel install: submodule + pnpm (skip prepare; Moss built in vercel-build).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .gitmodules ]] && grep -q 'vendor/moss' .gitmodules 2>/dev/null; then
  git submodule update --init --depth 1 vendor/moss
fi

export SEALMOSS_SKIP_PREPARE=1
pnpm install --prefer-offline --config.minimumReleaseAge=0 --frozen-lockfile
