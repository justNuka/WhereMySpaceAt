const LogPanel = ({ logs, isOpen, onToggle }) => {
  const { Terminal, ChevronDown, ChevronUp, AlertTriangle, Info, CheckCircle, XCircle } = window.LucideReact;
  const logContainerRef = React.useRef(null);
  
  React.useEffect(() => {
    if (logContainerRef.current && isOpen) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isOpen]);
  
  const getLogIcon = (type) => {
    switch (type) {
      case window.CONSTANTS.LOG_TYPES.ERROR:
        return <XCircle className="h-4 w-4 text-red-400" />;
      case window.CONSTANTS.LOG_TYPES.WARNING:
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case window.CONSTANTS.LOG_TYPES.SUCCESS:
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };
  
  const getLogTextColor = (type) => {
    switch (type) {
      case window.CONSTANTS.LOG_TYPES.ERROR:
        return 'text-red-300';
      case window.CONSTANTS.LOG_TYPES.WARNING:
        return 'text-yellow-300';
      case window.CONSTANTS.LOG_TYPES.SUCCESS:
        return 'text-green-300';
      default:
        return 'text-gray-300';
    }
  };
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  return (
    <div className="glass-morphism-dark rounded-2xl border border-white/10">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 
                 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center space-x-2">
          <Terminal className="h-5 w-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-white">Scan Logs</h2>
          {logs.length > 0 && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
              {logs.length}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="border-t border-white/10">
          <div 
            ref={logContainerRef}
            className="max-h-64 overflow-y-auto scrollbar-thin p-4 space-y-2"
          >
            {logs.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No logs yet</p>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3 p-2 glass-morphism rounded-lg border border-white/10"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${getLogTextColor(log.type)}`}>
                      {log.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogPanel;
