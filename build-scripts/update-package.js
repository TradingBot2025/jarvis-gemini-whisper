// Run this script to update package.json for Electron build
const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Update package.json for Electron
pkg.name = 'jarvis-desktop';
pkg.main = 'electron/main.js';
pkg.homepage = './';
pkg.description = 'JARVIS - Just A Rather Very Intelligent System Desktop App';

// Add Electron scripts
pkg.scripts = {
  ...pkg.scripts,
  electron: 'electron .',
  'electron:dev': 'concurrently "npm run dev" "wait-on http://localhost:8080 && electron ."',
  'build:electron': 'npm run build && electron-builder',
  'build:electron:all': 'npm run build && electron-builder --win --mac --linux',
  dist: 'node scripts/build-electron.js',
  pack: 'electron-builder --dir',
  'dist:win': 'npm run build && electron-builder --win',
  'dist:mac': 'npm run build && electron-builder --mac',
  'dist:linux': 'npm run build && electron-builder --linux'
};

// Write updated package.json
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));

console.log('✅ package.json updated for Electron build');
console.log('📝 You can now run: npm run dist:win to build the .exe file');