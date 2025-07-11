import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Trash2, AlertTriangle, Zap } from 'lucide-react';

export function DeleteConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  files = [], 
  isPermanent = false 
}) {
  const [understood, setUnderstood] = useState(false);
  const [permanentDelete, setPermanentDelete] = useState(false);
  const [canDeletePermanently, setCanDeletePermanently] = useState(false);

  // Charger les paramètres de suppression permanente
  useEffect(() => {
    const loadPermanentDeleteSetting = async () => {
      try {
        const setting = await window.electronAPI.getPermanentDeletePermission();
        setCanDeletePermanently(setting);
      } catch (error) {
        console.error('Failed to load permanent delete setting:', error);
        setCanDeletePermanently(false);
      }
    };

    if (isOpen) {
      loadPermanentDeleteSetting();
      setUnderstood(false);
      setPermanentDelete(false);
    }
  }, [isOpen]);

  const isMultipleFiles = Array.isArray(files) && files.length > 1;
  const fileCount = Array.isArray(files) ? files.length : 1;
  const displayFiles = Array.isArray(files) ? files.slice(0, 5) : [files];

  const handleConfirm = () => {
    onConfirm(permanentDelete);
    onClose();
  };

  const handleCancel = () => {
    setUnderstood(false);
    setPermanentDelete(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {isMultipleFiles 
              ? `Vous êtes sur le point de supprimer ${fileCount} fichier(s).`
              : 'Vous êtes sur le point de supprimer ce fichier.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aperçu des fichiers */}
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-medium mb-2">Fichier(s) à supprimer :</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {displayFiles.map((file, index) => (
                <div key={index} className="text-sm text-gray-300 break-all">
                  {typeof file === 'string' ? file : file.path || file.name || 'Fichier inconnu'}
                </div>
              ))}
              {fileCount > 5 && (
                <div className="text-sm text-gray-400 italic">
                  ... et {fileCount - 5} fichier(s) supplémentaire(s)
                </div>
              )}
            </div>
          </div>

          {/* Options de suppression */}
          {canDeletePermanently && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="permanent-delete"
                  checked={permanentDelete}
                  onCheckedChange={setPermanentDelete}
                />
                <label htmlFor="permanent-delete" className="text-yellow-200 text-sm font-medium flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  Suppression permanente (contourne la corbeille)
                </label>
              </div>
              <p className="text-xs text-yellow-300">
                Les fichiers seront définitivement supprimés et ne pourront pas être récupérés.
              </p>
            </div>
          )}

          {/* Confirmation de compréhension */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="understood"
              checked={understood}
              onCheckedChange={setUnderstood}
            />
            <label htmlFor="understood" className="text-white text-sm">
              Je comprends que cette action {permanentDelete ? 'supprimera définitivement' : 'déplacera vers la corbeille'} 
              {isMultipleFiles ? ' ces fichiers' : ' ce fichier'}
            </label>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-white hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!understood}
              className={`${
                permanentDelete 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {permanentDelete ? 'Supprimer définitivement' : 'Déplacer vers la corbeille'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmationDialog;