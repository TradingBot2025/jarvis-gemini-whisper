const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  
  // System control - open URL in default browser (new tab)
  openUrl: (url) => ipcRenderer.invoke('system:openUrl', url),
  search: (query) => ipcRenderer.invoke('system:search', query),
  openApp: (appName) => ipcRenderer.invoke('system:openApp', appName),
  minimize: () => ipcRenderer.invoke('system:minimize'),
  maximize: () => ipcRenderer.invoke('system:maximize'),
  close: () => ipcRenderer.invoke('system:close'),
  reload: () => ipcRenderer.invoke('system:reload'),
  
  sendMessage: (channel, data) => {
    let validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  onMessage: (channel, func) => {
    let validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
