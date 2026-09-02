# TaskFlow 📋

Application de gestion de tâches personnelles, construite avec React et Supabase.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss)
![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify)

🔗 **Démo** : [taskflow-prisca.netlify.app](https://taskflow-prisca.netlify.app)

## Fonctionnalités

- Authentification complète : inscription, connexion, mot de passe oublié, réinitialisation
- Création de tâches avec titre, description, priorité et catégorie
- Dates de début et de fin avec heure, et statut d'échéance calculé automatiquement
- Liste de besoins par tâche
- Dashboard avec statistiques en temps réel
- Graphiques : répartition par catégorie, activité des 7 derniers jours
- Recherche, filtres et tri avancés
- Row Level Security : chaque utilisateur ne voit que ses propres données
- Déploiement continu via Netlify

## Stack technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 19 | Frontend |
| Vite | 8 | Build et serveur de développement |
| React Router | 7 | Navigation multi-pages |
| Supabase | 2 | PostgreSQL + authentification |
| Tailwind CSS | 3 | Styling |
| Recharts | 3 | Graphiques |

## Architecture

```
src/
├── pages/
│   ├── Dashboard.jsx        # Statistiques, graphiques, tâches urgentes
│   ├── Tasks.jsx            # Liste complète et CRUD
│   └── ResetPassword.jsx    # Définition d'un nouveau mot de passe
├── components/
│   ├── Auth.jsx             # Inscription / connexion / mot de passe oublié
│   ├── Layout.jsx           # En-tête et navigation communs
│   └── TaskRow.jsx          # Ligne de tâche avec édition en place
├── context/
│   ├── TasksContext.jsx     # Provider : chargement et état des tâches
│   └── tasks-context.js     # Contexte et hook useTasks
├── lib/
│   └── taskUtils.js         # Constantes partagées et helpers de dates
└── supabase.js              # Client Supabase

supabase/
└── schema.sql               # Table tasks, index et politiques RLS
```

## Installation

```bash
git clone https://github.com/Prisca-SANKARA/taskflow-app.git
cd taskflow-app
npm install
```

Copier `.env.example` en `.env` et renseigner les identifiants du projet
(Supabase → Project Settings → API) :

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Créer la base en exécutant [`supabase/schema.sql`](supabase/schema.sql) dans
Supabase → SQL Editor, puis lancer le serveur de développement :

```bash
npm run dev
```

## Configuration Supabase

Trois réglages dans **Authentication** conditionnent le bon fonctionnement de
l'authentification en production :

- **URL Configuration → Site URL** : l'URL déployée (`https://taskflow-prisca.netlify.app`),
  et non `localhost`. C'est elle qui construit les liens de confirmation et de
  réinitialisation envoyés par email.
- **URL Configuration → Redirect URLs** : ajouter `https://taskflow-prisca.netlify.app/**`
  et `http://localhost:5173/**` pour le développement local.
- **Sign In / Providers → Email → Confirm email** : le service SMTP intégré à
  Supabase est limité à quelques emails par heure et réservé aux tests. Pour une
  démo publique, désactiver la confirmation, ou brancher un SMTP applicatif
  (Resend, Brevo…) dans **Project Settings → Authentication → SMTP Settings**.

## Scripts

| Commande | Effet |
|----------|-------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Analyse ESLint |

---

Développé par [Prisca SANKARA](https://github.com/Prisca-SANKARA)
