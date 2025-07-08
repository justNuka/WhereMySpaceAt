import React from 'react';
import { Terminal, ChevronDown, ChevronUp, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const LogPanel = ({ logs, isOpen, onToggle }) => {
  const logContainerRef = React.useRef(null);
  
  // Limiter le nombre de logs affichés pour éviter les problèmes de performance
  const MAX_LOGS = 100;
  const displayedLogs = logs.slice(-MAX_LOGS);
  
  React.useEffect(() => {
    if (logContainerRef.current && isOpen) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [displayedLogs, isOpen]);
  
  const getLogIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };
  
  const getLogTextColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'error':
        return 'text-red-300';
      case 'warning':
        return 'text-yellow-300';
      case 'success':
        return 'text-green-300';
      case 'info':
      default:
        return 'text-gray-300';
    }
  };
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  return (
    <div className="glass-morphism-dark rounded-2xl border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 
                 transition-all duration-200 focus:outline-none focus:bg-white/5
                 rounded-t-2xl relative"
      >
        <div className="flex items-center space-x-2">
          <Terminal className="h-5 w-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-white">Logs du Scan</h2>
          {logs.length > 0 && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
              {logs.length}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {isOpen ? 'Masquer' : 'Afficher'}
          </span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-400 transition-transform duration-200" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="border-t border-white/10 animate-in slide-in-from-top duration-200">
          <div 
            ref={logContainerRef}
            className="max-h-64 overflow-y-auto scrollbar-thin p-4 space-y-2"
          >
            {displayedLogs.length === 0 ? (
              <div className="text-center py-8">
                <Terminal className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Aucun log pour le moment</p>
                <p className="text-gray-500 text-sm">Les logs apparaîtront ici pendant le scan</p>
              </div>
            ) : (
              displayedLogs.map((log, index) => (
                <div 
                  key={log.id || index}
                  className="flex items-start space-x-3 p-3 glass-morphism rounded-lg border border-white/10 
                           hover:bg-white/5 transition-all duration-150 group"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${getLogTextColor(log.type)} group-hover:text-white transition-colors`}>
                      {log.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {formatTimestamp(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {displayedLogs.length > 0 && (
            <div className="border-t border-white/10 px-4 py-2 bg-black/20">
              <p className="text-xs text-gray-500 text-center">
                {logs.length > MAX_LOGS ? `${displayedLogs.length}/${logs.length}` : displayedLogs.length} log{displayedLogs.length > 1 ? 's' : ''} affiché{displayedLogs.length > 1 ? 's' : ''}
                {logs.length > MAX_LOGS && (
                  <span className="ml-2 text-yellow-400">
                    (Limite de {MAX_LOGS} logs atteinte)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogPanel;
