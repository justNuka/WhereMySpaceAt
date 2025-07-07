const { parentPort, workerData } = require('worker_threads');
const fs = require('fs').promises;
const path = require('path');

class DirectoryScanner {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.totalFiles = 0;
    this.processedFiles = 0;
    this.errors = [];
    this.startTime = Date.now();
  }

  async scan() {
    try {
      parentPort.postMessage({
        type: 'start',
        message: `Starting scan of ${this.rootPath}`,
        timestamp: new Date().toISOString()
      });

      const result = await this.scanDirectory(this.rootPath);
      
      parentPort.postMessage({
        type: 'complete',
        data: result,
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
        error: error.message,
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
          
          // Send progress update every 100 items
          if (this.processedFiles % 100 === 0) {
            parentPort.postMessage({
              type: 'progress',
              processed: this.processedFiles,
              currentPath: fullPath,
              timestamp: new Date().toISOString()
            });
          }
          
        } catch (error) {
          this.errors.push({
            path: fullPath,
            error: error.message,
            code: error.code
          });
          
          parentPort.postMessage({
            type: 'warning',
            message: `Access denied: ${fullPath} - ${error.message}`,
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
      
      parentPort.postMessage({
        type: 'error',
        message: `Failed to scan directory: ${dirPath} - ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }

    return item;
  }
}

// Start scanning
const scanner = new DirectoryScanner(workerData.dirPath);
scanner.scan();
