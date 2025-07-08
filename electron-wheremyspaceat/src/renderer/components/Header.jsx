import { Button } from "@/components/ui/button";
import { Search, Play, Settings } from "lucide-react";

export default function Header({ onNewScan, isScanning }) {
  return (
    <header className="glass-card border-b border-white/10 px-6 py-4 pt-12 sticky top-0 z-50" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">WhereMySpaceAt</h1>
            <p className="text-sm text-gray-400">Analyseur d'espace disque</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4" style={{ WebkitAppRegion: 'no-drag' }}>
          <Button
            onClick={onNewScan}
            disabled={isScanning}
            className="bg-white text-black hover:bg-gray-100 font-semibold"
          >
            <Play className="w-4 h-4 mr-2 text-black" />
            <span className="text-black">Nouveau scan</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="glass-card text-white hover:bg-white/20"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}