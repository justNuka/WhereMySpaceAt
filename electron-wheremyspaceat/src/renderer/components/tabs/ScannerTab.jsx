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
  elapsedTime
}) {
  const [scanType, setScanType] = useState('folder');
  const [selectedPath, setSelectedPath] = useState('');
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    // Load available drives
    if (window.electronAPI) {
      window.electronAPI.getDrives().then(setDrives);
    }
  }, []);

  const handleSelectPath = async () => {
    if (!window.electronAPI) return;
    
    if (scanType === 'folder') {
      const path = await window.electronAPI.selectFolder();
      if (path) {
        setSelectedPath(path);
      }
    }
  };

  const handleStartScan = () => {
    if (!selectedPath) return;
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
                  onClick={() => setScanType('folder')}
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
                  onClick={() => setScanType('drive')}
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
                <Select value={selectedPath} onValueChange={setSelectedPath}>
                  <SelectTrigger className="glass-card border-white/20 text-white">
                    <SelectValue placeholder="Sélectionner un disque" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {drives.map((drive) => (
                      <SelectItem key={drive.path} value={drive.path}>
                        {drive.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
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
      
      {/* Live Stats */}
      <div className="space-y-6">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 mt-2">Statistiques en temps réel</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Fichiers scannés</span>
                <span className="text-white font-semibold">
                  {processedFiles.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Temps écoulé</span>
                <span className="text-white font-semibold">
                  {formatElapsedTime(elapsedTime)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Vitesse</span>
                <span className="text-white font-semibold">
                  {elapsedTime > 0 ? Math.floor(processedFiles / (elapsedTime / 1000)) : 0} f/s
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <ProgressCard 
          progress={progress}
          isScanning={isScanning}
          currentFile={currentFile}
          processedFiles={processedFiles}
          onStop={onStop}
          elapsedTime={elapsedTime}
        />
      </div>
    </div>
  );
}