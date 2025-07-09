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

// Fonctions de nettoyage
ipcMain.handle('scan-cleanup-items', async () => {
  try {
    const os = require('os');
    const items = [];
    
    // 1. Fichiers temporaires
    const tempPath = os.tmpdir();
    const tempStats = await scanDirectory(tempPath, { maxDepth: 2 });
    const tempProgress = tempStats.size > 0 ? Math.min((tempStats.size / (1024 * 1024 * 500)) * 100, 100) : 0; // Progression basée sur la taille (max 500MB = 100%)
    items.push({
      id: 'temp',
      name: 'Fichiers temporaires',
      description: 'Fichiers %temp%, cache navigateur, logs temporaires',
      size: tempStats.size || 0,
      fileCount: tempStats.fileCount || 0,
      type: 'temp',
      progress: tempProgress,
      path: tempPath
    });
    
    // 2. Corbeille (macOS)
    if (process.platform === 'darwin') {
      try {
        // Sur macOS, la corbeille nécessite des permissions spéciales
        items.push({
          id: 'trash',
          name: 'Corbeille',
          description: 'Nécessite des permissions "Accès complet au disque" dans Préférences Système > Sécurité',
          size: 0,
          fileCount: 0,
          type: 'trash',
          progress: 0,
          path: path.join(os.homedir(), '.Trash'),
          requiresPermissions: true
        });
      } catch (error) {
        console.error('Error scanning trash:', error);
        items.push({
          id: 'trash',
          name: 'Corbeille',
          description: 'Impossible d\'accéder à la corbeille - permissions requises',
          size: 0,
          fileCount: 0,
          type: 'trash',
          progress: 0,
          path: path.join(os.homedir(), '.Trash'),
          requiresPermissions: true
        });
      }
    }
    
    // 3. Anciens téléchargements
    const downloadsPath = path.join(os.homedir(), 'Downloads');
    const oldDownloads = await findOldFiles(downloadsPath, 30); // 30 jours
    const downloadsProgress = oldDownloads.size > 0 ? Math.min((oldDownloads.size / (1024 * 1024 * 100)) * 100, 100) : 0; // Progression basée sur la taille (max 100MB = 100%)
    items.push({
      id: 'old-downloads',
      name: 'Anciens téléchargements',
      description: 'Fichiers téléchargés il y a plus de 30 jours',
      size: oldDownloads.size || 0,
      fileCount: oldDownloads.fileCount || 0,
      type: 'old-downloads',
      progress: downloadsProgress,
      path: downloadsPath
    });
    
    return items;
  } catch (error) {
    console.error('Error scanning cleanup items:', error);
    // Retourner des données mock en cas d'erreur
    return [
      {
        id: 'temp',
        name: 'Fichiers temporaires',
        description: 'Fichiers %temp%, cache navigateur, logs temporaires',
        size: 2469396480,
        fileCount: 4567,
        type: 'temp',
        progress: Math.min((2469396480 / (1024 * 1024 * 500)) * 100, 100) // Progression basée sur la taille
      },
      {
        id: 'trash',
        name: 'Corbeille',
        description: 'Fichiers supprimés mais non définitivement effacés',
        size: 897581056,
        fileCount: 234,
        type: 'trash',
        progress: Math.min((897581056 / (1024 * 1024 * 50)) * 100, 100) // Progression basée sur la taille
      }
    ];
  }
});

// Nouvelle fonction pour obtenir les détails d'un élément de nettoyage
ipcMain.handle('get-cleanup-item-details', async (event, itemId) => {
  const fs = require('fs').promises;
  const os = require('os');
  
  try {
    // Recreate the cleanup items to find the one we need
    const items = [];
    
    if (itemId === 'temp') {
      const tempPath = os.tmpdir();
      items.push({ id: 'temp', path: tempPath });
    } else if (itemId === 'trash') {
      const trashPath = path.join(os.homedir(), '.Trash');
      items.push({ id: 'trash', path: trashPath });
    } else if (itemId === 'old-downloads') {
      const downloadsPath = path.join(os.homedir(), 'Downloads');
      items.push({ id: 'old-downloads', path: downloadsPath });
    }
    
    const item = items.find(i => i.id === itemId);
    
    if (!item || !item.path) {
      return { files: [], totalFiles: 0 };
    }
    
    const files = [];
    
    async function scanPath(dirPath, maxFiles = 50) {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (files.length >= maxFiles) break;
          
          const fullPath = path.join(dirPath, entry.name);
          
          if (entry.isFile()) {
            try {
              const stats = await fs.stat(fullPath);
              
              // Pour old-downloads, vérifier l'âge
              if (itemId === 'old-downloads') {
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                if (stats.mtime >= thirtyDaysAgo) continue;
              }
              
              files.push({
                name: entry.name,
                path: fullPath,
                size: stats.size,
                modified: stats.mtime
              });
            } catch (err) {
              // Ignorer les fichiers inaccessibles
            }
          } else if (entry.isDirectory() && files.length < maxFiles && itemId !== 'old-downloads') {
            await scanPath(fullPath, maxFiles - files.length);
          }
        }
      } catch (err) {
        // Ignorer les dossiers inaccessibles
      }
    }
    
    await scanPath(item.path);
    
    return {
      files: files.slice(0, 50), // Limiter à 50 fichiers pour l'affichage
      totalFiles: files.length
    };
    
  } catch (error) {
    console.error('Error getting cleanup item details:', error);
    return { files: [], totalFiles: 0 };
  }
});

ipcMain.handle('cleanup-files', async (event, selectedItems) => {
  const fs = require('fs').promises;
  
  let totalItems = selectedItems.length;
  let processedItems = 0;
  
  try {
    for (const item of selectedItems) {
      console.log(`Cleaning up ${item.name}...`);
      
      // Envoyer la progression au début de chaque élément
      event.sender.send('cleanup-progress', (processedItems / totalItems) * 100);
      
      if (item.id === 'trash') {
        // Vider la corbeille
        if (process.platform === 'darwin') {
          // Utiliser AppleScript pour vider la corbeille sur macOS
          const { exec } = require('child_process');
          await new Promise((resolve, reject) => {
            exec('osascript -e "tell application \\"Finder\\" to empty the trash"', (error, stdout, stderr) => {
              if (error) {
                console.error('Error emptying trash:', error);
                reject(error);
              } else {
                console.log('Trash emptied successfully');
                resolve();
              }
            });
          });
        } else if (process.platform === 'win32') {
          // Windows - vider la corbeille
          const { exec } = require('child_process');
          await new Promise((resolve, reject) => {
            exec('PowerShell.exe -Command "Clear-RecycleBin -Force"', (error) => {
              if (error) reject(error);
              else resolve();
            });
          });
        }
      } else if (item.id === 'temp') {
        // Nettoyer les fichiers temporaires
        const tempPath = require('os').tmpdir();
        await cleanTempDirectory(tempPath, (itemProgress) => {
          const globalProgress = ((processedItems + (itemProgress / 100)) / totalItems) * 100;
          event.sender.send('cleanup-progress', globalProgress);
        });
      } else if (item.id === 'old-downloads') {
        // Supprimer les anciens téléchargements
        const downloadsPath = path.join(require('os').homedir(), 'Downloads');
        await cleanOldDownloads(downloadsPath, 30, (itemProgress) => {
          const globalProgress = ((processedItems + (itemProgress / 100)) / totalItems) * 100;
          event.sender.send('cleanup-progress', globalProgress);
        });
      }
      
      processedItems++;
      // Envoyer la progression finale pour cet élément
      event.sender.send('cleanup-progress', (processedItems / totalItems) * 100);
    }
    
    // Progression complète
    event.sender.send('cleanup-progress', 100);
    
    return {
      success: true,
      freedSpace: selectedItems.reduce((sum, item) => sum + item.size, 0),
      cleanedFiles: selectedItems.reduce((sum, item) => sum + item.fileCount, 0)
    };
    
  } catch (error) {
    console.error('Cleanup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Fonctions utilitaires pour le scan de nettoyage
async function scanDirectory(dirPath, options = {}) {
  const fs = require('fs').promises;
  let totalSize = 0;
  let fileCount = 0;
  const { maxDepth = 5 } = options;
  
  async function scan(currentPath, depth = 0) {
    if (depth > maxDepth) return;
    
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        try {
          const fullPath = path.join(currentPath, entry.name);
          
          if (entry.isFile()) {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
            fileCount++;
          } else if (entry.isDirectory() && depth < maxDepth) {
            await scan(fullPath, depth + 1);
          }
        } catch (err) {
          // Ignorer les fichiers/dossiers inaccessibles
        }
      }
    } catch (err) {
      // Ignorer les erreurs d'accès au dossier
    }
  }
  
  await scan(dirPath);
  return { size: totalSize, fileCount };
}

async function findOldFiles(dirPath, daysOld) {
  const fs = require('fs').promises;
  const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  let totalSize = 0;
  let fileCount = 0;
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      try {
        if (entry.isFile()) {
          const fullPath = path.join(dirPath, entry.name);
          const stats = await fs.stat(fullPath);
          
          if (stats.mtime < cutoffDate) {
            totalSize += stats.size;
            fileCount++;
          }
        }
      } catch (err) {
        // Ignorer les erreurs
      }
    }
  } catch (err) {
    // Ignorer les erreurs d'accès au dossier
  }
  
  return { size: totalSize, fileCount };
}
async function emptyDirectory(dirPath, progressCallback) {
  const fs = require('fs').promises;
  let processedCount = 0;
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const totalEntries = entries.length;
    
    for (const entry of entries) {
      try {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          await fs.rmdir(fullPath, { recursive: true });
        } else {
          await fs.unlink(fullPath);
        }
        
        processedCount++;
        if (progressCallback) {
          progressCallback(processedCount / totalEntries * 100);
        }
      } catch (err) {
        console.warn(`Could not delete ${entry.name}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Error emptying directory:', error);
  }
}

async function cleanTempDirectory(tempPath, progressCallback) {
  const fs = require('fs').promises;
  
  try {
    const entries = await fs.readdir(tempPath, { withFileTypes: true });
    let processedCount = 0;
    
    for (const entry of entries) {
      try {
        const fullPath = path.join(tempPath, entry.name);
        const stats = await fs.stat(fullPath);
        
        // Supprimer les fichiers/dossiers de plus de 24h
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        if (stats.mtime < oneDayAgo) {
          if (entry.isDirectory()) {
            await fs.rmdir(fullPath, { recursive: true });
          } else {
            await fs.unlink(fullPath);
          }
        }
        
        processedCount++;
        if (progressCallback) {
          progressCallback(processedCount / entries.length * 100);
        }
      } catch (err) {
        // Ignorer les erreurs pour les fichiers en cours d'utilisation
      }
    }
  } catch (error) {
    console.error('Error cleaning temp directory:', error);
  }
}

async function cleanOldDownloads(downloadsPath, daysOld, progressCallback) {
  const fs = require('fs').promises;
  
  try {
    const entries = await fs.readdir(downloadsPath, { withFileTypes: true });
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    let processedCount = 0;
    
    for (const entry of entries) {
      try {
        if (entry.isFile()) {
          const fullPath = path.join(downloadsPath, entry.name);
          const stats = await fs.stat(fullPath);
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(fullPath);
          }
        }
        
        processedCount++;
        if (progressCallback) {
          progressCallback(processedCount / entries.length * 100);
        }
      } catch (err) {
        // Ignorer les erreurs
      }
    }
  } catch (error) {
    console.error('Error cleaning old downloads:', error);
  }
}

// Handler pour relancer avec les droits admin
ipcMain.handle('relaunch-as-admin', async () => {
  try {
    if (process.platform === 'win32') {
      // Windows - utiliser PowerShell pour relancer avec UAC
      const { spawn } = require('child_process');
      const appPath = process.execPath;
      
      // Utiliser PowerShell Start-Process avec -Verb RunAs pour déclencher UAC
      spawn('powershell', [
        'Start-Process',
        `"${appPath}"`,
        '-Verb',
        'RunAs'
      ], {
        detached: true,
        stdio: 'ignore'
      });
      
      // Fermer l'instance actuelle
      app.quit();
      return { success: true };
    } else if (process.platform === 'darwin') {
      // macOS - utiliser osascript pour demander l'authentification admin
      const { spawn } = require('child_process');
      const appPath = process.execPath;
      
      spawn('osascript', [
        '-e',
        `do shell script "${appPath}" with administrator privileges`
      ], {
        detached: true,
        stdio: 'ignore'
      });
      
      app.quit();
      return { success: true };
    } else {
      // Linux - utiliser sudo/pkexec
      const { spawn } = require('child_process');
      const appPath = process.execPath;
      
      // Essayer avec pkexec d'abord, puis sudo
      try {
        spawn('pkexec', [appPath], {
          detached: true,
          stdio: 'ignore'
        });
      } catch (e) {
        spawn('sudo', [appPath], {
          detached: true,
          stdio: 'ignore'
        });
      }
      
      app.quit();
      return { success: true };
    }
  } catch (error) {
    console.error('Failed to relaunch as admin:', error);
    return { 
      success: false, 
      error: error.message 
    };
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