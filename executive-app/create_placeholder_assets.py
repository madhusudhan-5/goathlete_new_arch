#!/usr/bin/env python3
"""
Quick script to create placeholder assets for GoAthlete Executive app.
Creates simple placeholder icons that you can replace with your actual logo later.
"""

import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("❌ PIL/Pillow is not installed.")
    print("\nInstall it with:")
    print("  pip install Pillow")
    print("\nOr use the online tools mentioned in CREATE_ASSETS.md")
    exit(1)

# Colors
NAVY = (10, 31, 53)  # #0A1F35
ORANGE = (218, 111, 43)  # #DA6F2B
WHITE = (255, 255, 255)

ASSETS_DIR = Path(__file__).parent / "assets"
ASSETS_DIR.mkdir(exist_ok=True)

def create_icon(size, filename):
    """Create a simple placeholder icon."""
    img = Image.new('RGB', (size, size), NAVY)
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        # Try to find a bold font
        font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size=size//3)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size=size//8)
    except:
        try:
            font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size=size//3)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size=size//8)
        except:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()
    
    # Draw "GA" in orange
    text = "GA"
    bbox = draw.textbbox((0, 0), text, font=font_large)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size - text_width) // 2, (size - text_height) // 2 - size//10)
    draw.text(position, text, fill=ORANGE, font=font_large)
    
    # Draw "GoAthlete" below in white
    text2 = "GoAthlete"
    bbox2 = draw.textbbox((0, 0), text2, font=font_small)
    text2_width = bbox2[2] - bbox2[0]
    position2 = ((size - text2_width) // 2, position[1] + text_height + size//20)
    draw.text(position2, text2, fill=WHITE, font=font_small)
    
    img.save(ASSETS_DIR / filename)
    print(f"✅ Created {filename} ({size}x{size})")

def create_splash(size, filename):
    """Create a simple placeholder splash screen."""
    img = Image.new('RGB', (size, size), NAVY)
    draw = ImageDraw.Draw(img)
    
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size=size//3)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size=size//8)
    except:
        try:
            font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size=size//3)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size=size//8)
        except:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()
    
    # Draw "GA" in orange (larger for splash)
    text = "GA"
    bbox = draw.textbbox((0, 0), text, font=font_large)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size - text_width) // 2, (size - text_height) // 2 - size//15)
    draw.text(position, text, fill=ORANGE, font=font_large)
    
    # Draw "GoAthlete" below in white
    text2 = "GoAthlete"
    bbox2 = draw.textbbox((0, 0), text2, font=font_small)
    text2_width = bbox2[2] - bbox2[0]
    position2 = ((size - text2_width) // 2, position[1] + text_height + size//25)
    draw.text(position2, text2, fill=WHITE, font=font_small)
    
    img.save(ASSETS_DIR / filename)
    print(f"✅ Created {filename} ({size}x{size})")

def create_favicon(size, filename):
    """Create a simple placeholder favicon."""
    img = Image.new('RGB', (size, size), NAVY)
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size=size//2)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size=size//2)
        except:
            font = ImageFont.load_default()
    
    # Draw "GA" in orange
    text = "GA"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size - text_width) // 2, (size - text_height) // 2)
    draw.text(position, text, fill=ORANGE, font=font)
    
    img.save(ASSETS_DIR / filename)
    print(f"✅ Created {filename} ({size}x{size})")

if __name__ == "__main__":
    print("🎨 Creating placeholder assets for GoAthlete Executive...")
    print("")
    
    create_icon(1024, "icon.png")
    create_icon(1024, "adaptive-icon.png")
    create_splash(2048, "splash.png")
    create_favicon(512, "favicon.png")
    
    print("")
    print("✅ All placeholder assets created successfully!")
    print("")
    print("📝 Note: These are placeholder icons with 'GA' text.")
    print("   Replace them with your actual GoAthlete logo when ready!")
    print("")
    print("📁 Files created in:", ASSETS_DIR)
    print("")
    print("Next step: Run 'npx expo-doctor' to verify")

