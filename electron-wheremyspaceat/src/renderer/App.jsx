import { useState, useEffect } from 'react';
import { useScan } from '@/hooks/useScan.js';
import Header from '@/components/Header.jsx';
import TabNavigation from '@/components/TabNavigation.jsx';
import ScannerTab from '@/components/tabs/ScannerTab.jsx';
import ResultsTab from '@/components/tabs/ResultsTab.jsx';
import DetailsTab from '@/components/tabs/DetailsTab.jsx';
import CleanTab from '@/components/tabs/CleanTab.jsx';
import VisualTab from '@/components/tabs/VisualTab.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const {
    scanData,
    isScanning,
    progress,
    logs,
    currentFile,
    processedFiles,
    scanStats,
    startScan,
    stopScan,
    resetScan,
    getElapsedTime
  } = useScan();

  // Auto-switch to results tab when scan completes
  useEffect(() => {
    if (scanData && !isScanning && activeTab === 'scanner') {
      setActiveTab('results');
    }
  }, [scanData, isScanning, activeTab]);

  const handleNewScan = () => {
    resetScan();
    setActiveTab('scanner');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'scanner':
        return (
          <ScannerTab
            onScanStart={startScan}
            isScanning={isScanning}
            progress={progress}
            currentFile={currentFile}
            processedFiles={processedFiles}
            onStop={stopScan}
            elapsedTime={getElapsedTime()}
          />
        );
      case 'results':
        return (
          <ResultsTab
            scanData={scanData}
            scanStats={scanStats}
          />
        );
      case 'details':
        return (
          <DetailsTab
            scanData={scanData}
          />
        );
      case 'clean':
        return <CleanTab />;
      case 'visual':
        return (
          <VisualTab
            scanData={scanData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Main App Container */}
      <div className="relative z-10 min-h-screen">
        <Header onNewScan={handleNewScan} isScanning={isScanning} />
        
        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          scanData={scanData}
        />
        
        {/* Main Content Area */}
        <main className="px-6 pb-8 pt-2">
          <div className="max-w-7xl mx-auto">
            <div className="fade-in">
              {renderActiveTab()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;