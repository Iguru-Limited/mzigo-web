# PWA Icon Creation Guide

## 📍 Location
Place all icons in: `public/assets/icons/`

## 📐 Required Files

### Standard Icons (Square, full image)
1. **icon-192x192.png** - 192×192 pixels
2. **icon-512x512.png** - 512×512 pixels

### Maskable Icons (With safe zone padding)
3. **icon-192x192-maskable.png** - 192×192 pixels
4. **icon-512x512-maskable.png** - 512×512 pixels

## 🎨 Icon Specifications

### Standard Icons
- **Format**: PNG (with transparency support)
- **Dimensions**: Exact size (192×192 or 512×512)
- **Content**: Your app logo/icon can fill the entire square
- **Background**: Can be transparent or solid color

### Maskable Icons (Important!)
- **Format**: PNG (with transparency support)
- **Dimensions**: Same as standard (192×192 or 512×512)
- **Safe Zone**: Important content must be within the **center 80%** of the image
- **Why**: Android devices apply different icon shapes (circle, rounded square, etc.)
- **Padding**: Leave 10% margin on all sides for the safe zone

## 🛠️ How to Create Icons

### Option 1: Using Maskable.app (Recommended)
1. Go to https://maskable.app/editor
2. Upload your logo/icon
3. Adjust the safe zone (center 80%)
4. Export both standard and maskable versions
5. Download at 192×192 and 512×512 sizes

### Option 2: Using Image Editor (Photoshop, GIMP, Figma)
1. Create a square canvas (192×192 or 512×512)
2. Place your logo in the center
3. For maskable: Ensure logo fits within center 80% (leave 10% margin on all sides)
4. Export as PNG with transparency

### Option 3: Using PWA Asset Generator (CLI)
```bash
# Install globally
npm install -g pwa-asset-generator

# Generate from a source image
pwa-asset-generator source-icon.png public/assets/icons/ --icon-only
```

### Option 4: Quick Placeholder (Temporary)
If you need to test quickly, you can:
1. Use your existing `logo.jpg` from the public folder
2. Convert/resize it to PNG format
3. Create square versions at the required sizes
4. Replace later with proper icons

## 📱 Visual Guide

### Standard Icon (192×192)
```
┌─────────────────┐
│                 │
│   [Your Logo]   │  ← Can fill entire space
│                 │
└─────────────────┘
```

### Maskable Icon (192×192)
```
┌─────────────────┐
│  ┌───────────┐  │  ← 10% padding
│  │           │  │
│  │ [Logo]    │  │  ← Safe zone (80%)
│  │           │  │
│  └───────────┘  │  ← 10% padding
└─────────────────┘
```

## ✅ Checklist
- [ ] icon-192x192.png (192×192 pixels, PNG)
- [ ] icon-512x512.png (512×512 pixels, PNG)
- [ ] icon-192x192-maskable.png (192×192, safe zone)
- [ ] icon-512x512-maskable.png (512×512, safe zone)
- [ ] All files placed in `public/assets/icons/`

## 🔗 Resources
- **Maskable.app**: https://maskable.app/editor
- **PWA Builder**: https://www.pwabuilder.com/imageGenerator
- **Android Icon Guidelines**: https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive

