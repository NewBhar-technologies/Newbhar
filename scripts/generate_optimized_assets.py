import os
import shutil
from PIL import Image

def generate_assets():
    source_path = "public/newbhar-mark.png"
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Source mark not found at {source_path}")

    master_img = Image.open(source_path).convert("RGBA")
    w, h = master_img.size
    print(f"Loaded master source from {source_path}: {w}x{h}, mode={master_img.mode}")

    # 1. Generate descriptive logo assets for SEO
    # PNG format (512x512)
    logo_png_path = "public/newbhar-technologies-logo.png"
    master_img.save(logo_png_path, "PNG", optimize=True)
    print(f"Generated {logo_png_path} ({os.path.getsize(logo_png_path)} bytes)")

    brand_logo_path = "public/newbhar-technologies-brand-logo.png"
    master_img.save(brand_logo_path, "PNG", optimize=True)
    print(f"Generated {brand_logo_path} ({os.path.getsize(brand_logo_path)} bytes)")

    # WebP format (512x512)
    logo_webp_path = "public/newbhar-technologies-logo.webp"
    master_img.save(logo_webp_path, "WEBP", lossless=True)
    print(f"Generated {logo_webp_path} ({os.path.getsize(logo_webp_path)} bytes)")

    # Ensure public/newbhar-mark.png is also freshly optimized
    master_img.save("public/newbhar-mark.png", "PNG", optimize=True)

    # 2. Generate Favicon PNGs across sizes
    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "favicon-48x48.png": 48,
        "favicon-96x96.png": 96,
        "apple-touch-icon.png": 180,
        "apple-icon.png": 180,
        "icon-192.png": 192,
        "icon-512.png": 512,
        "icon.png": 512,
        "favicon.png": 48, # Google 48px square standard
    }

    resized_images = {}
    for filename, sz in sizes.items():
        resized = master_img.resize((sz, sz), Image.Resampling.LANCZOS)
        out_path = os.path.join("public", filename)
        resized.save(out_path, "PNG", optimize=True)
        resized_images[sz] = resized
        print(f"Generated {out_path} ({sz}x{sz}, {os.path.getsize(out_path)} bytes)")

    # 3. Generate Multi-Size favicon.ico (16, 32, 48)
    # 48x48 is specifically required by Google Search Favicon Guidelines
    ico_path = "public/favicon.ico"
    master_img.save(
        ico_path,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)]
    )
    print(f"Generated multi-size {ico_path} ({os.path.getsize(ico_path)} bytes)")

    # 4. Copy required app directory icons for Next.js App Router metadata conventions
    app_ico = "app/favicon.ico"
    shutil.copy2(ico_path, app_ico)
    print(f"Synchronized {app_ico}")

    app_icon = "app/icon.png"
    shutil.copy2("public/icon.png", app_icon)
    print(f"Synchronized {app_icon}")

    app_apple = "app/apple-icon.png"
    shutil.copy2("public/apple-icon.png", app_apple)
    print(f"Synchronized {app_apple}")

    print("\n--- All assets generated and synchronized successfully! ---")

if __name__ == "__main__":
    generate_assets()
