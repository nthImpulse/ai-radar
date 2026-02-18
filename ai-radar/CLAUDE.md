# AI Radar — Veille IA pour équipes

## Projet

Dashboard de veille IA qui agrège 37 flux RSS de l'écosystème AI complet. Actualisé automatiquement toutes les 4h via GitHub Actions. Site statique hébergé sur GitHub Pages. Destiné aux équipes pour rester à jour quotidiennement.

## Stack

- **Site** : HTML statique + Tailwind CSS (CDN) + JavaScript vanilla
- **Hosting** : GitHub Pages (depuis /docs)
- **Cron** : GitHub Actions (toutes les 4h)
- **RSS Parsing** : Node.js script avec `rss-parser`
- **State local** : localStorage (lu/non-lu)
- **Langue UI** : Français
- **Coût** : 0$

## Architecture

```
ai-radar/
  .github/
    workflows/
      fetch-feeds.yml     → Cron GitHub Action (toutes les 4h)
  scripts/
    fetch-feeds.js        → Script Node.js : fetch RSS → génère feeds.json
  docs/                   → GitHub Pages root
    index.html            → Dashboard principal (single page)
    data/
      feeds.json          → Données générées par le script (commitées auto)
  package.json            → Dépendances (rss-parser)
  CLAUDE.md
```

## Flow de données

```
GitHub Action (cron 4h)
  → Exécute scripts/fetch-feeds.js
  → Fetch 37 flux RSS en parallèle
  → Parse, déduplique, catégorise
  → Écrit docs/data/feeds.json
  → Git commit + push automatique
  → GitHub Pages sert le site statique mis à jour
```

## Catégories (11)

| # | Catégorie | Emoji | Couleur accent |
|---|---|---|---|
| 1 | Big Players | 🏢 | #3B82F6 (bleu) |
| 2 | Design & Créatif | 🎨 | #EC4899 (rose) |
| 3 | Business & Productivité | 📋 | #F59E0B (ambre) |
| 4 | Dev & Optimisation | ⚡ | #10B981 (émeraude) |
| 5 | Agents & Automatisation | 🤖 | #8B5CF6 (violet) |
| 6 | Gaming & Créatif | 🎮 | #EF4444 (rouge) |
| 7 | Produits & Apps | 📱 | #06B6D4 (cyan) |
| 8 | APIs & Intégrations | 🔌 | #6366F1 (indigo) |
| 9 | Sécurité & Éthique | 🛡️ | #64748B (slate) |
| 10 | Funding & Business | 💰 | #22C55E (vert) |
| 11 | Tutos & Guides | 🎓 | #D946EF (fuchsia) |

## Sources RSS (37 vérifiées le 18 février 2026)

### Flux directs (18)

| Source | URL | Catégorie |
|---|---|---|
| Google AI Blog | `https://blog.google/technology/ai/rss/` | Big Players |
| Google DeepMind | `https://deepmind.google/blog/rss.xml` | Big Players |
| OpenAI Blog | `https://openai.com/blog/rss.xml` | Big Players |
| Apple ML Research | `https://machinelearning.apple.com/rss.xml` | Big Players |
| NVIDIA Blog | `https://blogs.nvidia.com/feed/` | Big Players |
| Hugging Face Blog | `https://huggingface.co/blog/feed.xml` | Big Players |
| Vercel Blog | `https://vercel.com/atom` | Dev & Optimisation |
| Supabase Blog | `https://supabase.com/rss.xml` | Dev & Optimisation |
| LangChain Blog | `https://blog.langchain.dev/rss/` | Agents & Automatisation |
| Simon Willison | `https://simonwillison.net/atom/everything/` | Dev & Optimisation |
| The Verge AI | `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml` | Produits & Apps |
| TechCrunch AI | `https://techcrunch.com/category/artificial-intelligence/feed/` | Funding & Business |
| MIT Tech Review | `https://www.technologyreview.com/feed/` | Sécurité & Éthique |
| The Decoder | `https://the-decoder.com/feed/` | Produits & Apps |
| Towards Data Science | `https://towardsdatascience.com/feed` | Tutos & Guides |
| Latent Space | `https://www.latent.space/feed` | Dev & Optimisation |
| Sebastian Raschka | `https://magazine.sebastianraschka.com/feed` | Tutos & Guides |
| Lilian Weng | `https://lilianweng.github.io/index.xml` | Tutos & Guides |

### Via Google News RSS (19)

| Source | Query | Catégorie |
|---|---|---|
| Anthropic | `Anthropic+Claude+AI+when:7d` | Big Players |
| Meta AI | `%22Meta+AI%22+Llama+when:7d` | Big Players |
| Microsoft AI | `Microsoft+Copilot+AI+when:7d` | Big Players |
| Mistral AI | `Mistral+AI+when:7d` | Big Players |
| Perplexity AI | `Perplexity+AI+when:7d` | Big Players |
| AI Design | `AI+design+tool+Figma+Canva+when:7d` | Design & Créatif |
| AI Image Gen | `AI+image+generation+DALL-E+Midjourney+when:7d` | Design & Créatif |
| AI Business | `AI+business+automation+productivity+when:7d` | Business & Productivité |
| AI SaaS | `AI+SaaS+tool+launch+when:7d` | Business & Productivité |
| AI Coding | `AI+coding+assistant+Cursor+Copilot+when:7d` | Dev & Optimisation |
| AI Agents | `AI+agents+MCP+automation+when:7d` | Agents & Automatisation |
| AI Gaming | `AI+gaming+NPC+generative+music+when:7d` | Gaming & Créatif |
| AI Products | `ChatGPT+Gemini+Claude+app+update+when:7d` | Produits & Apps |
| AI APIs | `AI+API+SDK+endpoint+integration+when:7d` | APIs & Intégrations |
| AI Regulation | `AI+regulation+law+EU+AI+Act+when:7d` | Sécurité & Éthique |
| AI Safety | `AI+safety+ethics+bias+deepfake+when:7d` | Sécurité & Éthique |
| AI Funding | `AI+startup+funding+acquisition+raised+when:7d` | Funding & Business |
| AI M&A | `AI+company+acquisition+valuation+IPO+when:7d` | Funding & Business |
| AI Tutorials | `AI+tutorial+guide+how+to+prompting+when:7d` | Tutos & Guides |

## Features V1

1. **Articles groupés par jour** — aujourd'hui en premier, séparateurs visuels par date
2. **Filtres par catégorie** — 11 catégories, toggle rapide, "Tout" par défaut
3. **Lu / Non-lu** — localStorage, pastille discrète, toggle pour masquer les lus
4. **Section "Cette semaine"** — top 5 articles en haut (sources à forte autorité)
5. **Bouton partage** — copie message formaté Slack/Discord en un clic
6. **Recherche** — filtre textuel instantané par titre ou source
7. **Compteurs** — nombre d'articles par catégorie dans les filtres

## Design

- **Ton** : doux, professionnel, journal quotidien
- **Fond** : #FAFAF9 (warm white), pas blanc pur
- **Texte** : #1C1917 (stone-900)
- **Cartes** : fond blanc, border subtile, ombre douce
- **Typo** : Inter ou system font, lisible, pas monospace
- **Espacement** : généreux, aéré
- **Mobile-first** : responsive
- **Catégories** : pastille colorée + emoji, couleurs douces pas saturées
