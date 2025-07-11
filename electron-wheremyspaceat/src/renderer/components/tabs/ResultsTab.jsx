import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatSize, formatFileCount, formatDuration } from '@/lib/formatUtils.js';
import { BarChart3, FileText, Clock, FolderOpen, CheckCircle, Copy, FileSearch, Calendar, Trash2, ExternalLink } from "lucide-react";
import StatsCard from '@/components/StatsCard.jsx';
import { useMemo, useState } from 'react';
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";

export default function ResultsTab({ scanData, scanStats, setScanData }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  const { largestItems, oldestFiles, fileTypeDistribution } = useMemo(() => {
    const allFiles = [];
    const allItems = [];

    const collectItems = (node) => {
      if (!node) return;
      allItems.push(node);
      if (node.type === 'file') {
        allFiles.push(node);
      }
      if (node.children) {
        node.children.forEach(collectItems);
      }
    };

    collectItems(scanData);

    const largest = allItems
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    const oldest = allFiles
      .sort((a, b) => new Date(a.modified) - new Date(b.modified))
      .slice(0, 10);

    const typeDistribution = {};
    allFiles.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      let type = 'Autres';
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg'].includes(ext)) type = 'Images';
      else if (['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) type = 'Vidéos';
      else if (['doc', 'docx', 'pdf', 'txt', 'odt', 'rtf'].includes(ext)) type = 'Documents';
      else if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) type = 'Audio';
      else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) type = 'Archives';
      else if (['exe', 'msi', 'app', 'dmg'].includes(ext)) type = 'Applications';

      if (!typeDistribution[type]) {
        typeDistribution[type] = { size: 0, count: 0 };
      }
      typeDistribution[type].size += file.size;
      typeDistribution[type].count++;
    });

    return { largestItems: largest, oldestFiles: oldest, fileTypeDistribution: typeDistribution };
  }, [scanData]);

  const handleOpenInFolder = (filePath) => {
    if (window.electronAPI) {
      window.electronAPI.showItemInFolder(filePath);
    }
  };

  const handleMoveToTrash = (item) => {
    setItemToDelete(item);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async (item) => {
    if (window.electronAPI) {
      const result = await window.electronAPI.moveToTrash([item.path]);
      if (result.success) {
        console.log(`Moved ${item.path} to trash.`);
        // Here you should update your scanData state to reflect the deletion
        // This is a simple example, you might need a more robust state management solution
        const removeDeletedItem = (node) => {
          if (!node) return null;
          if (node.children) {
            node.children = node.children.filter(child => child.path !== item.path);
            node.children.forEach(removeDeletedItem);
          }
          return node;
        }
        setScanData(prevData => removeDeletedItem(JSON.parse(JSON.stringify(prevData))));
      } else {
        console.error(`Failed to move ${item.path} to trash:`, result.error);
      }
    }
    setDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Summary Cards */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Taille totale"
              value={formatSize(scanStats?.totalSize || 0)}
              icon={<BarChart3 className="w-6 h-6" />}
              iconColor="text-green-400"
              iconBg="bg-green-500/20"
            />
            
            <StatsCard
              title="Fichiers scannés"
              value={(scanStats?.totalFiles || 0).toLocaleString()}
              icon={<FileText className="w-6 h-6" />}
              iconColor="text-blue-400"
              iconBg="bg-blue-500/20"
            />
            
            <StatsCard
              title="Temps de scan"
              value={formatDuration(scanStats?.duration || 0)}
              icon={<Clock className="w-6 h-6" />}
              iconColor="text-purple-400"
              iconBg="bg-purple-500/20"
            />
            
            <StatsCard
              title="Dossiers analysés"
              value={scanStats?.totalDirectories ? scanStats.totalDirectories.toLocaleString() : '0'}
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
                {largestItems.length > 0 ? largestItems.map((item, index) => (
                  <Card key={`${item.path}-${index}`} className="glass-card border-white/10 hover:bg-white/10 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          item.type === 'directory' ? 'bg-blue-500/20' : 'bg-green-500/20'
                        }`}>
                          {item.type === 'directory' ? (
                            <FolderOpen className="w-5 h-5 text-blue-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium break-words">{item.name}</h4>
                          <p className="text-sm text-gray-400 break-all">{item.path}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-white font-semibold">{formatSize(item.size)}</p>
                          {item.type === 'directory' && item.fileCount && (
                            <p className="text-sm text-gray-400">{formatFileCount(item.fileCount)}</p>
                          )}
                          <div className="flex space-x-2 mt-2">
                            <Button size="sm" variant="ghost" onClick={() => handleOpenInFolder(item.path)} title="Ouvrir dans le dossier">
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleMoveToTrash(item)} title="Déplacer vers la corbeille">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <p className="text-gray-400">Aucun élément volumineux trouvé.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column: File Type Distribution & Oldest Files */}
        <div className="space-y-6">
          {/* File Type Distribution */}
          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Répartition par type de fichier</h3>
              <div className="space-y-3">
                {Object.entries(fileTypeDistribution).length > 0 ? Object.entries(fileTypeDistribution).sort(([, a], [, b]) => b.size - a.size).map(([type, data]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-white font-medium">{type} ({data.count} fichiers)</span>
                    <span className="text-gray-300">{formatSize(data.size)}</span>
                  </div>
                )) : (
                  <p className="text-gray-400">Aucune répartition par type de fichier disponible.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Oldest Files */}
          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Fichiers les plus anciens</h3>
              <div className="space-y-4">
                {oldestFiles.length > 0 ? oldestFiles.map((file, index) => (
                  <Card key={`${file.path}-${index}`} className="glass-card border-white/10 hover:bg-white/10 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-500/20">
                          <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium break-words">{file.name}</h4>
                          <p className="text-sm text-gray-400 break-all">{file.path}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-white font-semibold">{new Date(file.modified).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-400">{formatSize(file.size)}</p>
                          <div className="flex space-x-2 mt-2">
                            <Button size="sm" variant="ghost" onClick={() => handleOpenInFolder(file.path)} title="Ouvrir dans le dossier">
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleMoveToTrash(file)} title="Déplacer vers la corbeille">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <p className="text-gray-400">Aucun fichier ancien trouvé.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <DeleteConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        item={itemToDelete}
      />
    </>
  );
}