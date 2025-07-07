import React from 'react';
import { Filter, Search, RotateCcw } from 'lucide-react';

const FilterPanel = ({ onMinSizeChange, minSize, scanData }) => {

  const [minSizeInput, setMinSizeInput] = React.useState('');
  const [sizeUnit, setSizeUnit] = React.useState('MB');
  
  React.useEffect(() => {
    if (minSize > 0) {
      const { value, unit } = convertBytesToUnit(minSize);
      setMinSizeInput(value.toString());
      setSizeUnit(unit);
    }
  }, [minSize]);
  
  const convertBytesToUnit = (bytes) => {
    if (bytes >= window.CONSTANTS.SIZE_UNITS.GB) {
      return { value: (bytes / window.CONSTANTS.SIZE_UNITS.GB).toFixed(1), unit: 'GB' };
    }
    if (bytes >= window.CONSTANTS.SIZE_UNITS.MB) {
      return { value: (bytes / window.CONSTANTS.SIZE_UNITS.MB).toFixed(1), unit: 'MB' };
    }
    if (bytes >= window.CONSTANTS.SIZE_UNITS.KB) {
      return { value: (bytes / window.CONSTANTS.SIZE_UNITS.KB).toFixed(1), unit: 'KB' };
    }
    return { value: bytes, unit: 'B' };
  };
  
  const handleApplyFilter = () => {
    const value = parseFloat(minSizeInput) || 0;
    const bytes = value * window.CONSTANTS.SIZE_UNITS[sizeUnit];
    onMinSizeChange(bytes);
  };
  
  const handleReset = () => {
    setMinSizeInput('');
    setSizeUnit('MB');
    onMinSizeChange(0);
  };
  
  const getFilteredCount = () => {
    if (!scanData || !minSize) return null;
    
    let count = 0;
    const countItems = (item) => {
      if (item.size >= minSize) count++;
      if (item.children) {
        item.children.forEach(countItems);
      }
    };
    
    countItems(scanData);
    return count;
  };
  
  const filteredCount = getFilteredCount();
  
  return (
    <div className="glass-morphism-dark rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Filter className="h-5 w-5 mr-2" />
        Filters
      </h2>
      
      <div className="space-y-4">
        {/* Size Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Minimum Size
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={minSizeInput}
              onChange={(e) => setMinSizeInput(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              className="flex-1 px-3 py-2 glass-morphism border border-white/20 rounded-lg 
                       text-white placeholder-gray-400 focus:outline-none focus:border-blue-400
                       transition-colors bg-black/20"
            />
            <select
              value={sizeUnit}
              onChange={(e) => setSizeUnit(e.target.value)}
              className="px-3 py-2 glass-morphism border border-white/20 rounded-lg 
                       text-white focus:outline-none focus:border-blue-400 transition-colors bg-black/20"
            >
              <option value="B">B</option>
              <option value="KB">KB</option>
              <option value="MB">MB</option>
              <option value="GB">GB</option>
            </select>
          </div>
        </div>
        
        {/* Filter Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleApplyFilter}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 
                     bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg 
                     hover:from-green-600 hover:to-blue-600 transition-all duration-200"
          >
            <Search className="h-4 w-4" />
            <span>Apply Filter</span>
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 glass-morphism border border-white/20 rounded-lg 
                     text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        
        {/* Filter Results */}
        {filteredCount !== null && minSize > 0 && (
          <div className="glass-morphism border border-white/20 rounded-lg p-3">
            <p className="text-sm text-gray-300">
              Showing <span className="text-blue-400 font-semibold">{filteredCount}</span> items 
              larger than <span className="text-blue-400 font-semibold">{window.formatSize(minSize)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
