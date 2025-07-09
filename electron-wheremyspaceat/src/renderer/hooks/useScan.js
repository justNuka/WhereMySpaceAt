import { useState, useEffect, useCallback } from 'react';

export const useScan = () => {
  const [scanData, setScanData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [currentFile, setCurrentFile] = useState('');
  const [processedFiles, setProcessedFiles] = useState(0);
  const [scanStats, setScanStats] = useState(null);
  const [liveStats, setLiveStats] = useState({ ignoredDirs: 0, permissionDeniedCount: 0, adminRequiredDirs: 0 });
  const [scanStartTime, setScanStartTime] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.onScanProgress((data) => {
        setProgress(data.progress || 0);
        setCurrentFile(data.currentFile || '');
        setProcessedFiles(data.processed || 0);
        
        // Mettre à jour les statistiques en temps réel si disponibles
        if (data.stats) {
          setLiveStats(data.stats);
        }
      });

      window.electronAPI.onScanLog((data) => {
        setLogs(prev => [...prev, {
          id: Date.now().toString(),
          type: data.type || 'info',
          message: data.message,
          timestamp: new Date().toISOString()
        }]);
      });

      return () => {
        window.electronAPI.removeAllListeners();
      };
    }
  }, []);

  const startScan = useCallback(async (targetPath, scanType) => {
    if (!window.electronAPI) return;

    setIsScanning(true);
    setProgress(0);
    setScanData(null);
    setLogs([]);
    setCurrentFile('');
    setProcessedFiles(0);
    setScanStats(null);
    setLiveStats({ ignoredDirs: 0, permissionDeniedCount: 0, adminRequiredDirs: 0 });
    setScanStartTime(Date.now());
    
    // Add initial log
    setLogs([{
      id: Date.now().toString(),
      type: 'info',
      message: `Début du scan ${scanType === 'folder' ? 'du dossier' : 'du disque'}: ${targetPath}`,
      timestamp: new Date().toISOString()
    }]);
    
    try {
      const response = await window.electronAPI.startScan(targetPath, scanType);
      setScanData(response.result);
      setScanStats(response.stats);
      
      // Assurer que le progrès est à 100% à la fin
      setProgress(100);
      
      setLogs(prev => [...prev, {
        id: Date.now().toString(),
        type: 'success',
        message: 'Scan terminé avec succès!',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Scan failed:', error);
      setLogs(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        message: `Échec du scan: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const stopScan = useCallback(async () => {
    if (!window.electronAPI) return;

    try {
      await window.electronAPI.stopScan();
      setIsScanning(false);
      setLogs(prev => [...prev, {
        id: Date.now().toString(),
        type: 'warning',
        message: 'Scan arrêté par l\'utilisateur',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to stop scan:', error);
    }
  }, []);

  const resetScan = useCallback(() => {
    setScanData(null);
    setIsScanning(false);
    setProgress(0);
    setLogs([]);
    setCurrentFile('');
    setProcessedFiles(0);
    setScanStats(null);
    setLiveStats({ ignoredDirs: 0, permissionDeniedCount: 0, adminRequiredDirs: 0 });
    setScanStartTime(null);
  }, []);

  const getElapsedTime = useCallback(() => {
    if (!scanStartTime) return 0;
    return Date.now() - scanStartTime;
  }, [scanStartTime]);

  return {
    scanData,
    isScanning,
    progress,
    logs,
    currentFile,
    processedFiles,
    scanStats,
    liveStats,
    scanStartTime,
    startScan,
    stopScan,
    resetScan,
    getElapsedTime
  };
};