@echo off
echo Building JARVIS Desktop App...

echo Step 1: Updating package.json...
node build-scripts/update-package.js

echo Step 2: Installing dependencies...
npm install

echo Step 3: Building web app...
npm run build

echo Step 4: Building Windows executable...
npm run dist:win

echo.
echo ✅ Build complete!
echo 📁 Find your .exe in the dist-electron folder
echo 📋 Upload to GitHub Releases or file sharing service for download link

pause