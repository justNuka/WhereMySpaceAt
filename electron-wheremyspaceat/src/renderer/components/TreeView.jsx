const TreeView = ({ data, minSizeFilter }) => {
  const [expandedItems, setExpandedItems] = React.useState(new Set());
  
  const handleToggle = (path) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };
  
  const renderItem = (item, depth = 0) => {
    const isExpanded = expandedItems.has(item.path);
    const hasChildren = item.children && item.children.length > 0;
    
    // Filter by minimum size
    if (minSizeFilter && item.size < minSizeFilter) {
      return null;
    }
    
    return (
      <div key={item.path}>
        <window.FileItem
          item={item}
          depth={depth}
          maxSize={data?.size || 0}
          onToggle={handleToggle}
          isExpanded={isExpanded}
          minSizeFilter={minSizeFilter}
        />
        
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {item.children
              .filter(child => !minSizeFilter || child.size >= minSizeFilter)
              .map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  if (!data) {
    return (
      <div className="glass-morphism-dark rounded-2xl p-8 border border-white/10 text-center">
        <p className="text-gray-400">No data to display. Start a scan to see results.</p>
      </div>
    );
  }
  
  return (
    <div className="glass-morphism-dark rounded-2xl border border-white/10">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white">Directory Structure</h2>
        <p className="text-sm text-gray-300">
          Total size: {window.formatSize(data.size)} • {window.formatFileCount(data.fileCount)}
        </p>
      </div>
      
      <div className="max-h-96 overflow-y-auto scrollbar-thin p-4">
        {renderItem(data)}
      </div>
    </div>
  );
};

export default TreeView;
