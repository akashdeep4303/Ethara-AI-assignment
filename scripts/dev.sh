#!/usr/bin/env bash
# Run a single Next dev server for this repo. Multiple `next dev` instances corrupt `.next` chunks.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if command -v pkill >/dev/null 2>&1; then
  pkill -f "$ROOT/node_modules/.bin/next dev" 2>/dev/null || true
  sleep 1
fi
exec "$ROOT/node_modules/.bin/next" dev
