import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import TreeView from '../TreeView.jsx';
import SpaceChart from '../SpaceChart.jsx';
import SimpleChart from '../SimpleChart.jsx';
import { Search, Filter, ListTree, PieChart, BarChart3, Zap } from "lucide-react";
import { Button } from '@/components/ui/button';

export default function DetailsTab({ scanData }) {
  const [view, setView] = useState('explorer'); // 'explorer', 'visual', 'simple'
  const [minFileSize, setMinFileSize] = useState(0);
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estimer la complexité des données
  const dataComplexity = useMemo(() => {
    if (!scanData) return 0;
    
    let totalNodes = 0;
    const countNodes = (node) => {
      totalNodes++;
      if (node.children) {
        node.children.forEach(countNodes);
      }
    };
    countNodes(scanData);
    
    return totalNodes;
  }, [scanData]);

  // Recommander le type de visualisation
  const recommendedView = useMemo(() => {
    if (dataComplexity > 10000) return 'simple';
    if (dataComplexity > 5000) return 'simple';
    return 'visual';
  }, [dataComplexity]);

  // Délai de chargement pour éviter le freeze lors du changement de vue
  useEffect(() => {
    if (scanData && (view === 'visual' || view === 'simple')) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [view, scanData]);

  if (!scanData) {
    return (
      <div className="mt-8 text-center">
        <Card className="glass-card border-white/10 p-8">
          <CardContent className="p-0">
            <p className="text-gray-400">Aucune donnée de scan disponible. Veuillez effectuer un scan d'abord.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <Card className="glass-card border-white/10 p-8">
          <CardContent className="p-0">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Chargement de la vue...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center mb-6">
        <div className="p-1 rounded-lg bg-gray-800/50 flex items-center gap-2">
          <Button 
            onClick={() => setView('explorer')} 
            variant={view === 'explorer' ? 'secondary' : 'ghost'} 
            className="text-white"
          >
            <ListTree className="w-4 h-4 mr-2" />
            Explorateur
          </Button>
          <Button 
            onClick={() => setView('simple')} 
            variant={view === 'simple' ? 'secondary' : 'ghost'} 
            className="text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Graphique Simple
            {recommendedView === 'simple' && (
              <Zap className="w-3 h-3 ml-1 text-yellow-400" title="Recommandé pour ce volume de données" />
            )}
          </Button>
          <Button 
            onClick={() => setView('visual')} 
            variant={view === 'visual' ? 'secondary' : 'ghost'} 
            className="text-white"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Treemap
            {dataComplexity > 10000 && (
              <span className="ml-1 text-xs text-orange-400">(!)</span>
            )}
          </Button>
        </div>
      </div>

      {dataComplexity > 10000 && view === 'visual' && (
        <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg">
          <p className="text-orange-300 text-sm">
            ⚠️ Volume de données important ({dataComplexity.toLocaleString()} éléments). 
            La visualisation Treemap peut être lente. Considérez utiliser le "Graphique Simple" pour de meilleures performances.
          </p>
        </div>
      )}

      {view === 'explorer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-white">Filtres</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Taille minimale: {minFileSize} MB</label>
                    <Slider value={[minFileSize]} onValueChange={(v) => setMinFileSize(v[0])} max={1000} step={10} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type de fichier</label>
                    <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                      <SelectTrigger className="glass-card border-white/20 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="folder">Dossiers</SelectItem>
                        <SelectItem value="file">Fichiers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Recherche</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input type="text" placeholder="Nom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="glass-card border-white/20 text-white pl-10" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Tree View */}
          <div className="lg:col-span-3">
            <TreeView data={scanData} minFileSize={minFileSize} />
          </div>
        </div>
      ) : view === 'simple' ? (
        isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-400">Chargement du graphique...</span>
          </div>
        ) : (
          <SimpleChart data={scanData} />
        )
      ) : (
        isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-400">Génération de la treemap...</span>
          </div>
        ) : (
          <SpaceChart data={scanData} />
        )
      )}
    </div>
  );
}