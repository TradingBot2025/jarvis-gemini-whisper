/// <reference types="vite/client" />

interface ElectronAPI {
  isElectron?: boolean;
  platform?: string;
  openUrl: (url: string) => Promise<{ success: boolean; error?: string }>;
  search: (query: string) => Promise<{ success: boolean; error?: string }>;
  openApp: (appName: string) => Promise<{ success: boolean; error?: string }>;
  minimize: () => Promise<{ success: boolean }>;
  maximize: () => Promise<{ success: boolean }>;
  close: () => Promise<{ success: boolean }>;
  reload: () => Promise<{ success: boolean }>;
  sendMessage: (channel: string, data: unknown) => void;
  onMessage: (channel: string, func: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
