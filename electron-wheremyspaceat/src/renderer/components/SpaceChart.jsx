import React, { useState } from 'react';
import { formatSize } from '@/lib/formatUtils.js';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

const TreemapNode = ({ node, totalSize, onNodeClick }) => {
  if (!node || node.size === 0) return null;

  const percentage = (node.size / totalSize) * 100;
  const color = generateColor(node.name);

  // Ne pas afficher les enfants si le noeud est trop petit
  if (percentage < 0.1) {
    return (
      <div
        className="treemap-cell border border-gray-700/50 overflow-hidden"
        style={{ backgroundColor: color, opacity: 0.5 }}
        title={`${node.name} (${formatSize(node.size)}) - Trop petit pour afficher les détails`}
      />
    );
  }

  // Si le noeud n'a pas d'enfants, c'est une feuille
  if (!node.children || node.children.length === 0) {
    return (
      <div
        className="treemap-cell border border-gray-800/80 flex items-center justify-center p-1 overflow-hidden cursor-pointer hover:border-white"
        style={{ backgroundColor: `${color}BF` }} // 75% opacity
        onClick={() => onNodeClick(node)}
        title={`${node.name} (${formatSize(node.size)})`}
      >
        <div className="text-center text-white text-xs font-medium break-words">
          {node.name}
          <br />
          <span className="text-gray-300">{formatSize(node.size)}</span>
        </div>
      </div>
    );
  }

  // C'est un conteneur, on affiche ses enfants
  // On trie les enfants par taille pour la disposition
  const sortedChildren = [...node.children].sort((a, b) => b.size - a.size);
  const totalChildrenSize = sortedChildren.reduce((sum, child) => sum + child.size, 0);

  // Détermine si la disposition doit être en ligne ou en colonne
  const isHorizontal = window.innerWidth > window.innerHeight;

  return (
    <div className={`treemap-node flex ${isHorizontal ? 'flex-row' : 'flex-col'}`}>
      {sortedChildren.map((child, index) => (
        <div
          key={index}
          style={{ flex: child.size }}
          className="flex"
        >
          <TreemapNode node={child} totalSize={totalChildrenSize} onNodeClick={onNodeClick} />
        </div>
      ))}
    </div>
  );
};

export default function SpaceChart({ data }) {
  const [history, setHistory] = useState([data]);
  const currentData = history[history.length - 1];

  const handleNodeClick = (node) => {
    if (node.children && node.children.length > 0) {
      setHistory([...history, node]);
    }
  };

  const handleGoBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };

  if (!data) return null;

  return (
    <Card className="glass-card border-white/10 h-[600px] flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-center mb-4">
          {history.length > 1 && (
            <Button onClick={handleGoBack} variant="ghost" size="sm" className="text-white hover:bg-white/20 mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          )}
          <div className="text-gray-300 font-mono text-sm truncate">
            {currentData.path}
          </div>
        </div>
        <div className="flex-1 w-full h-full bg-gray-900/50 rounded-lg overflow-hidden">
          <TreemapNode node={currentData} totalSize={currentData.size} onNodeClick={handleNodeClick} />
        </div>
      </CardContent>
    </Card>
  );
}