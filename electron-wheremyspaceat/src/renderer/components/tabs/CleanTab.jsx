import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Folder, File, AlertTriangle, Sparkles } from "lucide-react";
import { formatSize } from '@/lib/formatUtils.js';

// --- Helper function to analyze scan data ---
const generateCleaningSuggestions = (scanData) => {
  if (!scanData) return [];

  const suggestions = {
    cache: { title: 'Dossiers de Cache', files: [], totalSize: 0, icon: Folder },
    logs: { title: 'Fichiers de Log', files: [], totalSize: 0, icon: File },
    large: { title: 'Fichiers Volumineux (>500MB)', files: [], totalSize: 0, icon: File },
  };

  const traverse = (node) => {
    if (!node) return;

    const nodeName = node.name.toLowerCase();
    if (node.type === 'directory' && (nodeName.includes('cache') || nodeName.includes('tmp'))) {
      suggestions.cache.files.push(node);
      suggestions.cache.totalSize += node.size;
    } else if (node.type === 'file') {
      if (nodeName.endsWith('.log')) {
        suggestions.logs.files.push(node);
        suggestions.logs.totalSize += node.size;
      }
      if (node.size > 500 * 1024 * 1024) { // > 500 MB
        suggestions.large.files.push(node);
        suggestions.large.totalSize += node.size;
      }
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  };

  traverse(scanData);

  return Object.values(suggestions).filter(s => s.files.length > 0);
};

export default function CleanTab({ scanData, onFilesCleaned }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    const newSuggestions = generateCleaningSuggestions(scanData);
    setSuggestions(newSuggestions);
    setSelectedFiles({}); // Reset selection when scan data changes
  }, [scanData]);

  const handleToggleFile = (suggestionTitle, filePath) => {
    setSelectedFiles(prev => {
      const newSelection = { ...prev };
      if (!newSelection[suggestionTitle]) newSelection[suggestionTitle] = new Set();
      
      if (newSelection[suggestionTitle].has(filePath)) {
        newSelection[suggestionTitle].delete(filePath);
      } else {
        newSelection[suggestionTitle].add(filePath);
      }
      return newSelection;
    });
  };

  const handleToggleSuggestion = (suggestion) => {
    setSelectedFiles(prev => {
      const newSelection = { ...prev };
      const currentSelection = newSelection[suggestion.title] || new Set();
      
      if (currentSelection.size === suggestion.files.length) {
        // All selected, so unselect all
        newSelection[suggestion.title] = new Set();
      } else {
        // Not all selected, so select all
        newSelection[suggestion.title] = new Set(suggestion.files.map(f => f.path));
      }
      return newSelection;
    });
  };

  const { totalSelectedSize, totalSelectedCount, allSelectedPaths } = useMemo(() => {
    let size = 0;
    let count = 0;
    const paths = [];
    for (const title in selectedFiles) {
      const suggestion = suggestions.find(s => s.title === title);
      if (suggestion) {
        for (const path of selectedFiles[title]) {
          const file = suggestion.files.find(f => f.path === path);
          if (file) {
            size += file.size;
            count++;
            paths.push(path);
          }
        }
      }
    }
    return { totalSelectedSize: size, totalSelectedCount: count, allSelectedPaths: paths };
  }, [selectedFiles, suggestions]);

  const handleClean = async () => {
    if (allSelectedPaths.length === 0) return;
    setIsCleaning(true);
    try {
      const result = await window.electronAPI.moveToTrash(allSelectedPaths);
      if (result.success) {
        onFilesCleaned(allSelectedPaths);
      }
    } catch (error) {
      console.error('Failed to clean files:', error);
    } finally {
      setIsCleaning(false);
      setSelectedFiles({});
    }
  };

  if (!scanData) {
    return (
      <div className="mt-8 text-center">
        <Card className="glass-card border-white/10 p-8 max-w-md mx-auto">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold text-white mb-2">Aucune analyse à nettoyer</h3>
            <p className="text-gray-400">Veuillez d'abord effectuer un scan pour obtenir des suggestions de nettoyage.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
      {/* Suggestions List */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold text-white">Suggestions de Nettoyage</h2>
        {suggestions.length > 0 ? (
          <Accordion type="multiple" className="w-full space-y-4">
            {suggestions.map((suggestion) => (
              <AccordionItem key={suggestion.title} value={suggestion.title} className="glass-card border-white/10 rounded-lg">
                <AccordionTrigger className="p-4 hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <Checkbox 
                      checked={selectedFiles[suggestion.title]?.size === suggestion.files.length}
                      onCheckedChange={() => handleToggleSuggestion(suggestion)}
                      onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling
                    />
                    <suggestion.icon className="w-6 h-6 text-white" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white">{suggestion.title}</p>
                      <p className="text-sm text-gray-400">{suggestion.files.length} éléments trouvés</p>
                    </div>
                    <p className="text-lg font-bold text-cyan-400">{formatSize(suggestion.totalSize)}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 border-t border-white/10 max-h-96 overflow-y-auto">
                  {suggestion.files.map(file => (
                    <div key={file.path} className="flex items-center gap-4 p-2 rounded-md hover:bg-white/5">
                      <Checkbox 
                        checked={selectedFiles[suggestion.title]?.has(file.path)}
                        onCheckedChange={() => handleToggleFile(suggestion.title, file.path)}
                      />
                      <div className="flex-1 truncate">
                        <p className="text-sm text-white font-mono" title={file.path}>{file.path}</p>
                      </div>
                      <p className="text-sm text-gray-300">{formatSize(file.size)}</p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card className="glass-card border-white/10 p-8 text-center">
             <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">Aucune suggestion de nettoyage !</h3>
            <p className="text-gray-400">Votre dossier scanné semble déjà bien propre.</p>
          </Card>
        )}
      </div>

      {/* Summary & Action */}
      <div className="space-y-6">
        <Card className="glass-card border-white/10 sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trash2 className="w-5 h-5" />
              Résumé du Nettoyage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-white">
              <span>Éléments sélectionnés</span>
              <span className="font-bold">{totalSelectedCount}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Espace à libérer</span>
              <span className="font-bold text-cyan-400">{formatSize(totalSelectedSize)}</span>
            </div>
            <div className="border-t border-white/10 pt-4">
              <Button 
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
                disabled={allSelectedPaths.length === 0 || isCleaning}
                onClick={handleClean}
              >
                {isCleaning ? 'Nettoyage en cours...' : `Nettoyer ${totalSelectedCount} éléments`}
              </Button>
            </div>
            <div className="flex items-start gap-2 text-xs text-amber-400 p-3 bg-amber-500/10 rounded-lg mt-2">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <p>Les éléments sélectionnés seront déplacés vers la corbeille du système. Ils ne seront pas supprimés définitivement.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}