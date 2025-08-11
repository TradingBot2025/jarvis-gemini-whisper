# Build & Deploy JARVIS Desktop App

## Quick Build Instructions

### Step 1: Update package.json
Run this command to update your package.json:
```bash
node build-scripts/update-package.js
```

### Step 2: Build the executable
```bash
# Build Windows .exe
npm run dist:win
```

### Step 3: Find your executable
Your .exe file will be in: `dist-electron/`

## Option A: Host on GitHub Releases

1. After building, upload the .exe to GitHub Releases
2. Get a direct download link like:
   `https://github.com/yourusername/jarvis/releases/download/v1.0.0/JARVIS-Setup-1.0.0.exe`

## Option B: Host on File Sharing

Upload to:
- Google Drive (get shareable link)
- Dropbox 
- OneDrive
- WeTransfer

## Option C: Deploy Build Service

Use GitHub Actions to auto-build:

```yaml
# .github/workflows/build.yml
name: Build Electron App

on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run dist:win
      - uses: actions/upload-artifact@v2
        with:
          name: jarvis-windows
          path: dist-electron/*.exe
```

## Ready-to-Use Commands

```bash
# 1. Setup
node build-scripts/update-package.js

# 2. Build
npm run build
npm run dist:win

# 3. Your .exe will be ready in dist-electron/
```

The executable will be about 150-200MB and work offline on any Windows PC.