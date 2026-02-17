/**
 * Groq API Summarization Endpoint with Redis Caching
 * Uses Llama 3.1 8B Instant for high-throughput summarization
 * Free tier: 14,400 requests/day (14x more than 70B model)
 * Server-side Redis cache for cross-user deduplication
 */

import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge',
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant'; // 14.4K RPD vs 1K for 70b
const CACHE_TTL_SECONDS = 86400; // 24 hours

// Initialize Redis (lazy - only if env vars present)
let redis = null;
let redisInitFailed = false;
function getRedis() {
  if (redis) return redis;
  if (redisInitFailed) return null;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      redis = new Redis({ url, token });
    } catch (err) {
      console.warn('[Groq] Redis init failed:', err.message);
      redisInitFailed = true;
      return null;
    }
  }
  return redis;
}

// Cache version - increment to bust old caches after breaking changes
const CACHE_VERSION = 'v3';

// Generate cache key from headlines, geoContext, and variant
function getCacheKey(headlines, mode, geoContext = '', variant = 'full') {
  const sorted = headlines.slice(0, 15).sort().join('|');
  const geoHash = geoContext ? ':g' + hashString(geoContext).slice(0, 6) : '';
  const hash = hashString(`${mode}:${sorted}`);
  // Include variant and version to prevent cross-site cache collisions
  return `summary:${CACHE_VERSION}:${variant}:${hash}${geoHash}`;
}

// Simple hash function for cache keys
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Deduplicate similar headlines (same story from different sources)
function deduplicateHeadlines(headlines) {
  const seen = new Set();
  const unique = [];

  for (const headline of headlines) {
    // Normalize: lowercase, remove punctuation, collapse whitespace
    const normalized = headline.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract key words (4+ chars) for similarity check
    const words = new Set(normalized.split(' ').filter(w => w.length >= 4));

    // Check if this headline is too similar to any we've seen
    let isDuplicate = false;
    for (const seenWords of seen) {
      const intersection = [...words].filter(w => seenWords.has(w));
      const similarity = intersection.length / Math.min(words.size, seenWords.size);
      if (similarity > 0.6) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      seen.add(words);
      unique.push(headline);
    }
  }

  return unique;
}

export default async function handler(request) {
  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Groq API key not configured', fallback: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { headlines, mode = 'brief', geoContext = '', variant = 'full' } = await request.json();

    if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
      return new Response(JSON.stringify({ error: 'Headlines array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check Redis cache first
    const redisClient = getRedis();
    const cacheKey = getCacheKey(headlines, mode, geoContext, variant);

    if (redisClient) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached && typeof cached === 'object' && cached.summary) {
          console.log('[Groq] Cache hit:', cacheKey);
          return new Response(JSON.stringify({
            summary: cached.summary,
            model: cached.model || MODEL,
            provider: 'cache',
            cached: true,
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch (cacheError) {
        console.warn('[Groq] Cache read error:', cacheError.message);
      }
    }

    // Deduplicate similar headlines (same story from multiple sources)
    const uniqueHeadlines = deduplicateHeadlines(headlines.slice(0, 15));
    const headlineText = uniqueHeadlines.map((h, i) => `${i + 1}. ${h}`).join('\n');

    let systemPrompt, userPrompt;

    // Include intelligence synthesis context in prompt if available
    const intelSection = geoContext ? `\n\n${geoContext}` : '';

    // Current date context for LLM (models may have outdated knowledge)
    const isTechVariant = variant === 'tech';
    const isPolkamVariant = variant === 'polkam';
    const dateContext = `Current date: ${new Date().toISOString().split('T')[0]}.${isTechVariant ? '' : ' Donald Trump is the current US President (second term, inaugurated Jan 2025).'}`;

    if (mode === 'brief') {
      if (isTechVariant) {
        systemPrompt = `${dateContext}

You receive news headlines from a specific panel/category. Summarize the key development in 2-3 sentences.
Rules:
- Focus ONLY on technology, startups, AI, funding, product launches, or developer news
- Lead with the company/product/technology name
- Start directly: "OpenAI announced...", "A new $50M Series B...", "GitHub released..."
- No bullet points, no meta-commentary`;
      } else if (isPolkamVariant) {
        systemPrompt = `${dateContext} Prabowo Subianto adalah Presiden Indonesia saat ini.

Kamu menerima judul berita dari panel/kategori tertentu. Rangkum perkembangan utama dalam 2-3 kalimat dalam Bahasa Indonesia.
Aturan:
- SELALU tulis dalam Bahasa Indonesia
- Fokus pada topik yang relevan dengan kategori panel
- Mulai langsung dengan subjek: "Pemerintah Indonesia...", "TNI...", "Bank Indonesia..."
- Sebutkan aktor utama dan lokasi secara spesifik
- Jika ada berita internasional, jelaskan dampaknya terhadap Indonesia
- Tidak ada bullet point, tidak ada meta-komentar`;
      } else {
        systemPrompt = `${dateContext}

You receive news headlines from a specific panel/category. Summarize the key development in 2-3 sentences.
Rules:
- Lead with WHAT happened and WHERE - be specific
- Start directly with the subject: "Iran's regime...", "The US Treasury...", "Protests in..."
- Mention key actors by name
- No bullet points, no meta-commentary`;
      }
      userPrompt = isPolkamVariant
        ? `Rangkum berita utama berikut:\n${headlineText}${intelSection}`
        : `Summarize the top stories:\n${headlineText}${intelSection}`;
    } else if (mode === 'analysis') {
      if (isTechVariant) {
        systemPrompt = `${dateContext}

You receive news headlines from a specific panel/category. Analyze the trend in 2-3 sentences.
Rules:
- Focus on technology implications: funding trends, AI developments, market shifts
- Lead with the insight for tech industry
- Connect to startup ecosystem, VC trends, or technical implications`;
      } else if (isPolkamVariant) {
        systemPrompt = `${dateContext} Prabowo Subianto adalah Presiden Indonesia saat ini.

Kamu menerima judul berita dari panel/kategori tertentu. Berikan analisis dalam 2-3 kalimat dalam Bahasa Indonesia.
Aturan:
- SELALU tulis dalam Bahasa Indonesia
- Mulai dengan insight utama - apa yang signifikan dan mengapa
- Fokus pada dampak terhadap Indonesia: keamanan, ekonomi, geopolitik
- Hubungkan dengan kepentingan nasional Indonesia`;
      } else {
        systemPrompt = `${dateContext}

You receive news headlines from a specific panel/category. Provide analysis in 2-3 sentences.
Rules:
- Lead with the insight - what's significant and why
- Start with substance: "Iran faces...", "The escalation in...", "Multiple signals suggest..."
- Explain WHY the key actors matter
- Connect dots, be specific about implications`;
      }
      userPrompt = isTechVariant
        ? `What's the key tech trend?\n${headlineText}${intelSection}`
        : isPolkamVariant
        ? `Apa pola atau risiko utama?\n${headlineText}${intelSection}`
        : `What's the key pattern or risk?\n${headlineText}${intelSection}`;
    } else {
      systemPrompt = isTechVariant
        ? `${dateContext}\n\nSynthesize these tech headlines in 2 sentences. Focus on startups, AI, funding, products.`
        : isPolkamVariant
        ? `${dateContext} Prabowo Subianto adalah Presiden Indonesia saat ini.\n\nSintesis judul berita berikut dalam 2 kalimat dalam Bahasa Indonesia. Fokus pada dampak terhadap Indonesia.`
        : `${dateContext}\n\nSynthesize these headlines in 2 sentences. Lead with substance.`;
      userPrompt = isPolkamVariant
        ? `Kesimpulan utama:\n${headlineText}${intelSection}`
        : `Key takeaway:\n${headlineText}${intelSection}`;
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Groq] API error:', response.status, errorText);

      // Return fallback signal for rate limiting
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited', fallback: true }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Groq API error', fallback: true }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      return new Response(JSON.stringify({ error: 'Empty response', fallback: true }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Store in Redis cache
    if (redisClient) {
      try {
        await redisClient.set(cacheKey, {
          summary,
          model: MODEL,
          timestamp: Date.now(),
        }, { ex: CACHE_TTL_SECONDS });
        console.log('[Groq] Cached:', cacheKey);
      } catch (cacheError) {
        console.warn('[Groq] Cache write error:', cacheError.message);
      }
    }

    return new Response(JSON.stringify({
      summary,
      model: MODEL,
      provider: 'groq',
      cached: false,
      tokens: data.usage?.total_tokens || 0,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800',
      },
    });

  } catch (error) {
    console.error('[Groq] Error:', error.name, error.message, error.stack?.split('\n')[1]);
    return new Response(JSON.stringify({
      error: error.message,
      errorType: error.name,
      fallback: true
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
