# fiche-logement IA prototype

# 🏠 Fiche Logement App — Letahost

Prototype d'application web pour la gestion des fiches logement dans le cadre des activités de conciergerie Letahost.

## 🚀 Objectif

Cette app a pour but de remplacer l'actuel formulaire Jotform par une interface moderne, mobile-first, avec sauvegarde des données sur Supabase, et navigation fluide entre sections.

## 🧱 Stack technique

- ⚛️ React + Vite
- 🎨 Tailwind CSS
- 🧠 Supabase (auth + database)
- ☁️ Déployé via Vercel

## 🗂 Structure

- `pages/` : pages thématiques du formulaire (Propriétaire, Logement, Clefs, etc.)
- `components/` : composants partagés (menus, boutons, etc.)
- `lib/` : clients et helpers (ex : `supabaseClient.js`)
- `styles/` : styles globaux
- `App.jsx` : routing principal

## 📌 Fonctionnalités principales (en cours)

- Formulaire multistep avec navigation par sections
- Affichage conditionnel des champs selon les réponses
- Sauvegarde des fiches dans Supabase
- Authentification utilisateur (bientôt)
- Optimisation mobile (prioritaire)

## ▶️ Lancer en local

```bash
npm install
npm run dev

