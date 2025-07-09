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
  scanCleanupItems: () => ipcRenderer.invoke('scan-cleanup-items'),
  getCleanupItemDetails: (itemId) => ipcRenderer.invoke('get-cleanup-item-details', itemId),
  cleanupFiles: (selectedItems) => ipcRenderer.invoke('cleanup-files', selectedItems),
  
  // Event listeners pour les mises à jour en temps réel
  onScanProgress: (callback) => {
    ipcRenderer.on('scan-progress', (event, data) => callback(data));
  },
  onScanLog: (callback) => {
    ipcRenderer.on('scan-log', (event, data) => callback(data));
  },
  onCleanupProgress: (callback) => {
    ipcRenderer.on('cleanup-progress', (event, progress) => callback(progress));
    // Retourner une fonction pour nettoyer l'écouteur
    return () => ipcRenderer.removeAllListeners('cleanup-progress');
  },
  
  // Nettoyage des listeners
  removeAllListeners: (channel) => {
    if (channel) {
      ipcRenderer.removeAllListeners(channel);
    } else {
      // Nettoyer tous les listeners si aucun channel spécifié
      ipcRenderer.removeAllListeners('scan-progress');
      ipcRenderer.removeAllListeners('scan-log');
      ipcRenderer.removeAllListeners('cleanup-progress');
    }
  },

  // Get la plateforme
  getPlatform: () => process.platform,
});