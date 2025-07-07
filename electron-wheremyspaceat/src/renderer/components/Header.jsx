import React from 'react';
import Icons from './Icons';

const Header = ({ onNewScan, isScanning }) => {
  
  return (
    <header className="glass-morphism-dark rounded-2xl p-6 mb-6 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
            <Icons.HardDrive />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Analyseur d'Espace Disque
            </h1>
            <p className="text-gray-300 text-sm">
              Interface moderne avec style glassomorphism
            </p>
          </div>
        </div>

        <button
          onClick={onNewScan}
          disabled={isScanning}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 
                   text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed glass-morphism border border-white/20"
        >
          <Icons.RefreshCw spinning={isScanning} />
          <span>Nouveau Scan</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
