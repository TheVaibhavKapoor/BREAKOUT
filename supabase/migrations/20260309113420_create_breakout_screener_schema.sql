/*
  # Breakout Screener Database Schema

  1. New Tables
    - `stocks`
      - `id` (uuid, primary key)
      - `symbol` (text, unique) - Stock ticker symbol
      - `name` (text) - Company name
      - `exchange` (text) - Stock exchange
      - `sector` (text) - Company sector
      - `last_updated` (timestamptz) - Last data update timestamp
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `daily_candles`
      - `id` (uuid, primary key)
      - `stock_id` (uuid, foreign key to stocks)
      - `date` (date) - Trading date
      - `open` (decimal) - Opening price
      - `high` (decimal) - Highest price
      - `low` (decimal) - Lowest price
      - `close` (decimal) - Closing price
      - `volume` (bigint) - Trading volume
      - `ema_50` (decimal) - 50-period EMA
      - `ema_200` (decimal) - 200-period EMA
      - `created_at` (timestamptz)
    
    - `weekly_candles`
      - `id` (uuid, primary key)
      - `stock_id` (uuid, foreign key to stocks)
      - `week_start` (date) - Week starting date
      - `open` (decimal) - Opening price
      - `high` (decimal) - Highest price
      - `low` (decimal) - Lowest price
      - `close` (decimal) - Closing price
      - `volume` (bigint) - Trading volume
      - `ema_50` (decimal) - 50-period EMA
      - `ema_200` (decimal) - 200-period EMA
      - `created_at` (timestamptz)
    
    - `support_resistance`
      - `id` (uuid, primary key)
      - `stock_id` (uuid, foreign key to stocks)
      - `level` (decimal) - Price level
      - `type` (text) - 'support' or 'resistance'
      - `strength` (integer) - Strength score (1-10)
      - `timeframe` (text) - 'daily' or 'weekly'
      - `created_at` (timestamptz)
    
    - `breakout_signals`
      - `id` (uuid, primary key)
      - `stock_id` (uuid, foreign key to stocks)
      - `signal_date` (date) - Date of signal
      - `signal_type` (text) - 'ema_crossover_bullish', 'ema_crossover_bearish', 'resistance_breakout', 'support_breakdown', 'reversal_bullish', 'reversal_bearish'
      - `timeframe` (text) - 'daily' or 'weekly'
      - `price` (decimal) - Price at signal
      - `volume` (bigint) - Volume at signal
      - `volume_avg_20` (bigint) - 20-period average volume
      - `created_at` (timestamptz)
    
    - `news`
      - `id` (uuid, primary key)
      - `stock_id` (uuid, foreign key to stocks)
      - `title` (text) - News headline
      - `description` (text) - News description
      - `url` (text) - News article URL
      - `source` (text) - News source
      - `published_at` (timestamptz) - Publication timestamp
      - `sentiment` (text) - 'positive', 'negative', 'neutral'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data
    - Only service role can insert/update data

  3. Indexes
    - Added indexes for efficient querying on dates, symbols, and signal types
*/

-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  name text NOT NULL,
  exchange text DEFAULT '',
  sector text DEFAULT '',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create daily_candles table
CREATE TABLE IF NOT EXISTS daily_candles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid REFERENCES stocks(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  open decimal(12, 4) NOT NULL,
  high decimal(12, 4) NOT NULL,
  low decimal(12, 4) NOT NULL,
  close decimal(12, 4) NOT NULL,
  volume bigint NOT NULL,
  ema_50 decimal(12, 4),
  ema_200 decimal(12, 4),
  created_at timestamptz DEFAULT now(),
  UNIQUE(stock_id, date)
);

-- Create weekly_candles table
CREATE TABLE IF NOT EXISTS weekly_candles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid REFERENCES stocks(id) ON DELETE CASCADE NOT NULL,
  week_start date NOT NULL,
  open decimal(12, 4) NOT NULL,
  high decimal(12, 4) NOT NULL,
  low decimal(12, 4) NOT NULL,
  close decimal(12, 4) NOT NULL,
  volume bigint NOT NULL,
  ema_50 decimal(12, 4),
  ema_200 decimal(12, 4),
  created_at timestamptz DEFAULT now(),
  UNIQUE(stock_id, week_start)
);

-- Create support_resistance table
CREATE TABLE IF NOT EXISTS support_resistance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid REFERENCES stocks(id) ON DELETE CASCADE NOT NULL,
  level decimal(12, 4) NOT NULL,
  type text NOT NULL CHECK (type IN ('support', 'resistance')),
  strength integer NOT NULL CHECK (strength BETWEEN 1 AND 10),
  timeframe text NOT NULL CHECK (timeframe IN ('daily', 'weekly')),
  created_at timestamptz DEFAULT now()
);

-- Create breakout_signals table
CREATE TABLE IF NOT EXISTS breakout_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid REFERENCES stocks(id) ON DELETE CASCADE NOT NULL,
  signal_date date NOT NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('ema_crossover_bullish', 'ema_crossover_bearish', 'resistance_breakout', 'support_breakdown', 'reversal_bullish', 'reversal_bearish')),
  timeframe text NOT NULL CHECK (timeframe IN ('daily', 'weekly')),
  price decimal(12, 4) NOT NULL,
  volume bigint NOT NULL,
  volume_avg_20 bigint,
  created_at timestamptz DEFAULT now()
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid REFERENCES stocks(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  url text DEFAULT '',
  source text DEFAULT '',
  published_at timestamptz NOT NULL,
  sentiment text DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_candles_stock_date ON daily_candles(stock_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_candles_stock_date ON weekly_candles(stock_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_breakout_signals_stock_date ON breakout_signals(stock_id, signal_date DESC);
CREATE INDEX IF NOT EXISTS idx_breakout_signals_type ON breakout_signals(signal_type, signal_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_stock_published ON news(stock_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_resistance_stock ON support_resistance(stock_id, timeframe);

-- Enable Row Level Security
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_candles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_candles ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_resistance ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakout_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (screener is typically public)
CREATE POLICY "Anyone can view stocks"
  ON stocks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view daily candles"
  ON daily_candles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view weekly candles"
  ON weekly_candles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view support resistance"
  ON support_resistance FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view breakout signals"
  ON breakout_signals FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view news"
  ON news FOR SELECT
  TO anon, authenticated
  USING (true);