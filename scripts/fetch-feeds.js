/**
 * AI Radar — Script de récupération des flux RSS
 * Exécuté toutes les 4h via GitHub Actions
 * Génère docs/data/feeds.json
 */

const RSSParser = require("rss-parser");
const fs = require("fs");
const path = require("path");

const parser = new RSSParser({
  timeout: 15000,
  headers: {
    "User-Agent": "AI-Radar/1.0 (RSS Aggregator)",
  },
});

// ── GOOGLE NEWS RSS BASE ────────────────────────────────────────────
const GN = (q) => `https://news.google.com/rss/search?q=${q}&hl=en`;

// ── SOURCES ─────────────────────────────────────────────────────────
const SOURCES = [
  // 🏢 Big Players — Directs
  { name: "Google AI", url: "https://blog.google/technology/ai/rss/", category: "Big Players" },
  { name: "DeepMind", url: "https://deepmind.google/blog/rss.xml", category: "Big Players" },
  { name: "OpenAI", url: "https://openai.com/blog/rss.xml", category: "Big Players" },
  { name: "Apple ML", url: "https://machinelearning.apple.com/rss.xml", category: "Big Players" },
  { name: "NVIDIA", url: "https://blogs.nvidia.com/feed/", category: "Big Players" },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml", category: "Big Players" },
  // 🏢 Big Players — Google News
  { name: "Anthropic", url: GN("Anthropic+Claude+AI+when:7d"), category: "Big Players" },
  { name: "Meta AI", url: GN("%22Meta+AI%22+Llama+when:7d"), category: "Big Players" },
  { name: "Microsoft AI", url: GN("Microsoft+Copilot+AI+when:7d"), category: "Big Players" },
  { name: "Mistral AI", url: GN("Mistral+AI+when:7d"), category: "Big Players" },
  { name: "Perplexity", url: GN("Perplexity+AI+when:7d"), category: "Big Players" },

  // 🎨 Design & Créatif
  { name: "AI Design", url: GN("AI+design+tool+Figma+Canva+when:7d"), category: "Design & Créatif" },
  { name: "AI Image Gen", url: GN("AI+image+generation+DALL-E+Midjourney+when:7d"), category: "Design & Créatif" },

  // 📋 Business & Productivité
  { name: "AI Business", url: GN("AI+business+automation+productivity+when:7d"), category: "Business & Productivité" },
  { name: "AI SaaS", url: GN("AI+SaaS+tool+launch+when:7d"), category: "Business & Productivité" },

  // ⚡ Dev & Optimisation
  { name: "Vercel", url: "https://vercel.com/atom", category: "Dev & Optimisation" },
  { name: "Supabase", url: "https://supabase.com/rss.xml", category: "Dev & Optimisation" },
  { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/", category: "Dev & Optimisation" },
  { name: "Latent Space", url: "https://www.latent.space/feed", category: "Dev & Optimisation" },
  { name: "AI Coding", url: GN("AI+coding+assistant+Cursor+Copilot+when:7d"), category: "Dev & Optimisation" },

  // 🤖 Agents & Automatisation
  { name: "LangChain", url: "https://blog.langchain.dev/rss/", category: "Agents & Automatisation" },
  { name: "AI Agents", url: GN("AI+agents+MCP+automation+when:7d"), category: "Agents & Automatisation" },

  // 🎮 Gaming & Créatif
  { name: "AI Gaming", url: GN("AI+gaming+NPC+generative+music+when:7d"), category: "Gaming & Créatif" },

  // 📱 Produits & Apps
  { name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", category: "Produits & Apps" },
  { name: "The Decoder", url: "https://the-decoder.com/feed/", category: "Produits & Apps" },
  { name: "AI Products", url: GN("ChatGPT+Gemini+Claude+app+update+when:7d"), category: "Produits & Apps" },

  // 🔌 APIs & Intégrations
  { name: "AI APIs", url: GN("AI+API+SDK+endpoint+integration+when:7d"), category: "APIs & Intégrations" },

  // 🛡️ Sécurité & Éthique
  { name: "MIT Tech Review", url: "https://www.technologyreview.com/feed/", category: "Sécurité & Éthique" },
  { name: "AI Regulation", url: GN("AI+regulation+law+EU+AI+Act+when:7d"), category: "Sécurité & Éthique" },
  { name: "AI Safety", url: GN("AI+safety+ethics+bias+deepfake+when:7d"), category: "Sécurité & Éthique" },

  // 💰 Funding & Business
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "Funding & Business" },
  { name: "AI Funding", url: GN("AI+startup+funding+acquisition+raised+when:7d"), category: "Funding & Business" },
  { name: "AI M&A", url: GN("AI+company+acquisition+valuation+IPO+when:7d"), category: "Funding & Business" },

  // 🎓 Tutos & Guides
  { name: "Towards Data Science", url: "https://towardsdatascience.com/feed", category: "Tutos & Guides" },
  { name: "Sebastian Raschka", url: "https://magazine.sebastianraschka.com/feed", category: "Tutos & Guides" },
  { name: "Lilian Weng", url: "https://lilianweng.github.io/index.xml", category: "Tutos & Guides" },
  { name: "AI Tutorials", url: GN("AI+tutorial+guide+how+to+prompting+when:7d"), category: "Tutos & Guides" },
];

// ── HELPERS ──────────────────────────────────────────────────────────

/** Nettoie le HTML des descriptions RSS */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

/** Déduplique par titre normalisé */
function dedup(articles) {
  const seen = new Set();
  return articles.filter((a) => {
    const key = a.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Génère un ID stable pour un article */
function makeId(source, title, link) {
  const base = `${source}::${title}::${link}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// ── MAIN ─────────────────────────────────────────────────────────────

async function fetchAllFeeds() {
  console.log(`🛰️  AI Radar — Début du scan (${SOURCES.length} sources)`);
  console.log(`   ${new Date().toISOString()}\n`);

  const allArticles = [];
  const errors = [];
  const stats = {};

  // Fetch par batch de 6 pour pas surcharger
  const BATCH_SIZE = 6;
  for (let i = 0; i < SOURCES.length; i += BATCH_SIZE) {
    const batch = SOURCES.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (src) => {
        try {
          const feed = await parser.parseURL(src.url);
          const items = (feed.items || []).slice(0, 15).map((item) => ({
            id: makeId(src.name, item.title || "", item.link || ""),
            title: (item.title || "").trim(),
            description: stripHtml(item.contentSnippet || item.content || item.summary || ""),
            link: item.link || "",
            date: item.isoDate || item.pubDate || new Date().toISOString(),
            source: src.name,
            category: src.category,
          }));

          stats[src.name] = items.length;
          return items;
        } catch (err) {
          errors.push({ source: src.name, error: err.message });
          stats[src.name] = 0;
          return [];
        }
      })
    );

    results.forEach((r) => {
      if (r.status === "fulfilled") allArticles.push(...r.value);
    });

    // Petit délai entre les batchs
    if (i + BATCH_SIZE < SOURCES.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Tri par date décroissante + dédup
  allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
  const cleaned = dedup(allArticles);

  // Stats
  console.log(`\n📊 Résultats :`);
  console.log(`   ${cleaned.length} articles (${allArticles.length} avant dédup)`);
  console.log(`   ${Object.keys(stats).filter((k) => stats[k] > 0).length}/${SOURCES.length} sources OK`);
  if (errors.length > 0) {
    console.log(`\n⚠️  Erreurs (${errors.length}) :`);
    errors.forEach((e) => console.log(`   ❌ ${e.source}: ${e.error.slice(0, 80)}`));
  }

  // Catégories count
  const catCount = {};
  cleaned.forEach((a) => {
    catCount[a.category] = (catCount[a.category] || 0) + 1;
  });
  console.log(`\n📁 Par catégorie :`);
  Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`   ${cat}: ${count}`));

  // Écriture du JSON
  const output = {
    lastUpdated: new Date().toISOString(),
    totalArticles: cleaned.length,
    sourcesOk: Object.keys(stats).filter((k) => stats[k] > 0).length,
    sourcesTotal: SOURCES.length,
    errors: errors.map((e) => e.source),
    articles: cleaned,
  };

  const outDir = path.join(__dirname, "..", "docs", "data");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "feeds.json"), JSON.stringify(output, null, 2));

  console.log(`\n✅ Fichier écrit : docs/data/feeds.json`);
  console.log(`   Taille : ${(JSON.stringify(output).length / 1024).toFixed(1)} KB`);
}

fetchAllFeeds().catch((err) => {
  console.error("❌ Erreur fatale :", err);
  process.exit(1);
});
