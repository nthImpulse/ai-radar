# 🛰️ AI Radar

Veille IA pour ton équipe. 37 sources RSS, 11 catégories, actualisé toutes les 4h.

## Setup (5 minutes)

### 1. Créer le repo GitHub

```bash
git init
git add .
git commit -m "🛰️ AI Radar — initial setup"
gh repo create ai-radar --public --push
```

### 2. Activer GitHub Pages

- Va dans **Settings → Pages**
- Source : **Deploy from a branch**
- Branch : `main`, dossier `/docs`
- Save

### 3. Premier fetch des données

Lance le workflow manuellement :
- Va dans **Actions → 🛰️ AI Radar — Fetch RSS Feeds**
- Clique **Run workflow**

Le cron prendra le relais automatiquement toutes les 4h.

### 4. C'est prêt

Ton dashboard est live sur `https://ton-user.github.io/ai-radar/`

## Commandes locales

```bash
npm install          # Installer les dépendances
npm run fetch        # Lancer un fetch manuellement
```

## Architecture

```
.github/workflows/fetch-feeds.yml  → Cron GitHub Action (4h)
scripts/fetch-feeds.js             → Fetch RSS + génère JSON
docs/index.html                    → Dashboard statique
docs/data/feeds.json               → Données (auto-commitées)
```

## Stack

- **Frontend** : HTML + Tailwind CSS (CDN) + JS vanilla
- **Backend** : Node.js script (GitHub Actions)
- **Hosting** : GitHub Pages
- **Coût** : 0$
