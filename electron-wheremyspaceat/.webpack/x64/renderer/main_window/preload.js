/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("electron");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/************************************************************************/
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!****************************!*\
  !*** ./workers/preload.js ***!
  \****************************/
var _require = __webpack_require__(/*! electron */ "electron"),
  contextBridge = _require.contextBridge,
  ipcRenderer = _require.ipcRenderer;
contextBridge.exposeInMainWorld('electronAPI', {
  // Sélection de dossier
  selectFolder: function selectFolder() {
    return ipcRenderer.invoke('select-folder');
  },
  // Obtenir la liste des disques/lecteurs
  getDrives: function getDrives() {
    return ipcRenderer.invoke('get-drives');
  },
  // Prescan des disques au démarrage
  prescanDrives: function prescanDrives() {
    return ipcRenderer.invoke('prescan-drives');
  },
  // Gestion du scan
  startScan: function startScan(targetPath, scanType) {
    return ipcRenderer.invoke('start-scan', targetPath, scanType);
  },
  stopScan: function stopScan() {
    return ipcRenderer.invoke('stop-scan');
  },
  // Permissions et droits admin
  checkAdminPrivileges: function checkAdminPrivileges() {
    return ipcRenderer.invoke('check-admin-privileges');
  },
  relaunchAsAdmin: function relaunchAsAdmin() {
    return ipcRenderer.invoke('relaunch-as-admin');
  },
  // Fonctions de nettoyage
  scanCleanupItems: function scanCleanupItems() {
    return ipcRenderer.invoke('scan-cleanup-items');
  },
  cleanupFiles: function cleanupFiles(selectedItems) {
    return ipcRenderer.invoke('cleanup-files', selectedItems);
  },
  // Event listeners pour les mises à jour en temps réel
  onScanProgress: function onScanProgress(callback) {
    ipcRenderer.on('scan-progress', function (event, data) {
      return callback(data);
    });
  },
  onScanLog: function onScanLog(callback) {
    ipcRenderer.on('scan-log', function (event, data) {
      return callback(data);
    });
  },
  // Nettoyage des listeners
  removeAllListeners: function removeAllListeners(channel) {
    if (channel) {
      ipcRenderer.removeAllListeners(channel);
    } else {
      // Nettoyer tous les listeners si aucun channel spécifié
      ipcRenderer.removeAllListeners('scan-progress');
      ipcRenderer.removeAllListeners('scan-log');
    }
  },
  // Get la plateforme
  getPlatform: function getPlatform() {
    return process.platform;
  }
});
})();

/******/ })()
;
//# sourceMappingURL=preload.js.map