import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatSize } from '@/lib/formatUtils.js';
import { BarChart3, Maximize2 } from "lucide-react";

export default function VisualTab({ scanData }) {
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

  const getLargestItems = (item, maxItems = 8) => {
    const allItems = [];
    
    const collectItems = (current) => {
      if (current.children) {
        current.children.forEach(collectItems);
      } else {
        allItems.push(current);
      }
    };
    
    collectItems(item);
    
    return allItems
      .sort((a, b) => b.size - a.size)
      .slice(0, maxItems);
  };

  const largestItems = getLargestItems(scanData);
  const totalSize = scanData.size;

  const getTypeData = () => {
    const types = {};
    
    largestItems.forEach(item => {
      const ext = item.name.split('.').pop()?.toLowerCase() || 'other';
      let type = 'Autres';
      
      if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) type = 'Vidéos';
      else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) type = 'Images';
      else if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) type = 'Documents';
      else if (['exe', 'msi', 'app'].includes(ext)) type = 'Applications';
      
      types[type] = (types[type] || 0) + item.size;
    });
    
    return types;
  };

  const typeData = getTypeData();
  const colors = ['bg-red-500/60', 'bg-blue-500/60', 'bg-green-500/60', 'bg-yellow-500/60', 'bg-purple-500/60'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Chart Visualization */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Répartition par type</h3>
            <Select defaultValue="type">
              <SelectTrigger className="glass-card border-white/20 text-white text-sm w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                <SelectItem value="type">Par type</SelectItem>
                <SelectItem value="size">Par taille</SelectItem>
                <SelectItem value="age">Par âge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="h-80 flex items-center justify-center">
            <div className="w-64 h-64 relative">
              {/* Simple pie chart representation */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500/60 via-blue-500/60 to-green-500/60 flex items-center justify-center">
                <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Object.entries(typeData).map(([type, size], index) => (
              <div key={type} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                <span className="text-sm text-gray-400">
                  {type} ({Math.round((size / totalSize) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Treemap */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Carte des tailles</h3>
            <Button
              variant="ghost"
              size="sm"
              className="glass-card text-white hover:bg-white/20"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Plein écran
            </Button>
          </div>
          
          <div className="h-80 relative">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1">
              {largestItems.slice(0, 8).map((item, index) => {
                const sizeRatio = item.size / totalSize;
                const spans = Math.max(1, Math.round(sizeRatio * 8));
                
                return (
                  <div
                    key={index}
                    className={`${colors[index % colors.length]} rounded p-2 flex items-center justify-center text-white text-sm font-medium text-center`}
                    style={{
                      gridColumn: `span ${Math.min(spans, 2)}`,
                      gridRow: `span ${Math.min(spans, 2)}`
                    }}
                  >
                    <div>
                      <div className="truncate">{item.name}</div>
                      <div className="text-xs opacity-75">{formatSize(item.size)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Timeline Chart */}
      <div className="lg:col-span-2">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Évolution de l'espace disque</h3>
              <div className="flex items-center space-x-2">
                {['7 jours', '30 jours', '6 mois'].map((period) => (
                  <Button
                    key={period}
                    variant="ghost"
                    size="sm"
                    className="glass-card text-white hover:bg-white/20"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="h-64 relative">
              {/* Simple line chart representation */}
              <div className="absolute inset-0 flex items-end justify-between px-4">
                {[35, 38, 42, 45, 48, 45].map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-blue-500/60 rounded-t"
                      style={{ height: `${(value / 50) * 100}%` }}
                    />
                    <span className="text-xs text-gray-400 mt-2">
                      {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}