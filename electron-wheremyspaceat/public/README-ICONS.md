# Icônes requises pour la distribution

Pour créer les exécutables, vous devez ajouter les icônes suivantes dans ce dossier :

## Formats requis :
- **icon.ico** (Windows) - 256x256 pixels minimum
- **icon.icns** (macOS) - Format icns avec plusieurs résolutions
- **icon.png** (Linux) - 512x512 pixels minimum

## Comment créer les icônes :

### Option 1 : En ligne
1. Allez sur https://iconverticons.com/online/
2. Uploadez votre image PNG (512x512 recommandé)
3. Téléchargez tous les formats (.ico, .icns, .png)

### Option 2 : Avec electron-icon-builder
```bash
npm install -g electron-icon-builder
electron-icon-builder --input=./icon-source.png --output=./public/
```

### Option 3 : Manuellement
- **Windows (.ico)** : Utilisez GIMP ou un convertisseur en ligne
- **macOS (.icns)** : Utilisez l'app "Image2icon" ou en ligne de commande
- **Linux (.png)** : Image PNG standard 512x512

## Placement des fichiers :
```
public/
  ├── icon.ico      # Windows
  ├── icon.icns     # macOS  
  └── icon.png      # Linux
```

**Note :** Sans ces icônes, electron-builder utilisera l'icône par défaut d'Electron.
