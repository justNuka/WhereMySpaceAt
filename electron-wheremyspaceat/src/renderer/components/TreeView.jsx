import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import { formatSize, formatFileCount } from '@/lib/formatUtils.js';
import { cn } from '@/lib/utils';

function TreeNode({ item, depth, minFileSize }) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  
  // Filter out items smaller than minFileSize
  if (item.size < minFileSize * 1024 * 1024) {
    return null;
  }

  const hasChildren = item.children && item.children.length > 0;
  const isDirectory = item.type === 'directory';
  
  const filteredChildren = item.children?.filter(child => 
    child.size >= minFileSize * 1024 * 1024
  ) || [];

  return (
    <div className="tree-item">
      <div 
        className="p-3 rounded-lg cursor-pointer flex items-center space-x-3"
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
            <span className="text-white font-medium">{item.name}</span>
            <div className="flex items-center space-x-4">
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
      
      {hasChildren && isExpanded && filteredChildren.length > 0 && (
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
  if (!data) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-gray-400">Aucune donnée à afficher</p>
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
        </div>
      </div>
      
      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        <TreeNode item={data} depth={0} minFileSize={minFileSize} />
      </div>
    </div>
  );
}