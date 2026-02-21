/**
 * System command execution via Electron.
 * Runs only when app is in Electron (local PC), not in web browser.
 */

export type SystemCommandResult = {
  handled: boolean;
  message: string;
};

// App name mappings for "open X" commands
const APP_ALIASES: Record<string, string> = {
  calculator: 'calculator',
  calc: 'calculator',
  notepad: 'notepad',
  paint: 'paint',
  explorer: 'explorer',
  'file explorer': 'explorer',
  chrome: 'chrome',
  edge: 'edge',
  browser: 'browser',
};

// URL mappings for "open X" (websites)
const URL_ALIASES: Record<string, string> = {
  youtube: 'https://youtube.com',
  google: 'https://google.com',
  gmail: 'https://gmail.com',
  facebook: 'https://facebook.com',
  twitter: 'https://twitter.com',
  x: 'https://x.com',
  github: 'https://github.com',
  stackoverflow: 'https://stackoverflow.com',
  reddit: 'https://reddit.com',
  netflix: 'https://netflix.com',
  amazon: 'https://amazon.com',
  wikipedia: 'https://wikipedia.org',
  maps: 'https://maps.google.com',
};

async function executeSystemCommand(command: string): Promise<SystemCommandResult> {
  if (typeof window === 'undefined' || !window.electronAPI) {
    return { handled: false, message: '' };
  }

  const lower = command.toLowerCase().trim();
  const api = window.electronAPI;

  // Window controls
  if (/\b(minimize|minimise)\b/.test(lower)) {
    const res = await api.minimize();
    return { handled: res.success, message: 'Minimizing window.' };
  }
  if (/\b(maximize|maximise|full screen)\b/.test(lower)) {
    const res = await api.maximize();
    return { handled: res.success, message: 'Toggling maximize.' };
  }
  if (/\b(close|exit|quit)\s*(jarvis|app|window)?\b/.test(lower) || lower === 'close' || lower === 'exit') {
    const res = await api.close();
    return { handled: res.success, message: 'Closing.' };
  }
  if (/\b(reload|refresh)\b/.test(lower)) {
    const res = await api.reload();
    return { handled: res.success, message: 'Reloading.' };
  }

  // Search
  const searchMatch = lower.match(/\b(?:search|find|look up)\s+(?:for\s+)?(.+)/);
  if (searchMatch) {
    const query = searchMatch[1].trim();
    if (query) {
      const res = await api.search(query);
      return { handled: res.success, message: `Searching for "${query}".` };
    }
  }

  // Open URL or app
  const openMatch = lower.match(/\b(?:open|launch|go to|navigate to)\s+(?:the\s+)?(.+)/);
  if (openMatch) {
    const target = openMatch[1].trim();
    if (!target) return { handled: false, message: '' };

    // Check URL aliases (websites)
    const urlKey = Object.keys(URL_ALIASES).find(k => target.includes(k) || target === k);
    if (urlKey) {
      const url = URL_ALIASES[urlKey];
      const res = await api.openUrl(url);
      return { handled: res.success, message: `Opening ${urlKey}.` };
    }

    // Check if it looks like a URL
    if (target.includes('.') && (target.includes('.com') || target.includes('.org') || target.includes('.net'))) {
      const res = await api.openUrl(target);
      return { handled: res.success, message: `Opening ${target}.` };
    }

    // App aliases
    const appKey = Object.keys(APP_ALIASES).find(k => target.includes(k) || target === k);
    if (appKey) {
      const appName = APP_ALIASES[appKey];
      const res = await api.openApp(appName);
      return { handled: res.success, message: `Opening ${appName}.` };
    }

    // Default: try as URL (e.g. "open facebook")
    const res = await api.openUrl(`https://${target.replace(/\s/g, '')}.com`);
    return { handled: res.success, message: `Opening ${target}.` };
  }

  return { handled: false, message: '' };
}

export async function trySystemCommand(command: string): Promise<SystemCommandResult> {
  try {
    return await executeSystemCommand(command);
  } catch (err) {
    console.error('System command error:', err);
    return { handled: false, message: '' };
  }
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}
