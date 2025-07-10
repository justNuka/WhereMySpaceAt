import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import TreeView from '../TreeView.jsx';
import SpaceChart from '../SpaceChart.jsx'; // Import the new component
import { Search, Filter, ListTree, PieChart } from "lucide-react";
import { Button } from '@/components/ui/button';

export default function DetailsTab({ scanData }) {
  const [view, setView] = useState('explorer'); // 'explorer' or 'visual'
  const [minFileSize, setMinFileSize] = useState(0);
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center mb-6">
        <div className="p-1 rounded-lg bg-gray-800/50 flex items-center gap-2">
          <Button onClick={() => setView('explorer')} variant={view === 'explorer' ? 'secondary' : 'ghost'} className="text-white">
            <ListTree className="w-4 h-4 mr-2" />
            Explorateur
          </Button>
          <Button onClick={() => setView('visual')} variant={view === 'visual' ? 'secondary' : 'ghost'} className="text-white">
            <PieChart className="w-4 h-4 mr-2" />
            Visualisation
          </Button>
        </div>
      </div>

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
      ) : (
        <SpaceChart data={scanData} />
      )}
    </div>
  );
}