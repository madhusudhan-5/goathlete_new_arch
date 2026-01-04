#!/bin/bash

# Convert SVG files to PNG for Expo
cd "$(dirname "$0")/assets"

echo "🎨 Converting SVG files to PNG..."

# Check if qlmanage is available (macOS built-in)
if command -v qlmanage &> /dev/null; then
    echo "Using qlmanage (macOS)..."
    
    # Convert icon.svg to icon.png (1024x1024)
    if [ -f "icon.svg" ]; then
        qlmanage -t -s 1024 -o . icon.svg 2>/dev/null
        mv icon.svg.png icon.png 2>/dev/null || echo "Could not convert icon.svg"
        echo "✅ Created icon.png (1024x1024)"
    fi
    
    # Convert adaptive-icon.svg to adaptive-icon.png (1024x1024)
    if [ -f "adaptive-icon.svg" ]; then
        qlmanage -t -s 1024 -o . adaptive-icon.svg 2>/dev/null
        mv adaptive-icon.svg.png adaptive-icon.png 2>/dev/null || echo "Could not convert adaptive-icon.svg"
        echo "✅ Created adaptive-icon.png (1024x1024)"
    fi
    
    # Convert splash-icon.svg to splash.png (2048x2048)
    if [ -f "splash-icon.svg" ]; then
        qlmanage -t -s 2048 -o . splash-icon.svg 2>/dev/null
        mv splash-icon.svg.png splash.png 2>/dev/null || echo "Could not convert splash-icon.svg"
        echo "✅ Created splash.png (2048x2048)"
    fi
fi

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    
    if [ -f "icon.svg" ]; then
        convert -background none -resize 1024x1024 icon.svg icon.png 2>/dev/null
        echo "✅ Created icon.png (1024x1024)"
    fi
    
    if [ -f "adaptive-icon.svg" ]; then
        convert -background none -resize 1024x1024 adaptive-icon.svg adaptive-icon.png 2>/dev/null
        echo "✅ Created adaptive-icon.png (1024x1024)"
    fi
    
    if [ -f "splash-icon.svg" ]; then
        convert -background none -resize 2048x2048 splash-icon.svg splash.png 2>/dev/null
        echo "✅ Created splash.png (2048x2048)"
    fi
fi

# Check if rsvg-convert is available
if command -v rsvg-convert &> /dev/null; then
    echo "Using rsvg-convert..."
    
    if [ -f "icon.svg" ]; then
        rsvg-convert -w 1024 -h 1024 icon.svg > icon.png 2>/dev/null
        echo "✅ Created icon.png (1024x1024)"
    fi
    
    if [ -f "adaptive-icon.svg" ]; then
        rsvg-convert -w 1024 -h 1024 adaptive-icon.svg > adaptive-icon.png 2>/dev/null
        echo "✅ Created adaptive-icon.png (1024x1024)"
    fi
    
    if [ -f "splash-icon.svg" ]; then
        rsvg-convert -w 2048 -h 2048 splash-icon.svg > splash.png 2>/dev/null
        echo "✅ Created splash.png (2048x2048)"
    fi
fi

# Check if we successfully created the files
if [ -f "icon.png" ] && [ -f "adaptive-icon.png" ] && [ -f "splash.png" ]; then
    echo ""
    echo "✅ All PNG files created successfully!"
    echo ""
    ls -lh *.png
else
    echo ""
    echo "⚠️  Automatic conversion not available with built-in tools."
    echo ""
    echo "Please use one of these options:"
    echo ""
    echo "Option 1: Install ImageMagick (recommended)"
    echo "  brew install imagemagick"
    echo "  Then run this script again"
    echo ""
    echo "Option 2: Use online converter"
    echo "  1. Go to: https://convertio.co/svg-png/"
    echo "  2. Upload each SVG file"
    echo "  3. Set size:"
    echo "     - icon.svg → 1024x1024 → save as icon.png"
    echo "     - adaptive-icon.svg → 1024x1024 → save as adaptive-icon.png"
    echo "     - splash-icon.svg → 2048x2048 → save as splash.png"
    echo "  4. Place all PNG files in the assets/ directory"
    echo ""
    echo "Option 3: Use macOS Preview"
    echo "  1. Open each SVG in Preview"
    echo "  2. File → Export"
    echo "  3. Format: PNG"
    echo "  4. Set appropriate size and save"
fi

