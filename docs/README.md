# 🏠 Fiche Logement App

Prototype d'application web pour la gestion des fiches logement dans le cadre d'activités de conciergerie immobilière pour deux marques françaises (Letahost).

## 🚀 Objectif

Cette app a pour but de remplacer l'actuel formulaire Jotform par une interface moderne, mobile-first, avec sauvegarde des données sur Supabase, et navigation fluide entre sections.

## 🧱 Stack technique

- ⚛️ React + Vite
- 🎨 Tailwind CSS
- 🧠 Supabase (auth + database + storage)
- </> Code source sur GitHub (https://github.com/Julinhio/fiche-logement_ia-githubcopilot-v1/tree/main)
- ☁️ Déployé via Vercel (https://fiche-logement.vercel.app/)

## 🗂 Structure du projet

### 📁 Documentation (`/docs/`)
- `🎨 DESIGN_SYSTEM.md` - Documentation du système de design
- `📋 FEATURE_SPEC.md` - Spécifications des fonctionnalités
- `🏗️ ARCHITECTURE` - Spécifications techniques
- `📊 SUPABASE_INTEGRATION_SPEC.md` - Spécifications d'intégration Supabase
- `📋 PROCESS COMPLET` - Ajouter une nouvelle section au formulaire
- `📸 PLAN UPLOAD PHOTOS` - Specifications de l'upload des photos
- `📸 PLAN UPLOAD PDF` - Specifications de l'upload des fichiers PDF (Logement + Ménage)
- `🐛 Bug Report` - Historique des bugs rencontrés et leurs solutions
- `README.md` - Documentation principale

### 📁 Source (`/src/`)

#### Components (`/components/`)
- `AuthContext.jsx` - Gestion de l'authentification
- `Button.jsx` - Composant bouton réutilisable
- `FormContext.jsx` - Contexte pour la gestion des formulaires
- `ProgressBar.jsx` - Barre de progression
- `ProtectedRoute.jsx` - Routes protégées par authentification
- `SidebarMenu.jsx` - Menu latéral
- `[Les autres composants].jsx` - P. ex: AdmninRoute, PDFUpload, PhotoUpload, PDFTemplate, etc.

#### Pages (`/pages/`)
- `Dashboard.jsx` - Tableau de bord
- `Login.jsx` - Page de connexion
- `FicheLogement.jsx` - Page principale de fiche logement
- `FicheForm.jsx` - Formulaire de fiche
- `FicheWizard.jsx` - Assistant de création de fiche
- `FicheAirbnb.jsx` - Page spécifique Airbnb
- `FicheBooking.jsx` - Page spécifique Booking
- `FicheClefs.jsx` - Page de gestion des clés
- `NotFound.jsx` - Page 404
- `[Les autres pages du formulaire].jsx` - FicheViste, FicheBebe, FicheSecurite, etc.

#### Hooks (`/hooks/`)
- `useFiches.js` - Hook personnalisé pour la gestion des fiches

#### Lib (`/lib/`)
- `supabaseClient.js` - Configuration du client Supabase
- `supabaseHelpers.js` - Fonctions helpers pour Supabase

#### Fichiers principaux
- `App.jsx` - Composant racine de l'application
- `main.jsx` - Point d'entrée JavaScript

### ⚙️ Fichiers de configuration (racine)
- `package.json` et `package-lock.json` - Gestion des dépendances
- `vite.config.js` - Configuration de Vite
- `tailwind.config.js` - Configuration de Tailwind CSS
- `postcss.config.js` - Configuration de PostCSS
- `vercel.json` - Configuration du déploiement Vercel
- `index.html` - Point d'entrée HTML

## 📌 Fonctionnalités principales

- ✅ Formulaire multistep avec navigation par sections
- ✅ Affichage conditionnel des champs selon les réponses
- ✅ Sauvegarde des fiches avec photos dans Supabase
- ✅ Authentification utilisateur
- ✅ Optimisation mobile

## 🔧 Navigation et gestion d'état

### Navigation complexe
- Gestion des étapes via `FormContext` (`currentStep`, `sections`, `goTo()`)
- Différenciation "Mes fiches" vs sections dans `handleClick()`
- Styles conditionnels avec `isActive(index)`

### Gestion d'état
- État du menu mobile avec `useState(false)`
- Fermeture automatique après chaque clic (`setOpen(false)`)
- Navigation vers la page d'accueil (`navigate('/')`)
- Changement d'étape dans le wizard (`goTo(index)`)

### Interface adaptative
- Menu hamburger mobile avec gestion du z-index
- Overlay avec `stopPropagation`
- Sidebar desktop en affichage normal
- Classes conditionnelles pour les styles actifs/inactifs
