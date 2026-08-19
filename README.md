# Sudoku Couleur

Un sudoku revisité avec des couleurs à la place des chiffres. Même logique, nouvelle expérience visuelle.

## Jouer

- Application web : https://sudoku-couleur.vercel.app
- Google Play Store : bientôt disponible

## Fonctionnalités

### Gameplay
- 3 niveaux de difficulté : Facile (40 cases), Moyen (55 cases), Difficile (65 cases)
- Défi quotidien : une grille unique générée chaque jour, identique pour tous les joueurs
- Système d'aide : 3 aides disponibles par partie (malus sur le score)
- Sauvegarde automatique de la partie en cours
- Reprise de partie possible depuis la page d'accueil

### Score
- Points de base selon le niveau (1000 / 2000 / 3000)
- Multiplicateur de précision selon le nombre d'erreurs
- Bonus de rapidité selon le temps de complétion
- Malus par aide utilisée

### Profil et classement
- Connexion via compte Google
- Choix d'un pseudo personnalisé
- Classement mondial par niveau (Facile / Moyen / Difficile)
- Statistiques personnelles : parties jouées, erreurs totales, meilleurs scores

### Accessibilité et personnalisation
- Mode daltonisme avec palette de couleurs adaptée (palette Wong)
- Disponible en français et anglais (détection automatique de la langue)
- Effet visuel sur les erreurs (animation de tremblement)
- Interface responsive : mobile, tablette et desktop

### Streak
- Compteur de jours consécutifs de jeu
- Se remet à zéro si le joueur ne joue pas pendant plus d'un jour

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite |
| Mobile | Capacitor (Android) |
| Base de données | Firebase Firestore |
| Authentification | Firebase Auth (Google) |
| Hébergement web | Vercel |
| Analytics | Vercel Analytics |
| CI/CD | GitHub Actions |

## Installation et développement

### Prérequis
- Node.js 20+
- Android Studio (pour le build Android)

### Installation

```bash
git clone https://github.com/pierrewozniak/sudoku-couleur.git
cd sudoku-couleur
npm install
```

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...


### Lancer en développement

```bash
npm run dev
```

### Build Android

```bash
npm run build
npx cap sync android
```

Puis dans Android Studio : Build > Generate Signed Bundle / APK

## Architecture du projet :

src/
├── App.jsx # Composant principal et logique de l'app
├── sudoku.js # Algorithmes de génération et validation de grilles
├── storage.js # Gestion du localStorage (scores, parties, statistiques)
├── firestore.js # Interactions avec Firebase Firestore
├── firebase.js # Configuration Firebase
└── translations.js # Traductions FR/EN


## Auteur

Pierre Wozniak  
Développeur Full-Stack en formation (EPSI Lille)  
GitHub : github.com/pierrewozniak