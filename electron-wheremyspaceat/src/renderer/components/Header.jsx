import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Play, Settings, Shield, ShieldCheck } from "lucide-react";

export default function Header({ onNewScan, isScanning }) {
  const [canDeletePermanently, setCanDeletePermanently] = useState(false);
  const [adminStatus, setAdminStatus] = useState({ isAdmin: false, platform: 'unknown' });

  useEffect(() => {
    // Vérifier le statut administrateur au chargement
    const checkAdmin = async () => {
      if (window.electronAPI) {
        try {
          const status = await window.electronAPI.checkAdminPrivileges();
          setAdminStatus(status);
        } catch (error) {
          console.error('Failed to check admin privileges:', error);
        }
      }
    };
    
    const loadPermanentDeleteSetting = async () => {
      if (window.electronAPI) {
        try {
          const setting = await window.electronAPI.getPermanentDeletePermission();
          setCanDeletePermanently(setting);
        } catch (error) {
          console.error('Failed to load permanent delete setting:', error);
        }
      }
    };

    checkAdmin();
    loadPermanentDeleteSetting();
  }, []);

  const handleRelaunchAsAdmin = async () => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.relaunchAsAdmin();
      } catch (error) {
        console.error('Failed to relaunch as admin:', error);
      }
    }
  };

  const getAdminButtonText = () => {
    switch (adminStatus.platform) {
      case 'win32':
      case 'windows':
        return 'Relancer en admin';
      case 'darwin':
        return 'Relancer avec sudo';
      case 'linux':
        return 'Relancer avec sudo';
      default:
        return 'Privilèges élevés';
    }
  };

  const handlePermanentDeleteChange = async (checked) => {
    setCanDeletePermanently(checked);
    if (window.electronAPI) {
      try {
        await window.electronAPI.setPermanentDeletePermission(checked);
      } catch (error) {
        console.error('Failed to set permanent delete permission:', error);
      }
    }
  };

  return (
    <header className="glass-card border-b border-white/10 px-6 py-4 pt-12 sticky top-0 z-[60]" style={{ WebkitAppRegion: 'drag' }}>
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
          
          {!adminStatus.isAdmin && (
            <Button
              onClick={handleRelaunchAsAdmin}
              disabled={isScanning}
              variant="outline"
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 font-semibold"
              title="Relancer avec des privilèges élevés pour un scan complet"
            >
              <Shield className="w-4 h-4 mr-2" />
              <span>{getAdminButtonText()}</span>
            </Button>
          )}
          
          {adminStatus.isAdmin && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">
                Privilèges élevés
              </span>
            </div>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="glass-card text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-white">Paramètres</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="permanent-delete"
                    checked={canDeletePermanently}
                    onCheckedChange={handlePermanentDeleteChange}
                  />
                  <label htmlFor="permanent-delete" className="text-white text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Activer la suppression permanente (contourne la corbeille)
                  </label>
                </div>
                {!adminStatus.isAdmin && (
                  <p className="text-sm text-yellow-400 mt-4">
                    Pour supprimer des fichiers système ou des dossiers protégés, l'application doit être relancée avec des privilèges élevés.
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
