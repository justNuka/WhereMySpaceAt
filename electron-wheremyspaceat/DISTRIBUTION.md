# Guide de Distribution - WhereMySpaceAt

## 📦 Création des Exécutables

### Commandes disponibles :

```bash
# Build toutes les plateformes
npm run dist

# Build spécifique par plateforme
npm run build:win     # Windows (.exe, .msi)
npm run build:mac     # macOS (.dmg, .zip)
npm run build:linux   # Linux (.AppImage, .deb)

# Build sans distribution (pour test)
npm run pack
```

### 🚀 Processus complet de distribution :

#### 1. Préparer les icônes
Avant de créer les exécutables, ajoutez vos vraies icônes dans `public/` :
- `icon.ico` (Windows)
- `icon.icns` (macOS)  
- `icon.png` (Linux)

#### 2. Build pour votre plateforme actuelle
```bash
# Sur macOS, pour créer un .dmg
npm run build:mac

# Sur Windows, pour créer un .exe
npm run build:win
```

#### 3. Build multi-plateforme (requires Docker/VM)
```bash
# Pour toutes les plateformes
npm run dist
```

### 📁 Fichiers de sortie

Les exécutables seront créés dans `dist-electron/` :

```
dist-electron/
├── WhereMySpaceAt-1.0.0-mac-x64.dmg        # macOS Intel
├── WhereMySpaceAt-1.0.0-mac-arm64.dmg      # macOS Apple Silicon
├── WhereMySpaceAt-1.0.0-win-x64.exe        # Windows 64-bit
├── WhereMySpaceAt-1.0.0-win-ia32.exe       # Windows 32-bit
├── WhereMySpaceAt-1.0.0-linux-x64.AppImage # Linux portable
└── WhereMySpaceAt-1.0.0-linux-x64.deb      # Linux package
```

### 🎯 Pour votre professeur

#### Option 1 : Fichiers directs
1. Créez les exécutables : `npm run build:win` et `npm run build:mac`
2. Uploadez les fichiers `.exe` et `.dmg` sur GitHub Releases
3. Partagez les liens de téléchargement

#### Option 2 : GitHub Releases automatiques
1. Committez tout votre code sur GitHub
2. Créez un tag de version : `git tag v1.0.0 && git push origin v1.0.0`
3. Les builds seront automatiquement créés via GitHub Actions (si configuré)

### 🔧 Configuration avancée

#### Signature des exécutables (optionnel)
Pour la distribution publique, vous pourriez vouloir signer vos exécutables :

**Windows :**
```json
"win": {
  "certificateFile": "path/to/certificate.p12",
  "certificatePassword": "password"
}
```

**macOS :**
```json
"mac": {
  "identity": "Developer ID Application: Your Name"
}
```

### 🚨 Limitations multi-plateforme

- **Sur macOS** : Peut build pour macOS et Linux
- **Sur Windows** : Peut build pour Windows et Linux  
- **Sur Linux** : Peut build pour Linux seulement

Pour créer des builds pour toutes les plateformes depuis une seule machine, utilisez des services CI/CD comme GitHub Actions.

### 📋 Checklist avant distribution

- [ ] Icônes ajoutées dans `public/`
- [ ] Version mise à jour dans `package.json`
- [ ] Tests effectués sur l'app
- [ ] Build de production testée
- [ ] README.md mis à jour
- [ ] Code poussé sur GitHub

### 🔍 Dépannage

**Erreur "Icon not found"** : Ajoutez les vraies icônes dans `public/`
**Erreur de build** : Vérifiez que toutes les dépendances sont installées
**App ne démarre pas** : Vérifiez les logs dans la console de l'app

### 📤 Partage avec GitHub

1. **Créer une release :**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Uploader les fichiers :**
   - Allez sur GitHub > Releases > New Release
   - Choisissez le tag v1.0.0
   - Uploadez les fichiers depuis `dist-electron/`
   - Ajoutez des notes de version

3. **Instructions pour votre prof :**
   ```markdown
   ## Installation
   
   ### Windows
   Téléchargez `WhereMySpaceAt-1.0.0-win-x64.exe` et exécutez-le
   
   ### macOS  
   Téléchargez `WhereMySpaceAt-1.0.0-mac-x64.dmg`, ouvrez-le et glissez l'app dans Applications
   
   ### Linux
   Téléchargez `WhereMySpaceAt-1.0.0-linux-x64.AppImage` et exécutez-le
   ```
