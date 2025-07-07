import React, { useState, useEffect } from 'react';

// Icônes SVG intégrées
const Icons = {
  FolderOpen: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      <path d="M2 7h20"></path>
    </svg>
  ),
  Folder: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  HardDrive: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="12" x2="2" y2="12"></line>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
      <line x1="6" y1="16" x2="6.01" y2="16"></line>
      <line x1="10" y1="16" x2="10.01" y2="16"></line>
    </svg>
  ),
  Play: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 3l14 9-14 9V3z"></path>
    </svg>
  ),
  Search: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="M21 21l-4.35-4.35"></path>
    </svg>
  ),
  RefreshCw: ({ spinning }) => (
    <svg className={`icon ${spinning ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
      <path d="M3 21v-5h5"></path>
    </svg>
  )
};

const FilePicker = ({ onScanStart, isScanning }) => {
  const [scanType, setScanType] = useState('folder');
  const [selectedPath, setSelectedPath] = useState('');
  const [availableDrives, setAvailableDrives] = useState([]);

  useEffect(() => {
    loadAvailableDrives();
  }, []);

  const loadAvailableDrives = async () => {
    try {
      const drives = await window.electronAPI.getDrives();
      setAvailableDrives(drives || []);
    } catch (error) {
      console.error('Error loading drives:', error);
      setAvailableDrives([]);
    }
  };

  const handleScanTypeChange = (type) => {
    setScanType(type);
    setSelectedPath('');
  };

  const handleSelectFolder = async () => {
    try {
      const path = await window.electronAPI.selectFolder();
      if (path) {
        setSelectedPath(path);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleQuickAccess = (path) => {
    setSelectedPath(path);
  };

  const handleStartScan = () => {
    if (selectedPath && onScanStart) {
      onScanStart(selectedPath, scanType);
    }
  };

  const folderOptions = [
    { path: process.platform === 'win32' ? 'C:\\Users' : '/home', label: 'Dossier utilisateurs', desc: 'Dossiers des utilisateurs système' },
    { path: process.platform === 'win32' ? 'C:\\Program Files' : '/usr', label: 'Programmes installés', desc: 'Applications et logiciels' },
    { path: process.platform === 'win32' ? 'C:\\Users\\Public\\Documents' : '/tmp', label: 'Dossier temporaire', desc: 'Fichiers temporaires système' }
  ];

  return (
    <div className="glass-morphism-dark rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Icons.FolderOpen />
        <span className="ml-2">Sélection du Scan</span>
      </h2>
      
      <div className="space-y-4">
        {/* Type de scan */}
        <div>
          <p className="text-sm font-medium text-gray-300 mb-3">Type de scan :</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleScanTypeChange('folder')}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                scanType === 'folder' 
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300' 
                  : 'glass-morphism border-white/20 text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Icons.Folder />
                <span className="text-xs font-medium">Dossier</span>
              </div>
            </button>
            
            <button
              onClick={() => handleScanTypeChange('disk')}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                scanType === 'disk' 
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300' 
                  : 'glass-morphism border-white/20 text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Icons.HardDrive />
                <span className="text-xs font-medium">Disque</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Sélection du chemin */}
        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">
            {scanType === 'folder' ? 'Sélectionner un dossier :' : 'Sélectionner un disque :'}
          </p>
          
          {/* Accès rapide */}
          <div className="space-y-2 mb-3">
            {scanType === 'folder' ? (
              folderOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAccess(option.path)}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                    selectedPath === option.path
                      ? 'bg-blue-500/20 border-blue-400'
                      : 'glass-morphism border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icons.Folder />
                    <div>
                      <span className="text-white font-medium">{option.label}</span>
                      <p className="text-xs text-gray-400">{option.desc}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              availableDrives.map((drive, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAccess(drive.path)}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                    selectedPath === drive.path
                      ? 'bg-purple-500/20 border-purple-400'
                      : 'glass-morphism border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icons.HardDrive />
                    <div>
                      <span className="text-white font-medium">{drive.name}</span>
                      <p className="text-xs text-gray-400">{drive.path}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          
          {/* Sélection personnalisée */}
          {scanType === 'folder' && (
            <button 
              onClick={handleSelectFolder}
              className="w-full p-3 glass-morphism border border-white/20 rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              <div className="flex items-center justify-center space-x-2 text-gray-300">
                <Icons.Search />
                <span>Parcourir...</span>
              </div>
            </button>
          )}
        </div>
        
        {/* Bouton de démarrage */}
        <button
          onClick={handleStartScan}
          disabled={!selectedPath || isScanning}
          className={`w-full p-4 rounded-xl transition-all duration-200 font-medium ${
            selectedPath && !isScanning
              ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
              : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-center space-x-3">
            {isScanning ? (
              <>
                <Icons.RefreshCw spinning={true} />
                <span>Scan en cours...</span>
              </>
            ) : (
              <>
                <Icons.Play />
                <span>
                  {selectedPath 
                    ? `Scanner ${scanType === 'folder' ? 'le dossier' : 'le disque'}`
                    : 'Sélectionner un chemin'
                  }
                </span>
              </>
            )}
          </div>
        </button>
        
        {/* Informations sur la sélection */}
        {selectedPath && (
          <div className="glass-morphism border border-white/20 rounded-lg p-3">
            <p className="text-sm text-gray-300 mb-1">
              {scanType === 'folder' ? 'Dossier sélectionné :' : 'Disque sélectionné :'}
            </p>
            <p className="text-white font-mono text-sm break-all">{selectedPath}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePicker;
