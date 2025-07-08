const { parentPort, workerData } = require('worker_threads');
const fs = require('fs').promises;
const path = require('path');

class DirectoryScanner {
  constructor(rootPath, scanType) {
    this.rootPath = rootPath;
    this.scanType = scanType;
    this.totalFiles = 0;
    this.processedFiles = 0;
    this.errors = [];
    this.startTime = Date.now();
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
          errors: this.errors.length,
          duration: Date.now() - this.startTime
        },
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
    const item = {
      name: path.basename(dirPath) || dirPath,
      path: dirPath,
      type: 'directory',
      size: 0,
      children: [],
      fileCount: 0,
      depth
    };

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      // Log seulement pour les dossiers de niveau racine et quelques niveaux profonds
      if (depth <= 2) {
        parentPort.postMessage({
          type: 'log',
          level: 'info',
          message: `Analyse du dossier: ${path.basename(dirPath)}`,
          timestamp: new Date().toISOString()
        });
      }
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        try {
          if (entry.isDirectory()) {
            const childDir = await this.scanDirectory(fullPath, depth + 1);
            item.children.push(childDir);
            item.size += childDir.size;
            item.fileCount += childDir.fileCount;
          } else if (entry.isFile()) {
            const stats = await fs.stat(fullPath);
            const fileItem = {
              name: entry.name,
              path: fullPath,
              type: 'file',
              size: stats.size,
              modified: stats.mtime,
              depth: depth + 1
            };
            
            item.children.push(fileItem);
            item.size += stats.size;
            item.fileCount += 1;
            this.totalFiles++;
          }
          
          this.processedFiles++;
          
          // Send progress update every 100 items pour réduire les logs
          if (this.processedFiles % 100 === 0) {
            // Estimation plus réaliste du progrès
            const estimatedTotal = Math.max(this.totalFiles, this.processedFiles * 2);
            const progress = Math.min(95, (this.processedFiles / estimatedTotal) * 100);
            
            parentPort.postMessage({
              type: 'progress',
              progress: progress,
              processed: this.processedFiles,
              currentFile: fullPath,
              timestamp: new Date().toISOString()
            });
            
            // Log seulement lors des jalons importants
            if (this.processedFiles % 1000 === 0) {
              parentPort.postMessage({
                type: 'log',
                level: 'info',
                message: `${this.processedFiles} fichiers traités...`,
                timestamp: new Date().toISOString()
              });
            }
          }
          
        } catch (error) {
          this.errors.push({
            path: fullPath,
            error: error.message,
            code: error.code
          });
          
          // Plus user-friendly pour les erreurs de permission
          let logMessage = `Accès refusé: ${entry.name}`;
          if (error.code === 'EPERM') {
            logMessage = `Permissions insuffisantes pour accéder à: ${entry.name}`;
          } else if (error.code === 'EACCES') {
            logMessage = `Accès refusé pour: ${entry.name} (permissions système)`;
          } else if (error.code === 'ENOENT') {
            logMessage = `Fichier/dossier introuvable: ${entry.name}`;
          } else {
            logMessage = `Erreur lors de l'accès à ${entry.name}: ${error.message}`;
          }
          
          parentPort.postMessage({
            type: 'log',
            level: 'warning',
            message: logMessage,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Sort children by size (descending)
      item.children.sort((a, b) => b.size - a.size);
      
    } catch (error) {
      this.errors.push({
        path: dirPath,
        error: error.message,
        code: error.code
      });
      
      // Messages d'erreur plus clairs
      let logMessage = `Impossible d'analyser le dossier: ${path.basename(dirPath)}`;
      if (error.code === 'EPERM' || error.code === 'EACCES') {
        logMessage = `Permissions insuffisantes pour scanner: ${path.basename(dirPath)}`;
      } else if (error.code === 'ENOENT') {
        logMessage = `Dossier introuvable: ${path.basename(dirPath)}`;
      } else {
        logMessage = `Erreur lors du scan de ${path.basename(dirPath)}: ${error.message}`;
      }
      
      parentPort.postMessage({
        type: 'log',
        level: 'error',
        message: logMessage,
        timestamp: new Date().toISOString()
      });
    }

    return item;
  }
}

// Start scanning
const scanner = new DirectoryScanner(workerData.targetPath, workerData.scanType);
scanner.scan();
