import React from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  File, 
  Archive,
  Image,
  Music,
  Video,
  Code
} from 'lucide-react';

const FileItem = ({ item, depth = 0, maxSize, onToggle, isExpanded = false, minSizeFilter }) => {
  
  // Filter by minimum size
  if (minSizeFilter && item.size < minSizeFilter) {
    return null;
  }
  
  const getFileIcon = (fileName, isDirectory) => {
    if (isDirectory) {
      return isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />;
    }
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
      return <Image className="h-4 w-4" />;
    }
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) {
      return <Music className="h-4 w-4" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
      return <Video className="h-4 w-4" />;
    }
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'css', 'html'].includes(ext)) {
      return <Code className="h-4 w-4" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <Archive className="h-4 w-4" />;
    }
    
    return <File className="h-4 w-4" />;
  };
  
  const sizeColor = window.getSizeColor(item.size, maxSize);
  const sizeBadgeClass = window.getSizeBadge(item.size, maxSize);
  
  const hasChildren = item.children && item.children.length > 0;
  const isDirectory = item.type === window.CONSTANTS.FILE_TYPES.DIRECTORY;
  
  return (
    <div className="select-none">
      <div 
        className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 
                   transition-all duration-200 cursor-pointer group
                   ${depth > 0 ? 'ml-' + (depth * 4) : ''}`}
        onClick={() => isDirectory && hasChildren && onToggle(item.path)}
      >
        {/* Expand/Collapse Icon */}
        <div className="w-4 h-4 flex items-center justify-center">
          {isDirectory && hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3 text-gray-400" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-400" />
            )
          ) : null}
        </div>
        
        {/* File/Folder Icon */}
        <div className={`${isDirectory ? 'text-blue-400' : 'text-gray-400'} group-hover:text-white transition-colors`}>
          {getFileIcon(item.name, isDirectory)}
        </div>
        
        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate group-hover:text-blue-300 transition-colors">
            {item.name}
          </p>
          {isDirectory && item.fileCount > 0 && (
            <p className="text-xs text-gray-400">
              {window.formatFileCount(item.fileCount)}
            </p>
          )}
        </div>
        
        {/* Size Badge */}
        <div className={`px-2 py-1 rounded-md border text-xs font-medium ${sizeBadgeClass}`}>
          {window.formatSize(item.size)}
        </div>
        
        {/* Large File Indicator */}
        {item.size > maxSize * 0.1 && (
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        )}
      </div>
      
      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="ml-4 border-l border-white/10 pl-2">
          {item.children
            .filter(child => !minSizeFilter || child.size >= minSizeFilter)
            .map((child) => (
              <FileItem
                key={child.path}
                item={child}
                depth={depth + 1}
                maxSize={maxSize}
                onToggle={onToggle}
                isExpanded={isExpanded}
                minSizeFilter={minSizeFilter}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default FileItem;
