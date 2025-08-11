module.exports = {
  appId: 'com.jarvis.desktop',
  productName: 'JARVIS',
  directories: {
    output: 'dist-electron'
  },
  files: [
    'dist/**/*',
    'electron/main.js',
    'electron/preload.js',
    'node_modules/**/*'
  ],
  extraResources: [
    {
      from: 'public',
      to: 'public',
      filter: ['**/*']
    }
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: 'public/favicon.ico',
    publisherName: 'JARVIS Systems',
    fileAssociations: [
      {
        ext: 'jarvis',
        name: 'JARVIS Command File',
        description: 'JARVIS Command File'
      }
    ]
  },
  nsis: {
    oneClick: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    installerIcon: 'public/favicon.ico',
    uninstallerIcon: 'public/favicon.ico',
    installerHeaderIcon: 'public/favicon.ico',
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'public/favicon.ico',
    category: 'public.app-category.productivity'
  },
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      }
    ],
    icon: 'public/favicon.ico',
    category: 'Office'
  }
};