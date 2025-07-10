import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BarChart3, FileText, Trash2, PieChart } from "lucide-react";

export default function TabNavigation({ activeTab, onTabChange, scanData }) {
  const tabs = [
    { id: 'scanner', label: 'Scanner', icon: Search },
    { id: 'results', label: 'Résultats', icon: BarChart3 },
    { id: 'details', label: 'Détails & Visualisation', icon: PieChart },
    { id: 'clean', label: 'Nettoyer', icon: Trash2 },
  ];

  const getTabStatus = (tabId) => {
    if (tabId === 'scanner') return null;
    if (!scanData) return 'disabled';
    return null;
  };

  return (
    <div className="glass-card border-b border-white/10 p-6 sticky top-0 z-50">
      <div className="flex items-center space-x-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const status = getTabStatus(tab.id);
          const isActive = activeTab === tab.id;
          const isDisabled = status === 'disabled';
          
          return (
            <Button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              variant="ghost"
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : isDisabled 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }
              `}
              disabled={isDisabled}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <Badge variant="secondary" className="bg-white/20 text-white border-none">
                  Actif
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}