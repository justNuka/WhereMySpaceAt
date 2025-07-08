import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatSize, formatFileCount, formatDuration } from '@/lib/formatUtils.js';
import { BarChart3, FileText, Clock, FolderOpen, CheckCircle, Copy, FileSearch } from "lucide-react";
import StatsCard from '@/components/StatsCard.jsx';

export default function ResultsTab({ scanData, scanStats }) {
  if (!scanData || !scanStats) {
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

  // Get largest items from scan data
  const getLargestItems = (item, maxItems = 10) => {
    const allItems = [];
    
    const collectItems = (current) => {
      allItems.push(current);
      if (current.children) {
        current.children.forEach(collectItems);
      }
    };
    
    collectItems(item);
    
    return allItems
      .sort((a, b) => b.size - a.size)
      .slice(0, maxItems);
  };

  const largestItems = getLargestItems(scanData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      {/* Summary Cards */}
      <div className="lg:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Taille totale"
            value={formatSize(scanStats.totalSize)}
            icon={<BarChart3 className="w-6 h-6" />}
            iconColor="text-green-400"
            iconBg="bg-green-500/20"
          />
          
          <StatsCard
            title="Fichiers scannés"
            value={scanStats.totalFiles.toLocaleString()}
            icon={<FileText className="w-6 h-6" />}
            iconColor="text-blue-400"
            iconBg="bg-blue-500/20"
          />
          
          <StatsCard
            title="Temps de scan"
            value={formatDuration(scanStats.duration)}
            icon={<Clock className="w-6 h-6" />}
            iconColor="text-purple-400"
            iconBg="bg-purple-500/20"
          />
          
          <StatsCard
            title="Dossiers analysés"
            value={scanStats.totalDirectories ? scanStats.totalDirectories.toLocaleString() : 'N/A'}
            icon={<FolderOpen className="w-6 h-6" />}
            iconColor="text-orange-400"
            iconBg="bg-orange-500/20"
          />
        </div>
      </div>
      
      {/* Top Largest Items */}
      <div className="lg:col-span-2">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Éléments les plus volumineux</h3>
            <div className="space-y-4">
              {largestItems.map((item, index) => (
                <Card key={`${item.path}-${index}`} className="glass-card border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.type === 'directory' ? 'bg-blue-500/20' : 'bg-green-500/20'
                      }`}>
                        {item.type === 'directory' ? (
                          <FolderOpen className="w-5 h-5 text-blue-400" />
                        ) : (
                          <FileText className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-400 truncate">{item.path}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{formatSize(item.size)}</p>
                        {item.type === 'directory' && item.fileCount && (
                          <p className="text-sm text-gray-400">{formatFileCount(item.fileCount)}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-6">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <Button 
                variant="ghost" 
                className="w-full glass-card text-left hover:bg-white/20 p-4 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Nettoyer les fichiers temporaires</p>
                    <p className="text-sm text-gray-400">Libérer de l'espace disque</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full glass-card text-left hover:bg-white/20 p-4 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <FileSearch className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Analyser les doublons</p>
                    <p className="text-sm text-gray-400">Détecter les fichiers dupliqués</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full glass-card text-left hover:bg-white/20 p-4 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Copy className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Exporter le rapport</p>
                    <p className="text-sm text-gray-400">Sauvegarder les résultats</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}