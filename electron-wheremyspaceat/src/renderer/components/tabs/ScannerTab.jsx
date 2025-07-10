import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Folder, HardDrive, Loader2 } from "lucide-react";
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
  const progressRef = useRef(null);

  useEffect(() => {
    const loadDrives = async () => {
      if (window.electronAPI) {
        setIsLoadingDrives(true);
        try {
          const driveList = await window.electronAPI.prescanDrives();
          setDrives(driveList);
        } catch (error) {
          console.error('Failed to load drives:', error);
        } finally {
          setIsLoadingDrives(false);
        }
      }
    };
    loadDrives();
  }, []);

  useEffect(() => {
    // Auto-scroll to progress card when scan starts
    if (isScanning) {
      setTimeout(() => {
        progressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isScanning]);

  const handleSelectPath = async () => {
    if (!window.electronAPI || scanType !== 'folder') return;
    const path = await window.electronAPI.selectFolder();
    if (path) setSelectedPath(path);
  };

  const handleStartScan = () => {
    if (!selectedPath) return;
    onScanStart(selectedPath, scanType);
  };

  return (
    <div className="mt-4 flex flex-col gap-8">
      {/* Scan Configuration Card */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Analyser l'espace disque</h2>
          
          {/* Scan Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-4">1. Choisir le type de scan</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`glass-card p-4 border-2 cursor-pointer transition-all ${
                  scanType === 'folder' ? 'border-white' : 'border-white/20 hover:border-white/40'
                }`}
                onClick={() => { setScanType('folder'); setSelectedPath(''); }}
              >
                <CardContent className="p-0 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Dossier Spécifique</h3>
                    <p className="text-sm text-gray-400">Idéal pour un projet ou un répertoire</p>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`glass-card p-4 border-2 cursor-pointer transition-all ${
                  scanType === 'drive' ? 'border-white' : 'border-white/20 hover:border-white/40'
                }`}
                onClick={() => { setScanType('drive'); setSelectedPath(''); }}
              >
                <CardContent className="p-0 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Disque Entier</h3>
                    <p className="text-sm text-gray-400">Analyse complète d'un volume</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Path Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-4">2. Sélectionner la cible</label>
            {scanType === 'folder' ? (
              <div className="flex items-center gap-4">
                <Button onClick={handleSelectPath} className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-semibold">
                  Choisir un dossier
                </Button>
                <div className="flex-1 glass-card p-3 rounded-lg text-white font-mono truncate">
                  {selectedPath || 'Aucun dossier sélectionné'}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                 <p className="text-xs text-gray-400">
                  {isLoadingDrives ? 'Recherche des disques...' : `${drives.filter(d => d.accessible).length} disques détectés`}
                 </p>
                <Select value={selectedPath} onValueChange={setSelectedPath} disabled={isLoadingDrives}>
                  <SelectTrigger className="glass-card border-white/20 text-white">
                    <SelectValue placeholder={isLoadingDrives ? "Chargement..." : "Sélectionner un disque"} />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20 bg-gray-900/95 backdrop-blur-sm">
                    {drives.filter(drive => drive.accessible).map((drive) => (
                      <SelectItem key={drive.path} value={drive.path} className="text-white hover:bg-white/10 focus:bg-white/10">
                        {drive.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {/* Scan Controls */}
          <div>
             <label className="block text-sm font-medium text-gray-300 mb-4">3. Lancer l'analyse</label>
            <Button onClick={handleStartScan} disabled={!selectedPath || isScanning} className="bg-white hover:bg-gray-100 font-semibold w-full md:w-auto text-black">
              {isScanning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2 text-black" />
              )}
              <span className="text-black">{isScanning ? 'Scan en cours...' : 'Commencer le scan'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress and Live Stats - Full Width Below */}
      <div ref={progressRef}>
        {(isScanning || liveStats) && (
          <ProgressCard 
            progress={progress}
            isScanning={isScanning}
            currentFile={currentFile}
            processedFiles={processedFiles}
            onStop={onStop}
            elapsedTime={elapsedTime}
            showStats={true}
            scanStats={liveStats}
          />
        )}
      </div>
    </div>
  );
}