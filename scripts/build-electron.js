const { build } = require('vite');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildElectron() {
  console.log('🔨 Building Vite app for production...');
  
  // Build the Vite app
  await build({
    configFile: 'vite.config.ts',
    mode: 'production'
  });

  console.log('✅ Vite build complete!');
  console.log('📦 Building Electron app...');

  // Build Electron app
  const electronBuilder = spawn('npx', ['electron-builder'], {
    stdio: 'inherit',
    shell: true
  });

  electronBuilder.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Electron build complete!');
      console.log('📁 Check the dist-electron folder for your executable files.');
    } else {
      console.error('❌ Electron build failed with code:', code);
    }
  });
}

buildElectron().catch(console.error);