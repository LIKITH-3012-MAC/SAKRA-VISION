import cv2
import numpy as np
from PIL import Image

def recolor_dark_variant(img_bgr):
    # Convert BGR to HSV
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

    # Target colors in RGB:
    # Deep Forest Green: #0F2A24 -> BGR: (36, 42, 15)
    # Antique Gold: #C9A568 -> BGR: (104, 165, 201)
    # Light Gold: #E5D7BB -> BGR: (187, 215, 229)
    # Warm Ivory: #F8F3E8 -> BGR: (232, 243, 248)

    # In OpenCV HSV: H is [0, 180]
    # Blue is around H in [95, 140]
    # Cyan glow is around [80, 105]
    # Green is around [35, 75]
    # Gold/Yellow is around [18, 32]

    # Detect blue & cyan regions (glow, orb, borders)
    blue_mask = (h >= 85) & (h <= 145) & (s > 25)
    
    # Detect subtle blue in dark background (vignette)
    dark_blue_bg = (h >= 90) & (h <= 150) & (v < 60) & (s > 10)

    # Detect metallic silver/white highlights (low saturation, high value)
    silver_highlights = (s <= 40) & (v > 130)
    silver_midtones = (s <= 35) & (v > 60) & (v <= 130)

    # Output image in float BGR
    out = img_bgr.astype(np.float32).copy()

    # 1. Transform Blue Glow and Accents into Antique Gold / Emerald Green Glow
    # For high brightness blue (glow / orb center / cyan peak): warm champagne gold
    glow_mask = blue_mask & (v > 100)
    # Shift to warm gold: R higher than G higher than B
    out[glow_mask, 0] = v[glow_mask] * 0.40  # B
    out[glow_mask, 1] = v[glow_mask] * 0.72  # G
    out[glow_mask, 2] = v[glow_mask] * 0.90  # R

    # For deep blue structural elements (edges of emblem, inner shadow): deep forest green
    deep_blue_mask = blue_mask & (v <= 100)
    out[deep_blue_mask, 0] = v[deep_blue_mask] * 0.28  # B
    out[deep_blue_mask, 1] = v[deep_blue_mask] * 0.58  # G
    out[deep_blue_mask, 2] = v[deep_blue_mask] * 0.20  # R

    # 2. Transform dark blue vignette into deep forest green ambience (#0F2A24)
    out[dark_blue_bg, 0] = out[dark_blue_bg, 0] * 0.25 # Reduce blue
    out[dark_blue_bg, 1] = np.maximum(out[dark_blue_bg, 1], out[dark_blue_bg, 0] * 1.6) # Enhance green
    out[dark_blue_bg, 2] = out[dark_blue_bg, 2] * 0.75 # Controlled red

    # 3. Tint silver metallic highlights into warm ivory and champagne gold
    # Silver highlights get subtle champagne tint (#F2E9D8)
    out[silver_highlights, 0] = out[silver_highlights, 0] * 0.88 # B slightly reduced
    out[silver_highlights, 1] = out[silver_highlights, 1] * 0.96 # G preserved
    out[silver_highlights, 2] = np.clip(out[silver_highlights, 2] * 1.03, 0, 255) # R slightly boosted

    # Silver midtones get warm antique gold reflection
    out[silver_midtones, 0] = out[silver_midtones, 0] * 0.82
    out[silver_midtones, 1] = out[silver_midtones, 1] * 0.94
    out[silver_midtones, 2] = np.clip(out[silver_midtones, 2] * 1.05, 0, 255)

    return np.clip(out, 0, 255).astype(np.uint8)

def create_light_variant(dark_recolored):
    # For light backgrounds (warm ivory #F8F3E8):
    # The dark background (v < 30) becomes transparent or warm ivory
    # The metallic elements become deep forest green #0F2A24 and antique gold #C9A568
    hsv = cv2.cvtColor(dark_recolored, cv2.COLOR_BGR2HSV)
    v = hsv[:, :, 2]
    
    # Create RGBA
    b, g, r = cv2.split(dark_recolored)
    # Alpha mask based on luminance
    alpha = cv2.threshold(v, 20, 255, cv2.THRESH_BINARY)[1]
    alpha = cv2.GaussianBlur(alpha, (5, 5), 0)

    # On ivory background (#F8F3E8 -> BGR 232, 243, 248)
    h_img, w_img = dark_recolored.shape[:2]
    ivory_bg = np.zeros((h_img, w_img, 3), dtype=np.uint8)
    ivory_bg[:] = (232, 243, 248) # Warm Ivory BGR

    # Invert luminosity for emblem & text to read crisp dark on light background
    # Forest Green foreground: B: 36, G: 42, R: 15 (#0F2A24)
    # Gold accents: B: 104, G: 165, R: 201 (#C9A568)
    light_fg = np.zeros_like(dark_recolored)
    
    norm_v = (v.astype(np.float32) / 255.0)[:, :, np.newaxis]
    
    # Forest green base with gold highlights
    base_green = np.array([36, 42, 15], dtype=np.float32)
    accent_gold = np.array([104, 165, 201], dtype=np.float32)
    
    blended_color = base_green * (1.0 - norm_v * 0.4) + accent_gold * (norm_v * 0.4)
    
    alpha_norm = (alpha.astype(np.float32) / 255.0)[:, :, np.newaxis]
    light_variant = (blended_color * alpha_norm + ivory_bg.astype(np.float32) * (1.0 - alpha_norm))
    light_variant = np.clip(light_variant, 0, 255).astype(np.uint8)

    # RGBA transparent version
    rgba = cv2.merge([dark_recolored[:, :, 0], dark_recolored[:, :, 1], dark_recolored[:, :, 2], alpha])

    return light_variant, rgba

def main():
    src_path = 'client/public/brand/sakra-vision-original.png'
    img = cv2.imread(src_path)
    if img is None:
        print("Error: Could not load source image")
        return

    print("Source shape:", img.shape)
    
    # 1. Recolored Dark Variant (Deep Forest Green + Antique Gold + Warm Glow)
    dark_recolored = recolor_dark_variant(img)
    cv2.imwrite('client/public/brand/sakra-vision-logo.png', dark_recolored)
    print("Saved: client/public/brand/sakra-vision-logo.png")

    # 2. Light Variant
    light_variant, rgba = create_light_variant(dark_recolored)
    cv2.imwrite('client/public/brand/sakra-vision-light.png', light_variant)
    cv2.imwrite('client/public/brand/sakra-vision-transparent.png', rgba)
    print("Saved: client/public/brand/sakra-vision-light.png and sakra-vision-transparent.png")

    # 3. Crop emblem symbol (mark) for compact avatar / favicon / mobile header
    # Find bounding box of center emblem cleanly above text
    h, w = img.shape[:2]
    y1, y2 = int(h * 0.16), int(h * 0.525)
    x1, x2 = int(w * 0.33), int(w * 0.67)
    mark_crop = dark_recolored[y1:y2, x1:x2]
    cv2.imwrite('client/public/brand/sakra-vision-mark.png', mark_crop)
    print("Saved: client/public/brand/sakra-vision-mark.png")

if __name__ == '__main__':
    main()
