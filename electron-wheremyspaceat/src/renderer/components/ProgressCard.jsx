import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";
import { formatElapsedTime } from "@/lib/formatUtils.js";

export default function ProgressCard({ 
  progress, 
  isScanning, 
  currentFile, 
  processedFiles,
  onStop,
  elapsedTime 
}) {
  if (!isScanning) return null;

  return (
    <Card className="glass-card border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Progression du scan</h3>
          <Button
            onClick={onStop}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Square className="w-4 h-4 mr-2" />
            Arrêter
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Progression</span>
            <span className="text-white font-semibold">{Math.round(progress)}%</span>
          </div>
          
          <div className="glass-card rounded-full h-2 overflow-hidden">
            <Progress 
              value={progress} 
              className="h-full bg-transparent border-none"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Fichiers traités</span>
              <span className="text-white">{processedFiles.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Temps écoulé</span>
              <span className="text-white">{formatElapsedTime(elapsedTime)}</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-400 truncate" title={currentFile}>
            {currentFile || 'En attente...'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}