#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$ROOT/vendor/moss"
MOSS_URL="${MOSS_URL:-https://github.com/nishuzumi/moss.git}"

if [[ -f "$ROOT/.gitmodules" ]] && grep -q 'vendor/moss' "$ROOT/.gitmodules" 2>/dev/null; then
  echo "Initializing Moss git submodule (depth 1)…"
  git -C "$ROOT" submodule update --init --depth 1 vendor/moss
elif [[ -d "$TARGET/.git" || -d "$TARGET/packages" ]]; then
  echo "Moss already present at vendor/moss"
else
  mkdir -p "$ROOT/vendor"
  echo "Cloning Moss (shallow fallback)…"
  git clone --depth 1 "$MOSS_URL" "$TARGET"
fi

echo "Building Moss packages required by Sealmoss…"
bash "$ROOT/scripts/build-moss.sh"
echo "Moss ready at vendor/moss"
