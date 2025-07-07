const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Sélection de dossier
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // Obtenir la liste des disques/lecteurs
  getDrives: () => ipcRenderer.invoke('get-drives'),
  
  // Gestion du scan
  startScan: (targetPath, scanType) => ipcRenderer.invoke('start-scan', targetPath, scanType),
  stopScan: () => ipcRenderer.invoke('stop-scan'),
  
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
  getPlateform: () => process.platform,
});