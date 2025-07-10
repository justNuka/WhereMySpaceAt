const { parentPort, workerData } = require('worker_threads');
const fs = require('fs').promises;
const path = require('path');

class DirectoryScanner {
  constructor(rootPath, scanType) {
    this.rootPath = rootPath;
    this.scanType = scanType;
    this.totalFiles = 0;
    this.totalDirectories = 0;
    this.totalSize = 0;
    this.processedFiles = 0;
    this.errors = [];
    this.ignoredDirs = [];
    this.permissionDeniedCount = 0;
    this.adminRequiredDirs = [];
    this.startTime = Date.now();
    this.estimatedTotal = 0;
    this.lastProgressUpdate = 0;
    this.progressUpdateInterval = 500; // Update every 500ms minimum
    this.platform = process.platform;
  }

  async scan() {
    try {
      parentPort.postMessage({
        type: 'log',
        level: 'info',
        message: `Starting scan of ${this.rootPath}`,
        timestamp: new Date().toISOString()
      });

      const result = await this.scanDirectory(this.rootPath);
      
      // Calculer la taille totale à partir du résultat
      this.totalSize = result.size;
      
      // Log final avec stats réelles
      parentPort.postMessage({
        type: 'log',
        level: 'success',
        message: `Scan terminé avec succès! ${this.totalFiles} fichiers analysés`,
        timestamp: new Date().toISOString()
      });
      
      parentPort.postMessage({
        type: 'complete',
        result: result,
        stats: {
          totalFiles: this.totalFiles,
          totalDirectories: this.totalDirectories,
          totalSize: this.totalSize,
          errors: this.errors.length,
          ignoredDirs: this.ignoredDirs.length,
          permissionDeniedCount: this.permissionDeniedCount,
          adminRequiredDirs: this.adminRequiredDirs.length,
          duration: Date.now() - this.startTime,
          platform: this.platform
        },
        progress: 100, // Assurer que le progrès est à 100% à la fin
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      parentPort.postMessage({
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async scanDirectory(dirPath, depth = 0) {
    // Optimisation: ignorer les dossiers protégés par macOS pour éviter les erreurs de permission massives
    if (depth > 0 && this.isMacOSProtectedPath(dirPath)) {
      this.ignoredDirs.push(dirPath);
      // Loggue une seule fois que le dossier est ignoré au lieu de générer des milliers d'erreurs
      parentPort.postMessage({
        type: 'log',
        level: 'info',
        message: `🛡️ Dossier protégé ignoré: ${path.basename(dirPath)}`,
        timestamp: new Date().toISOString()
      });
      return null; // Retourne null pour qu'il soit filtré et ne soit pas ajouté à l'arbre
    }

    const item = {
      name: path.basename(dirPath) || dirPath,
      path: dirPath,
      type: 'directory',
      size: 0,
      children: [],
      fileCount: 0,
      depth
    };

    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
      if (depth <= 2) {
        parentPort.postMessage({
          type: 'log',
          level: 'info',
          message: `Analyse du dossier: ${path.basename(dirPath)}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      this.errors.push({ path: dirPath, error: error.message, code: error.code, isDirectory: true });
      this.handleDirectoryError(error, dirPath);
      return item; // Retourne un item vide en cas d'erreur pour ne pas crasher le parent
    }

    const promises = entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      try {
        if (entry.isDirectory()) {
          return await this.scanDirectory(fullPath, depth + 1);
        }
        if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          return { name: entry.name, path: fullPath, type: 'file', size: stats.size, modified: stats.mtime, depth: depth + 1 };
        }
      } catch (error) {
        this.errors.push({ path: fullPath, error: error.message, code: error.code, entryName: entry.name });
        this.handlePermissionError(error, fullPath, entry.name);
        return null;
      }
    });

    const results = (await Promise.all(promises)).filter(r => r);

    for (const result of results) {
      item.children.push(result);
      item.size += result.size;
      if (result.type === 'directory') {
        this.totalDirectories++;
        item.fileCount += result.fileCount || 0;
      } else {
        this.totalFiles++;
        item.fileCount++;
      }
    }
    
    this.processedFiles += entries.length;
    this.updateProgress(dirPath);

    item.children.sort((a, b) => b.size - a.size);

    // Optimisation: "élagage" de l'arbre pour éviter les crashs de mémoire
    // Ne conserve que les 100 enfants les plus volumineux, ce qui est suffisant pour l'analyse
    if (item.children.length > 100) {
      item.children = item.children.slice(0, 100);
    }

    return item;
  }

  updateProgress(currentPath) {
    const now = Date.now();
    if (now - this.lastProgressUpdate > this.progressUpdateInterval) {
      const elapsed = now - this.startTime;
      const scanRate = this.processedFiles / (elapsed / 1000);

      this.estimatedTotal = Math.max(this.estimatedTotal, this.processedFiles * 1.5);
      let progress = Math.min(95, (this.processedFiles / this.estimatedTotal) * 100);

      parentPort.postMessage({
        type: 'progress',
        progress: progress,
        processed: this.processedFiles,
        currentFile: currentPath,
        scanRate: Math.round(scanRate),
        estimatedTotal: this.estimatedTotal,
        timestamp: new Date().toISOString()
      });

      this.lastProgressUpdate = now;

      if (this.processedFiles % 1000 === 0) {
        parentPort.postMessage({
          type: 'log',
          level: 'info',
          message: `${this.processedFiles} fichiers traités...`,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  handlePermissionError(error, fullPath, entryName) {
    let logMessage = '';
    let logLevel = 'warning';
    
    if (error.code === 'EPERM' || error.code === 'EACCES') {
      this.permissionDeniedCount++;
      
      if (this.platform === 'win32') {
        // Windows - détecter si droits admin requis
        if (this.isAdminRequiredPath(fullPath)) {
          this.adminRequiredDirs.push(fullPath);
          logMessage = `🔒 Droits administrateur requis pour: ${entryName}`;
          logLevel = 'info';
        } else {
          logMessage = `⚠️ Accès refusé: ${entryName} (permissions insuffisantes)`;
        }
      } else if (this.platform === 'darwin') {
        // macOS - permissions système
        if (this.isMacOSProtectedPath(fullPath)) {
          logMessage = `🛡️ Dossier protégé par macOS: ${entryName} (permissions système requises)`;
          logLevel = 'info';
        } else {
          logMessage = `⚠️ Accès refusé: ${entryName} - Vérifiez les permissions dans Préférences Système`;
        }
      } else {
        // Linux/Unix
        logMessage = `⚠️ Permissions insuffisantes pour: ${entryName}`;
      }
      
      this.ignoredDirs.push(fullPath);
    } else if (error.code === 'ENOENT') {
      logMessage = `📂 Fichier/dossier introuvable: ${entryName} (lien symbolique cassé?)`;
    } else if (error.code === 'EMFILE' || error.code === 'ENFILE') {
      logMessage = `⚠️ Trop de fichiers ouverts - réessayez plus tard: ${entryName}`;
    } else {
      logMessage = `❌ Erreur lors de l'accès à ${entryName}: ${error.message}`;
    }
    
    parentPort.postMessage({
      type: 'log',
      level: logLevel,
      message: logMessage,
      timestamp: new Date().toISOString()
    });
  }

  handleDirectoryError(error, dirPath) {
    const dirName = path.basename(dirPath);
    let logMessage = '';
    let logLevel = 'error';
    
    if (error.code === 'EPERM' || error.code === 'EACCES') {
      this.permissionDeniedCount++;
      this.ignoredDirs.push(dirPath);
      
      if (this.platform === 'win32' && this.isAdminRequiredPath(dirPath)) {
        this.adminRequiredDirs.push(dirPath);
        logMessage = `🔒 Dossier nécessitant les droits administrateur ignoré: ${dirName}`;
        logLevel = 'info';
      } else {
        logMessage = `🚫 Impossible d'analyser le dossier: ${dirName} (permissions insuffisantes)`;
      }
    } else if (error.code === 'ENOENT') {
      logMessage = `📂 Dossier introuvable: ${dirName}`;
    } else {
      logMessage = `❌ Erreur lors du scan de ${dirName}: ${error.message}`;
    }
    
    parentPort.postMessage({
      type: 'log',
      level: logLevel,
      message: logMessage,
      timestamp: new Date().toISOString()
    });
  }

  isAdminRequiredPath(filePath) {
    if (this.platform !== 'win32') return false;
    
    const adminPaths = [
      'System Volume Information',
      'Windows\\System32',
      'Windows\\SysWOW64',
      'Program Files',
      'Program Files (x86)',
      'ProgramData',
      'Windows\\WinSxS',
      '$Recycle.Bin'
    ];
    
    return adminPaths.some(adminPath => 
      filePath.toLowerCase().includes(adminPath.toLowerCase())
    );
  }

  isMacOSProtectedPath(filePath) {
    if (this.platform !== 'darwin') return false;
    
    const protectedPaths = [
      '/System/',
      '/usr/bin/',
      '/usr/sbin/',
      '/private/var/db/',
      '/private/var/log/',
      '/Library/Application Support/com.apple.',
      '/.DocumentRevisions-V100/',
      '/.Spotlight-V100/',
      '/.fseventsd/',
      '/.Trashes/'
    ];
    
    return protectedPaths.some(protectedPath => 
      filePath.includes(protectedPath)
    );
  }
}

// Start scanning
const scanner = new DirectoryScanner(workerData.targetPath, workerData.scanType);
scanner.scan();
