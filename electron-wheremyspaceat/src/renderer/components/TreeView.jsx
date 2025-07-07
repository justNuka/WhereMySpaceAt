import React from 'react';
import FileItem from './FileItem';

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

const TreeView = ({ data, minFileSize }) => {
  const [expandedItems, setExpandedItems] = React.useState(
    new Set([data?.path])
  );

  const handleToggle = (path) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  if (!data) {
    return (
      <div className="glass-morphism-dark rounded-2xl p-8 border border-white/10 text-center">
        <p className="text-gray-400">
          Aucune donnée à afficher. Démarrez un scan pour voir les résultats.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-morphism-dark rounded-2xl border border-white/10">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white">
          Structure des Dossiers
        </h2>
        <p className="text-sm text-gray-300">
          Taille totale: {formatSize(data.size)} • {formatFileCount(data.fileCount)}
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto scrollbar-thin p-4">
        <FileItem
          item={data}
          depth={0}
          maxSize={data.size}
          onToggle={handleToggle}
          isExpanded={expandedItems.has(data.path)}
          minSize={minFileSize}
        />
      </div>
    </div>
  );
};

export default TreeView;
