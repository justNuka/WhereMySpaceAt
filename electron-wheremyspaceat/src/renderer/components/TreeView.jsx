import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import { formatSize, formatFileCount } from '@/lib/formatUtils.js';
import { cn } from '@/lib/utils';

// Limite le nombre d'enfants affichés pour éviter les problèmes de performance
const MAX_CHILDREN_DISPLAY = 100;

function TreeNode({ item, depth, minFileSize }) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  
  // Filter out items smaller than minFileSize avec mémorisation
  const filteredChildren = useMemo(() => {
    if (!item.children) return [];
    
    return item.children
      .filter(child => child.size >= minFileSize * 1024 * 1024)
      .sort((a, b) => b.size - a.size) // Trier par taille décroissante
      .slice(0, MAX_CHILDREN_DISPLAY); // Limiter le nombre d'enfants
  }, [item.children, minFileSize]);

  // Early return pour les éléments trop petits
  if (item.size < minFileSize * 1024 * 1024) {
    return null;
  }

  const hasChildren = filteredChildren.length > 0;
  const isDirectory = item.type === 'directory';
  const hasMoreChildren = item.children && item.children.length > filteredChildren.length;

  return (
    <div className="tree-item">
      <div 
        className="p-3 rounded-lg cursor-pointer flex items-center space-x-3 hover:bg-white/5 transition-colors"
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
      >
        {hasChildren && (
          <button className="tree-toggle w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
          </button>
        )}
        
        {!hasChildren && <div className="w-4 h-4" />}
        
        <div className={cn(
          "w-6 h-6 rounded flex items-center justify-center",
          isDirectory ? "bg-blue-500/20" : "bg-green-500/20"
        )}>
          {isDirectory ? (
            <Folder className="w-4 h-4 text-blue-400" />
          ) : (
            <FileText className="w-4 h-4 text-green-400" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <span className="text-white font-medium truncate">{item.name}</span>
              {hasMoreChildren && (
                <span className="text-xs text-yellow-400 ml-2">
                  (+{item.children.length - filteredChildren.length} éléments cachés)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 ml-4">
              {isDirectory && item.fileCount && (
                <span className="text-sm text-gray-400">
                  {formatFileCount(item.fileCount)}
                </span>
              )}
              <span className="text-white font-semibold">
                {formatSize(item.size)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-6 mt-2 space-y-1">
          {filteredChildren.map((child, index) => (
            <TreeNode 
              key={`${child.path}-${index}`}
              item={child} 
              depth={depth + 1}
              minFileSize={minFileSize}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ data, minFileSize = 0 }) {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialiser le TreeView progressivement pour éviter le freeze
  useMemo(() => {
    if (data && !isInitialized) {
      // Petit délai pour permettre le rendu de l'UI
      setTimeout(() => setIsInitialized(true), 50);
    }
  }, [data, isInitialized]);

  if (!data) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-gray-400">Aucune donnée à afficher</p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <p className="text-gray-400">Préparation de l'arborescence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Arborescence des fichiers</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            Taille minimale: {minFileSize} MB
          </span>
          <span className="text-xs text-blue-400">
            (Limité à {MAX_CHILDREN_DISPLAY} éléments par niveau)
          </span>
        </div>
      </div>
      
      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        <TreeNode item={data} depth={0} minFileSize={minFileSize} />
      </div>
    </div>
  );
}