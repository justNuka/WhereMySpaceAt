import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { formatSize, formatFileCount } from '@/lib/formatUtils.js';
import { Trash2, Copy, Download, History, ChevronDown, ChevronUp, Eye, Folder } from "lucide-react";

const getIconColor = (type) => {
  switch (type) {
    case 'temp':
      return { icon: 'text-red-400', bg: 'bg-red-500/20' };
    case 'duplicates':
      return { icon: 'text-orange-400', bg: 'bg-orange-500/20' };
    case 'trash':
      return { icon: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    case 'old-downloads':
      return { icon: 'text-blue-400', bg: 'bg-blue-500/20' };
    default:
      return { icon: 'text-gray-400', bg: 'bg-gray-500/20' };
  }
};

export default function CleanTab() {
  const [cleanupItems, setCleanupItems] = useState([]);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [itemDetails, setItemDetails] = useState({});
  const [cleanupProgress, setCleanupProgress] = useState(0);

  useEffect(() => {
    loadCleanupItems();
  }, []);

  const loadCleanupItems = async () => {
    if (window.electronAPI) {
      try {
        const items = await window.electronAPI.scanCleanupItems();
        setCleanupItems(items.map(item => ({ ...item, selected: false })));
      } catch (error) {
        console.error('Failed to load cleanup items:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleItem = (id) => {
    setCleanupItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleExpanded = async (itemId) => {
    const newExpanded = new Set(expandedItems);
    
    if (expandedItems.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
      
      // Charger les détails si pas encore chargés
      if (!itemDetails[itemId] && window.electronAPI) {
        try {
          const details = await window.electronAPI.getCleanupItemDetails(itemId);
          setItemDetails(prev => ({ ...prev, [itemId]: details }));
        } catch (error) {
          console.error('Failed to load item details:', error);
        }
      }
    }
    
    setExpandedItems(newExpanded);
  };

  const getSelectedStats = () => {
    const selected = cleanupItems.filter(item => item.selected);
    const totalSize = selected.reduce((sum, item) => sum + item.size, 0);
    const totalFiles = selected.reduce((sum, item) => sum + item.fileCount, 0);
    return { totalSize, totalFiles };
  };

  const handleCleanup = async () => {
    if (!window.electronAPI) return;
    
    setIsCleaningUp(true);
    setCleanupProgress(0);
    
    try {
      const selectedItems = cleanupItems.filter(item => item.selected);
      
      // Écouter les mises à jour de progression
      const removeProgressListener = window.electronAPI.onCleanupProgress((progress) => {
        setCleanupProgress(progress);
      });
      
      const result = await window.electronAPI.cleanupFiles(selectedItems);
      
      if (result.success) {
        // Recharger les éléments après nettoyage
        await loadCleanupItems();
        setExpandedItems(new Set()); // Fermer tous les éléments expandés
        setItemDetails({}); // Vider le cache des détails
      }
      
      // Nettoyer l'écouteur
      removeProgressListener();
      
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      setIsCleaningUp(false);
      setCleanupProgress(0);
    }
  };

  const selectedStats = getSelectedStats();

  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <Card className="glass-card border-white/10 p-8">
          <CardContent className="p-0">
            <p className="text-gray-400">Analyse des éléments à nettoyer...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      {/* Cleanup Categories */}
      <div className="lg:col-span-2">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Nettoyage recommandé</h3>
              <Button
                onClick={handleCleanup}
                disabled={selectedStats.totalSize === 0 || isCleaningUp}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {isCleaningUp ? `Nettoyage... ${Math.round(cleanupProgress)}%` : 'Nettoyer la sélection'}
              </Button>
            </div>
            
            {/* Barre de progression du nettoyage */}
            {isCleaningUp && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Nettoyage en cours...</span>
                  <span className="text-sm text-white">{Math.round(cleanupProgress)}%</span>
                </div>
                <Progress value={cleanupProgress} className="h-2" />
              </div>
            )}
            
            <div className="space-y-4">
              {cleanupItems.map((item) => {
                const colors = getIconColor(item.type);
                const isExpanded = expandedItems.has(item.id);
                const details = itemDetails[item.id];
                
                return (
                  <Card key={item.id} className="glass-card border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleItem(item.id)}
                          className="w-5 h-5"
                        />
                        
                        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                          <Trash2 className={`w-6 h-6 ${colors.icon}`} />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-400">{item.description}</p>
                          <div className="mt-2 glass-card rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full transition-all duration-300"
                              style={{ 
                                width: `${item.progress}%`,
                                backgroundColor: colors.icon.includes('red') ? '#ef4444' :
                                               colors.icon.includes('orange') ? '#f97316' :
                                               colors.icon.includes('yellow') ? '#eab308' :
                                               '#3b82f6'
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-white font-bold">{formatSize(item.size)}</p>
                          <p className="text-sm text-gray-400">{formatFileCount(item.fileCount)}</p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(item.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      {/* Détails expandés */}
                      {isExpanded && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-white font-medium">Fichiers à supprimer</span>
                          </div>
                          
                          {details ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {details.files.map((file, index) => (
                                <div key={index} className="flex items-center space-x-3 p-2 glass-card rounded">
                                  <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{file.name}</p>
                                    <p className="text-xs text-gray-400">{file.path}</p>
                                  </div>
                                  <span className="text-xs text-gray-400 flex-shrink-0">{formatSize(file.size)}</span>
                                </div>
                              ))}
                              {details.files.length > 10 && (
                                <p className="text-xs text-gray-400 text-center py-2">
                                  ... et {details.totalFiles - 10} autres fichiers
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-gray-400">Chargement des détails...</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Cleanup Summary */}
      <div className="space-y-6">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Résumé du nettoyage</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Espace à libérer</span>
                <span className="text-white font-bold text-xl">
                  {formatSize(selectedStats.totalSize)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Fichiers à supprimer</span>
                <span className="text-white font-semibold">
                  {selectedStats.totalFiles.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Temps estimé</span>
                <span className="text-white font-semibold">2-3 min</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <History className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">Historique</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { time: 'Il y a 2 jours', size: '4.1 GB' },
                { time: 'Il y a 1 semaine', size: '2.8 GB' },
                { time: 'Il y a 2 semaines', size: '1.5 GB' }
              ].map((entry, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Nettoyage terminé</p>
                    <p className="text-xs text-gray-400">{entry.time} - {entry.size} libérés</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}