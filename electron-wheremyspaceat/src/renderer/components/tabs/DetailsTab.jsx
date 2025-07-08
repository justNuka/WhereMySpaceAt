import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import TreeView from '../TreeView.jsx';
import { Search, Filter } from "lucide-react";

export default function DetailsTab({ scanData }) {
  const [minFileSize, setMinFileSize] = useState(0);
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!scanData) {
    return (
      <div className="mt-8 text-center">
        <Card className="glass-card border-white/10 p-8">
          <CardContent className="p-0">
            <p className="text-gray-400">Aucune donnée de scan disponible</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
      {/* Filters */}
      <div className="space-y-6">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">Filtres</h3>
            </div>
            
            <div className="space-y-6">
              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Taille minimale: {minFileSize} MB
                </label>
                <Slider
                  value={[minFileSize]}
                  onValueChange={(value) => setMinFileSize(value[0])}
                  min={0}
                  max={1000}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0 MB</span>
                  <span>1 GB</span>
                </div>
              </div>
              
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type de fichier
                </label>
                <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                  <SelectTrigger className="glass-card border-white/20 text-white">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="folder">Dossiers seulement</SelectItem>
                    <SelectItem value="file">Fichiers seulement</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Vidéos</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nom de fichier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-card border-white/20 text-white pl-10 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tree View */}
      <div className="lg:col-span-3">
        <TreeView 
          data={scanData} 
          minFileSize={minFileSize}
        />
      </div>
    </div>
  );
}