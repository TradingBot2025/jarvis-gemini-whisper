const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

// Windows app names mapped to launch commands
const WINDOWS_APPS = {
  calculator: 'calc.exe',
  notepad: 'notepad.exe',
  paint: 'mspaint.exe',
  explorer: 'explorer.exe',
  command: 'cmd.exe',
  chrome: 'chrome',
  edge: 'msedge',
  browser: 'start', // Uses shell for default browser
};

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    titleBarStyle: 'default',
    show: false,
    frame: true,
    autoHideMenuBar: false
  });

  // Custom title
  mainWindow.setTitle('JARVIS - Just A Rather Very Intelligent System');

  const startUrl = isDev 
    ? 'http://localhost:8080' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    app.quit();
  });

  return mainWindow;
}

// Store main window reference for window controls
let mainWindowRef = null;

app.whenReady().then(() => {
  mainWindowRef = createWindow();

  // IPC: Open URL in default browser (new tab)
  ipcMain.handle('system:openUrl', async (event, url) => {
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      await shell.openExternal(normalizedUrl);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // IPC: Search web (opens Google search in browser)
  ipcMain.handle('system:search', async (event, query) => {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      await shell.openExternal(searchUrl);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // IPC: Launch application
  ipcMain.handle('system:openApp', async (event, appName) => {
    try {
      const name = String(appName).toLowerCase().trim();
      if (name === 'browser') {
        await shell.openExternal('https://google.com');
        return { success: true };
      }
      const cmd = WINDOWS_APPS[name];
      if (cmd) {
        spawn(cmd, [], { shell: true, detached: true });
        return { success: true };
      }
      spawn(name, [], { shell: true, detached: true });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // IPC: Window controls
  ipcMain.handle('system:minimize', () => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.minimize();
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle('system:maximize', () => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      if (mainWindowRef.isMaximized()) {
        mainWindowRef.unmaximize();
      } else {
        mainWindowRef.maximize();
      }
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle('system:close', () => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.close();
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle('system:reload', () => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.reload();
      return { success: true };
    }
    return { success: false };
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app protocol for dev
if (isDev) {
  try {
    if (require('electron-squirrel-startup')) app.quit();
  } catch (_) {}
}
