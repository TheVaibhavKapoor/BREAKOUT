export interface Stock {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  last_updated: string;
  created_at: string;
}

export interface DailyCandle {
  id: string;
  stock_id: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema_50: number | null;
  ema_200: number | null;
  created_at: string;
}

export interface WeeklyCandle {
  id: string;
  stock_id: string;
  week_start: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema_50: number | null;
  ema_200: number | null;
  created_at: string;
}

export interface SupportResistance {
  id: string;
  stock_id: string;
  level: number;
  type: 'support' | 'resistance';
  strength: number;
  timeframe: 'daily' | 'weekly';
  created_at: string;
}

export interface BreakoutSignal {
  id: string;
  stock_id: string;
  signal_date: string;
  signal_type: 'ema_crossover_bullish' | 'ema_crossover_bearish' | 'resistance_breakout' | 'support_breakdown' | 'reversal_bullish' | 'reversal_bearish';
  timeframe: 'daily' | 'weekly';
  price: number;
  volume: number;
  volume_avg_20: number | null;
  created_at: string;
}

export interface News {
  id: string;
  stock_id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  created_at: string;
}

export interface ScreenerRow {
  stock: Stock;
  latest_daily: DailyCandle | null;
  latest_weekly: WeeklyCandle | null;
  signals: BreakoutSignal[];
  support_resistance: SupportResistance[];
  recent_news: News[];
}
