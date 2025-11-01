# DMX-512 Controller - Android App

Progressive Web App (PWA) for mobile control of DMX-512 lighting fixtures, stepper motors, servos, and automated effects.

## 📱 Overview

A mobile-first DMX 512 lighting and motion controller web application optimized for Android and iOS devices. Control stage lighting fixtures, motors, create automated effects, manage scenes, and configure network connections through an intuitive touch interface.

## ✨ Features

- **Fixture Control**: Individual DMX channel faders (0-255) for controlling fixture parameters
- **Scene Management**: Save and recall complete lighting states
- **Automated Effects**: Pre-programmed effects (chase, strobe, rainbow, fade) with visual block programming
- **Motor Control**: 
  - Stepper motors with 16-bit positioning
  - Servo control with 0-180° angle mapping
- **Network Protocols**: Art-Net, sACN, or USB DMX interfaces
- **PWA Support**: Install on Android/iOS home screen for app-like experience
- **Offline Mode**: Works without internet connection using cached assets
- **Custom UI Builder**: Create personalized control pages with drag-and-drop blocks

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Navigate to the android-app directory
cd packages/android-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

### Deploying as PWA

For PWA functionality, you must deploy to an HTTPS endpoint. Recommended options:

1. **Vercel** (Easiest):
   ```bash
   npx vercel --prod
   ```

2. **Netlify**:
   ```bash
   npm run build
   netlify deploy --prod
   ```

3. **GitHub Pages**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📖 Documentation

- [Android Setup Guide](./ANDROID_SETUP.md) - Detailed Android PWA configuration
- [Quick Start Guide](./QUICKSTART_ANDROID.md) - Fast deployment guide
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Full deployment options
- [Icons Guide](./ICONS_README.md) - PWA icon requirements

## 🎨 Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **Radix UI** - Accessible component primitives
- **Phosphor Icons** - Icon library
- **Spark** - GitHub's component library

## 🏗️ Project Structure

```
android-app/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── FixturesView.tsx
│   │   ├── ScenesView.tsx
│   │   ├── EffectsView.tsx
│   │   └── ...
│   ├── lib/              # Utilities and types
│   ├── hooks/            # Custom React hooks
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── manifest.json         # PWA manifest
```

## 🎮 Usage

### Basic Workflow

1. **Setup Universe**: Configure DMX universes in Setup tab
2. **Add Fixtures**: Add lighting fixtures with DMX addresses
3. **Control Fixtures**: Adjust channels using faders
4. **Create Scenes**: Save current state as a scene
5. **Add Effects**: Create automated lighting effects
6. **Connect Network**: Configure Art-Net/sACN output

### Installing on Android

1. Open the app in Chrome browser
2. Tap menu (⋮) → "Add to Home Screen"
3. Or tap the in-app "Install" button
4. Icon will appear on your home screen

## 🔧 Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run optimize  # Optimize dependencies
```

### Environment Setup

The app uses local storage (IndexedDB) via GitHub Spark's `useKV` hook. No backend required for basic functionality.

### Adding Components

UI components are built using Radix UI primitives and styled with Tailwind CSS. See `src/components/ui/` for examples.

## 🌐 Network Protocols

The app supports multiple DMX output protocols:

- **Art-Net**: Industry-standard DMX over IP
- **sACN (E1.31)**: Streaming ACN protocol
- **USB DMX**: Direct USB DMX interface (requires compatible hardware)

Configure in the Connection tab.

## 📱 PWA Features

- **Offline Support**: Service Worker caches assets
- **App Shortcuts**: Quick access to Fixtures and Scenes
- **Responsive Design**: Optimized for mobile and tablet
- **Touch Optimized**: Large touch targets (44px+)
- **Installable**: Add to home screen on Android/iOS

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build check
npm run build
```

For PWA testing:
- Chrome DevTools → Lighthouse → Run PWA audit (target score: 90+)
- Test offline mode in DevTools Network tab
- Test installation on real Android device

## 🐛 Known Issues

See [ANDROID_SETUP.md](./ANDROID_SETUP.md) for common issues and solutions.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## 📄 License

See the [LICENSE](../../LICENSE) file in the root directory.

## 🔗 Related Packages

- [Protocol](../protocol/README.md) - Shared protocol definitions
- [Server](../server/README.md) - Backend server
- [ESP32 Node](../nodes/esp32/README.md) - ESP32 firmware

## 📞 Support

For issues or questions, please use GitHub Issues in the main repository.

---

**Note**: This PWA can work standalone or with the server component for multi-client coordination and advanced features.
