const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { Worker } = require('worker_threads');
const os = require('os');
const { shell } = require('electron');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let scanWorker = null;

// Détection de l'environnement et définition des chemins
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const getPreloadPath = () => {
  if (typeof MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY !== 'undefined') {
    return MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY;
  }
  return path.join(__dirname, '../../workers/preload.js');
};

const getRendererPath = () => {
  if (typeof MAIN_WINDOW_WEBPACK_ENTRY !== 'undefined') {
    return MAIN_WINDOW_WEBPACK_ENTRY;
  }
  // En mode dev, utiliser l'URL du serveur de développement ou le fichier HTML
  if (isDev) {
    return path.join(__dirname, '../../dist/index.html');
  }
  return path.join(__dirname, '../../dist/index.html');
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getPreloadPath()
    },
    backgroundColor: '#1a1a2e',
    show: false,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'dark'
  });

  // Activer la console de dev
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  
  // Gérer les erreurs de chargement
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`Failed to load: ${errorCode} - ${errorDescription}`);
    dialog.showErrorBox('Erreur de chargement', `L'application n'a pas pu charger le contenu.\nCode d'erreur: ${errorCode}\nDescription: ${errorDescription}`);
    app.quit();
  });

  // Charger l'URL ou le fichier HTML selon l'environnement
  const rendererPath = getRendererPath();
  if (rendererPath.startsWith('http')) {
    mainWindow.loadURL(rendererPath);
  } else {
    mainWindow.loadFile(rendererPath);
  }

  // mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (scanWorker) {
      scanWorker.terminate();
      scanWorker = null;
    }
  });

  // Supprimer la barre de menu par défaut
  Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

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

// Gestion de la sélection de dossier/disque
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Sélectionner un dossier à analyser'
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

// Gestion de la sélection de disque avec prescan
ipcMain.handle('get-drives', async () => {
  const drives = [];
  
  if (process.platform === 'win32') {
    // Windows - énumérer les lecteurs
    for (let i = 65; i <= 90; i++) {
      const drive = String.fromCharCode(i) + ':\\';
      try {
        await fs.access(drive);
        const stats = await fs.stat(drive);
        
        // Essayer d'obtenir des infos sur l'espace disque (Windows)
        let totalSize = null;
        let freeSpace = null;
        try {
          // Note: Cette partie nécessiterait une librairie native pour Windows
          // Pour l'instant on utilise juste les stats de base
        } catch (e) {
          // Ignore
        }
        
        drives.push({
          path: drive,
          name: `Disque ${String.fromCharCode(i)}:`,
          type: 'drive',
          totalSize,
          freeSpace,
          platform: 'windows'
        });
      } catch (e) {
        // Drive non accessible
      }
    }
    
    // Ajouter des dossiers utilisateur recommandés
    try {
      const userHome = os.homedir();
      const homeStats = await fs.stat(userHome);
      drives.push({
        path: userHome,
        name: `Dossier utilisateur (${path.basename(userHome)})`,
        type: 'folder',
        totalSize: null,
        freeSpace: null,
        platform: 'windows'
      });
      
      // Dossiers communs dans le profil utilisateur
      const commonFolders = [
        { folder: 'Documents', name: 'Documents' },
        { folder: 'Downloads', name: 'Téléchargements' },
        { folder: 'Pictures', name: 'Images' },
        { folder: 'Videos', name: 'Vidéos' },
        { folder: 'Music', name: 'Musique' }
      ];
      
      for (const { folder, name } of commonFolders) {
        const folderPath = path.join(userHome, folder);
        try {
          await fs.access(folderPath);
          drives.push({
            path: folderPath,
            name: `${name}`,
            type: 'folder',
            totalSize: null,
            freeSpace: null,
            platform: 'windows'
          });
        } catch (e) {
          // Dossier non accessible ou inexistant
        }
      }
    } catch (e) {
      // Ignore
    }
  } else {
    // Unix/Linux/macOS
    try {
      // Prescan du disque racine
      const rootStats = await fs.stat('/');
      drives.push({
        path: '/',
        name: 'Racine système (/)',
        type: 'drive',
        totalSize: null, // À implémenter avec statvfs si nécessaire
        freeSpace: null,
        platform: process.platform
      });
    } catch (e) {
      // Ignore
    }
    
    try {
      const homeDir = os.homedir();
      const homeStats = await fs.stat(homeDir);
      drives.push({
        path: homeDir,
        name: `Dossier utilisateur (${path.basename(homeDir)})`,
        type: 'folder',
        totalSize: null,
        freeSpace: null,
        platform: process.platform
      });
    } catch (e) {
      // Ignore
    }
    
    // Ajouter d'autres points de montage courants
    const commonMounts = ['/mnt', '/media', '/Volumes'];
    for (const mount of commonMounts) {
      try {
        const entries = await fs.readdir(mount);
        for (const entry of entries) {
          const fullPath = path.join(mount, entry);
          try {
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
              drives.push({
                path: fullPath,
                name: `${entry} (${mount})`,
                type: 'mount',
                totalSize: null,
                freeSpace: null,
                platform: process.platform
              });
            }
          } catch (e) {
            // Ignore inaccessible mounts
          }
        }
      } catch (e) {
        // Mount point doesn't exist
      }
    }
  }
  
  return drives;
});

// Nouveau handler pour le prescan des disques
ipcMain.handle('prescan-drives', async () => {
  console.log('Starting drive prescan...');
  const drives = [];
  
  if (process.platform === 'win32') {
    // Windows - prescan des lecteurs
    for (let i = 65; i <= 90; i++) {
      const drive = String.fromCharCode(i) + ':\\';
      try {
        await fs.access(drive);
        
        // Compter rapidement quelques éléments pour avoir une idée
        let estimatedItems = 0;
        let estimatedSize = 0;
        try {
          const entries = await fs.readdir(drive);
          estimatedItems = entries.length;
          
          // Échantillonner quelques fichiers pour estimation
          for (let j = 0; j < Math.min(5, entries.length); j++) {
            try {
              const filePath = path.join(drive, entries[j]);
              const stats = await fs.stat(filePath);
              if (stats.isFile()) {
                estimatedSize += stats.size;
              }
            } catch (e) {
              // Ignore inaccessible files
            }
          }
        } catch (e) {
          // Ignore scan errors
        }
        
        drives.push({
          path: drive,
          name: `Disque ${String.fromCharCode(i)}:`,
          type: 'drive',
          estimatedItems,
          estimatedSize,
          platform: 'windows',
          accessible: true
        });
      } catch (e) {
        // Drive non accessible
        drives.push({
          path: drive,
          name: `Disque ${String.fromCharCode(i)}: (non accessible)`,
          type: 'drive',
          estimatedItems: 0,
          estimatedSize: 0,
          platform: 'windows',
          accessible: false
        });
      }
    }
  } else {
    // Unix/Linux/macOS - prescan
    const mountsToCheck = [
      { path: '/', name: 'Racine système (/)' },
      { path: os.homedir(), name: `Dossier utilisateur (${path.basename(os.homedir())})` }
    ];
    
    // Ajouter les points de montage détectés
    try {
      const volumesEntries = await fs.readdir('/Volumes');
      for (const entry of volumesEntries) {
        const fullPath = path.join('/Volumes', entry);
        mountsToCheck.push({
          path: fullPath,
          name: `${entry} (/Volumes)`
        });
      }
    } catch (e) {
      // /Volumes n'existe pas ou n'est pas accessible
    }
    
    for (const mount of mountsToCheck) {
      try {
        await fs.access(mount.path);
        
        // Prescan rapide
        let estimatedItems = 0;
        let estimatedSize = 0;
        try {
          const entries = await fs.readdir(mount.path);
          estimatedItems = entries.length;
          
          // Échantillonner quelques fichiers
          for (let j = 0; j < Math.min(5, entries.length); j++) {
            try {
              const filePath = path.join(mount.path, entries[j]);
              const stats = await fs.stat(filePath);
              if (stats.isFile()) {
                estimatedSize += stats.size;
              }
            } catch (e) {
              // Ignore inaccessible files
            }
          }
        } catch (e) {
          // Ignore scan errors
        }
        
        drives.push({
          path: mount.path,
          name: mount.name,
          type: mount.path === '/' ? 'drive' : 'mount',
          estimatedItems,
          estimatedSize,
          platform: process.platform,
          accessible: true
        });
      } catch (e) {
        drives.push({
          path: mount.path,
          name: `${mount.name} (non accessible)`,
          type: mount.path === '/' ? 'drive' : 'mount',
          estimatedItems: 0,
          estimatedSize: 0,
          platform: process.platform,
          accessible: false
        });
      }
    }
  }
  
  console.log(`Drive prescan completed. Found ${drives.length} drives.`);
  return drives;
});

// Démarrer le scan
ipcMain.handle('start-scan', async (event, targetPath, scanType) => {
  console.log(`Starting scan: ${targetPath} (${scanType})`);
  
  return new Promise((resolve, reject) => {
    if (scanWorker) {
      scanWorker.terminate();
    }

    // Chemin vers le worker selon l'environnement
    const workerPath = app.isPackaged 
      ? path.join(process.resourcesPath, 'workers', 'scanner.js')
      : path.join(__dirname, '..', '..', 'workers', 'scanner.js');
      
    scanWorker = new Worker(workerPath, {
      workerData: { targetPath, scanType }
    });

    scanWorker.on('message', (data) => {
      if (data.type === 'progress') {
        mainWindow.webContents.send('scan-progress', data);
      } else if (data.type === 'complete') {
        console.log('Scan completed successfully');
        resolve({ result: data.result, stats: data.stats });
        scanWorker = null;
      } else if (data.type === 'error') {
        console.error('Scan error:', data.message);
        reject(new Error(data.message));
        scanWorker = null;
      } else if (data.type === 'log') {
        mainWindow.webContents.send('scan-log', data);
      }
    });

    scanWorker.on('error', (error) => {
      console.error('Worker error:', error);
      reject(error);
      scanWorker = null;
    });
  });
});

// Arrêter le scan
ipcMain.handle('stop-scan', async () => {
  if (scanWorker) {
    scanWorker.terminate();
    scanWorker = null;
    return true;
  }
  return false;
});

ipcMain.handle('move-to-trash', async (event, filePaths) => {
  try {
    const settings = await getSettings();
    const permanentDelete = settings.permanentDeletePermission;

    for (const filePath of filePaths) {
      if (permanentDelete) {
        // Suppression permanente
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
          await fs.rm(filePath, { recursive: true, force: true });
        } else {
          await fs.unlink(filePath);
        }
      } else {
        // Déplacer vers la corbeille
        await shell.trashItem(filePath);
      }
    }
    return { success: true, movedCount: filePaths.length };
  } catch (error) {
    console.error('Failed to process items:', error);
    return { success: false, error: error.message };
  }
});

// Chemin du fichier de configuration des paramètres
const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

// Fonction pour lire les paramètres
async function getSettings() {
  try {
    const data = await fs.readFile(settingsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Fichier non trouvé, retourner les paramètres par défaut
      return { permanentDeletePermission: false };
    }
    console.error('Failed to read settings file:', error);
    return { permanentDeletePermission: false };
  }
}

// Fonction pour écrire les paramètres
async function saveSettings(settings) {
  try {
    await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write settings file:', error);
  }
}

// IPC pour obtenir la permission de suppression permanente
ipcMain.handle('get-permanent-delete-permission', async () => {
  const settings = await getSettings();
  return settings.permanentDeletePermission;
});

// IPC pour définir la permission de suppression permanente
ipcMain.handle('set-permanent-delete-permission', async (event, enabled) => {
  const settings = await getSettings();
  settings.permanentDeletePermission = enabled;
  await saveSettings(settings);
  return true;
});

ipcMain.handle('relaunch-as-admin', async () => {
  const { exec } = require('child_process');
  const appPath = app.getPath('exe');

  try {
    if (process.platform === 'win32') {
      // Sur Windows, la méthode la plus fiable est d'utiliser une commande PowerShell
      // qui encapsule l'appel à Start-Process. L'argument -ArgumentList permet de gérer
      // correctement les chemins avec des espaces.
      const command = `Start-Process -FilePath "${appPath}" -Verb RunAs`;
      exec(`powershell -Command "${command}"`, (error) => {
        if (error) throw error;
        app.quit(); // Quitte l'application actuelle seulement si la nouvelle a pu se lancer
      });
      return { success: true };

    } else if (process.platform === 'darwin') {
      // Sur macOS, on utilise osascript pour demander les privilèges.
      // Échapper correctement le chemin pour éviter les problèmes avec les caractères spéciaux
      const escapedPath = appPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
      const command = `do shell script "open -a '${escapedPath}'" with administrator privileges`;
      exec(`osascript -e '${command}'`, (error) => {
        if (error) throw error;
        app.quit();
      });
      return { success: true };

    } else {
      // Pour Linux, pkexec est la méthode moderne préférée à sudo.
      exec(`pkexec "${appPath}"`, (error) => {
        if (error) {
          // Si pkexec échoue, tenter avec gksudo ou kdesudo (plus anciens)
          exec(`gksudo "${appPath}" || kdesudo "${appPath}"`, (err) => {
            if (err) throw err;
            app.quit();
          });
        } else {
          app.quit();
        }
      });
      return { success: true };
    }
  } catch (error) {
    console.error('Failed to relaunch as admin:', error);
    return { success: false, error: error.message };
  }
});

// Détecter si l'app s'exécute avec des privilèges élevés
ipcMain.handle('check-admin-privileges', async () => {
  try {
    if (process.platform === 'win32') {
      // Windows - vérifier si on est admin
      const { exec } = require('child_process');
      return new Promise((resolve) => {
        exec('net session >nul 2>&1', (error) => {
          resolve({ 
            isAdmin: !error,
            platform: 'windows'
          });
        });
      });
    } else {
      // Unix-like - vérifier si on est root
      const isRoot = process.getuid && process.getuid() === 0;
      return { 
        isAdmin: isRoot,
        platform: process.platform
      };
    }
  } catch (error) {
    return { 
      isAdmin: false,
      platform: process.platform,
      error: error.message
    };
  }
});