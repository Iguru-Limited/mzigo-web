# PWA Icons

This directory should contain the following icon files for the Progressive Web App:

## Required Icons

- `icon-192x192.png` - Standard icon (192×192 pixels)
- `icon-512x512.png` - Standard icon (512×512 pixels)
- `icon-192x192-maskable.png` - Maskable icon (192×192 pixels with safe zone padding)
- `icon-512x512-maskable.png` - Maskable icon (512×512 pixels with safe zone padding)

## Creating Icons

1. **Standard Icons**: Create square icons with your app logo/design
2. **Maskable Icons**: Icons should have important content within the center 80% (safe zone) to account for different device icon shapes

## Tools

- [Maskable.app Editor](https://maskable.app/editor) - Create maskable icons
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) - Generate all sizes from a single source

## Temporary Solution

Until you add the actual icon files, you can temporarily use the existing `logo.jpg` from the public folder by creating symlinks or copying it, but it's recommended to create proper PNG icons with the correct dimensions.

