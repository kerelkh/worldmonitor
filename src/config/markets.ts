import type { Sector, Commodity, MarketSymbol } from '@/types';
import { SITE_VARIANT } from './variant';

export const SECTORS: Sector[] = [
  { symbol: 'XLK', name: 'Tech' },
  { symbol: 'XLF', name: 'Finance' },
  { symbol: 'XLE', name: 'Energy' },
  { symbol: 'XLV', name: 'Health' },
  { symbol: 'XLY', name: 'Consumer' },
  { symbol: 'XLI', name: 'Industrial' },
  { symbol: 'XLP', name: 'Staples' },
  { symbol: 'XLU', name: 'Utilities' },
  { symbol: 'XLB', name: 'Materials' },
  { symbol: 'XLRE', name: 'Real Est' },
  { symbol: 'XLC', name: 'Comms' },
  { symbol: 'SMH', name: 'Semis' },
];

const FULL_COMMODITIES: Commodity[] = [
  { symbol: '^VIX', name: 'VIX', display: 'VIX' },
  { symbol: 'GC=F', name: 'Gold', display: 'GOLD' },
  { symbol: 'CL=F', name: 'Crude Oil', display: 'OIL' },
  { symbol: 'NG=F', name: 'Natural Gas', display: 'NATGAS' },
  { symbol: 'SI=F', name: 'Silver', display: 'SILVER' },
  { symbol: 'HG=F', name: 'Copper', display: 'COPPER' },
];

const POLKAM_COMMODITIES: Commodity[] = [
  { symbol: 'CL=F', name: 'Crude Oil', display: 'OIL' },
  { symbol: 'NG=F', name: 'Natural Gas', display: 'NATGAS' },
  { symbol: 'GC=F', name: 'Gold', display: 'GOLD' },
  { symbol: 'HG=F', name: 'Copper', display: 'COPPER' },
  { symbol: 'NI=F', name: 'Nickel', display: 'NICKEL' },
  { symbol: 'KE=F', name: 'KC Wheat', display: 'WHEAT' },
  { symbol: 'SB=F', name: 'Sugar', display: 'SUGAR' },
  { symbol: 'KC=F', name: 'Coffee', display: 'COFFEE' },
  { symbol: 'RR=F', name: 'Rough Rice', display: 'RICE' },
  { symbol: 'CT=F', name: 'Cotton', display: 'COTTON' },
];

export const COMMODITIES: Commodity[] = SITE_VARIANT === 'polkam' ? POLKAM_COMMODITIES : FULL_COMMODITIES;

const FULL_MARKET_SYMBOLS: MarketSymbol[] = [
  { symbol: '^GSPC', name: 'S&P 500', display: 'SPX' },
  { symbol: '^DJI', name: 'Dow Jones', display: 'DOW' },
  { symbol: '^IXIC', name: 'NASDAQ', display: 'NDX' },
  { symbol: 'AAPL', name: 'Apple', display: 'AAPL' },
  { symbol: 'MSFT', name: 'Microsoft', display: 'MSFT' },
  { symbol: 'NVDA', name: 'NVIDIA', display: 'NVDA' },
  { symbol: 'GOOGL', name: 'Alphabet', display: 'GOOGL' },
  { symbol: 'AMZN', name: 'Amazon', display: 'AMZN' },
  { symbol: 'META', name: 'Meta', display: 'META' },
  { symbol: 'BRK-B', name: 'Berkshire', display: 'BRK.B' },
  { symbol: 'TSM', name: 'TSMC', display: 'TSM' },
  { symbol: 'LLY', name: 'Eli Lilly', display: 'LLY' },
  { symbol: 'TSLA', name: 'Tesla', display: 'TSLA' },
  { symbol: 'AVGO', name: 'Broadcom', display: 'AVGO' },
  { symbol: 'WMT', name: 'Walmart', display: 'WMT' },
  { symbol: 'JPM', name: 'JPMorgan', display: 'JPM' },
  { symbol: 'V', name: 'Visa', display: 'V' },
  { symbol: 'UNH', name: 'UnitedHealth', display: 'UNH' },
  { symbol: 'NVO', name: 'Novo Nordisk', display: 'NVO' },
  { symbol: 'XOM', name: 'Exxon', display: 'XOM' },
  { symbol: 'MA', name: 'Mastercard', display: 'MA' },
  { symbol: 'ORCL', name: 'Oracle', display: 'ORCL' },
  { symbol: 'PG', name: 'P&G', display: 'PG' },
  { symbol: 'COST', name: 'Costco', display: 'COST' },
  { symbol: 'JNJ', name: 'J&J', display: 'JNJ' },
  { symbol: 'HD', name: 'Home Depot', display: 'HD' },
  { symbol: 'NFLX', name: 'Netflix', display: 'NFLX' },
  { symbol: 'BAC', name: 'BofA', display: 'BAC' },
];

const POLKAM_MARKET_SYMBOLS: MarketSymbol[] = [
  // Indonesian indices
  { symbol: '^JKSE', name: 'IHSG', display: 'IHSG', currency: 'IDR' },
  // Indonesian blue chips (IDX-listed, priced in IDR)
  { symbol: 'BBCA.JK', name: 'Bank BCA', display: 'BBCA', currency: 'IDR' },
  { symbol: 'BBRI.JK', name: 'Bank BRI', display: 'BBRI', currency: 'IDR' },
  { symbol: 'BMRI.JK', name: 'Bank Mandiri', display: 'BMRI', currency: 'IDR' },
  { symbol: 'TLKM.JK', name: 'Telkom', display: 'TLKM', currency: 'IDR' },
  { symbol: 'ASII.JK', name: 'Astra Intl', display: 'ASII', currency: 'IDR' },
  { symbol: 'UNVR.JK', name: 'Unilever ID', display: 'UNVR', currency: 'IDR' },
  { symbol: 'GOTO.JK', name: 'GoTo', display: 'GOTO', currency: 'IDR' },
  { symbol: 'BREN.JK', name: 'Barito Renew', display: 'BREN', currency: 'IDR' },
  { symbol: 'AMMN.JK', name: 'Amman Mineral', display: 'AMMN', currency: 'IDR' },
  { symbol: 'ADRO.JK', name: 'Adaro Energy', display: 'ADRO', currency: 'IDR' },
  { symbol: 'ANTM.JK', name: 'Aneka Tambang', display: 'ANTM', currency: 'IDR' },
  { symbol: 'INCO.JK', name: 'Vale Indonesia', display: 'INCO', currency: 'IDR' },
  { symbol: 'PGAS.JK', name: 'Perusahaan Gas', display: 'PGAS', currency: 'IDR' },
  // Global reference indices (USD)
  { symbol: '^GSPC', name: 'S&P 500', display: 'SPX' },
  { symbol: '^DJI', name: 'Dow Jones', display: 'DOW' },
  { symbol: '^HSI', name: 'Hang Seng', display: 'HSI' },
  { symbol: '^N225', name: 'Nikkei 225', display: 'N225' },
  { symbol: '^STI', name: 'SGX Straits', display: 'STI' },
];

export const MARKET_SYMBOLS: MarketSymbol[] = SITE_VARIANT === 'polkam' ? POLKAM_MARKET_SYMBOLS : FULL_MARKET_SYMBOLS;

export const CRYPTO_IDS = ['bitcoin', 'ethereum', 'solana'] as const;

export const CRYPTO_MAP: Record<string, { name: string; symbol: string }> = {
  bitcoin: { name: 'Bitcoin', symbol: 'BTC' },
  ethereum: { name: 'Ethereum', symbol: 'ETH' },
  solana: { name: 'Solana', symbol: 'SOL' },
};
