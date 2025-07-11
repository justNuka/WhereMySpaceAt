import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { formatSize } from '@/lib/formatUtils.js';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

// Limite drastique pour éviter les problèmes de performance
const MAX_CHILDREN_DISPLAY = 20;
const MIN_DISPLAY_PERCENTAGE = 1; // 1% minimum pour afficher un élément

// Fonction pour générer une couleur basée sur le nom du fichier
const generateColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  const color = "00000".substring(0, 6 - c.length) + c;
  return `#${color}`;
};

const TreemapNode = React.memo(({ node, totalSize, onNodeClick, depth = 0 }) => {
  if (!node || node.size === 0) return null;

  const percentage = (node.size / totalSize) * 100;
  const color = generateColor(node.name);

  // Ne pas afficher les enfants si le noeud est trop petit ou trop profond
  if (percentage < MIN_DISPLAY_PERCENTAGE || depth > 3) {
    return (
      <div
        className="treemap-cell border border-gray-700/50 overflow-hidden min-h-[20px] min-w-[20px]"
        style={{ backgroundColor: color, opacity: 0.6 }}
        title={`${node.name} (${formatSize(node.size)}) - ${percentage.toFixed(1)}%`}
      />
    );
  }

  // Si le noeud n'a pas d'enfants, c'est une feuille
  if (!node.children || node.children.length === 0) {
    return (
      <div
        className="treemap-cell border border-gray-800/80 flex items-center justify-center p-1 overflow-hidden cursor-pointer hover:border-white transition-colors min-h-[40px] min-w-[40px]"
        style={{ backgroundColor: `${color}BF` }} // 75% opacity
        onClick={() => onNodeClick(node)}
        title={`${node.name} (${formatSize(node.size)}) - ${percentage.toFixed(1)}%`}
      >
        {percentage > 3 && (
          <div className="text-center text-white text-xs font-medium break-words">
            <div className="truncate">{node.name}</div>
            <div className="text-gray-300">{formatSize(node.size)}</div>
          </div>
        )}
      </div>
    );
  }

  // C'est un conteneur, on affiche ses enfants avec limitation drastique
  const sortedChildren = useMemo(() => {
    return [...node.children]
      .sort((a, b) => b.size - a.size)
      .filter(child => (child.size / totalSize) * 100 >= MIN_DISPLAY_PERCENTAGE)
      .slice(0, MAX_CHILDREN_DISPLAY);
  }, [node.children, totalSize]);

  if (sortedChildren.length === 0) {
    return (
      <div
        className="treemap-cell border border-gray-800/80 flex items-center justify-center p-1 overflow-hidden cursor-pointer hover:border-white transition-colors min-h-[40px] min-w-[40px]"
        style={{ backgroundColor: `${color}BF` }}
        onClick={() => onNodeClick(node)}
        title={`${node.name} (${formatSize(node.size)}) - Pas d'enfants significatifs`}
      >
        <div className="text-center text-white text-xs font-medium break-words">
          <div className="truncate">{node.name}</div>
          <div className="text-gray-300">{formatSize(node.size)}</div>
        </div>
      </div>
    );
  }

  const totalChildrenSize = sortedChildren.reduce((sum, child) => sum + child.size, 0);

  // Détermine si la disposition doit être en ligne ou en colonne
  const isHorizontal = window.innerWidth > window.innerHeight;

  return (
    <div className={`treemap-node flex ${isHorizontal ? 'flex-row' : 'flex-col'} min-h-[40px] min-w-[40px]`}>
      {sortedChildren.map((child, index) => (
        <div
          key={`${child.path}-${index}`}
          style={{ flex: child.size }}
          className="flex min-h-[20px] min-w-[20px]"
        >
          <TreemapNode 
            node={child} 
            totalSize={totalChildrenSize} 
            onNodeClick={onNodeClick} 
            depth={depth + 1}
          />
        </div>
      ))}
    </div>
  );
});

TreemapNode.displayName = 'TreemapNode';

export default function SpaceChart({ data }) {
  const [history, setHistory] = useState([data]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState(data);

  // Gestion du rendu différé
  useEffect(() => {
    if (history.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setCurrentData(history[history.length - 1]);
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [history]);

  const handleNodeClick = useCallback((node) => {
    if (node.children && node.children.length > 0) {
      setHistory(prev => [...prev, node]);
    }
  }, []);

  const handleGoBack = useCallback(() => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    }
  }, [history.length]);

  // Données simplifiées pour l'affichage
  const simplifiedData = useMemo(() => {
    if (!currentData) return null;
    
    // Fonction récursive pour simplifier les données
    const simplifyNode = (node, depth = 0) => {
      if (depth > 3) return null; // Limite la profondeur
      
      const simplified = {
        name: node.name,
        size: node.size,
        path: node.path,
        type: node.type
      };
      
      if (node.children && node.children.length > 0) {
        simplified.children = node.children
          .sort((a, b) => b.size - a.size)
          .slice(0, MAX_CHILDREN_DISPLAY)
          .map(child => simplifyNode(child, depth + 1))
          .filter(Boolean);
      }
      
      return simplified;
    };
    
    return simplifyNode(currentData);
  }, [currentData]);

  if (!data) return null;

  return (
    <Card className="glass-card border-white/10 h-[600px] flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-center mb-4">
          {history.length > 1 && (
            <Button 
              onClick={handleGoBack} 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 mr-4"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          )}
          <div className="text-gray-300 font-mono text-sm truncate">
            {currentData?.path || 'Chargement...'}
          </div>
          <div className="ml-auto text-xs text-gray-400">
            Limité à {MAX_CHILDREN_DISPLAY} éléments par niveau
          </div>
        </div>
        
        <div className="flex-1 w-full h-full bg-gray-900/50 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <span className="ml-2 text-gray-400">Génération de la visualisation...</span>
            </div>
          ) : (
            <TreemapNode 
              node={simplifiedData} 
              totalSize={simplifiedData?.size || 0} 
              onNodeClick={handleNodeClick} 
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}