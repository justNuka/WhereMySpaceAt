import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilePicker from './components/FilePicker';
import ProgressIndicator from './components/ProgressIndicator';
import TreeView from './components/TreeView';
import SpaceChart from './components/SpaceChart';
import FilterPanel from './components/FilterPanel';
import LogPanel from './components/LogPanel';
import './styles/index.css';

function App() {
  const [scanData, setScanData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [minFileSize, setMinFileSize] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const [currentScanType, setCurrentScanType] = useState('');
  const [currentSelectedPath, setCurrentSelectedPath] = useState('');
  const [currentFile, setCurrentFile] = useState('');
  const [processedFiles, setProcessedFiles] = useState(0);
  const [scanStats, setScanStats] = useState(null);

  useEffect(() => {
    // Configuration des listeners pour les événements de scan
    if (window.electronAPI) {
      window.electronAPI.onScanProgress((data) => {
        setProgress(data.progress || 0);
        setCurrentFile(data.currentFile || '');
        setProcessedFiles(data.processed || 0);
        if (data.currentFile) {
          setLogs(prev => [...prev, {
            id: Date.now(),
            type: 'info',
            message: `Analyse: ${data.currentFile}`,
            timestamp: new Date().toISOString()
          }]);
        }
      });

      window.electronAPI.onScanLog((data) => {
        setLogs(prev => [...prev, {
          id: Date.now(),
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

  const handleScanStart = async (targetPath, scanType) => {
    setIsScanning(true);
    setProgress(0);
    setScanData(null);
    setLogs([]);
    setCurrentScanType(scanType);
    setCurrentSelectedPath(targetPath);
    setCurrentFile('');
    setProcessedFiles(0);
    setScanStats(null);
    
    // Log de démarrage
    setLogs([{
      id: Date.now(),
      type: 'info',
      message: `Début du scan ${scanType === 'folder' ? 'du dossier' : 'du disque'}: ${targetPath}`,
      timestamp: new Date().toISOString()
    }]);
    
    try {
      const response = await window.electronAPI.startScan(targetPath, scanType);
      setScanData(response.result);
      setScanStats(response.stats);
      // Le log de succès sera affiché par le scanner lui-même maintenant
    } catch (error) {
      console.error('Scan failed:', error);
      setLogs(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Échec du scan: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleStopScan = async () => {
    try {
      await window.electronAPI.stopScan();
      setIsScanning(false);
      setLogs(prev => [...prev, {
        id: Date.now(),
        type: 'warning',
        message: 'Scan arrêté par l\'utilisateur',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to stop scan:', error);
    }
  };

  const handleNewScan = () => {
    setScanData(null);
    setIsScanning(false);
    setProgress(0);
    setMinFileSize(0);
    setLogs([]);
    setCurrentScanType('');
    setCurrentSelectedPath('');
    setCurrentFile('');
    setProcessedFiles(0);
    setScanStats(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* <Header onNewScan={() => console.log('Nouveau scan')} isScanning={false} /> */}
        <Header onNewScan={handleNewScan} isScanning={isScanning} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            {!scanData && !isScanning && (
              <FilePicker 
                onScanStart={handleScanStart}
                isScanning={isScanning}
              />
            )}
            
            <ProgressIndicator 
              progress={progress}
              isScanning={isScanning}
              scanType={currentScanType}
              selectedPath={currentSelectedPath}
              onStop={handleStopScan}
              currentFile={currentFile}
              processedFiles={processedFiles}
              scanStats={scanStats}
            />
            
            {scanData && (
              <FilterPanel 
                minFileSize={minFileSize}
                onFilterChange={setMinFileSize}
              />
            )}
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <TreeView 
              data={scanData}
              minFileSize={minFileSize}
            />
            
            <LogPanel 
              logs={logs}
              isOpen={showLogs}
              onToggle={() => setShowLogs(!showLogs)}
            />
          </div>
        </div>
        
        {scanData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SpaceChart data={scanData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

// import React from 'react';

// function App() {
//   return (
//     <div style={{
//       height: '100vh',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#111',
//       color: 'white',
//       fontSize: '2rem'
//     }}>
//       WhereMySpaceAt 🚀
//     </div>
//   );
// }

// export default App;
