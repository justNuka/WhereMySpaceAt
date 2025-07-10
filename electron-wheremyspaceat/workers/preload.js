const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Sélection de dossier
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // Obtenir la liste des disques/lecteurs
  getDrives: () => ipcRenderer.invoke('get-drives'),
  
  // Prescan des disques au démarrage
  prescanDrives: () => ipcRenderer.invoke('prescan-drives'),
  
  // Gestion du scan
  startScan: (targetPath, scanType) => ipcRenderer.invoke('start-scan', targetPath, scanType),
  stopScan: () => ipcRenderer.invoke('stop-scan'),
  
  // Permissions et droits admin
  checkAdminPrivileges: () => ipcRenderer.invoke('check-admin-privileges'),
  relaunchAsAdmin: () => ipcRenderer.invoke('relaunch-as-admin'),
  
  // Fonctions de nettoyage
  moveToTrash: (filePaths) => ipcRenderer.invoke('move-to-trash', filePaths),
  
  // Gestion des permissions de suppression permanente
  getPermanentDeletePermission: () => ipcRenderer.invoke('get-permanent-delete-permission'),
  setPermanentDeletePermission: (enabled) => ipcRenderer.invoke('set-permanent-delete-permission', enabled),
  
  // Event listeners pour les mises à jour en temps réel
  onScanProgress: (callback) => {
    ipcRenderer.on('scan-progress', (event, data) => callback(data));
  },
  onScanLog: (callback) => {
    ipcRenderer.on('scan-log', (event, data) => callback(data));
  },
  
  // Nettoyage des listeners
  removeAllListeners: (channel) => {
    if (channel) {
      ipcRenderer.removeAllListeners(channel);
    } else {
      // Nettoyer tous les listeners si aucun channel spécifié
      ipcRenderer.removeAllListeners('scan-progress');
      ipcRenderer.removeAllListeners('scan-log');
    }
  },

  // Get la plateforme
  getPlatform: () => process.platform,
});