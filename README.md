# TaskFlow 📋

Application de gestion de tâches personnelles built with React + Supabase.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss)
![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify)

## Features

- Authentification complète (inscription, connexion, mot de passe oublié)
- Création de tâches avec titre, description, priorité, catégorie
- Date de début et date de fin avec heure
- Liste de besoins par tâche
- Dashboard avec statistiques en temps réel
- Graphiques (répartition par catégorie, activité hebdomadaire)
- Recherche, filtres et tri avancés
- Row Level Security — chaque utilisateur voit uniquement ses données
- Déploiement continu via Netlify

## Stack technique

| Technologie | Usage |
|-------------|-------|
| React 18 + Vite | Frontend |
| React Router v6 | Navigation multi-pages |
| Supabase | Base de données PostgreSQL + Auth |
| Tailwind CSS v3 | Styling |
| Recharts | Graphiques |
| Netlify | Déploiement |

## Architecture
src/
├── pages/
│   ├── Dashboard.jsx    # Stats, graphiques, tâches urgentes
│   └── Tasks.jsx        # Liste complète avec CRUD
├── components/
│   ├── Auth.jsx         # Inscription / Connexion / Reset password
│   ├── Layout.jsx       # Navigation commune
│   └── TaskRow.jsx      # Composant tâche avec édition inline
└── supabase.js          # Client Supabase

## Installation locale

```bash
git clone https://github.com/Prisca-SANKARA/taskflow-app.git
cd taskflow-app
npm install
```

Crée un fichier `.env` :
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

```bash
npm run dev
```

## Démo

🔗 **Live demo** : [taskflow-prisca.netlify.app](https://taskflow-prisca.netlify.app)

---

Built by [Prisca SANKARA](https://github.com/Prisca-SANKARA)