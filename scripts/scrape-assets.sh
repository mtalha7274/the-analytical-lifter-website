#!/usr/bin/env bash
set -euo pipefail

BASE_URL="https://mindset-matters.my.canva.site"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/assets/images"
MANIFEST="$OUT_DIR/manifest.txt"

mkdir -p "$OUT_DIR"
: > "$MANIFEST"

echo "Fetching asset URLs from Canva site..."
HTML=$(curl -sL "$BASE_URL/")

MEDIA_URLS=$(echo "$HTML" | rg -o '_assets/media/[^"'\'' ]+' | sort -u)
ICON_URLS=$(echo "$HTML" | rg -o '_assets/images/[^"'\'' ]+\.(png|jpg|webp|svg)' | sort -u)

count=0
for path in $MEDIA_URLS $ICON_URLS; do
  filename=$(basename "$path")
  dest="$OUT_DIR/$filename"
  if [[ ! -f "$dest" ]]; then
    curl -sL "$BASE_URL/$path" -o "$dest"
    echo "Downloaded: $filename"
  else
    echo "Skipped (exists): $filename"
  fi
  count=$((count + 1))
  echo "$filename -> $path" >> "$MANIFEST"
done

echo ""
echo "Done. Downloaded/checked $count assets to $OUT_DIR"
echo "Manifest written to $MANIFEST"

# Log dimensions for key image identification
echo "" >> "$MANIFEST"
echo "--- Dimensions ---" >> "$MANIFEST"
find "$OUT_DIR" -maxdepth 1 \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.svg' \) | while read -r f; do
  dims=$(sips -g pixelWidth -g pixelHeight "$f" 2>/dev/null | awk '/pixel/{print $2}' | tr '\n' 'x' | sed 's/x$//')
  echo "$(basename "$f"): ${dims:-unknown}" >> "$MANIFEST"
done
