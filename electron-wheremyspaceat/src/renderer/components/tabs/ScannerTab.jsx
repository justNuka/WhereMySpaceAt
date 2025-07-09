import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Folder, HardDrive, Clock, FileText, Zap } from "lucide-react";
import { formatSize, formatElapsedTime } from '@/lib/formatUtils.js';
import ProgressCard from '@/components/ProgressCard.jsx';

export default function ScannerTab({
  onScanStart,
  isScanning,
  progress,
  currentFile,
  processedFiles,
  onStop,
  elapsedTime,
  liveStats
}) {
  const [scanType, setScanType] = useState('folder');
  const [selectedPath, setSelectedPath] = useState('');
  const [drives, setDrives] = useState([]);
  const [isLoadingDrives, setIsLoadingDrives] = useState(true);

  useEffect(() => {
    // Effectuer le prescan des disques au chargement
    const loadDrives = async () => {
      if (window.electronAPI) {
        setIsLoadingDrives(true);
        try {
          const driveList = await window.electronAPI.prescanDrives();
          setDrives(driveList);
          console.log('Drives loaded:', driveList);
        } catch (error) {
          console.error('Failed to load drives:', error);
          // Fallback vers l'ancienne méthode
          try {
            const fallbackDrives = await window.electronAPI.getDrives();
            setDrives(fallbackDrives);
          } catch (fallbackError) {
            console.error('Fallback failed:', fallbackError);
          }
        } finally {
          setIsLoadingDrives(false);
        }
      }
    };

    loadDrives();
  }, []);

  useEffect(() => {
    // Reset selection only for drive scan type if the selected drive is no longer accessible
    if (selectedPath && drives.length > 0 && scanType === 'drive') {
      const selectedDrive = drives.find(drive => drive.path === selectedPath);
      if (!selectedDrive || !selectedDrive.accessible) {
        setSelectedPath('');
      }
    }
  }, [drives, selectedPath, scanType]);

  const setScanTypeAndClearPath = (newType) => {
    setScanType(newType);
    // Clear path when changing scan type to avoid confusion
    setSelectedPath('');
  };

  const handleSelectPath = async () => {
    if (!window.electronAPI) return;
    
    if (scanType === 'folder') {
      const path = await window.electronAPI.selectFolder();
      if (path) {
        setSelectedPath(path);
      }
    }
    // Pour le scanType 'drive', la sélection se fait via le Select dropdown
  };

  const handleStartScan = () => {
    if (!selectedPath) {
      console.log('No path selected');
      return;
    }
    console.log(`Starting scan: ${selectedPath} (${scanType})`);
    onScanStart(selectedPath, scanType);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
      {/* Scan Configuration */}
      <div className="lg:col-span-2">
        <Card className="glass-card border-white/10 h-full">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 mt-2">Analyser l'espace disque</h2>
            
            {/* Scan Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-4">Type de scan</label>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`glass-card p-4 border-2 cursor-pointer transition-all ${
                    scanType === 'folder' ? 'border-white' : 'border-white/20 hover:border-white/40'
                  }`}
                  onClick={() => setScanTypeAndClearPath('folder')}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <Folder className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Dossier</h3>
                        <p className="text-sm text-gray-400">Analyser un dossier spécifique</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`glass-card p-4 border-2 cursor-pointer transition-all ${
                    scanType === 'drive' ? 'border-white' : 'border-white/20 hover:border-white/40'
                  }`}
                  onClick={() => setScanTypeAndClearPath('drive')}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <HardDrive className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Disque entier</h3>
                        <p className="text-sm text-gray-400">Scanner un disque complet</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Path Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-4">Chemin à analyser</label>
              
              {scanType === 'folder' ? (
                <div className="space-y-3">
                  <Card className="glass-card p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-3">
                        <Folder className="w-5 h-5 text-gray-400" />
                        <span className="text-white font-mono flex-1">
                          {selectedPath || 'Aucun chemin sélectionné'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Button 
                    onClick={handleSelectPath}
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-semibold"
                  >
                    Choisir le dossier
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Select 
                    value={selectedPath} 
                    onValueChange={setSelectedPath}
                    disabled={isLoadingDrives}
                  >
                    <SelectTrigger className="glass-card border-white/20 text-white">
                      <SelectValue 
                        placeholder={isLoadingDrives ? "Analyse des disques..." : "Sélectionner un disque"}
                      >
                        {selectedPath && drives.find(d => d.path === selectedPath)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20 bg-gray-900/95 backdrop-blur-sm">
                      {drives.filter(drive => drive.accessible).map((drive) => (
                        <SelectItem 
                          key={drive.path} 
                          value={drive.path}
                          className="text-white hover:bg-white/10 focus:bg-white/10"
                        >
                          <div className="flex flex-col w-full">
                            <span className="text-white font-medium">
                              {drive.name}
                            </span>
                            {drive.estimatedItems !== undefined && (
                              <span className="text-xs text-gray-400">
                                ~{drive.estimatedItems} éléments 
                                {drive.estimatedSize > 0 && `, ${formatSize(drive.estimatedSize * 20)} estimé`}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                      {drives.filter(drive => drive.accessible).length === 0 && !isLoadingDrives && (
                        <SelectItem value="" disabled className="text-gray-500">
                          Aucun disque accessible trouvé
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  {isLoadingDrives && (
                    <div className="text-sm text-gray-400 flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyse des disques disponibles...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Drives Detection Info */}
            {drives.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center space-x-2">
                  <HardDrive className="w-4 h-4" />
                  <span>Disques détectés ({drives.length})</span>
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {drives.map((drive) => (
                    <div 
                      key={drive.path} 
                      className={`p-2 rounded-lg border ${
                        drive.accessible 
                          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{drive.name}</div>
                          <div className="text-xs opacity-70">{drive.path}</div>
                        </div>
                        <div className="text-xs text-right ml-2">
                          <div className={drive.accessible ? 'text-green-400' : 'text-red-400'}>
                            {drive.accessible ? 'Accessible' : 'Non accessible'}
                          </div>
                          {drive.accessible && drive.estimatedItems !== undefined && (
                            <div className="text-gray-400">
                              ~{drive.estimatedItems} éléments
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Scan Controls */}
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleStartScan}
                disabled={!selectedPath || isScanning}
                className="bg-white hover:bg-gray-100 font-semibold"
              >
                <Play className="w-4 h-4 mr-2 text-black" />
                <span className="text-black">Commencer le scan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Progress and Stats */}
      <div className="space-y-6">
        <ProgressCard 
          progress={progress}
          isScanning={isScanning}
          currentFile={currentFile}            processedFiles={processedFiles}
            onStop={onStop}
            elapsedTime={elapsedTime}
            showStats={true}
            scanStats={liveStats}
        />
        
        {/* Disques détectés */}
        {!isLoadingDrives && drives.length > 0 && (
          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 mt-2">Disques détectés</h3>
              <div className="space-y-3">
                {drives.filter(drive => drive.accessible).map((drive) => (
                  <div key={drive.path} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        drive.type === 'drive' ? 'bg-blue-500/20' : 'bg-green-500/20'
                      }`}>
                        <HardDrive className={`w-4 h-4 ${
                          drive.type === 'drive' ? 'text-blue-400' : 'text-green-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{drive.name}</p>
                        <p className="text-xs text-gray-400">{drive.path}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {drive.estimatedItems !== undefined && (
                        <p className="text-xs text-gray-400">
                          ~{drive.estimatedItems} éléments
                        </p>
                      )}
                      {drive.platform && (
                        <p className="text-xs text-gray-500 capitalize">
                          {drive.platform}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {drives.filter(drive => !drive.accessible).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-2">Non accessibles:</p>
                    {drives.filter(drive => !drive.accessible).map((drive) => (
                      <div key={drive.path} className="flex items-center space-x-2 text-xs text-gray-600">
                        <span>•</span>
                        <span>{drive.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}