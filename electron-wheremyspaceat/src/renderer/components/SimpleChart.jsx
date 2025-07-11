import React, { useState, useMemo } from 'react';
import { formatSize } from '@/lib/formatUtils.js';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Folder, File } from "lucide-react";

// Version ultra-légère pour les gros volumes
export default function SimpleChart({ data }) {
  const [currentLevel, setCurrentLevel] = useState(data);
  const [path, setPath] = useState([data]);

  const topItems = useMemo(() => {
    if (!currentLevel || !currentLevel.children) return [];
    
    return [...currentLevel.children]
      .sort((a, b) => b.size - a.size)
      .slice(0, 15) // Limite à 15 éléments maximum
      .map(item => ({
        ...item,
        percentage: (item.size / currentLevel.size) * 100
      }));
  }, [currentLevel]);

  const handleItemClick = (item) => {
    if (item.children && item.children.length > 0) {
      setCurrentLevel(item);
      setPath([...path, item]);
    }
  };

  const handleGoBack = () => {
    if (path.length > 1) {
      const newPath = path.slice(0, -1);
      setPath(newPath);
      setCurrentLevel(newPath[newPath.length - 1]);
    }
  };

  if (!data) return null;

  return (
    <Card className="glass-card border-white/10 h-[600px] flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-center mb-4">
          {path.length > 1 && (
            <Button 
              onClick={handleGoBack} 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 mr-4"
            >
              ← Retour
            </Button>
          )}
          <div className="text-gray-300 font-mono text-sm truncate">
            {currentLevel.path}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {topItems.map((item, index) => (
            <div
              key={item.path}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                item.children && item.children.length > 0 
                  ? 'hover:bg-white/10 border border-white/20' 
                  : 'hover:bg-white/5 border border-white/10'
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex-shrink-0 mr-3">
                {item.type === 'directory' ? (
                  <Folder className="w-5 h-5 text-blue-400" />
                ) : (
                  <File className="w-5 h-5 text-green-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium truncate">{item.name}</span>
                  <span className="text-gray-300 ml-2">{formatSize(item.size)}</span>
                </div>
                
                {/* Barre de progression */}
                <div className="mt-1 flex items-center">
                  <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {item.children && item.children.length > 0 && (
                <div className="ml-2 text-gray-400">
                  →
                </div>
              )}
            </div>
          ))}
          
          {topItems.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun élément à afficher</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
