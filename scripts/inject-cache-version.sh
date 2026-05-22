#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INDEX="$ROOT/index.html"

if [[ ! -f "$INDEX" ]]; then
  echo "index.html not found at $INDEX" >&2
  exit 1
fi

if VERSION="$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null)"; then
  :
else
  VERSION="$(date +%Y%m%d%H%M%S)"
fi

perl -pi -e "s/\\?v=[^\"']+/\\?v=$VERSION/g" "$INDEX"
printf '%s\n' "$VERSION" > "$ROOT/.cache-version"

echo "Cache bust version set to $VERSION"
