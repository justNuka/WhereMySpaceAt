const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { Worker } = require('worker_threads');
const os = require('os');

let mainWindow;
let scanWorker = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '..', '..', 'workers', 'preload.js')
    },
    backgroundColor: '#1a1a2e',
    show: false,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'dark'
  });

  mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'index.html'));

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

// Gestion de la sélection de disque
ipcMain.handle('get-drives', async () => {
  const drives = [];
  
  if (process.platform === 'win32') {
    // Windows - énumérer les lecteurs
    for (let i = 65; i <= 90; i++) {
      const drive = String.fromCharCode(i) + ':\\';
      try {
        await fs.access(drive);
        const stats = await fs.stat(drive);
        drives.push({
          path: drive,
          name: `Disque ${String.fromCharCode(i)}:`,
          type: 'drive'
        });
      } catch (e) {
        // Drive non accessible
      }
    }
  } else {
    // Unix/Linux/macOS
    drives.push({
      path: '/',
      name: 'Racine système (/)',
      type: 'drive'
    });
    
    try {
      const homeDir = os.homedir();
      drives.push({
        path: homeDir,
        name: `Dossier utilisateur (${path.basename(homeDir)})`,
        type: 'folder'
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
                type: 'mount'
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

// Démarrer le scan
ipcMain.handle('start-scan', async (event, targetPath, scanType) => {
  return new Promise((resolve, reject) => {
    if (scanWorker) {
      scanWorker.terminate();
    }

    scanWorker = new Worker(path.join(__dirname, '..', '..', 'workers', 'scanner.js'), {
      workerData: { targetPath, scanType }
    });

    scanWorker.on('message', (data) => {
      if (data.type === 'progress') {
        mainWindow.webContents.send('scan-progress', data);
      } else if (data.type === 'complete') {
        resolve(data.result);
        scanWorker = null;
      } else if (data.type === 'error') {
        reject(new Error(data.message));
        scanWorker = null;
      } else if (data.type === 'log') {
        mainWindow.webContents.send('scan-log', data);
      }
    });

    scanWorker.on('error', (error) => {
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