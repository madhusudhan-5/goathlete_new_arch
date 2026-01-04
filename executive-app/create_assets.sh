#!/bin/bash
# Quick script to create placeholder assets
cd "$(dirname "$0")"
ASSETS_DIR="./assets"
mkdir -p "$ASSETS_DIR"

echo "Creating placeholder assets..."
echo "Note: This requires ImageMagick. Install with: brew install imagemagick"

if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Using online tools instead."
    echo "See CREATE_ASSETS.md for instructions"
    exit 1
fi

NAVY="#0A1F35"
ORANGE="#DA6F2B"
WHITE="#FFFFFF"

convert -size 1024x1024 xc:"$NAVY" -font Helvetica-Bold -pointsize 350 -fill "$ORANGE" -gravity center -annotate +0+0 'GA' -pointsize 120 -fill "$WHITE" -gravity center -annotate +0+150 'GoAthlete' "$ASSETS_DIR/icon.png"
cp "$ASSETS_DIR/icon.png" "$ASSETS_DIR/adaptive-icon.png"
convert -size 2048x2048 xc:"$NAVY" -font Helvetica-Bold -pointsize 700 -fill "$ORANGE" -gravity center -annotate +0+0 'GA' -pointsize 240 -fill "$WHITE" -gravity center -annotate +0+300 'GoAthlete' "$ASSETS_DIR/splash.png"
convert -size 512x512 xc:"$NAVY" -font Helvetica-Bold -pointsize 180 -fill "$ORANGE" -gravity center -annotate +0+0 'GA' "$ASSETS_DIR/favicon.png"

echo "✅ Assets created!"
