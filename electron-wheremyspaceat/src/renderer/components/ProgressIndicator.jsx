import React from 'react';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const ProgressIndicator = ({ scanStatus, processedFiles, currentPath, logs }) => {  
  const getStatusIcon = () => {
    switch (scanStatus) {
      case window.CONSTANTS.SCAN_STATUS.SCANNING:
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
      case window.CONSTANTS.SCAN_STATUS.COMPLETE:
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case window.CONSTANTS.SCAN_STATUS.ERROR:
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getStatusText = () => {
    switch (scanStatus) {
      case window.CONSTANTS.SCAN_STATUS.SCANNING:
        return 'Scanning in progress...';
      case window.CONSTANTS.SCAN_STATUS.COMPLETE:
        return 'Scan completed successfully';
      case window.CONSTANTS.SCAN_STATUS.ERROR:
        return 'Scan failed';
      default:
        return 'Ready to scan';
    }
  };
  
  const getStatusColor = () => {
    switch (scanStatus) {
      case window.CONSTANTS.SCAN_STATUS.SCANNING:
        return 'text-blue-400';
      case window.CONSTANTS.SCAN_STATUS.COMPLETE:
        return 'text-green-400';
      case window.CONSTANTS.SCAN_STATUS.ERROR:
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };
  
  return (
    <div className="glass-morphism-dark rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Scan Progress</h2>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
      
      {scanStatus === window.CONSTANTS.SCAN_STATUS.SCANNING && (
        <div className="space-y-4">
          <div className="glass-morphism border border-white/20 rounded-lg p-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Files processed</span>
              <span className="font-mono">{processedFiles?.toLocaleString() || 0}</span>
            </div>
            
            {currentPath && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1">Currently scanning:</p>
                <p className="text-sm text-white font-mono truncate" title={currentPath}>
                  {currentPath}
                </p>
              </div>
            )}
          </div>
          
          {/* Animated progress bar */}
          <div className="glass-morphism border border-white/20 rounded-lg p-2">
            <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full 
                            animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}
      
      {scanStatus === window.CONSTANTS.SCAN_STATUS.COMPLETE && logs.stats && (
        <div className="glass-morphism border border-white/20 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">
                {logs.stats.totalFiles?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-400">Files Scanned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {logs.stats.errors || 0}
              </p>
              <p className="text-xs text-gray-400">Errors</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {logs.stats.duration ? `${(logs.stats.duration / 1000).toFixed(1)}s` : '0s'}
              </p>
              <p className="text-xs text-gray-400">Duration</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
