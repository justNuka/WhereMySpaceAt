// Fonctions utilitaires pour le formatage

export const formatSize = (bytes) => {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
    return '0 B';
  }
  
  if (bytes === 0) return '0 B';
  
  // Calcul binaire (technique)
  const kBinary = 1024;
  const sizesBinary = ['B', 'Ko', 'Mo', 'Go', 'To'];
  const iBinary = Math.floor(Math.log(bytes) / Math.log(kBinary));
  const binarySize = parseFloat((bytes / Math.pow(kBinary, iBinary)).toFixed(2));
  
  // Calcul décimal (système)
  const kDecimal = 1000;
  const sizesDecimal = ['B', 'Ko', 'Mo', 'Go', 'To'];
  const iDecimal = Math.floor(Math.log(bytes) / Math.log(kDecimal));
  const decimalSize = parseFloat((bytes / Math.pow(kDecimal, iDecimal)).toFixed(2));
  
  // Si les valeurs sont identiques ou très proches, afficher seulement une version
  if (Math.abs(binarySize - decimalSize) < 0.01 || bytes < 1024) {
    return `${binarySize} ${sizesBinary[iBinary]}`;
  }
  
  return `${binarySize} ${sizesBinary[iBinary]} (${decimalSize} ${sizesDecimal[iDecimal]} sys)`;
};

// Version avec unités décimales (comme le système d'exploitation)
export const formatSizeDecimal = (bytes) => {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
    return '0 B';
  }
  
  if (bytes === 0) return '0 B';
  
  const k = 1000; // Unités décimales
  const sizes = ['B', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatFileCount = (count) => {
  if (count === null || count === undefined || isNaN(count) || count < 0) {
    return '0 fichiers';
  }
  
  if (count === 0) return '0 fichiers';
  if (count === 1) return '1 fichier';
  
  if (count < 1000) return `${count} fichiers`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K fichiers`;
  
  return `${(count / 1000000).toFixed(1)}M fichiers`;
};

export const formatElapsedTime = (milliseconds) => {
  if (milliseconds === null || milliseconds === undefined || isNaN(milliseconds) || milliseconds < 0) {
    return '0ms';
  }
  
  if (milliseconds < 1000) return `${milliseconds}ms`;
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
  if (milliseconds < 3600000) return `${Math.floor(milliseconds / 60000)}m ${Math.floor((milliseconds % 60000) / 1000)}s`;
  
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  
  return `${hours}h ${minutes}m ${seconds}s`;
};

// Alias pour la compatibilité
export const formatDuration = formatElapsedTime;

export const getSizeColor = (size, maxSize) => {
  if (size === null || size === undefined || isNaN(size) || 
      maxSize === null || maxSize === undefined || isNaN(maxSize) || maxSize === 0) {
    return 'text-gray-400';
  }
  
  const ratio = size / maxSize;
  
  if (ratio > 0.8) return 'text-red-400';
  if (ratio > 0.6) return 'text-orange-400';
  if (ratio > 0.4) return 'text-yellow-400';
  if (ratio > 0.2) return 'text-blue-400';
  
  return 'text-gray-400';
};

export const getSizeBadge = (size, maxSize) => {
  if (size === null || size === undefined || isNaN(size) || 
      maxSize === null || maxSize === undefined || isNaN(maxSize) || maxSize === 0) {
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
  
  const ratio = size / maxSize;
  
  if (ratio > 0.8) return 'bg-red-500/20 text-red-300 border-red-500/30';
  if (ratio > 0.6) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  if (ratio > 0.4) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  if (ratio > 0.2) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  
  return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
};
