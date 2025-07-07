import React from 'react';
import Icons from './Icons';

// Fonction utilitaire pour les badges de taille (copié de la démo)
const getSizeBadge = (size, maxSize) => {
  const ratio = size / maxSize;
  if (ratio > 0.8) return "bg-red-500/20 text-red-300 border-red-500/30";
  if (ratio > 0.6) return "bg-orange-500/20 text-orange-300 border-orange-500/30";
  if (ratio > 0.4) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  if (ratio > 0.2) return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  return "bg-gray-500/20 text-gray-300 border-gray-500/30";
};

// Fonction utilitaire pour formater la taille
const formatSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "Ko", "Mo", "Go", "To"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

// Fonction utilitaire pour formater le nombre de fichiers
const formatFileCount = (count) => {
  if (count === 0) return "0 fichiers";
  if (count === 1) return "1 fichier";
  if (count < 1000) return `${count} fichiers`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K fichiers`;
  return `${(count / 1000000).toFixed(1)}M fichiers`;
};

const FileItem = ({
  item,
  depth = 0,
  maxSize,
  onToggle,
  isExpanded,
  minSize,
}) => {
  if (minSize && item.size < minSize) return null;

  const getFileIcon = (fileName, isDirectory) => {
    if (isDirectory) {
      return isExpanded ? <Icons.FolderOpen /> : <Icons.Folder />;
    }
    return <Icons.File />;
  };

  const sizeBadgeClass = getSizeBadge(item.size, maxSize);
  const hasChildren = item.children && item.children.length > 0;
  const isDirectory = item.type === "directory";

  return (
    <div className="select-none">
      <div
        className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 
               transition-all duration-200 cursor-pointer group file-item`}
        style={{ marginLeft: depth * 16 }}
        onClick={() => isDirectory && hasChildren && onToggle(item.path)}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          {isDirectory && hasChildren ? (
            isExpanded ? (
              <Icons.ChevronDown />
            ) : (
              <Icons.ChevronRight />
            )
          ) : null}
        </div>

        <div
          className={`${
            isDirectory ? "text-blue-400" : "text-gray-400"
          } group-hover:text-white transition-colors`}
        >
          {getFileIcon(item.name, isDirectory)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate group-hover:text-blue-300 transition-colors">
            {item.name}
          </p>
          {isDirectory && item.fileCount > 0 && (
            <p className="text-xs text-gray-400">
              {formatFileCount(item.fileCount)}
            </p>
          )}
        </div>

        <div
          className={`px-2 py-1 rounded-md border text-xs font-medium ${sizeBadgeClass}`}
        >
          {formatSize(item.size)}
        </div>

        {item.size > maxSize * 0.1 && (
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4 border-l border-white/10 pl-2">
          {item.children
            .filter((child) => !minSize || child.size >= minSize)
            .map((child) => (
              <FileItem
                key={child.path}
                item={child}
                depth={depth + 1}
                maxSize={maxSize}
                onToggle={onToggle}
                isExpanded={false}
                minSize={minSize}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default FileItem;