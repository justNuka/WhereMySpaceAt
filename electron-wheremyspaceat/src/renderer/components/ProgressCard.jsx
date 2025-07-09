import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";
import { formatElapsedTime } from "@/lib/formatUtils.js";

export default function ProgressCard({ 
  progress, 
  isScanning, 
  currentFile, 
  processedFiles,
  onStop,
  elapsedTime,
  showStats = false,
  scanStats = null
}) {
  if (!isScanning) return null;

  const scanSpeed = elapsedTime > 0 ? Math.floor(processedFiles / (elapsedTime / 1000)) : 0;

  return (
    <Card className="glass-card border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {showStats ? 'Statistiques en temps réel' : 'Progression du scan'}
          </h3>
          <Button
            onClick={onStop}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Square className="w-4 h-4 mr-2" />
            Arrêter
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Barre de progression améliorée */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Progression</span>
              <span className="text-white font-semibold">{Math.round(progress)}%</span>
            </div>
            
            <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Statistiques détaillées */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Fichiers scannés</span>
              <span className="text-white font-semibold">{processedFiles.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Temps écoulé</span>
              <span className="text-white font-semibold">{formatElapsedTime(elapsedTime)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Vitesse</span>
              <span className="text-white font-semibold">{scanSpeed} f/s</span>
            </div>
            
            {/* Statistiques sur les permissions si disponibles */}
            {scanStats && (scanStats.permissionDeniedCount > 0 || scanStats.ignoredDirs > 0) && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-400">Dossiers ignorés</span>
                  <span className="text-yellow-400 font-semibold">{scanStats.ignoredDirs || 0}</span>
                </div>
                
                {scanStats.adminRequiredDirs > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-orange-400">Droits admin requis</span>
                    <span className="text-orange-400 font-semibold">{scanStats.adminRequiredDirs}</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Fichier en cours */}
          <div className="pt-3 border-t border-white/10">
            <div className="text-xs text-gray-400 mb-1">Fichier en cours :</div>
            <div className="text-sm text-white truncate font-mono bg-white/5 p-2 rounded" title={currentFile}>
              {currentFile || 'En attente...'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}