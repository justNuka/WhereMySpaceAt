const Header = ({ onRestartScan, scanStatus, currentPath }) => {
  const { RefreshCw, HardDrive, Settings } = window.LucideReact;
  
  return (
    <header className="glass-morphism-dark rounded-2xl p-6 mb-6 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
            <HardDrive className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Disk Space Analyzer</h1>
            <p className="text-gray-300 text-sm">
              {currentPath ? `Scanning: ${currentPath}` : 'Select a directory to start analyzing'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onRestartScan}
            disabled={scanStatus === window.CONSTANTS.SCAN_STATUS.SCANNING}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 
                     text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed glass-morphism border border-white/20"
          >
            <RefreshCw className={`h-4 w-4 ${scanStatus === window.CONSTANTS.SCAN_STATUS.SCANNING ? 'animate-spin' : ''}`} />
            <span>New Scan</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
