window.formatSize = function(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

window.formatFileCount = function(count) {
  if (count === 0) return '0 files';
  if (count === 1) return '1 file';
  
  if (count < 1000) return `${count} files`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K files`;
  
  return `${(count / 1000000).toFixed(1)}M files`;
};

window.getSizeColor = function(size, maxSize) {
  const ratio = size / maxSize;
  
  if (ratio > 0.8) return 'text-red-400';
  if (ratio > 0.6) return 'text-orange-400';
  if (ratio > 0.4) return 'text-yellow-400';
  if (ratio > 0.2) return 'text-blue-400';
  
  return 'text-gray-400';
};

window.getSizeBadge = function(size, maxSize) {
  const ratio = size / maxSize;
  
  if (ratio > 0.8) return 'bg-red-500/20 text-red-300 border-red-500/30';
  if (ratio > 0.6) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  if (ratio > 0.4) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  if (ratio > 0.2) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  
  return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
};
