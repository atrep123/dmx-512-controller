# Icon Requirements for Android PWA

## Required Icon Files

## Required Icon Files

Place these files in the `/public` directory:

- `icon-96.png` - 
- `icon-128.png` - 128x128px (Andro
- `icon-152.png` - 152x152px (iOS, 
- `icon-384.png` - 384x384px (Android 4x

- `apple-touch-icon.png` - 180x180
### Maskable Icons (Android Adaptive)
- `icon-maskable-512.png` - 512x512px with safe zone
### Screenshots (Optional but recommended)
- `screenshot-desktop.png` - 1280x720px (wide form factor)
## Icon Design Guidelines
### General Guidelines

- **Content**: DMX/li
### Maskable Icons Guidelines

- Critical content must stay in safe 
- Test with [Maskable.app](https://maskable.app)
### Quick Icon Generation

1. **Online Tools**:
   - [Real Favicon Generator](https://realfavicongenerator


convert icon-512.png -res

convert icon-512.png -
convert icon-512.png -resize 144x144 icon-144
convert icon-512.png -resize 192x192 icon-192.png
convert icon-512.png -resize 180x180 apple-touch-icon.


const sizes = [16, 32, 72, 96
sizes.forEach(size => {
    .resize(size, size)
});




  <rect width="512" heigh

        fill="#C97FB8" text-anchor="middle">512</text>

## Icon Theme
**Recommended color scheme for icons**:
- Primary: `#5B9FD8` (blue - from your --primary color)
- Highlight: `#FFFFFF` (white for details)

### Chrome DevTools
2. Go t
4. Verify all icons load c

1. Install PWA on Android device
3. Check app switcher icon

Run PWA audit to verify icon requirements:
- Maskable icon present ✓































































## Current Status

⚠️ **Action Required**: Icon files need to be created and placed in `/public` directory.

The application is currently configured to use these icons, but they don't exist yet. Create them based on the guidelines above.
