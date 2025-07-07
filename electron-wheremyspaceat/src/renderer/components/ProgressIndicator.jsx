import React from 'react';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const ProgressIndicator = ({ 
  progress, 
  isScanning, 
  scanType, 
  selectedPath, 
  onStop,
  currentFile,
  processedFiles,
  scanStats
}) => {
  return (
    <div className="glass-morphism-dark rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          Progression du Scan
        </h2>
        <div className="flex items-center space-x-2">
          {isScanning ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              <span className="font-medium text-blue-400">
                Scan en cours...
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="font-medium text-green-400">
                Scan terminé
              </span>
            </>
          )}
        </div>
      </div>

      {isScanning && (
        <div className="space-y-4">
          <div className="glass-morphism border border-white/20 rounded-lg p-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Type de scan</span>
              <span className="font-medium">
                {scanType === "folder" ? "Dossier" : scanType === "disk" ? "Disque complet" : "Analyse"}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Fichiers traités</span>
              <span className="font-mono">
                {(processedFiles || 0).toLocaleString()}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">
                Scan en cours :
              </p>
              <p className="text-sm text-white font-mono truncate">
                {currentFile || selectedPath || "..."}
              </p>
            </div>
          </div>

          <div className="glass-morphism border border-white/20 rounded-lg p-2">
            <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 animate-scan"
                style={{ width: `${(progress || 0) * 100}%` }}
              ></div>
            </div>
          </div>

          {onStop && (
            <button
              onClick={onStop}
              className="w-full p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/30 transition-all duration-200"
            >
              <div className="flex items-center justify-center space-x-2">
                <XCircle className="h-4 w-4" />
                <span>Arrêter le scan</span>
              </div>
            </button>
          )}
        </div>
      )}

      {!isScanning && scanStats && (
        <div className="glass-morphism border border-white/20 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{(scanStats.totalFiles || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400">Fichiers Scannés</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{scanStats.errors || 0}</p>
              <p className="text-xs text-gray-400">Erreurs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {scanStats.duration ? `${(scanStats.duration / 1000).toFixed(1)}s` : "0s"}
              </p>
              <p className="text-xs text-gray-400">Durée</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
