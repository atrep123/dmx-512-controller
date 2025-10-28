# Icon Requirements for Android PWA

This document describes the icon files needed for the DMX 512 Kontrolér Android PWA.

## Required Icon Files

Place these files in the `/public` directory:

### Standard Icons
- `icon-16.png` - 16x16px (favicon)
- `icon-32.png` - 32x32px (favicon)
- `icon-72.png` - 72x72px (Android ldpi)
- `icon-96.png` - 96x96px (Android mdpi)
- `icon-120.png` - 120x120px (iOS)
- `icon-128.png` - 128x128px (Android hdpi)
- `icon-144.png` - 144x144px (Android xhdpi, Windows tile)
- `icon-152.png` - 152x152px (iOS, Android xxhdpi)
- `icon-192.png` - 192x192px (Android xxxhdpi, PWA minimum)
- `icon-384.png` - 384x384px (Android 4x)
- `icon-512.png` - 512x512px (Android maximum, PWA recommended)

### Apple Touch Icons
- `apple-touch-icon.png` - 180x180px (iOS main)

### Maskable Icons (Android Adaptive)
- `icon-maskable-192.png` - 192x192px with safe zone
- `icon-maskable-512.png` - 512x512px with safe zone

### Screenshots (Optional but recommended)
- `screenshot-mobile.png` - 540x720px (narrow form factor)
- `screenshot-desktop.png` - 1280x720px (wide form factor)

## Icon Design Guidelines

### General Guidelines
- **Format**: PNG with transparent background
- **Color**: Dark background (#262626) with bright accent colors
- **Style**: Professional, technical, lighting-focused
- **Content**: DMX/lighting related symbol (e.g., light beam, DMX connector, control panel)

### Maskable Icons Guidelines
Maskable icons need a **safe zone**:
- Total size: 192x192 or 512x512
- Safe zone: Center 80% (154x154 or 410x410)
- Critical content must stay in safe zone
- Background should extend to edges
- Test with [Maskable.app](https://maskable.app)

### Quick Icon Generation

You can generate all icons from a single 512x512 source image using:

1. **Online Tools**:
   - [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
   - [Real Favicon Generator](https://realfavicongenerator.net/)
   - [Maskable.app Editor](https://maskable.app/editor)

2. **ImageMagick** (command line):
```bash
# From 512x512 source icon
convert icon-512.png -resize 16x16 icon-16.png
convert icon-512.png -resize 32x32 icon-32.png
convert icon-512.png -resize 72x72 icon-72.png
convert icon-512.png -resize 96x96 icon-96.png
convert icon-512.png -resize 120x120 icon-120.png
convert icon-512.png -resize 128x128 icon-128.png
convert icon-512.png -resize 144x144 icon-144.png
convert icon-512.png -resize 152x152 icon-152.png
convert icon-512.png -resize 192x192 icon-192.png
convert icon-512.png -resize 384x384 icon-384.png
convert icon-512.png -resize 180x180 apple-touch-icon.png
```

3. **Node.js script** (using sharp):
```javascript
const sharp = require('sharp');
const sizes = [16, 32, 72, 96, 120, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('source-icon.png')
    .resize(size, size)
    .toFile(`icon-${size}.png`);
});
```

## Temporary Placeholder Icons

Until proper icons are created, you can use solid color placeholders:

```html
<!-- SVG placeholder that can be saved as PNG -->
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#262626"/>
  <text x="256" y="280" font-family="Arial" font-size="72" 
        fill="#5B9FD8" text-anchor="middle" font-weight="bold">DMX</text>
  <text x="256" y="340" font-family="Arial" font-size="48" 
        fill="#C97FB8" text-anchor="middle">512</text>
</svg>
```

## Icon Theme

**Recommended color scheme for icons**:
- Background: `#262626` (dark gray)
- Primary: `#5B9FD8` (blue - from your --primary color)
- Accent: `#C97FB8` (pink - from your --accent color)
- Highlight: `#FFFFFF` (white for details)

## Testing Icons

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Check "Manifest" section
4. Verify all icons load correctly
5. Check for warnings

### Real Device Testing
1. Install PWA on Android device
2. Check home screen icon
3. Check app switcher icon
4. Test on different Android versions (8, 9, 10, 11+)

### Lighthouse Audit
Run PWA audit to verify icon requirements:
- Minimum 192x192 icon ✓
- Maskable icon present ✓
- Apple touch icon ✓

## Current Status

⚠️ **Action Required**: Icon files need to be created and placed in `/public` directory.

The application is currently configured to use these icons, but they don't exist yet. Create them based on the guidelines above.
