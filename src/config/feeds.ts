import type { Feed } from '@/types';
import { SITE_VARIANT } from './variant';

// Helper to create RSS proxy URL (Vercel)
const rss = (url: string) => `/api/rss-proxy?url=${encodeURIComponent(url)}`;

// Railway proxy for feeds blocked by Vercel IPs (UN News, CISA, etc.)
// Reuses VITE_WS_RELAY_URL which is already configured for AIS/OpenSky
const wsRelayUrl = import.meta.env.VITE_WS_RELAY_URL || '';
const railwayBaseUrl = wsRelayUrl
  ? wsRelayUrl.replace('wss://', 'https://').replace('ws://', 'http://').replace(/\/$/, '')
  : '';
const railwayRss = (url: string) =>
  railwayBaseUrl ? `${railwayBaseUrl}/rss?url=${encodeURIComponent(url)}` : rss(url);

// Source tier system for prioritization (lower = more authoritative)
// Tier 1: Wire services - fastest, most reliable breaking news
// Tier 2: Major outlets - high-quality journalism
// Tier 3: Specialty sources - domain expertise
// Tier 4: Aggregators & blogs - useful but less authoritative
export const SOURCE_TIERS: Record<string, number> = {
  // Tier 1 - Wire Services
  'Reuters': 1,
  'AP News': 1,
  'AFP': 1,
  'Bloomberg': 1,

  // Tier 2 - Major Outlets
  'BBC World': 2,
  'BBC Middle East': 2,
  'Guardian World': 2,
  'Guardian ME': 2,
  'NPR News': 2,
  'CNN World': 2,
  'CNBC': 2,
  'MarketWatch': 2,
  'Al Jazeera': 2,
  'Financial Times': 2,
  'Politico': 2,
  'Reuters World': 1,
  'Reuters Business': 1,
  'OpenAI News': 3,

  // Tier 1 - Official Government & International Orgs
  'White House': 1,
  'State Dept': 1,
  'Pentagon': 1,
  'UN News': 1,
  'CISA': 1,
  'Treasury': 2,
  'DOJ': 2,
  'DHS': 2,
  'CDC': 2,
  'FEMA': 2,

  // Tier 3 - Specialty
  'Defense One': 3,
  'Breaking Defense': 3,
  'The War Zone': 3,
  'Defense News': 3,
  'Janes': 3,
  'Foreign Policy': 3,
  'The Diplomat': 3,
  'Bellingcat': 3,
  'Krebs Security': 3,
  'Federal Reserve': 3,
  'SEC': 3,
  'MIT Tech Review': 3,
  'Ars Technica': 3,
  'Atlantic Council': 3,
  'Foreign Affairs': 3,
  'CrisisWatch': 3,
  'CSIS': 3,
  'RAND': 3,
  'Brookings': 3,
  'Carnegie': 3,
  'IAEA': 1,
  'WHO': 1,
  'UNHCR': 1,
  'Xinhua': 3,
  'TASS': 3,
  'Layoffs.fyi': 3,

  // Tier 2 - Premium Startup/VC Sources
  'Y Combinator Blog': 2,
  'a16z Blog': 2,
  'Sequoia Blog': 2,
  'Crunchbase News': 2,
  'CB Insights': 2,
  'PitchBook News': 2,
  'The Information': 2,

  // Tier 3 - Regional/Specialty Startup Sources
  'EU Startups': 3,
  'Tech.eu': 3,
  'Sifted (Europe)': 3,
  'The Next Web': 3,
  'Tech in Asia': 3,
  'TechCabal (Africa)': 3,
  'Inc42 (India)': 3,
  'YourStory': 3,
  'Paul Graham Essays': 2,
  'Stratechery': 2,
  // Asia - Regional
  'e27 (SEA)': 3,
  'DealStreetAsia': 3,
  'Pandaily (China)': 3,
  '36Kr English': 3,
  'TechNode (China)': 3,
  'China Tech News': 3,
  'The Bridge (Japan)': 3,
  'Japan Tech News': 3,
  'Nikkei Tech': 2,
  'Korea Tech News': 3,
  'KED Global': 3,
  'Entrackr (India)': 3,
  'India Tech News': 3,
  'Taiwan Tech News': 3,
  'GloNewswire (Taiwan)': 4,
  // LATAM
  'LATAM Tech News': 3,
  'Startups.co (LATAM)': 3,
  'Contxto (LATAM)': 3,
  'Brazil Tech News': 3,
  'Mexico Tech News': 3,
  'LATAM Fintech': 3,
  // Africa & MENA
  'Disrupt Africa': 3,
  'Wamda (MENA)': 3,
  'Magnitt': 3,

  // Tier 3 - Think Tanks
  'Brookings Tech': 3,
  'CSIS Tech': 3,
  'MIT Tech Policy': 3,
  'Stanford HAI': 2,
  'AI Now Institute': 3,
  'OECD Digital': 2,
  'Bruegel (EU)': 3,
  'Chatham House Tech': 3,
  'ISEAS (Singapore)': 3,
  'ORF Tech (India)': 3,
  'RIETI (Japan)': 3,
  'Lowy Institute': 3,
  'China Tech Analysis': 3,
  'DigiChina': 2,

  // Tier 3 - Policy Sources
  'Politico Tech': 2,
  'AI Regulation': 3,
  'Tech Antitrust': 3,
  'EFF News': 3,
  'EU Digital Policy': 3,
  'Euractiv Digital': 3,
  'EU Commission Digital': 2,
  'China Tech Policy': 3,
  'UK Tech Policy': 3,
  'India Tech Policy': 3,

  // Tier 2-3 - Podcasts & Newsletters
  'Acquired Podcast': 2,
  'All-In Podcast': 2,
  'a16z Podcast': 2,
  'This Week in Startups': 3,
  'The Twenty Minute VC': 2,
  'Lex Fridman Tech': 3,
  'The Vergecast': 3,
  'Decoder (Verge)': 3,
  'Hard Fork (NYT)': 2,
  'Pivot (Vox)': 2,
  'Benedict Evans': 2,
  'The Pragmatic Engineer': 2,
  'Lenny Newsletter': 2,
  'AI Podcast (NVIDIA)': 3,
  'Gradient Dissent': 3,
  'Eye on AI': 3,
  'How I Built This': 2,
  'Masters of Scale': 2,
  'The Pitch': 3,

  // Tier 4 - Aggregators
  'Hacker News': 4,
  'The Verge': 4,
  'The Verge AI': 4,
  'VentureBeat AI': 4,
  'Yahoo Finance': 4,
  'TechCrunch Layoffs': 4,
  'ArXiv AI': 4,
  'AI News': 4,
  'Layoffs News': 4,
};

export function getSourceTier(sourceName: string): number {
  return SOURCE_TIERS[sourceName] ?? 4; // Default to tier 4 if unknown
}

export type SourceType = 'wire' | 'gov' | 'intel' | 'mainstream' | 'market' | 'tech' | 'other';

export const SOURCE_TYPES: Record<string, SourceType> = {
  // Wire services - fastest, most authoritative
  'Reuters': 'wire', 'Reuters World': 'wire', 'Reuters Business': 'wire',
  'AP News': 'wire', 'AFP': 'wire', 'Bloomberg': 'wire',

  // Government & International Org sources
  'White House': 'gov', 'State Dept': 'gov', 'Pentagon': 'gov',
  'Treasury': 'gov', 'DOJ': 'gov', 'DHS': 'gov', 'CDC': 'gov',
  'FEMA': 'gov', 'Federal Reserve': 'gov', 'SEC': 'gov',
  'UN News': 'gov', 'CISA': 'gov',

  // Intel/Defense specialty
  'Defense One': 'intel', 'Breaking Defense': 'intel', 'The War Zone': 'intel',
  'Defense News': 'intel', 'Janes': 'intel', 'Bellingcat': 'intel', 'Krebs Security': 'intel',
  'Foreign Policy': 'intel', 'The Diplomat': 'intel',
  'Atlantic Council': 'intel', 'Foreign Affairs': 'intel',
  'CrisisWatch': 'intel',
  'CSIS': 'intel', 'RAND': 'intel', 'Brookings': 'intel', 'Carnegie': 'intel',
  'IAEA': 'gov', 'WHO': 'gov', 'UNHCR': 'gov',
  'Xinhua': 'wire', 'TASS': 'wire',

  // Mainstream outlets
  'BBC World': 'mainstream', 'BBC Middle East': 'mainstream',
  'Guardian World': 'mainstream', 'Guardian ME': 'mainstream',
  'NPR News': 'mainstream', 'Al Jazeera': 'mainstream',
  'CNN World': 'mainstream', 'Politico': 'mainstream',

  // Market/Finance
  'CNBC': 'market', 'MarketWatch': 'market', 'Yahoo Finance': 'market',
  'Financial Times': 'market',

  // Tech
  'Hacker News': 'tech', 'Ars Technica': 'tech', 'The Verge': 'tech',
  'The Verge AI': 'tech', 'MIT Tech Review': 'tech', 'TechCrunch Layoffs': 'tech',
  'AI News': 'tech', 'ArXiv AI': 'tech', 'VentureBeat AI': 'tech',
  'Layoffs.fyi': 'tech', 'Layoffs News': 'tech',

  // Regional Tech Startups
  'EU Startups': 'tech', 'Tech.eu': 'tech', 'Sifted (Europe)': 'tech',
  'The Next Web': 'tech', 'Tech in Asia': 'tech', 'e27 (SEA)': 'tech',
  'DealStreetAsia': 'tech', 'Pandaily (China)': 'tech', '36Kr English': 'tech',
  'TechNode (China)': 'tech', 'The Bridge (Japan)': 'tech', 'Nikkei Tech': 'tech',
  'Inc42 (India)': 'tech', 'YourStory': 'tech', 'TechCabal (Africa)': 'tech',
  'Disrupt Africa': 'tech', 'Wamda (MENA)': 'tech', 'Magnitt': 'tech',

  // Think Tanks & Policy
  'Brookings Tech': 'intel', 'CSIS Tech': 'intel', 'Stanford HAI': 'intel',
  'AI Now Institute': 'intel', 'OECD Digital': 'intel', 'Bruegel (EU)': 'intel',
  'Chatham House Tech': 'intel', 'DigiChina': 'intel', 'Lowy Institute': 'intel',
  'EFF News': 'intel', 'Politico Tech': 'intel',

  // Podcasts & Newsletters
  'Acquired Podcast': 'tech', 'All-In Podcast': 'tech', 'a16z Podcast': 'tech',
  'This Week in Startups': 'tech', 'The Twenty Minute VC': 'tech',
  'Hard Fork (NYT)': 'tech', 'Pivot (Vox)': 'tech', 'Stratechery': 'tech',
  'Benedict Evans': 'tech', 'How I Built This': 'tech', 'Masters of Scale': 'tech',
};

export function getSourceType(sourceName: string): SourceType {
  return SOURCE_TYPES[sourceName] ?? 'other';
}

// Propaganda risk assessment for sources (Quick Win #5)
// 'high' = State-controlled media, known to push government narratives
// 'medium' = State-affiliated or known editorial bias toward specific governments
// 'low' = Independent journalism with editorial standards
export type PropagandaRisk = 'low' | 'medium' | 'high';

export interface SourceRiskProfile {
  risk: PropagandaRisk;
  stateAffiliated?: string;
  knownBiases?: string[];
  note?: string;
}

export const SOURCE_PROPAGANDA_RISK: Record<string, SourceRiskProfile> = {
  // High risk - State-controlled media
  'Xinhua': { risk: 'high', stateAffiliated: 'China', note: 'Official CCP news agency' },
  'TASS': { risk: 'high', stateAffiliated: 'Russia', note: 'Russian state news agency' },
  'RT': { risk: 'high', stateAffiliated: 'Russia', note: 'Russian state media, banned in EU' },
  'Sputnik': { risk: 'high', stateAffiliated: 'Russia', note: 'Russian state media' },
  'CGTN': { risk: 'high', stateAffiliated: 'China', note: 'Chinese state broadcaster' },
  'Press TV': { risk: 'high', stateAffiliated: 'Iran', note: 'Iranian state media' },
  'KCNA': { risk: 'high', stateAffiliated: 'North Korea', note: 'North Korean state media' },

  // Medium risk - State-affiliated or known bias
  'Al Jazeera': { risk: 'medium', stateAffiliated: 'Qatar', note: 'Qatari state-funded, independent editorial' },
  'Al Arabiya': { risk: 'medium', stateAffiliated: 'Saudi Arabia', note: 'Saudi-owned, reflects Gulf perspective' },
  'TRT World': { risk: 'medium', stateAffiliated: 'Turkey', note: 'Turkish state broadcaster' },
  'France 24': { risk: 'medium', stateAffiliated: 'France', note: 'French state-funded, editorially independent' },
  'DW News': { risk: 'medium', stateAffiliated: 'Germany', note: 'German state-funded, editorially independent' },
  'Voice of America': { risk: 'medium', stateAffiliated: 'USA', note: 'US government-funded' },
  'Kyiv Independent': { risk: 'medium', knownBiases: ['Pro-Ukraine'], note: 'Ukrainian perspective on Russia-Ukraine war' },
  'Moscow Times': { risk: 'medium', knownBiases: ['Anti-Kremlin'], note: 'Independent, critical of Russian government' },

  // Low risk - Independent with editorial standards (explicit)
  'Reuters': { risk: 'low', note: 'Wire service, strict editorial standards' },
  'AP News': { risk: 'low', note: 'Wire service, nonprofit cooperative' },
  'AFP': { risk: 'low', note: 'Wire service, editorially independent' },
  'BBC World': { risk: 'low', note: 'Public broadcaster, editorial independence charter' },
  'BBC Middle East': { risk: 'low', note: 'Public broadcaster, editorial independence charter' },
  'Guardian World': { risk: 'low', knownBiases: ['Center-left'], note: 'Scott Trust ownership, no shareholders' },
  'Financial Times': { risk: 'low', note: 'Business focus, Nikkei-owned' },
  'Bellingcat': { risk: 'low', note: 'Open-source investigations, methodology transparent' },
};

export function getSourcePropagandaRisk(sourceName: string): SourceRiskProfile {
  return SOURCE_PROPAGANDA_RISK[sourceName] ?? { risk: 'low' };
}

export function isStateAffiliatedSource(sourceName: string): boolean {
  const profile = SOURCE_PROPAGANDA_RISK[sourceName];
  return !!profile?.stateAffiliated;
}

const FULL_FEEDS: Record<string, Feed[]> = {
  politics: [
    { name: 'BBC World', url: rss('https://feeds.bbci.co.uk/news/world/rss.xml') },
    { name: 'NPR News', url: rss('https://feeds.npr.org/1001/rss.xml') },
    { name: 'Guardian World', url: rss('https://www.theguardian.com/world/rss') },
    { name: 'AP News', url: rss('https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Reuters World', url: rss('https://news.google.com/rss/search?q=site:reuters.com+world&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Politico', url: rss('https://www.politico.com/rss/politicopicks.xml') },
    { name: 'The Diplomat', url: rss('https://thediplomat.com/feed/') },
  ],
  middleeast: [
    { name: 'BBC Middle East', url: rss('https://feeds.bbci.co.uk/news/world/middle_east/rss.xml') },
    { name: 'Al Jazeera', url: rss('https://www.aljazeera.com/xml/rss/all.xml') },
    // AlArabiya blocks cloud IPs (Cloudflare), use Google News fallback
    { name: 'Al Arabiya', url: rss('https://news.google.com/rss/search?q=site:english.alarabiya.net+when:2d&hl=en-US&gl=US&ceid=US:en') },
    // Arab News and Times of Israel removed — 403 from cloud IPs
    { name: 'Guardian ME', url: rss('https://www.theguardian.com/world/middleeast/rss') },
    { name: 'CNN World', url: rss('http://rss.cnn.com/rss/cnn_world.rss') },
  ],
  tech: [
    { name: 'Hacker News', url: rss('https://hnrss.org/frontpage') },
    { name: 'Ars Technica', url: rss('https://feeds.arstechnica.com/arstechnica/technology-lab') },
    { name: 'The Verge', url: rss('https://www.theverge.com/rss/index.xml') },
    { name: 'MIT Tech Review', url: rss('https://www.technologyreview.com/feed/') },
  ],
  ai: [
    { name: 'AI News', url: rss('https://news.google.com/rss/search?q=(OpenAI+OR+Anthropic+OR+Google+AI+OR+"large+language+model"+OR+ChatGPT)+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'VentureBeat AI', url: rss('https://venturebeat.com/category/ai/feed/') },
    { name: 'The Verge AI', url: rss('https://www.theverge.com/rss/ai-artificial-intelligence/index.xml') },
    { name: 'MIT Tech Review', url: rss('https://www.technologyreview.com/topic/artificial-intelligence/feed') },
    { name: 'ArXiv AI', url: rss('https://export.arxiv.org/rss/cs.AI') },
  ],
  finance: [
    { name: 'CNBC', url: rss('https://www.cnbc.com/id/100003114/device/rss/rss.html') },
    { name: 'MarketWatch', url: rss('https://feeds.marketwatch.com/marketwatch/topstories') },
    { name: 'Yahoo Finance', url: rss('https://finance.yahoo.com/news/rssindex') },
    { name: 'Financial Times', url: rss('https://www.ft.com/rss/home') },
    { name: 'Reuters Business', url: rss('https://news.google.com/rss/search?q=site:reuters.com+business+markets&hl=en-US&gl=US&ceid=US:en') },
  ],
  gov: [
    { name: 'White House', url: rss('https://news.google.com/rss/search?q=site:whitehouse.gov&hl=en-US&gl=US&ceid=US:en') },
    { name: 'State Dept', url: rss('https://news.google.com/rss/search?q=site:state.gov+OR+"State+Department"&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Pentagon', url: rss('https://news.google.com/rss/search?q=site:defense.gov+OR+Pentagon&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Treasury', url: rss('https://news.google.com/rss/search?q=site:treasury.gov+OR+"Treasury+Department"&hl=en-US&gl=US&ceid=US:en') },
    { name: 'DOJ', url: rss('https://news.google.com/rss/search?q=site:justice.gov+OR+"Justice+Department"+DOJ&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Federal Reserve', url: rss('https://www.federalreserve.gov/feeds/press_all.xml') },
    { name: 'SEC', url: rss('https://www.sec.gov/news/pressreleases.rss') },
    { name: 'CDC', url: rss('https://news.google.com/rss/search?q=site:cdc.gov+OR+CDC+health&hl=en-US&gl=US&ceid=US:en') },
    { name: 'FEMA', url: rss('https://news.google.com/rss/search?q=site:fema.gov+OR+FEMA+emergency&hl=en-US&gl=US&ceid=US:en') },
    { name: 'DHS', url: rss('https://news.google.com/rss/search?q=site:dhs.gov+OR+"Homeland+Security"&hl=en-US&gl=US&ceid=US:en') },
    { name: 'UN News', url: railwayRss('https://news.un.org/feed/subscribe/en/news/all/rss.xml') },
    { name: 'CISA', url: railwayRss('https://www.cisa.gov/cybersecurity-advisories/all.xml') },
  ],
  layoffs: [
    { name: 'Layoffs.fyi', url: rss('https://layoffs.fyi/feed/') },
    { name: 'TechCrunch Layoffs', url: rss('https://techcrunch.com/tag/layoffs/feed/') },
    { name: 'Layoffs News', url: rss('https://news.google.com/rss/search?q=(layoffs+OR+"job+cuts"+OR+"workforce+reduction")+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  thinktanks: [
    { name: 'Foreign Policy', url: rss('https://foreignpolicy.com/feed/') },
    { name: 'Atlantic Council', url: rss('https://www.atlanticcouncil.org/feed/') },
    { name: 'Foreign Affairs', url: rss('https://www.foreignaffairs.com/rss.xml') },
    { name: 'CSIS', url: rss('https://news.google.com/rss/search?q=site:csis.org+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'RAND', url: rss('https://news.google.com/rss/search?q=site:rand.org+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Brookings', url: rss('https://news.google.com/rss/search?q=site:brookings.edu+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Carnegie', url: rss('https://news.google.com/rss/search?q=site:carnegieendowment.org+when:7d&hl=en-US&gl=US&ceid=US:en') },
  ],
  crisis: [
    { name: 'CrisisWatch', url: rss('https://www.crisisgroup.org/rss') },
    { name: 'IAEA', url: rss('https://www.iaea.org/feeds/topnews') },
    { name: 'WHO', url: rss('https://www.who.int/rss-feeds/news-english.xml') },
    { name: 'UNHCR', url: rss('https://news.google.com/rss/search?q=site:unhcr.org+OR+UNHCR+refugees+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  regional: [
    { name: 'Xinhua', url: rss('https://news.google.com/rss/search?q=site:xinhuanet.com+OR+Xinhua+when:1d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'TASS', url: rss('https://news.google.com/rss/search?q=site:tass.com+OR+TASS+Russia+when:1d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Kyiv Independent', url: rss('https://kyivindependent.com/feed/') },
    { name: 'Moscow Times', url: rss('https://www.themoscowtimes.com/rss/news') },
  ],
  africa: [
    { name: 'Africa News', url: rss('https://news.google.com/rss/search?q=(Africa+OR+Nigeria+OR+Kenya+OR+"South+Africa"+OR+Ethiopia)+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Sahel Crisis', url: rss('https://news.google.com/rss/search?q=(Sahel+OR+Mali+OR+Niger+OR+"Burkina+Faso"+OR+Wagner)+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'News24', url: railwayRss('https://feeds.capi24.com/v1/Search/articles/news24/Africa/rss') },
    { name: 'BBC Africa', url: rss('https://feeds.bbci.co.uk/news/world/africa/rss.xml') },
  ],
  latam: [
    { name: 'Latin America', url: rss('https://news.google.com/rss/search?q=(Brazil+OR+Mexico+OR+Argentina+OR+Venezuela+OR+Colombia)+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'BBC Latin America', url: rss('https://feeds.bbci.co.uk/news/world/latin_america/rss.xml') },
    { name: 'Reuters LatAm', url: rss('https://news.google.com/rss/search?q=site:reuters.com+(Brazil+OR+Mexico+OR+Argentina)+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Guardian Americas', url: rss('https://www.theguardian.com/world/americas/rss') },
  ],
  asia: [
    { name: 'Asia News', url: rss('https://news.google.com/rss/search?q=(China+OR+Japan+OR+Korea+OR+India+OR+ASEAN)+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'BBC Asia', url: rss('https://feeds.bbci.co.uk/news/world/asia/rss.xml') },
    { name: 'South China Morning Post', url: railwayRss('https://www.scmp.com/rss/91/feed/') },
    { name: 'Reuters Asia', url: rss('https://news.google.com/rss/search?q=site:reuters.com+(China+OR+Japan+OR+Taiwan+OR+Korea)+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  energy: [
    { name: 'Oil & Gas', url: rss('https://news.google.com/rss/search?q=(oil+price+OR+OPEC+OR+"natural+gas"+OR+pipeline+OR+LNG)+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Nuclear Energy', url: rss('https://news.google.com/rss/search?q=("nuclear+energy"+OR+"nuclear+power"+OR+uranium+OR+IAEA)+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Reuters Energy', url: rss('https://news.google.com/rss/search?q=site:reuters.com+(oil+OR+gas+OR+energy+OR+OPEC)+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Mining & Resources', url: rss('https://news.google.com/rss/search?q=(lithium+OR+"rare+earth"+OR+cobalt+OR+mining)+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
};

// Tech/AI variant feeds
const TECH_FEEDS: Record<string, Feed[]> = {
  tech: [
    { name: 'TechCrunch', url: rss('https://techcrunch.com/feed/') },
    { name: 'The Verge', url: rss('https://www.theverge.com/rss/index.xml') },
    { name: 'Ars Technica', url: rss('https://feeds.arstechnica.com/arstechnica/technology-lab') },
    { name: 'Hacker News', url: rss('https://hnrss.org/frontpage') },
    { name: 'MIT Tech Review', url: rss('https://www.technologyreview.com/feed/') },
    { name: 'ZDNet', url: rss('https://www.zdnet.com/news/rss.xml') },
    { name: 'TechMeme', url: rss('https://www.techmeme.com/feed.xml') },
    { name: 'Engadget', url: rss('https://www.engadget.com/rss.xml') },
    { name: 'Fast Company', url: rss('https://feeds.feedburner.com/fastcompany/headlines') },
  ],
  ai: [
    { name: 'AI News', url: rss('https://news.google.com/rss/search?q=(OpenAI+OR+Anthropic+OR+Google+AI+OR+"large+language+model"+OR+ChatGPT+OR+Claude+OR+"AI+model")+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'VentureBeat AI', url: rss('https://venturebeat.com/category/ai/feed/') },
    { name: 'The Verge AI', url: rss('https://www.theverge.com/rss/ai-artificial-intelligence/index.xml') },
    { name: 'MIT Tech Review AI', url: rss('https://www.technologyreview.com/topic/artificial-intelligence/feed') },
    { name: 'MIT Research', url: rss('https://news.mit.edu/rss/research') },
    { name: 'ArXiv AI', url: rss('https://export.arxiv.org/rss/cs.AI') },
    { name: 'ArXiv ML', url: rss('https://export.arxiv.org/rss/cs.LG') },
    { name: 'AI Weekly', url: rss('https://news.google.com/rss/search?q="artificial+intelligence"+OR+"machine+learning"+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Anthropic News', url: rss('https://news.google.com/rss/search?q=Anthropic+Claude+AI+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'OpenAI News', url: rss('https://news.google.com/rss/search?q=OpenAI+ChatGPT+GPT-4+when:7d&hl=en-US&gl=US&ceid=US:en') },
  ],
  startups: [
    { name: 'TechCrunch Startups', url: rss('https://techcrunch.com/category/startups/feed/') },
    { name: 'VentureBeat', url: rss('https://venturebeat.com/feed/') },
    { name: 'Crunchbase News', url: rss('https://news.crunchbase.com/feed/') },
    { name: 'SaaStr', url: rss('https://www.saastr.com/feed/') },
    { name: 'AngelList News', url: rss('https://news.google.com/rss/search?q=site:angellist.com+OR+"AngelList"+funding+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'TechCrunch Venture', url: rss('https://techcrunch.com/category/venture/feed/') },
    { name: 'The Information', url: rss('https://news.google.com/rss/search?q=site:theinformation.com+startup+OR+funding+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Fortune Term Sheet', url: rss('https://news.google.com/rss/search?q="Term+Sheet"+venture+capital+OR+startup+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'PitchBook News', url: rss('https://news.google.com/rss/search?q=site:pitchbook.com+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'CB Insights', url: rss('https://www.cbinsights.com/research/feed/') },
  ],
  vcblogs: [
    { name: 'Y Combinator Blog', url: rss('https://www.ycombinator.com/blog/rss/') },
    { name: 'a16z Blog', url: rss('https://news.google.com/rss/search?q=site:a16z.com+OR+"Andreessen+Horowitz"+blog+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Sequoia Blog', url: rss('https://www.sequoiacap.com/feed/') },
    { name: 'Paul Graham Essays', url: rss('https://news.google.com/rss/search?q="Paul+Graham"+essay+OR+blog+when:30d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'VC Insights', url: rss('https://news.google.com/rss/search?q=("venture+capital"+insights+OR+"VC+trends"+OR+"startup+advice")+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Lenny\'s Newsletter', url: rss('https://www.lennysnewsletter.com/feed') },
    { name: 'Stratechery', url: rss('https://stratechery.com/feed/') },
    { name: 'FwdStart Newsletter', url: '/api/fwdstart' },
  ],
  regionalStartups: [
    // Europe
    { name: 'EU Startups', url: rss('https://www.eu-startups.com/feed/') },
    { name: 'Tech.eu', url: rss('https://tech.eu/feed/') },
    { name: 'Sifted (Europe)', url: rss('https://sifted.eu/feed') },
    { name: 'The Next Web', url: rss('https://news.google.com/rss/search?q=site:thenextweb.com+when:7d&hl=en-US&gl=US&ceid=US:en') },
    // Asia - General
    { name: 'Tech in Asia', url: rss('https://www.techinasia.com/feed') },
    { name: 'KrASIA', url: rss('https://news.google.com/rss/search?q=site:kr-asia.com+OR+KrASIA+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'SEA Startups', url: rss('https://news.google.com/rss/search?q=(Singapore+OR+Indonesia+OR+Vietnam+OR+Thailand+OR+Malaysia)+startup+funding+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Asia VC News', url: rss('https://news.google.com/rss/search?q=("Southeast+Asia"+OR+ASEAN)+venture+capital+OR+funding+when:7d&hl=en-US&gl=US&ceid=US:en') },
    // China
    { name: 'China Startups', url: rss('https://news.google.com/rss/search?q=China+startup+funding+OR+"Chinese+startup"+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: '36Kr English', url: rss('https://news.google.com/rss/search?q=site:36kr.com+OR+"36Kr"+startup+china+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'China Tech Giants', url: rss('https://news.google.com/rss/search?q=(Alibaba+OR+Tencent+OR+ByteDance+OR+Baidu+OR+JD.com+OR+Xiaomi+OR+Huawei)+when:3d&hl=en-US&gl=US&ceid=US:en') },
    // Japan
    { name: 'Japan Startups', url: rss('https://news.google.com/rss/search?q=Japan+startup+funding+OR+"Japanese+startup"+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Japan Tech News', url: rss('https://news.google.com/rss/search?q=(Japan+startup+OR+Japan+tech+OR+SoftBank+OR+Rakuten+OR+Sony)+funding+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Nikkei Tech', url: rss('https://news.google.com/rss/search?q=site:asia.nikkei.com+technology+when:3d&hl=en-US&gl=US&ceid=US:en') },
    // Korea
    { name: 'Korea Tech News', url: rss('https://news.google.com/rss/search?q=(Korea+startup+OR+Korean+tech+OR+Samsung+OR+Kakao+OR+Naver+OR+Coupang)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Korea Startups', url: rss('https://news.google.com/rss/search?q=Korea+startup+funding+OR+"Korean+unicorn"+when:7d&hl=en-US&gl=US&ceid=US:en') },
    // India
    { name: 'Inc42 (India)', url: rss('https://inc42.com/feed/') },
    { name: 'YourStory', url: rss('https://yourstory.com/feed') },
    { name: 'India Startups', url: rss('https://news.google.com/rss/search?q=India+startup+funding+OR+"Indian+startup"+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'India Tech News', url: rss('https://news.google.com/rss/search?q=(Flipkart+OR+Razorpay+OR+Zerodha+OR+Zomato+OR+Paytm+OR+PhonePe)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    // Southeast Asia
    { name: 'SEA Tech News', url: rss('https://news.google.com/rss/search?q=(Grab+OR+GoTo+OR+Sea+Limited+OR+Shopee+OR+Tokopedia)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Vietnam Tech', url: rss('https://news.google.com/rss/search?q=Vietnam+startup+OR+Vietnam+tech+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Indonesia Tech', url: rss('https://news.google.com/rss/search?q=Indonesia+startup+OR+Indonesia+tech+when:7d&hl=en-US&gl=US&ceid=US:en') },
    // Taiwan
    { name: 'Taiwan Tech', url: rss('https://news.google.com/rss/search?q=(Taiwan+startup+OR+TSMC+OR+MediaTek+OR+Foxconn)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    // Latin America
    { name: 'LAVCA (LATAM)', url: rss('https://lavca.org/feed/') },
    { name: 'LATAM Startups', url: rss('https://news.google.com/rss/search?q=("Latin+America"+startup+OR+LATAM+funding)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Startups LATAM', url: rss('https://news.google.com/rss/search?q=(startup+Brazil+OR+startup+Mexico+OR+startup+Argentina+OR+startup+Colombia+OR+startup+Chile)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Brazil Tech', url: rss('https://news.google.com/rss/search?q=(Nubank+OR+iFood+OR+Mercado+Libre+OR+Rappi+OR+VTEX)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'FinTech LATAM', url: rss('https://news.google.com/rss/search?q=fintech+(Brazil+OR+Mexico+OR+Argentina+OR+"Latin+America")+when:7d&hl=en-US&gl=US&ceid=US:en') },
    // Africa
    { name: 'TechCabal (Africa)', url: rss('https://techcabal.com/feed/') },
    { name: 'Disrupt Africa', url: rss('https://news.google.com/rss/search?q=site:disrupt-africa.com+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Africa Startups', url: rss('https://news.google.com/rss/search?q=Africa+startup+funding+OR+"African+startup"+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Africa Tech News', url: rss('https://news.google.com/rss/search?q=(Flutterwave+OR+Paystack+OR+Jumia+OR+Andela+OR+"Africa+startup")+when:7d&hl=en-US&gl=US&ceid=US:en') },
    // Middle East
    { name: 'MENA Startups', url: rss('https://news.google.com/rss/search?q=(MENA+startup+OR+"Middle+East"+funding+OR+Gulf+startup)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'MENA Tech News', url: rss('https://news.google.com/rss/search?q=(UAE+startup+OR+Saudi+tech+OR+Dubai+startup+OR+NEOM+tech)+when:7d&hl=en-US&gl=US&ceid=US:en') },
  ],
  github: [
    { name: 'GitHub Blog', url: rss('https://github.blog/feed/') },
    { name: 'GitHub Trending', url: rss('https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml') },
    { name: 'Show HN', url: rss('https://hnrss.org/show') },
    { name: 'YC Launches', url: rss('https://hnrss.org/launches') },
    { name: 'Dev Events', url: rss('https://dev.events/rss.xml') },
    { name: 'Open Source News', url: rss('https://news.google.com/rss/search?q="open+source"+project+release+OR+launch+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  ipo: [
    { name: 'IPO News', url: rss('https://news.google.com/rss/search?q=(IPO+OR+"initial+public+offering"+OR+SPAC)+tech+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Renaissance IPO', url: rss('https://news.google.com/rss/search?q=site:renaissancecapital.com+IPO+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Tech IPO News', url: rss('https://news.google.com/rss/search?q=tech+IPO+OR+"tech+company"+IPO+when:7d&hl=en-US&gl=US&ceid=US:en') },
  ],
  funding: [
    { name: 'SEC Filings', url: rss('https://news.google.com/rss/search?q=(S-1+OR+"IPO+filing"+OR+"SEC+filing")+startup+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'VC News', url: rss('https://news.google.com/rss/search?q=("Series+A"+OR+"Series+B"+OR+"Series+C"+OR+"funding+round"+OR+"venture+capital")+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Seed & Pre-Seed', url: rss('https://news.google.com/rss/search?q=("seed+round"+OR+"pre-seed"+OR+"angel+round"+OR+"seed+funding")+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Startup Funding', url: rss('https://news.google.com/rss/search?q=("startup+funding"+OR+"raised+funding"+OR+"raised+$"+OR+"funding+announced")+when:7d&hl=en-US&gl=US&ceid=US:en') },
  ],
  producthunt: [
    { name: 'Product Hunt', url: rss('https://www.producthunt.com/feed') },
  ],
  outages: [
    { name: 'AWS Status', url: rss('https://news.google.com/rss/search?q=AWS+outage+OR+"Amazon+Web+Services"+down+when:1d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Cloud Outages', url: rss('https://news.google.com/rss/search?q=(Azure+OR+GCP+OR+Cloudflare+OR+Slack+OR+GitHub)+outage+OR+down+when:1d&hl=en-US&gl=US&ceid=US:en') },
  ],
  security: [
    { name: 'Krebs Security', url: rss('https://krebsonsecurity.com/feed/') },
    { name: 'The Hacker News', url: rss('https://feeds.feedburner.com/TheHackersNews') },
    { name: 'Dark Reading', url: rss('https://www.darkreading.com/rss.xml') },
    { name: 'Schneier', url: rss('https://www.schneier.com/feed/') },
  ],
  policy: [
    // US Policy
    { name: 'Politico Tech', url: rss('https://rss.politico.com/technology.xml') },
    { name: 'AI Regulation', url: rss('https://news.google.com/rss/search?q=AI+regulation+OR+"artificial+intelligence"+law+OR+policy+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Tech Antitrust', url: rss('https://news.google.com/rss/search?q=tech+antitrust+OR+FTC+Google+OR+FTC+Apple+OR+FTC+Amazon+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'EFF News', url: rss('https://news.google.com/rss/search?q=site:eff.org+OR+"Electronic+Frontier+Foundation"+when:14d&hl=en-US&gl=US&ceid=US:en') },
    // EU Digital Policy
    { name: 'EU Digital Policy', url: rss('https://news.google.com/rss/search?q=("Digital+Services+Act"+OR+"Digital+Markets+Act"+OR+"EU+AI+Act"+OR+"GDPR")+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Euractiv Digital', url: rss('https://news.google.com/rss/search?q=site:euractiv.com+digital+OR+tech+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'EU Commission Digital', url: rss('https://news.google.com/rss/search?q=site:ec.europa.eu+digital+OR+technology+when:14d&hl=en-US&gl=US&ceid=US:en') },
    // China Tech Policy
    { name: 'China Tech Policy', url: rss('https://news.google.com/rss/search?q=(China+tech+regulation+OR+China+AI+policy+OR+MIIT+technology)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    // UK Policy
    { name: 'UK Tech Policy', url: rss('https://news.google.com/rss/search?q=(UK+AI+safety+OR+"Online+Safety+Bill"+OR+UK+tech+regulation)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    // India Policy
    { name: 'India Tech Policy', url: rss('https://news.google.com/rss/search?q=(India+tech+regulation+OR+India+data+protection+OR+India+AI+policy)+when:7d&hl=en-US&gl=US&ceid=US:en') },
  ],
  thinktanks: [
    // US Think Tanks
    { name: 'Brookings Tech', url: rss('https://news.google.com/rss/search?q=site:brookings.edu+technology+OR+AI+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'CSIS Tech', url: rss('https://news.google.com/rss/search?q=site:csis.org+technology+OR+AI+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'MIT Tech Policy', url: rss('https://news.google.com/rss/search?q=site:techpolicypress.org+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Stanford HAI', url: rss('https://news.google.com/rss/search?q=site:hai.stanford.edu+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'AI Now Institute', url: rss('https://news.google.com/rss/search?q=site:ainowinstitute.org+when:14d&hl=en-US&gl=US&ceid=US:en') },
    // Europe Think Tanks
    { name: 'OECD Digital', url: rss('https://news.google.com/rss/search?q=site:oecd.org+digital+OR+AI+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'EU Tech Policy', url: rss('https://news.google.com/rss/search?q=("EU+tech+policy"+OR+"European+digital"+OR+Bruegel+tech)+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Chatham House Tech', url: rss('https://news.google.com/rss/search?q=site:chathamhouse.org+technology+OR+AI+when:14d&hl=en-US&gl=US&ceid=US:en') },
    // Asia Think Tanks
    { name: 'ISEAS (Singapore)', url: rss('https://news.google.com/rss/search?q=site:iseas.edu.sg+technology+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'ORF Tech (India)', url: rss('https://news.google.com/rss/search?q=(India+tech+policy+OR+ORF+technology+OR+"Observer+Research+Foundation"+tech)+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'RIETI (Japan)', url: rss('https://news.google.com/rss/search?q=site:rieti.go.jp+technology+when:30d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Asia Pacific Tech', url: rss('https://news.google.com/rss/search?q=("Asia+Pacific"+tech+policy+OR+"Lowy+Institute"+technology)+when:14d&hl=en-US&gl=US&ceid=US:en') },
    // China Research (External Views)
    { name: 'China Tech Analysis', url: rss('https://news.google.com/rss/search?q=("China+tech+strategy"+OR+"Chinese+AI"+OR+"China+semiconductor")+analysis+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'DigiChina', url: rss('https://news.google.com/rss/search?q=site:digichina.stanford.edu+when:14d&hl=en-US&gl=US&ceid=US:en') },
  ],
  finance: [
    { name: 'CNBC Tech', url: rss('https://www.cnbc.com/id/19854910/device/rss/rss.html') },
    { name: 'MarketWatch Tech', url: rss('https://feeds.marketwatch.com/marketwatch/topstories/') },
    { name: 'Yahoo Finance', url: rss('https://finance.yahoo.com/rss/topstories') },
    { name: 'Seeking Alpha Tech', url: rss('https://seekingalpha.com/market_currents.xml') },
  ],
  hardware: [
    { name: "Tom's Hardware", url: rss('https://www.tomshardware.com/feeds/all') },
    { name: 'SemiAnalysis', url: rss('https://www.semianalysis.com/feed') },
    { name: 'Semiconductor News', url: rss('https://news.google.com/rss/search?q=semiconductor+OR+chip+OR+TSMC+OR+NVIDIA+OR+Intel+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  cloud: [
    { name: 'InfoQ', url: rss('https://feed.infoq.com/') },
    { name: 'The New Stack', url: rss('https://thenewstack.io/feed/') },
    { name: 'DevOps.com', url: rss('https://devops.com/feed/') },
  ],
  dev: [
    { name: 'Dev.to', url: rss('https://dev.to/feed') },
    { name: 'Lobsters', url: rss('https://lobste.rs/rss') },
    { name: 'Changelog', url: rss('https://changelog.com/feed') },
  ],
  layoffs: [
    { name: 'Layoffs.fyi', url: rss('https://news.google.com/rss/search?q=tech+layoffs+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'TechCrunch Layoffs', url: rss('https://techcrunch.com/tag/layoffs/feed/') },
  ],
  unicorns: [
    { name: 'Unicorn News', url: rss('https://news.google.com/rss/search?q=("unicorn+startup"+OR+"unicorn+valuation"+OR+"$1+billion+valuation")+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'CB Insights Unicorn', url: rss('https://news.google.com/rss/search?q=site:cbinsights.com+unicorn+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Decacorn News', url: rss('https://news.google.com/rss/search?q=("decacorn"+OR+"$10+billion+valuation"+OR+"$10B+valuation")+startup+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'New Unicorns', url: rss('https://news.google.com/rss/search?q=("becomes+unicorn"+OR+"joins+unicorn"+OR+"reaches+unicorn"+OR+"achieved+unicorn")+when:14d&hl=en-US&gl=US&ceid=US:en') },
  ],
  accelerators: [
    { name: 'Techstars News', url: rss('https://news.google.com/rss/search?q=Techstars+accelerator+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: '500 Global News', url: rss('https://news.google.com/rss/search?q="500+Global"+OR+"500+Startups"+accelerator+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Demo Day News', url: rss('https://news.google.com/rss/search?q=("demo+day"+OR+"YC+batch"+OR+"accelerator+batch")+startup+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Startup School', url: rss('https://news.google.com/rss/search?q="Startup+School"+OR+"YC+Startup+School"+when:14d&hl=en-US&gl=US&ceid=US:en') },
  ],
  podcasts: [
    // Tech Podcast Episodes (via Google News - podcast hosts block RSS proxies)
    { name: 'Acquired Episodes', url: rss('https://news.google.com/rss/search?q="Acquired+podcast"+episode+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'All-In Podcast', url: rss('https://news.google.com/rss/search?q="All-In+podcast"+(Chamath+OR+Sacks+OR+Friedberg)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'a16z Insights', url: rss('https://news.google.com/rss/search?q=("a16z"+OR+"Andreessen+Horowitz")+podcast+OR+interview+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'TWIST Episodes', url: rss('https://news.google.com/rss/search?q="This+Week+in+Startups"+Jason+Calacanis+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: '20VC Episodes', url: rss('https://news.google.com/rss/search?q="20+Minute+VC"+Harry+Stebbings+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Lex Fridman Tech', url: rss('https://news.google.com/rss/search?q=("Lex+Fridman"+interview)+(AI+OR+tech+OR+startup+OR+CEO)+when:7d&hl=en-US&gl=US&ceid=US:en') },
    // Tech Media Shows
    { name: 'Verge Shows', url: rss('https://news.google.com/rss/search?q=("Vergecast"+OR+"Decoder+podcast"+Verge)+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Hard Fork (NYT)', url: rss('https://news.google.com/rss/search?q="Hard+Fork"+podcast+NYT+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Pivot Podcast', url: rss('https://news.google.com/rss/search?q="Pivot+podcast"+(Kara+Swisher+OR+Scott+Galloway)+when:14d&hl=en-US&gl=US&ceid=US:en') },
    // Newsletters
    { name: 'Tech Newsletters', url: rss('https://news.google.com/rss/search?q=("Benedict+Evans"+OR+"Pragmatic+Engineer"+OR+Stratechery)+tech+when:14d&hl=en-US&gl=US&ceid=US:en') },
    // AI Podcasts & Shows
    { name: 'AI Podcasts', url: rss('https://news.google.com/rss/search?q=("AI+podcast"+OR+"artificial+intelligence+podcast")+episode+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'AI Interviews', url: rss('https://news.google.com/rss/search?q=(NVIDIA+OR+OpenAI+OR+Anthropic+OR+DeepMind)+interview+OR+podcast+when:14d&hl=en-US&gl=US&ceid=US:en') },
    // Startup Shows
    { name: 'How I Built This', url: rss('https://news.google.com/rss/search?q="How+I+Built+This"+Guy+Raz+when:14d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Startup Podcasts', url: rss('https://news.google.com/rss/search?q=("Masters+of+Scale"+OR+"The+Pitch+podcast"+OR+"startup+podcast")+episode+when:14d&hl=en-US&gl=US&ceid=US:en') },
  ],
};

// Polkam variant feeds (Indonesia-focused + global)
// Google News helper for Indonesian language feeds
const idNews = (query: string) => rss(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`);
const enNews = (query: string) => rss(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`);

const POLKAM_FEEDS: Record<string, Feed[]> = {
  indonesia: [
    // === Major Indonesian outlets (Bahasa Indonesia) ===
    { name: 'Berita Terkini', url: idNews('Indonesia when:1d') },
    { name: 'Kompas', url: idNews('site:kompas.com when:2d') },
    { name: 'Detik News', url: idNews('site:detik.com when:2d') },
    { name: 'CNN Indonesia', url: idNews('site:cnnindonesia.com when:2d') },
    { name: 'Tempo', url: idNews('site:tempo.co when:2d') },
    { name: 'Antara', url: idNews('site:antaranews.com when:2d') },
    { name: 'Republika', url: idNews('site:republika.co.id when:2d') },
    { name: 'Tribunnews', url: idNews('site:tribunnews.com when:2d') },
    { name: 'Liputan6', url: idNews('site:liputan6.com when:2d') },
    { name: 'Okezone', url: idNews('site:okezone.com when:2d') },
    { name: 'Sindonews', url: idNews('site:sindonews.com when:2d') },
    { name: 'Merdeka', url: idNews('site:merdeka.com when:2d') },
    { name: 'Suara.com', url: idNews('site:suara.com when:2d') },
    { name: 'VIVA', url: idNews('site:viva.co.id when:2d') },
    { name: 'Bisnis Indonesia', url: idNews('site:bisnis.com when:2d') },
    { name: 'Kontan', url: idNews('site:kontan.co.id when:2d') },
    { name: 'iNews', url: idNews('site:inews.id when:2d') },
    { name: 'JPNN', url: idNews('site:jpnn.com when:2d') },
    { name: 'Kumparan', url: idNews('site:kumparan.com when:2d') },
    // === Politik & Pemerintahan ===
    { name: 'Politik RI', url: idNews('(politik OR DPR OR presiden OR menteri OR kabinet) Indonesia when:2d') },
    { name: 'Pemerintahan', url: idNews('(pemerintah OR kebijakan OR regulasi OR "peraturan pemerintah") Indonesia when:3d') },
    // === English Indonesia coverage ===
    { name: 'Jakarta Post', url: enNews('site:thejakartapost.com when:2d') },
    { name: 'Jakarta Globe', url: enNews('site:jakartaglobe.id when:2d') },
    { name: 'Reuters Indonesia', url: enNews('site:reuters.com Indonesia when:3d') },
    { name: 'Bloomberg Indonesia', url: enNews('Bloomberg Indonesia when:3d') },
  ],
  politics: [
    // === Direct RSS feeds — international wire & major outlets ===
    { name: 'BBC World', url: rss('https://feeds.bbci.co.uk/news/world/rss.xml') },
    { name: 'Al Jazeera', url: rss('https://www.aljazeera.com/xml/rss/all.xml') },
    { name: 'France 24', url: rss('https://www.france24.com/en/rss') },
    { name: 'Guardian World', url: rss('https://www.theguardian.com/world/rss') },
    { name: 'NPR News', url: rss('https://feeds.npr.org/1001/rss.xml') },
    { name: 'CNN World', url: rss('http://rss.cnn.com/rss/cnn_world.rss') },
    { name: 'DW News', url: rss('https://rss.dw.com/rdf/rss-en-all') },
    // === Google News — wire services & major outlets ===
    { name: 'Reuters World', url: enNews('site:reuters.com world when:2d') },
    { name: 'AP News', url: enNews('site:apnews.com world when:2d') },
    { name: 'Bloomberg World', url: enNews('site:bloomberg.com world politics when:2d') },
    { name: 'Politico', url: enNews('site:politico.com when:2d') },
    { name: 'Foreign Policy', url: enNews('site:foreignpolicy.com when:3d') },
    // === Geopolitical topics ===
    { name: 'Geopolitik', url: enNews('(geopolitics OR "international relations" OR diplomacy OR sanctions) when:2d') },
    { name: 'Konflik Global', url: enNews('(war OR conflict OR military OR ceasefire OR "peace talks") when:2d') },
    { name: 'NATO & Pertahanan', url: enNews('(NATO OR "European defense" OR "US military" OR Pentagon) when:3d') },
    // === Indonesian world news perspective (Bahasa) ===
    { name: 'Dunia - Kompas', url: idNews('site:kompas.com (dunia OR internasional) when:2d') },
    { name: 'Dunia - Detik', url: idNews('site:detik.com (internasional OR dunia) when:2d') },
    { name: 'Dunia - CNN ID', url: idNews('site:cnnindonesia.com internasional when:2d') },
    { name: 'Dunia - Tempo', url: idNews('site:tempo.co (dunia OR internasional) when:2d') },
  ],
  asia: [
    // === Direct RSS feeds ===
    { name: 'BBC Asia', url: rss('https://feeds.bbci.co.uk/news/world/asia/rss.xml') },
    { name: 'South China Morning Post', url: railwayRss('https://www.scmp.com/rss/91/feed/') },
    { name: 'The Diplomat', url: rss('https://thediplomat.com/feed/') },
    { name: 'Channel News Asia', url: rss('https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml') },
    // === ASEAN & Indonesia perspective (Bahasa) ===
    { name: 'ASEAN Indonesia', url: idNews('(ASEAN OR "Asia Tenggara") when:3d') },
    { name: 'Berita Asia', url: idNews('(China OR Jepang OR Korea OR India OR ASEAN) when:2d') },
    { name: 'Diplomasi RI', url: idNews('(diplomasi OR "luar negeri" OR "kementerian luar negeri") when:3d') },
    { name: 'Laut China Selatan', url: idNews('("Laut China Selatan" OR Natuna OR "ZEE" OR "kapal asing") when:7d') },
    { name: 'ASEAN - Kompas', url: idNews('site:kompas.com (ASEAN OR "Asia Tenggara" OR regional) when:3d') },
    { name: 'ASEAN - Detik', url: idNews('site:detik.com (ASEAN OR "Asia Tenggara") when:3d') },
    { name: 'ASEAN - Tempo', url: idNews('site:tempo.co (ASEAN OR "Asia Tenggara" OR regional) when:3d') },
    { name: 'ASEAN - Antara', url: idNews('site:antaranews.com (ASEAN OR "Asia Tenggara") when:3d') },
    // === Regional topics (English) ===
    { name: 'Asia Pacific', url: enNews('(China OR Japan OR Korea OR Taiwan OR ASEAN) when:2d') },
    { name: 'South China Sea', url: enNews('("South China Sea" OR Natuna OR "Taiwan Strait" OR "East China Sea") when:3d') },
    { name: 'Southeast Asia', url: enNews('("Southeast Asia" OR ASEAN OR Philippines OR Vietnam OR Myanmar OR Thailand) when:2d') },
    { name: 'China News', url: enNews('(China economy OR China military OR China politics OR Xi Jinping) when:2d') },
    { name: 'Japan & Korea', url: enNews('(Japan OR "South Korea" OR "North Korea" OR Kishida OR Yoon) when:3d') },
    { name: 'India News', url: enNews('(India OR Modi OR "Indian Ocean" OR "Indo-Pacific") when:3d') },
    { name: 'Nikkei Asia', url: enNews('site:asia.nikkei.com when:3d') },
    { name: 'Reuters Asia', url: enNews('site:reuters.com (Asia OR China OR Japan OR ASEAN) when:3d') },
  ],
  finance: [
    // === Indonesian finance — site-specific (Bahasa) ===
    { name: 'Bisnis Indonesia', url: idNews('site:bisnis.com when:2d') },
    { name: 'Kontan', url: idNews('site:kontan.co.id when:2d') },
    { name: 'CNBC Indonesia', url: idNews('site:cnbcindonesia.com when:2d') },
    { name: 'Investor Daily', url: idNews('site:investor.id when:2d') },
    { name: 'Detik Finance', url: idNews('site:detik.com (finance OR ekonomi OR bisnis) when:2d') },
    { name: 'Kompas Bisnis', url: idNews('site:kompas.com (bisnis OR ekonomi OR keuangan) when:2d') },
    { name: 'Tempo Bisnis', url: idNews('site:tempo.co (bisnis OR ekonomi OR keuangan) when:2d') },
    { name: 'Liputan6 Bisnis', url: idNews('site:liputan6.com (bisnis OR ekonomi) when:2d') },
    // === Indonesian finance — topic queries (Bahasa) ===
    { name: 'IHSG & Saham', url: idNews('(IHSG OR saham OR "Bursa Efek" OR IDX OR emiten) when:2d') },
    { name: 'Rupiah & BI', url: idNews('(Rupiah OR "Bank Indonesia" OR "suku bunga" OR inflasi OR "cadangan devisa") when:3d') },
    { name: 'APBN & Fiskal', url: idNews('(APBN OR "anggaran negara" OR "penerimaan pajak" OR "defisit anggaran" OR fiskal) when:3d') },
    { name: 'Perbankan RI', url: idNews('(perbankan OR "bank sentral" OR OJK OR "kredit macet" OR NPL) Indonesia when:3d') },
    { name: 'Ekonomi RI', url: idNews('(ekonomi OR "pertumbuhan ekonomi" OR ekspor OR impor OR "neraca perdagangan") Indonesia when:3d') },
    { name: 'Investasi RI', url: idNews('(investasi OR "penanaman modal" OR BKPM OR "investor asing" OR FDI) Indonesia when:3d') },
    // === Global finance — direct RSS ===
    { name: 'CNBC', url: rss('https://www.cnbc.com/id/100003114/device/rss/rss.html') },
    { name: 'MarketWatch', url: rss('https://feeds.marketwatch.com/marketwatch/topstories') },
    { name: 'Yahoo Finance', url: rss('https://finance.yahoo.com/rss/topstories') },
    { name: 'Financial Times', url: rss('https://www.ft.com/rss/home') },
    // === Global finance — Google News ===
    { name: 'Reuters Business', url: enNews('site:reuters.com business markets when:2d') },
    { name: 'Bloomberg Markets', url: enNews('site:bloomberg.com markets economy when:2d') },
    { name: 'Global Economy', url: enNews('("global economy" OR "world economy" OR "Federal Reserve" OR "interest rate" OR recession) when:2d') },
  ],
  energy: [
    // === Indonesian energy — site-specific (Bahasa) ===
    { name: 'Detik Energi', url: idNews('site:detik.com (energi OR migas OR pertambangan OR batubara) when:2d') },
    { name: 'Kompas Energi', url: idNews('site:kompas.com (energi OR migas OR pertambangan) when:2d') },
    { name: 'Bisnis Energi', url: idNews('site:bisnis.com (energi OR migas OR tambang OR batubara) when:2d') },
    { name: 'Kontan Energi', url: idNews('site:kontan.co.id (energi OR migas OR tambang) when:2d') },
    { name: 'CNBC ID Energi', url: idNews('site:cnbcindonesia.com (energi OR migas OR pertambangan) when:2d') },
    { name: 'Tempo Energi', url: idNews('site:tempo.co (energi OR migas OR tambang) when:3d') },
    // === Indonesian energy — topic queries (Bahasa) ===
    { name: 'Pertamina & PLN', url: idNews('(Pertamina OR PLN OR "BBM" OR "subsidi energi" OR "tarif listrik") when:3d') },
    { name: 'Migas Indonesia', url: idNews('("minyak bumi" OR "gas alam" OR LNG OR kilang OR "hulu migas" OR SKK) when:3d') },
    { name: 'Sawit & CPO', url: idNews('(sawit OR CPO OR "kelapa sawit" OR "minyak sawit" OR "biodiesel") when:3d') },
    { name: 'Tambang & Nikel', url: idNews('(nikel OR timah OR bauksit OR tembaga OR "tambang" OR Freeport OR INALUM) Indonesia when:3d') },
    { name: 'Batubara', url: idNews('(batubara OR "batu bara" OR "harga batubara" OR "ekspor batubara" OR DMO) Indonesia when:3d') },
    { name: 'Minerba & ESDM', url: idNews('(ESDM OR minerba OR "energi terbarukan" OR "listrik" OR "energi baru") Indonesia when:7d') },
    { name: 'EBT & Transisi', url: idNews('("energi terbarukan" OR "panel surya" OR "tenaga angin" OR "panas bumi" OR geothermal) Indonesia when:7d') },
    // === Global energy — direct RSS ===
    { name: 'Reuters Energy', url: enNews('site:reuters.com (oil OR gas OR energy OR OPEC) when:3d') },
    // === Global energy — Google News ===
    { name: 'Oil & Gas', url: enNews('(oil price OR OPEC OR "natural gas" OR LNG OR "crude oil") when:2d') },
    { name: 'Coal Global', url: enNews('(coal price OR "thermal coal" OR "coal market" OR "coal export") when:3d') },
    { name: 'Mining Global', url: enNews('(nickel OR coal OR copper OR "rare earth" OR lithium mining) when:3d') },
    { name: 'Palm Oil Global', url: enNews('("palm oil" OR "crude palm oil" OR CPO price) when:3d') },
    { name: 'Nuclear Energy', url: enNews('("nuclear energy" OR "nuclear power" OR uranium OR IAEA) when:3d') },
    { name: 'Energy Transition', url: enNews('("energy transition" OR "renewable energy" OR "clean energy" OR "green hydrogen") when:3d') },
  ],
  criminals: [
    // === KRIMINAL — site-specific from major Indonesian outlets ===
    { name: 'Detik Hukum', url: idNews('site:detik.com (hukum OR kriminal OR pidana) when:2d') },
    { name: 'Kompas Hukum', url: idNews('site:kompas.com (hukum OR kriminal OR kejahatan) when:2d') },
    { name: 'CNN Indonesia Kriminal', url: idNews('site:cnnindonesia.com (kriminal OR hukum OR kejahatan) when:2d') },
    { name: 'Tempo Hukum', url: idNews('site:tempo.co (hukum OR kriminal OR korupsi) when:2d') },
    { name: 'Tribunnews Kriminal', url: idNews('site:tribunnews.com (kriminal OR kejahatan OR pembunuhan) when:2d') },
    { name: 'Liputan6 Kriminal', url: idNews('site:liputan6.com (kriminal OR hukum OR kejahatan) when:2d') },
    { name: 'Antara Hukum', url: idNews('site:antaranews.com (hukum OR kriminal OR polisi) when:2d') },
    { name: 'Republika Hukum', url: idNews('site:republika.co.id (hukum OR kriminal) when:3d') },
    { name: 'Okezone Kriminal', url: idNews('site:okezone.com (kriminal OR kejahatan OR pembunuhan) when:2d') },
    { name: 'Suara Kriminal', url: idNews('site:suara.com (kriminal OR kejahatan OR hukum) when:2d') },
    { name: 'Sindonews Hukum', url: idNews('site:sindonews.com (hukum OR kriminal OR pidana) when:2d') },
    { name: 'Merdeka Kriminal', url: idNews('site:merdeka.com (kriminal OR kejahatan OR hukum) when:2d') },
    // === KRIMINAL — topic-specific queries ===
    { name: 'Korupsi & KPK', url: idNews('(KPK OR korupsi OR "tindak pidana korupsi" OR koruptor OR suap OR gratifikasi) when:3d') },
    { name: 'Narkoba & BNN', url: idNews('(narkoba OR narkotika OR BNN OR "barang bukti" OR pengedar OR ganja OR sabu) when:3d') },
    { name: 'Polri & Kepolisian', url: idNews('(Polri OR kepolisian OR penangkapan OR tersangka OR "barang bukti" OR Bareskrim) when:2d') },
    { name: 'Kejaksaan & Pengadilan', url: idNews('(kejaksaan OR pengadilan OR jaksa OR hakim OR vonis OR terdakwa) when:3d') },
    { name: 'Terorisme', url: idNews('(terorisme OR teroris OR Densus OR BNPT OR radikalisme) Indonesia when:3d') },
    { name: 'Penipuan & Siber', url: idNews('(penipuan OR "penipuan online" OR "kejahatan siber" OR skimming OR phishing OR judi) Indonesia when:3d') },
    // === BENCANA — site-specific from major outlets ===
    { name: 'Detik Bencana', url: idNews('site:detik.com (bencana OR gempa OR banjir OR longsor) when:2d') },
    { name: 'Kompas Bencana', url: idNews('site:kompas.com (bencana OR gempa OR banjir OR tsunami) when:2d') },
    { name: 'CNN Indonesia Bencana', url: idNews('site:cnnindonesia.com (bencana OR gempa OR banjir OR gunung) when:2d') },
    { name: 'Tempo Bencana', url: idNews('site:tempo.co (bencana OR gempa OR banjir) when:3d') },
    { name: 'Tribunnews Bencana', url: idNews('site:tribunnews.com (bencana OR gempa OR banjir OR longsor) when:2d') },
    { name: 'Liputan6 Bencana', url: idNews('site:liputan6.com (bencana OR gempa OR banjir) when:2d') },
    // === BENCANA — topic-specific queries ===
    { name: 'BNPB & Evakuasi', url: idNews('(BNPB OR "badan penanggulangan bencana" OR evakuasi OR pengungsi OR "tanggap darurat") when:3d') },
    { name: 'BMKG & Gempa', url: idNews('(BMKG OR gempa OR tsunami OR "peringatan dini" OR "gempa bumi") Indonesia when:2d') },
    { name: 'Banjir & Longsor', url: idNews('(banjir OR longsor OR "tanah longsor" OR "banjir bandang" OR rob) Indonesia when:3d') },
    { name: 'Gunung Berapi', url: idNews('(gunung OR erupsi OR vulkanik OR "gunung berapi" OR lahar OR Merapi OR Semeru) Indonesia when:3d') },
    { name: 'Kebakaran Hutan', url: idNews('(kebakaran OR karhutla OR "kebakaran hutan" OR "titik panas" OR "kabut asap") Indonesia when:3d') },
    { name: 'Kecelakaan', url: idNews('(kecelakaan OR "kecelakaan lalu lintas" OR tabrakan OR tenggelam OR "kapal tenggelam") Indonesia when:2d') },
    // === English sources ===
    { name: 'Indonesia Disasters (EN)', url: enNews('(Indonesia earthquake OR Indonesia flood OR Indonesia tsunami OR Indonesia volcano OR Indonesia landslide) when:3d') },
    { name: 'Indonesia Crime (EN)', url: enNews('(Indonesia crime OR Indonesia corruption OR Indonesia drug OR Indonesia police OR Indonesia arrest) when:3d') },
    { name: 'Jakarta Post Hukum', url: enNews('site:thejakartapost.com (crime OR disaster OR earthquake OR flood OR corruption) when:3d') },
  ],
  weather: [
    // === CUACA — site-specific from major Indonesian outlets ===
    { name: 'Kompas Cuaca', url: idNews('site:kompas.com (cuaca OR BMKG OR iklim OR "cuaca ekstrem") when:3d') },
    { name: 'Detik Cuaca', url: idNews('site:detik.com (cuaca OR BMKG OR iklim OR "cuaca ekstrem") when:3d') },
    { name: 'CNN Indonesia Cuaca', url: idNews('site:cnnindonesia.com (cuaca OR BMKG OR iklim OR "hujan lebat") when:3d') },
    { name: 'Tempo Cuaca', url: idNews('site:tempo.co (cuaca OR BMKG OR iklim OR lingkungan) when:3d') },
    { name: 'Tribunnews Cuaca', url: idNews('site:tribunnews.com (cuaca OR BMKG OR "cuaca ekstrem") when:3d') },
    { name: 'Liputan6 Cuaca', url: idNews('site:liputan6.com (cuaca OR BMKG OR "cuaca ekstrem") when:3d') },
    { name: 'Antara Cuaca', url: idNews('site:antaranews.com (cuaca OR BMKG OR iklim) when:3d') },
    // === CUACA — topic-specific queries (Bahasa) ===
    { name: 'Prakiraan Cuaca', url: idNews('(BMKG OR "prakiraan cuaca" OR "peringatan dini cuaca" OR "cuaca ekstrem") Indonesia when:2d') },
    { name: 'Hujan & Badai', url: idNews('("hujan lebat" OR "angin kencang" OR "gelombang tinggi" OR badai OR "curah hujan") Indonesia when:3d') },
    { name: 'Musim & Iklim', url: idNews('("musim hujan" OR "musim kemarau" OR "la nina" OR "el nino" OR "perubahan iklim") Indonesia when:7d') },
    { name: 'Suhu & Panas', url: idNews('(suhu OR "suhu panas" OR "gelombang panas" OR "suhu ekstrem" OR kemarau OR kekeringan) Indonesia when:7d') },
    { name: 'Kabut Asap & Polusi', url: idNews('("kabut asap" OR "kualitas udara" OR polusi OR ISPU OR "indeks pencemaran") Indonesia when:3d') },
    { name: 'Siklon Tropis', url: idNews('("siklon tropis" OR "badai tropis" OR siklon OR "tekanan rendah") Indonesia when:7d') },
    // === International weather feeds ===
    { name: 'GDACS Alerts', url: rss('https://www.gdacs.org/xml/rss_24h.xml') },
    { name: 'GDACS Floods', url: rss('https://www.gdacs.org/xml/rss_fl_7d.xml') },
    { name: 'GDACS Cyclones', url: rss('https://www.gdacs.org/xml/rss_tc_7d.xml') },
    { name: 'ReliefWeb Indonesia', url: rss('https://reliefweb.int/updates/rss.xml?advanced-search=%28PC120%29') },
    // === English sources ===
    { name: 'Indonesia Weather (EN)', url: enNews('(Indonesia weather OR Indonesia monsoon OR Indonesia flood warning OR BMKG) when:3d') },
    { name: 'SE Asia Weather (EN)', url: enNews('("Southeast Asia" weather OR tropical cyclone OR monsoon OR "Asia Pacific" weather) when:3d') },
  ],
};

// Variant-aware exports
export const FEEDS = SITE_VARIANT === 'tech' ? TECH_FEEDS : SITE_VARIANT === 'polkam' ? POLKAM_FEEDS : FULL_FEEDS;

const FULL_INTEL_SOURCES: Feed[] = [
  // Defense & Security (Tier 1)
  { name: 'Defense One', url: rss('https://www.defenseone.com/rss/all/'), type: 'defense' },
  { name: 'Breaking Defense', url: rss('https://breakingdefense.com/feed/'), type: 'defense' },
  { name: 'The War Zone', url: rss('https://www.thedrive.com/the-war-zone/rss'), type: 'defense' },
  { name: 'Defense News', url: rss('https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml'), type: 'defense' },
  { name: 'Janes', url: rss('https://news.google.com/rss/search?q=site:janes.com+when:3d&hl=en-US&gl=US&ceid=US:en'), type: 'defense' },
  { name: 'CSIS', url: rss('https://www.csis.org/analysis?type=analysis'), type: 'defense' },

  // International Relations (Tier 2)
  { name: 'Chatham House', url: rss('https://news.google.com/rss/search?q=site:chathamhouse.org+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'intl' },
  { name: 'ECFR', url: rss('https://ecfr.eu/feed/'), type: 'intl' },
  { name: 'Foreign Policy', url: rss('https://foreignpolicy.com/feed/'), type: 'intl' },
  { name: 'Foreign Affairs', url: rss('https://www.foreignaffairs.com/rss.xml'), type: 'intl' },
  { name: 'Atlantic Council', url: rss('https://www.atlanticcouncil.org/feed/'), type: 'intl' },
  { name: 'Middle East Institute', url: rss('https://www.mei.edu/rss.xml'), type: 'intl' },

  // Think Tanks & Research (Tier 3)
  { name: 'RAND', url: rss('https://www.rand.org/rss/all.xml'), type: 'research' },
  { name: 'Brookings', url: rss('https://www.brookings.edu/feed/'), type: 'research' },
  { name: 'Carnegie', url: rss('https://carnegieendowment.org/rss/'), type: 'research' },
  { name: 'FAS', url: rss('https://fas.org/feed/'), type: 'research' },
  { name: 'NTI', url: rss('https://www.nti.org/rss/'), type: 'research' },

  // OSINT & Monitoring (Tier 2)
  { name: 'Bellingcat', url: rss('https://www.bellingcat.com/feed/'), type: 'osint' },
  { name: 'Krebs Security', url: rss('https://krebsonsecurity.com/feed/'), type: 'cyber' },

  // Economic & Food Security (Tier 2)
  { name: 'FAO News', url: rss('https://www.fao.org/rss/home/en/'), type: 'economic' },
];

const POLKAM_INTEL_SOURCES: Feed[] = [
  // Indonesia Defense & Security (Bahasa)
  { name: 'TNI & Militer', url: idNews('(TNI OR militer OR "pertahanan" OR "Kementerian Pertahanan" OR Prabowo) when:3d'), type: 'defense' },
  { name: 'Polri & Keamanan', url: idNews('(Polri OR kepolisian OR "keamanan nasional" OR terorisme OR Densus) when:3d'), type: 'defense' },
  { name: 'BIN & Intelijen', url: idNews('(BIN OR intelijen OR "badan intelijen" OR "keamanan negara") when:7d'), type: 'defense' },
  { name: 'Separatisme & Konflik', url: idNews('(OPM OR Papua OR separatis OR konflik OR "keamanan dalam negeri") when:7d'), type: 'defense' },
  { name: 'Terorisme', url: idNews('(terorisme OR teroris OR BNPT OR radikalisme OR deradikalisasi) Indonesia when:7d'), type: 'defense' },
  { name: 'Pertahanan RI', url: idNews('(alutsista OR "kapal perang" OR "jet tempur" OR "rudal" OR "radar") Indonesia when:7d'), type: 'defense' },

  // Indonesia Geopolitics & Diplomacy (Bahasa)
  { name: 'Politik Luar Negeri', url: idNews('("politik luar negeri" OR "hubungan bilateral" OR "kedaulatan" OR "Laut China Selatan" OR Natuna) when:3d'), type: 'intl' },
  { name: 'Laut China Selatan', url: idNews('("Laut China Selatan" OR Natuna OR "ZEE" OR "zona ekonomi eksklusif" OR "kapal asing") when:7d'), type: 'intl' },

  // Indonesia Intel (English)
  { name: 'Indonesia Security', url: enNews('(Indonesia military OR Indonesia defense OR TNI OR "Indonesian navy") when:3d'), type: 'defense' },
  { name: 'South China Sea', url: enNews('("South China Sea" OR Natuna OR Indonesia maritime) when:7d'), type: 'intl' },

  // Regional think tanks & research
  { name: 'CSIS Indonesia', url: enNews('(site:csis.or.id OR "CSIS Jakarta" OR "CSIS Indonesia") when:7d'), type: 'research' },
  { name: 'Lowy Institute', url: rss('https://www.lowyinstitute.org/the-interpreter/rss.xml'), type: 'research' },
  { name: 'ISEAS', url: enNews('(site:iseas.edu.sg Indonesia OR "ISEAS" Southeast Asia) when:7d'), type: 'research' },

  // Global intel (keep key sources)
  { name: 'Defense One', url: rss('https://www.defenseone.com/rss/all/'), type: 'defense' },
  { name: 'Bellingcat', url: rss('https://www.bellingcat.com/feed/'), type: 'osint' },
  { name: 'Foreign Policy', url: rss('https://foreignpolicy.com/feed/'), type: 'intl' },
];

export const INTEL_SOURCES: Feed[] = SITE_VARIANT === 'polkam' ? POLKAM_INTEL_SOURCES : FULL_INTEL_SOURCES;

// Keywords that trigger alert status - must be specific to avoid false positives
export const ALERT_KEYWORDS = [
  'war', 'invasion', 'military', 'nuclear', 'sanctions', 'missile',
  'airstrike', 'drone strike', 'troops deployed', 'armed conflict', 'bombing', 'casualties',
  'ceasefire', 'peace treaty', 'nato', 'coup', 'martial law',
  'assassination', 'terrorist', 'terror attack', 'cyber attack', 'hostage', 'evacuation order',
];

// Patterns that indicate non-alert content (lifestyle, entertainment, etc.)
export const ALERT_EXCLUSIONS = [
  'protein', 'couples', 'relationship', 'dating', 'diet', 'fitness',
  'recipe', 'cooking', 'shopping', 'fashion', 'celebrity', 'movie',
  'tv show', 'sports', 'game', 'concert', 'festival', 'wedding',
  'vacation', 'travel tips', 'life hack', 'self-care', 'wellness',
];
