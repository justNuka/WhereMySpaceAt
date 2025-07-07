import { useState, useEffect } from 'react';
import Icons from './Icons';

const FilePicker = ({ onScanStart, isScanning }) => {
  const [scanType, setScanType] = useState('folder');
  const [selectedPath, setSelectedPath] = useState('');
  const [availableDrives, setAvailableDrives] = useState([]);
  const [isLoadingDrives, setIsLoadingDrives] = useState(false);

  useEffect(() => {
    loadAvailableDrives();
  }, []);

  const loadAvailableDrives = async () => {
    if (!window.electronAPI) return;
    
    setIsLoadingDrives(true);
    try {
      const drives = await window.electronAPI.getDrives();
      setAvailableDrives(drives || []);
    } catch (error) {
      console.error('Error loading drives:', error);
      setAvailableDrives([]);
    } finally {
      setIsLoadingDrives(false);
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

  const folderOptions = (() => {
    const platform = window.electronAPI?.getPlatform() || 'win32';
    
    if (platform === 'win32') {
      return [
        { path: 'C:\\Users', label: 'Dossier utilisateurs', desc: 'Dossiers des utilisateurs Windows', safe: true },
        { path: 'C:\\Program Files', label: 'Programmes installés', desc: 'Applications et logiciels', safe: false },
        { path: 'C:\\Windows\\Temp', label: 'Dossier temporaire', desc: 'Fichiers temporaires (attention: problèmes de permissions possibles)', safe: false }
      ];
    } else if (platform === 'darwin') {
      return [
        { path: '/Users', label: 'Dossier utilisateurs', desc: 'Dossiers des utilisateurs macOS', safe: true },
        { path: '/Applications', label: 'Applications', desc: 'Applications installées', safe: false },
        { path: '/tmp', label: 'Dossier temporaire', desc: 'Fichiers temporaires système', safe: false }
      ];
    } else {
      return [
        { path: '/home', label: 'Dossier utilisateurs', desc: 'Dossiers des utilisateurs Linux', safe: true },
        { path: '/usr', label: 'Programmes système', desc: 'Applications et bibliothèques', safe: false },
        { path: '/tmp', label: 'Dossier temporaire', desc: 'Fichiers temporaires système', safe: false }
      ];
    }
  })();

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
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{option.label}</span>
                        {!option.safe && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded border border-yellow-500/30">
                            ⚠️ Permissions
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{option.desc}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              isLoadingDrives ? (
                <div className="flex items-center justify-center p-8 text-gray-400">
                  <Icons.RefreshCw spinning={true} />
                  <span className="ml-2">Chargement des disques...</span>
                </div>
              ) : availableDrives.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center p-8 text-gray-400">
                  <span>Aucun disque détecté</span>
                </div>
              )
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
