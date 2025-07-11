# 🚀 WhereMySpaceAt

<div align="center">
  <img src="electron-wheremyspaceat/public/icon.png" alt="WhereMySpaceAt Logo" width="128" height="128">
  
  **Analyseur d'espace disque moderne et intuitif**
  
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/justNuka/WhereMySpaceAt)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![Electron](https://img.shields.io/badge/Electron-37.2.0-47848F.svg)](https://www.electronjs.org/)
  [![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
  [![Tailwind](https://img.shields.io/badge/Tailwind-3.4+-38B2AC.svg)](https://tailwindcss.com/)
</div>

## 📋 Table des matières

- [🌟 Aperçu](#-aperçu)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🎯 Captures d'écran](#-captures-décran)
- [🔧 Installation](#-installation)
- [🚀 Utilisation](#-utilisation)
- [🏗️ Architecture](#️-architecture)
- [⚙️ Configuration](#️-configuration)
- [📦 Distribution](#-distribution)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## 🌟 Aperçu

WhereMySpaceAt est un analyseur d'espace disque moderne et performant construit avec **Electron**, **React** et **Tailwind CSS**. Il offre une interface utilisateur élégante et intuitive pour analyser l'utilisation de l'espace disque, identifier les gros fichiers et optimiser le stockage.

### 🎯 Objectifs

- **Performance** : Analyse rapide et efficace des disques et dossiers
- **Intuitivité** : Interface utilisateur moderne et facile à utiliser
- **Multiplateforme** : Compatible Windows, macOS et Linux
- **Visualisation** : Graphiques et statistiques détaillées
- **Nettoyage** : Suggestions intelligentes pour libérer de l'espace

## ✨ Fonctionnalités

### 🔍 Scanner

- **Scan complet de disques** : Analyse tous les disques disponibles
- **Scan de dossiers spécifiques** : Analyse ciblée d'un répertoire
- **Scan en temps réel** : Suivi en direct du processus d'analyse
- **Statistiques live** : Nombre de fichiers traités, taille totale, progression
- **Contrôle d'exécution** : Possibilité d'arrêter le scan à tout moment

### 📊 Résultats

- **Statistiques détaillées** : Taille totale, nombre de fichiers, durée du scan
- **Top des plus gros éléments** : Fichiers et dossiers les plus volumineux
- **Temps d'analyse** : Durée précise du processus de scan
- **Récapitulatif visuel** : Cartes d'information avec icônes et couleurs

### 🔎 Détails & Exploration

- **Vue arborescente** : Navigation hiérarchique des dossiers
- **Vue graphique** : Visualisation en graphique circulaire (Pie Chart)
- **Filtres avancés** :
  - Filtrage par taille minimale de fichier
  - Filtrage par type de fichier
  - Recherche textuelle dans les noms
- **Navigation intuitive** : Basculement entre vue explorer et vue visuelle

### 🧹 Nettoyage Intelligent

- **Suggestions automatiques** :
  - Dossiers de cache temporaires
  - Fichiers de logs
  - Fichiers volumineux (+500MB)
- **Sélection multiple** : Choix des éléments à supprimer
- **Calcul d'économie** : Estimation de l'espace libérable
- **Suppression sécurisée** : Confirmation avant suppression

## 🎯 Captures d'écran

### Interface principale
*L'interface moderne avec navigation par onglets*

### Scanner en action
*Analyse en temps réel avec statistiques live*

### Résultats détaillés
*Visualisation des résultats avec graphiques*

### Nettoyage intelligent
*Suggestions automatiques pour libérer de l'espace*

## 🔧 Installation

### Prérequis

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Git**

### Installation depuis les sources

```bash
# Cloner le repository
git clone https://github.com/justNuka/WhereMySpaceAt.git
cd WhereMySpaceAt/electron-wheremyspaceat

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

### Installation des binaires

Téléchargez la dernière version depuis la [page des releases](https://github.com/justNuka/WhereMySpaceAt/releases).

#### Windows
- Téléchargez `WhereMySpaceAt-Setup.exe`
- Exécutez l'installeur

#### macOS
- Téléchargez `WhereMySpaceAt.dmg`
- Glissez l'application dans le dossier Applications

#### Linux
- Téléchargez `WhereMySpaceAt.AppImage`
- Rendez-le exécutable : `chmod +x WhereMySpaceAt.AppImage`
- Exécutez : `./WhereMySpaceAt.AppImage`

## 🚀 Utilisation

### 1. Démarrage de l'analyse

1. **Sélectionnez le type de scan** :
   - **Disque complet** : Analyse un disque entier
   - **Dossier spécifique** : Analyse un répertoire choisi

2. **Choisissez la cible** :
   - Pour un disque : sélectionnez dans la liste des disques détectés
   - Pour un dossier : cliquez sur "Parcourir" pour choisir le répertoire

3. **Lancez l'analyse** :
   - Cliquez sur "Démarrer le scan"
   - Suivez la progression en temps réel

### 2. Analyse des résultats

- **Onglet Résultats** : Consultez les statistiques générales
- **Onglet Détails** : Explorez la structure des fichiers
- **Utilisez les filtres** : Recherchez des fichiers spécifiques

### 3. Nettoyage

- **Onglet Nettoyage** : Consultez les suggestions automatiques
- **Sélectionnez les éléments** à supprimer
- **Confirmez la suppression** pour libérer de l'espace

### 4. Nouvelle analyse

- Cliquez sur "Nouveau scan" pour analyser un autre répertoire
- L'historique précédent sera effacé

## 🏗️ Architecture

### Structure du projet

```
electron-wheremyspaceat/
├── src/
│   ├── main/                    # Process principal Electron
│   │   └── main.js
│   ├── renderer/                # Interface utilisateur React
│   │   ├── App.jsx             # Composant principal
│   │   ├── components/         # Composants React
│   │   │   ├── tabs/          # Onglets de l'application
│   │   │   └── ui/            # Composants UI réutilisables
│   │   ├── hooks/             # Hooks React personnalisés
│   │   └── utils/             # Utilitaires
│   └── workers/               # Workers pour le traitement
├── public/                    # Ressources publiques
├── assets/                    # Icônes et ressources
└── dist/                     # Build de production
```

### Technologies utilisées

- **Frontend** : React 18, Tailwind CSS
- **Backend** : Electron, Node.js
- **Bundling** : Webpack
- **UI Components** : Lucide React (icônes)
- **Build** : Electron Builder

### Composants principaux

#### `App.jsx`
- Composant racine de l'application
- Gestion des onglets et de l'état global
- Coordination entre les différents modules

#### `useScan.js`
- Hook personnalisé pour la gestion des scans
- Interface avec les workers natifs
- Gestion de l'état du scan en temps réel

#### `ScannerTab.jsx`
- Interface de configuration et lancement des scans
- Sélection des disques et dossiers
- Affichage de la progression

#### `ResultsTab.jsx`
- Affichage des résultats de scan
- Statistiques et métriques
- Top des plus gros fichiers

#### `DetailsTab.jsx`
- Exploration détaillée des résultats
- Vue arborescente et graphiques
- Filtres et recherche

#### `CleanTab.jsx`
- Suggestions de nettoyage
- Sélection des éléments à supprimer
- Confirmation et suppression

## ⚙️ Configuration

### Scripts disponibles

```bash
# Développement
npm run dev              # Lance en mode développement
npm run dev:renderer     # Lance uniquement le renderer
npm run dev:main         # Lance uniquement le main process

# Build
npm run build            # Build de production
npm run build:renderer   # Build du renderer seulement
npm run build:electron   # Build complet avec Electron

# Packaging
npm run package-mac      # Package pour macOS
npm run package-win      # Package pour Windows
npm run package-linux    # Package pour Linux
npm run package-all      # Package pour toutes les plateformes

# Distribution
npm run dist             # Crée les installeurs
npm run make             # Utilise Electron Forge
```

### Configuration Webpack

Le projet utilise une configuration Webpack personnalisée pour :
- Transpilation React/JSX avec Babel
- Intégration Tailwind CSS
- Gestion des alias de modules
- Optimisation pour la production

### Configuration Electron

- **App ID** : `com.nuka.wheremyspaceat`
- **Product Name** : WhereMySpaceAt
- **Icônes** : Disponibles pour toutes les plateformes
- **Auto-updater** : Configuré pour les mises à jour automatiques

## 📦 Distribution

### Build de production

```bash
# Build complet
npm run build:renderer && npm run build:electron

# Distribution avec installeurs
npm run dist
```

### Plateformes supportées

- **Windows** : 64-bit et 32-bit
- **macOS** : Intel et Apple Silicon
- **Linux** : 64-bit (AppImage, deb, rpm)

### Configuration des builds

Les builds sont configurés dans `package.json` avec :
- Compression des ressources
- Signature de code (macOS/Windows)
- Création d'installeurs natifs
- Optimisation de la taille

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

### 1. Fork et Clone

```bash
git clone https://github.com/votre-username/WhereMySpaceAt.git
cd WhereMySpaceAt/electron-wheremyspaceat
```

### 2. Créer une branche

```bash
git checkout -b feature/nouvelle-fonctionnalite
```

### 3. Développer

- Respectez les conventions de code existantes
- Ajoutez des tests si nécessaire
- Documentez les nouvelles fonctionnalités

### 4. Tester

```bash
npm run dev    # Test en développement
npm run build  # Test du build
```

### 5. Proposer les changements

```bash
git commit -m "Ajout de la nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

Puis créez une Pull Request sur GitHub.

### Guidelines

- **Code style** : Suivez les conventions ESLint
- **Commits** : Messages clairs et descriptifs
- **Documentation** : Mettez à jour le README si nécessaire
- **Tests** : Assurez-vous que tout fonctionne correctement

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
  <p>Développé avec ❤️ par <a href="https://github.com/justNuka">Nuka</a></p>
  <p>
    <a href="https://github.com/justNuka/WhereMySpaceAt/issues">🐛 Signaler un bug</a> •
    <a href="https://github.com/justNuka/WhereMySpaceAt/discussions">💬 Discussions</a> •
    <a href="https://github.com/justNuka/WhereMySpaceAt/releases">📦 Releases</a>
  </p>
</div>
