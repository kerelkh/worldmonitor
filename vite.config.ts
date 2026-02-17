import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import pkg from './package.json';

const VARIANT_META: Record<string, {
  title: string;
  description: string;
  keywords: string;
  url: string;
  siteName: string;
  features: string[];
}> = {
  world: {
    title: 'World Monitor - Real-Time Global Intelligence Dashboard',
    description: 'Real-time global intelligence dashboard with live news, markets, military tracking, infrastructure monitoring, and geopolitical data. OSINT in one view.',
    keywords: 'global intelligence, geopolitical dashboard, world news, market data, military bases, nuclear facilities, undersea cables, conflict zones, real-time monitoring, situation awareness, OSINT, flight tracking, AIS ships, earthquake monitor, protest tracker, power outages, oil prices, government spending, polymarket predictions',
    url: 'https://worldmonitor.app/',
    siteName: 'World Monitor',
    features: [
      'Real-time news aggregation',
      'Stock market tracking',
      'Military flight monitoring',
      'Ship AIS tracking',
      'Earthquake alerts',
      'Protest tracking',
      'Power outage monitoring',
      'Oil price analytics',
      'Government spending data',
      'Prediction markets',
      'Infrastructure monitoring',
      'Geopolitical intelligence',
    ],
  },
  tech: {
    title: 'Tech Monitor - Real-Time AI & Tech Industry Dashboard',
    description: 'Real-time AI and tech industry dashboard tracking tech giants, AI labs, startup ecosystems, funding rounds, and tech events worldwide.',
    keywords: 'tech dashboard, AI industry, startup ecosystem, tech companies, AI labs, venture capital, tech events, tech conferences, cloud infrastructure, datacenters, tech layoffs, funding rounds, unicorns, FAANG, tech HQ, accelerators, Y Combinator, tech news',
    url: 'https://tech.worldmonitor.app/',
    siteName: 'Tech Monitor',
    features: [
      'Tech news aggregation',
      'AI lab tracking',
      'Startup ecosystem mapping',
      'Tech HQ locations',
      'Conference & event calendar',
      'Cloud infrastructure monitoring',
      'Datacenter mapping',
      'Tech layoff tracking',
      'Funding round analytics',
      'Tech stock tracking',
      'Service status monitoring',
    ],
  },
  polkam: {
    title: 'Polkam Monitor - Indonesia Intelligence Dashboard',
    description: 'Real-time Indonesia intelligence and geopolitical monitoring dashboard with live news, economic indicators, energy tracking, and Asia-Pacific analysis.',
    keywords: 'Indonesia intelligence, polkam, geopolitical dashboard, Indonesia news, ASEAN, Asia-Pacific, Indonesian economy, energy monitoring, commodities, Jakarta, Southeast Asia, real-time monitoring',
    url: 'https://polkam.worldmonitor.app/',
    siteName: 'Polkam Monitor',
    features: [
      'Indonesia news aggregation',
      'Live Indonesian TV channels',
      'AI-powered insights',
      'Intel feed monitoring',
      'Asia-Pacific analysis',
      'Indonesian economic indicators',
      'Energy & resources tracking',
      'Commodities monitoring',
      'Market tracking',
      'Financial news',
      'Geopolitical map',
    ],
  },
};

function htmlVariantPlugin(): Plugin {
  const variant = process.env.VITE_VARIANT || 'world';
  const meta = VARIANT_META[variant] || VARIANT_META.world;

  return {
    name: 'html-variant',
    transformIndexHtml(html) {
      return html
        .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
        .replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${meta.title}" />`)
        .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${meta.description}" />`)
        .replace(/<meta name="keywords" content=".*?" \/>/, `<meta name="keywords" content="${meta.keywords}" />`)
        .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${meta.url}" />`)
        .replace(/<meta name="application-name" content=".*?" \/>/, `<meta name="application-name" content="${meta.siteName}" />`)
        .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${meta.url}" />`)
        .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${meta.title}" />`)
        .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${meta.description}" />`)
        .replace(/<meta property="og:site_name" content=".*?" \/>/, `<meta property="og:site_name" content="${meta.siteName}" />`)
        .replace(/<meta name="twitter:url" content=".*?" \/>/, `<meta name="twitter:url" content="${meta.url}" />`)
        .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${meta.title}" />`)
        .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${meta.description}" />`)
        .replace(/"name": "World Monitor"/, `"name": "${meta.siteName}"`)
        .replace(/"alternateName": "WorldMonitor"/, `"alternateName": "${meta.siteName.replace(' ', '')}"`)
        .replace(/"url": "https:\/\/worldmonitor\.app\/"/, `"url": "${meta.url}"`)
        .replace(/"description": "Real-time global intelligence dashboard with live news, markets, military tracking, infrastructure monitoring, and geopolitical data."/, `"description": "${meta.description}"`)
        .replace(/"featureList": \[[\s\S]*?\]/, `"featureList": ${JSON.stringify(meta.features, null, 8).replace(/\n/g, '\n      ')}`);
    },
  };
}

function rssProxyDevPlugin(): Plugin {
  return {
    name: 'rss-proxy-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/rss-proxy')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const feedUrl = url.searchParams.get('url');

        if (!feedUrl) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing url parameter' }));
          return;
        }

        try {
          const response = await fetch(feedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml, text/xml, */*',
              'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
            },
          });

          const data = await response.text();
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/xml');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(data);
        } catch {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to fetch feed' }));
        }
      });
    },
  };
}

function groqSummarizeDevPlugin(): Plugin {
  return {
    name: 'groq-summarize-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/groq-summarize')) {
          return next();
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Groq API key not configured', fallback: true }));
          return;
        }

        try {
          // Read request body
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.from(chunk));
          }
          const body = JSON.parse(Buffer.concat(chunks).toString());
          const { headlines, mode = 'brief', geoContext = '', variant = 'full' } = body;

          if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Headlines array required' }));
            return;
          }

          const headlineText = headlines.slice(0, 15).map((h: string, i: number) => `${i + 1}. ${h}`).join('\n');
          const intelSection = geoContext ? `\n\n${geoContext}` : '';
          const isTechVariant = variant === 'tech';
          const isPolkamVariant = variant === 'polkam';
          const dateContext = `Current date: ${new Date().toISOString().split('T')[0]}.${isTechVariant ? '' : ' Donald Trump is the current US President (second term, inaugurated Jan 2025).'}`;

          let systemPrompt: string, userPrompt: string;

          if (mode === 'brief') {
            if (isPolkamVariant) {
              systemPrompt = `${dateContext} Prabowo Subianto adalah Presiden Indonesia saat ini.\n\nKamu menerima judul berita dari panel/kategori tertentu. Rangkum perkembangan utama dalam 2-3 kalimat dalam Bahasa Indonesia.\nAturan:\n- SELALU tulis dalam Bahasa Indonesia\n- Fokus pada topik yang relevan dengan kategori panel\n- Mulai langsung dengan subjek\n- Tidak ada bullet point`;
            } else if (isTechVariant) {
              systemPrompt = `${dateContext}\n\nYou receive news headlines from a specific panel/category. Summarize the key development in 2-3 sentences. Focus on technology, startups, AI, funding.`;
            } else {
              systemPrompt = `${dateContext}\n\nYou receive news headlines from a specific panel/category. Summarize the key development in 2-3 sentences. Lead with WHAT happened and WHERE. No bullet points.`;
            }
            userPrompt = isPolkamVariant ? `Rangkum berita utama berikut:\n${headlineText}${intelSection}` : `Summarize the top stories:\n${headlineText}${intelSection}`;
          } else if (mode === 'analysis') {
            if (isPolkamVariant) {
              systemPrompt = `${dateContext} Prabowo Subianto adalah Presiden Indonesia saat ini.\n\nKamu menerima judul berita dari panel/kategori tertentu. Berikan analisis dalam 2-3 kalimat dalam Bahasa Indonesia.\nAturan:\n- SELALU tulis dalam Bahasa Indonesia\n- Fokus pada dampak terhadap Indonesia: keamanan, ekonomi, geopolitik`;
            } else if (isTechVariant) {
              systemPrompt = `${dateContext}\n\nYou receive news headlines from a specific panel/category. Analyze the trend in 2-3 sentences.`;
            } else {
              systemPrompt = `${dateContext}\n\nYou receive news headlines from a specific panel/category. Provide analysis in 2-3 sentences. Be direct and specific.`;
            }
            userPrompt = isPolkamVariant ? `Apa pola atau risiko utama?\n${headlineText}${intelSection}` : isTechVariant ? `What's the key tech trend?\n${headlineText}${intelSection}` : `What's the key pattern or risk?\n${headlineText}${intelSection}`;
          } else {
            systemPrompt = isPolkamVariant
              ? `${dateContext} Prabowo Subianto adalah Presiden Indonesia saat ini.\n\nSintesis judul berita berikut dalam 2 kalimat dalam Bahasa Indonesia. Fokus pada dampak terhadap Indonesia.`
              : `${dateContext}\n\nSynthesize these headlines in 2 sentences. Lead with substance.`;
            userPrompt = isPolkamVariant ? `Kesimpulan utama:\n${headlineText}${intelSection}` : `Key takeaway:\n${headlineText}${intelSection}`;
          }

          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.1-8b-instant',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.3,
              max_tokens: 200,
            }),
          });

          if (!groqResponse.ok) {
            res.statusCode = groqResponse.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Groq API error', fallback: true }));
            return;
          }

          const data = await groqResponse.json() as any;
          const summary = data.choices?.[0]?.message?.content?.trim();

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ summary, model: 'llama-3.1-8b-instant', provider: 'groq', cached: false }));
        } catch {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Groq summarize error', fallback: true }));
        }
      });
    },
  };
}

function finnhubDevPlugin(): Plugin {
  return {
    name: 'finnhub-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/finnhub')) {
          return next();
        }

        const apiKey = process.env.FINNHUB_API_KEY;
        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Finnhub API key not configured' }));
          return;
        }

        try {
          const url = new URL(req.url, 'http://localhost');
          const symbolsParam = url.searchParams.get('symbols');
          if (!symbolsParam) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing symbols parameter' }));
            return;
          }

          const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(s => /^[A-Za-z0-9.^]+$/.test(s)).slice(0, 20);
          const quotes = await Promise.all(
            symbols.map(async (symbol) => {
              try {
                const resp = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`);
                if (!resp.ok) return { symbol, error: `HTTP ${resp.status}` };
                const data = await resp.json();
                if (data.c === 0 && data.h === 0 && data.l === 0) return { symbol, error: 'No data' };
                return { symbol, price: data.c, change: data.d, changePercent: data.dp, high: data.h, low: data.l, open: data.o, previousClose: data.pc, timestamp: data.t };
              } catch {
                return { symbol, error: 'Fetch failed' };
              }
            })
          );

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'public, max-age=30');
          res.end(JSON.stringify({ quotes }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to fetch data' }));
        }
      });
    },
  };
}

function yahooFinanceDevPlugin(): Plugin {
  return {
    name: 'yahoo-finance-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/yahoo-finance')) {
          return next();
        }

        try {
          const url = new URL(req.url, 'http://localhost');
          const symbol = url.searchParams.get('symbol')?.trim().toUpperCase();
          if (!symbol || !/^[A-Za-z0-9.^=\-]+$/.test(symbol)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid or missing symbol' }));
            return;
          }

          const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
          const response = await fetch(yahooUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          const data = await response.text();
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=60');
          res.end(data);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to fetch data' }));
        }
      });
    },
  };
}

function youtubeLivePlugin(): Plugin {
  return {
    name: 'youtube-live',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/youtube/live')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const channel = url.searchParams.get('channel');

        if (!channel) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing channel parameter' }));
          return;
        }

        try {
          // Use YouTube's oEmbed to check if a video is valid/live
          // For now, return null to use fallback - will implement proper detection later
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.end(JSON.stringify({ videoId: null, channel }));
        } catch (error) {
          console.error(`[YouTube Live] Error:`, error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to fetch', videoId: null }));
        }
      });
    },
  };
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [htmlVariantPlugin(), rssProxyDevPlugin(), groqSummarizeDevPlugin(), finnhubDevPlugin(), yahooFinanceDevPlugin(), youtubeLivePlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'd3': ['d3'],
          'topojson': ['topojson-client'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Yahoo Finance API
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
      },
      // CoinGecko API
      '/api/coingecko': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
      },
      // Polymarket API
      '/api/polymarket': {
        target: 'https://gamma-api.polymarket.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/polymarket/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Polymarket proxy error:', err.message);
          });
        },
      },
      // USGS Earthquake API
      '/api/earthquake': {
        target: 'https://earthquake.usgs.gov',
        changeOrigin: true,
        timeout: 30000,
        rewrite: (path) => path.replace(/^\/api\/earthquake/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Earthquake proxy error:', err.message);
          });
        },
      },
      // PizzINT - Pentagon Pizza Index
      '/api/pizzint': {
        target: 'https://www.pizzint.watch',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pizzint/, '/api'),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('PizzINT proxy error:', err.message);
          });
        },
      },
      // FRED Economic Data - handled by Vercel serverless function in prod
      // In dev, we proxy to the API directly with the key from .env
      '/api/fred-data': {
        target: 'https://api.stlouisfed.org',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const seriesId = url.searchParams.get('series_id');
          const start = url.searchParams.get('observation_start');
          const end = url.searchParams.get('observation_end');
          const apiKey = process.env.FRED_API_KEY || '';
          return `/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=10${start ? `&observation_start=${start}` : ''}${end ? `&observation_end=${end}` : ''}`;
        },
      },
      // RSS Feeds - BBC
      '/rss/bbc': {
        target: 'https://feeds.bbci.co.uk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/bbc/, ''),
      },
      // RSS Feeds - Guardian
      '/rss/guardian': {
        target: 'https://www.theguardian.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/guardian/, ''),
      },
      // RSS Feeds - NPR
      '/rss/npr': {
        target: 'https://feeds.npr.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/npr/, ''),
      },
      // RSS Feeds - AP News
      '/rss/apnews': {
        target: 'https://rsshub.app/apnews',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/apnews/, ''),
      },
      // RSS Feeds - Al Jazeera
      '/rss/aljazeera': {
        target: 'https://www.aljazeera.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/aljazeera/, ''),
      },
      // RSS Feeds - CNN
      '/rss/cnn': {
        target: 'http://rss.cnn.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/cnn/, ''),
      },
      // RSS Feeds - Hacker News
      '/rss/hn': {
        target: 'https://hnrss.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/hn/, ''),
      },
      // RSS Feeds - Ars Technica
      '/rss/arstechnica': {
        target: 'https://feeds.arstechnica.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/arstechnica/, ''),
      },
      // RSS Feeds - The Verge
      '/rss/verge': {
        target: 'https://www.theverge.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/verge/, ''),
      },
      // RSS Feeds - CNBC
      '/rss/cnbc': {
        target: 'https://www.cnbc.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/cnbc/, ''),
      },
      // RSS Feeds - MarketWatch
      '/rss/marketwatch': {
        target: 'https://feeds.marketwatch.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/marketwatch/, ''),
      },
      // RSS Feeds - Defense/Intel sources
      '/rss/defenseone': {
        target: 'https://www.defenseone.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/defenseone/, ''),
      },
      '/rss/warontherocks': {
        target: 'https://warontherocks.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/warontherocks/, ''),
      },
      '/rss/breakingdefense': {
        target: 'https://breakingdefense.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/breakingdefense/, ''),
      },
      '/rss/bellingcat': {
        target: 'https://www.bellingcat.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/bellingcat/, ''),
      },
      // RSS Feeds - TechCrunch (layoffs)
      '/rss/techcrunch': {
        target: 'https://techcrunch.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/techcrunch/, ''),
      },
      // Google News RSS
      '/rss/googlenews': {
        target: 'https://news.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/googlenews/, ''),
      },
      // AI Company Blogs
      '/rss/openai': {
        target: 'https://openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/openai/, ''),
      },
      '/rss/anthropic': {
        target: 'https://www.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/anthropic/, ''),
      },
      '/rss/googleai': {
        target: 'https://blog.google',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/googleai/, ''),
      },
      '/rss/deepmind': {
        target: 'https://deepmind.google',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/deepmind/, ''),
      },
      '/rss/huggingface': {
        target: 'https://huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/huggingface/, ''),
      },
      '/rss/techreview': {
        target: 'https://www.technologyreview.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/techreview/, ''),
      },
      '/rss/arxiv': {
        target: 'https://rss.arxiv.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/arxiv/, ''),
      },
      // Government
      '/rss/whitehouse': {
        target: 'https://www.whitehouse.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/whitehouse/, ''),
      },
      '/rss/statedept': {
        target: 'https://www.state.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/statedept/, ''),
      },
      '/rss/state': {
        target: 'https://www.state.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/state/, ''),
      },
      '/rss/defense': {
        target: 'https://www.defense.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/defense/, ''),
      },
      '/rss/justice': {
        target: 'https://www.justice.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/justice/, ''),
      },
      '/rss/cdc': {
        target: 'https://tools.cdc.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/cdc/, ''),
      },
      '/rss/fema': {
        target: 'https://www.fema.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/fema/, ''),
      },
      '/rss/dhs': {
        target: 'https://www.dhs.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/dhs/, ''),
      },
      '/rss/fedreserve': {
        target: 'https://www.federalreserve.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/fedreserve/, ''),
      },
      '/rss/sec': {
        target: 'https://www.sec.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/sec/, ''),
      },
      '/rss/treasury': {
        target: 'https://home.treasury.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/treasury/, ''),
      },
      '/rss/cisa': {
        target: 'https://www.cisa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/cisa/, ''),
      },
      // Think Tanks
      '/rss/brookings': {
        target: 'https://www.brookings.edu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/brookings/, ''),
      },
      '/rss/cfr': {
        target: 'https://www.cfr.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/cfr/, ''),
      },
      '/rss/csis': {
        target: 'https://www.csis.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/csis/, ''),
      },
      // Defense
      '/rss/warzone': {
        target: 'https://www.thedrive.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/warzone/, ''),
      },
      '/rss/defensegov': {
        target: 'https://www.defense.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/defensegov/, ''),
      },
      // Security
      '/rss/krebs': {
        target: 'https://krebsonsecurity.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/krebs/, ''),
      },
      // Finance
      '/rss/yahoonews': {
        target: 'https://finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/yahoonews/, ''),
      },
      // Diplomat
      '/rss/diplomat': {
        target: 'https://thediplomat.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/diplomat/, ''),
      },
      // VentureBeat
      '/rss/venturebeat': {
        target: 'https://venturebeat.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/venturebeat/, ''),
      },
      // Foreign Policy
      '/rss/foreignpolicy': {
        target: 'https://foreignpolicy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/foreignpolicy/, ''),
      },
      // Financial Times
      '/rss/ft': {
        target: 'https://www.ft.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/ft/, ''),
      },
      // Reuters
      '/rss/reuters': {
        target: 'https://www.reutersagency.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss\/reuters/, ''),
      },
      // Cloudflare Radar - Internet outages
      '/api/cloudflare-radar': {
        target: 'https://api.cloudflare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cloudflare-radar/, ''),
      },
      // NGA Maritime Safety Information - Navigation Warnings
      '/api/nga-msi': {
        target: 'https://msi.nga.mil',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nga-msi/, ''),
      },
      // ACLED - Armed Conflict Location & Event Data (protests, riots)
      '/api/acled': {
        target: 'https://acleddata.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/acled/, ''),
      },
      // GDELT GEO 2.0 API - Geolocation endpoint (must come before /api/gdelt)
      '/api/gdelt-geo': {
        target: 'https://api.gdeltproject.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gdelt-geo/, '/api/v2/geo/geo'),
      },
      // GDELT GEO 2.0 API - Global event data
      '/api/gdelt': {
        target: 'https://api.gdeltproject.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gdelt/, ''),
      },
      // AISStream WebSocket proxy for live vessel tracking
      '/ws/aisstream': {
        target: 'wss://stream.aisstream.io',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/ws\/aisstream/, ''),
      },
      // FAA NASSTATUS - Airport delays and closures
      '/api/faa': {
        target: 'https://nasstatus.faa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/faa/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('FAA NASSTATUS proxy error:', err.message);
          });
        },
      },
      // OpenSky Network - Aircraft tracking (military flight detection)
      '/api/opensky': {
        target: 'https://opensky-network.org/api',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/opensky/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('OpenSky proxy error:', err.message);
          });
        },
      },
      // ADS-B Exchange - Military aircraft tracking (backup/supplement)
      '/api/adsb-exchange': {
        target: 'https://adsbexchange.com/api',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/adsb-exchange/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('ADS-B Exchange proxy error:', err.message);
          });
        },
      },
    },
  },
});
