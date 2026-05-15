#!/usr/bin/env bash
#
# Build assets/resume.pdf from the Jekyll site.
#
# Pipeline: jekyll build (Docker) -> _site/ -> headless Chrome -> PDF.
#
# Usage:
#   scripts/build-resume-pdf.sh           # build local site + render
#   scripts/build-resume-pdf.sh --live    # render from https://jakearmstrong.me/

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

OUT="assets/resume.pdf"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [[ ! -x "$CHROME" ]]; then
  echo "Chrome not found at $CHROME" >&2
  exit 1
fi

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

if [[ "${1:-}" == "--live" ]]; then
  TARGET_URL="https://jakearmstrong.me/"
  echo "Rendering from live URL: $TARGET_URL"
else
  echo "Building site with Docker (jekyll/jekyll:4.2.2)..."
  docker run --rm \
    --volume "$REPO_ROOT":/srv/jekyll \
    --volume "$REPO_ROOT/.bundle-cache":/usr/local/bundle \
    jekyll/jekyll:4.2.2 \
    jekyll build --quiet

  if [[ ! -f "_site/index.html" ]]; then
    echo "jekyll build did not produce _site/index.html" >&2
    exit 1
  fi

  # _site uses absolute asset paths (/assets/...) so file:// breaks CSS;
  # serve _site over HTTP on a random port and render from there.
  PORT="$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')"
  echo "Serving _site/ on http://127.0.0.1:$PORT/"
  (cd "$REPO_ROOT/_site" && python3 -m http.server "$PORT" >/dev/null 2>&1) &
  SERVER_PID=$!

  # Wait for the server to accept connections
  for _ in $(seq 1 50); do
    if curl -fs "http://127.0.0.1:$PORT/" -o /dev/null; then
      break
    fi
    sleep 0.1
  done

  TARGET_URL="http://127.0.0.1:$PORT/"
fi

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --no-pdf-header-footer \
  --hide-scrollbars \
  --virtual-time-budget=15000 \
  --print-to-pdf="$REPO_ROOT/$OUT" \
  "$TARGET_URL" 2>/dev/null

echo "Wrote $OUT"
ls -lh "$OUT"
