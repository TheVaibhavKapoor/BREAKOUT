import { useState } from 'react';
import { Database, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function SampleDataButton() {
  const [loading, setLoading] = useState(false);

  const calculateEMA = (prices: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const emaArray: number[] = [];

    emaArray[0] = prices[0];

    for (let i = 1; i < prices.length; i++) {
      emaArray[i] = prices[i] * k + emaArray[i - 1] * (1 - k);
    }

    return emaArray;
  };

  const generateSampleData = async () => {
    setLoading(true);
    try {
      const sampleStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Automotive' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology' },
      ];

      for (const stockData of sampleStocks) {
        const { data: existingStock } = await supabase
          .from('stocks')
          .select('id')
          .eq('symbol', stockData.symbol)
          .maybeSingle();

        let stockId: string;

        if (existingStock) {
          stockId = existingStock.id;
        } else {
          const { data: newStock, error: stockError } = await supabase
            .from('stocks')
            .insert(stockData)
            .select()
            .single();

          if (stockError) throw stockError;
          stockId = newStock.id;
        }

        const prices: number[] = [];
        const dailyCandles = [];
        const basePrice = Math.random() * 200 + 50;

        for (let i = 0; i < 250; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (250 - i));

          const volatility = 0.02;
          const trend = i < 200 ? -0.001 : 0.003;
          const price = i === 0 ? basePrice : prices[i - 1] * (1 + trend + (Math.random() - 0.5) * volatility);
          prices.push(price);

          const open = price * (1 + (Math.random() - 0.5) * 0.01);
          const close = price * (1 + (Math.random() - 0.5) * 0.01);
          const high = Math.max(open, close) * (1 + Math.random() * 0.01);
          const low = Math.min(open, close) * (1 - Math.random() * 0.01);
          const volume = Math.floor(Math.random() * 50000000 + 10000000);

          dailyCandles.push({
            stock_id: stockId,
            date: date.toISOString().split('T')[0],
            open,
            high,
            low,
            close,
            volume,
            ema_50: null,
            ema_200: null,
          });
        }

        const ema50Values = calculateEMA(prices, 50);
        const ema200Values = calculateEMA(prices, 200);

        dailyCandles.forEach((candle, idx) => {
          candle.ema_50 = ema50Values[idx];
          candle.ema_200 = ema200Values[idx];
        });

        await supabase.from('daily_candles').delete().eq('stock_id', stockId);
        const { error: candlesError } = await supabase
          .from('daily_candles')
          .insert(dailyCandles);

        if (candlesError) throw candlesError;

        const signals = [];
        for (let i = 200; i < dailyCandles.length - 1; i++) {
          const prevEma50 = ema50Values[i - 1];
          const prevEma200 = ema200Values[i - 1];
          const currEma50 = ema50Values[i];
          const currEma200 = ema200Values[i];

          if (prevEma50 < prevEma200 && currEma50 > currEma200) {
            signals.push({
              stock_id: stockId,
              signal_date: dailyCandles[i].date,
              signal_type: 'ema_crossover_bullish',
              timeframe: 'daily',
              price: dailyCandles[i].close,
              volume: dailyCandles[i].volume,
              volume_avg_20: Math.floor(dailyCandles.slice(Math.max(0, i - 20), i).reduce((sum, c) => sum + c.volume, 0) / 20),
            });
          } else if (prevEma50 > prevEma200 && currEma50 < currEma200) {
            signals.push({
              stock_id: stockId,
              signal_date: dailyCandles[i].date,
              signal_type: 'ema_crossover_bearish',
              timeframe: 'daily',
              price: dailyCandles[i].close,
              volume: dailyCandles[i].volume,
              volume_avg_20: Math.floor(dailyCandles.slice(Math.max(0, i - 20), i).reduce((sum, c) => sum + c.volume, 0) / 20),
            });
          }

          const recentHigh = Math.max(...dailyCandles.slice(Math.max(0, i - 20), i).map(c => c.high));
          if (dailyCandles[i].close > recentHigh * 1.02) {
            signals.push({
              stock_id: stockId,
              signal_date: dailyCandles[i].date,
              signal_type: 'resistance_breakout',
              timeframe: 'daily',
              price: dailyCandles[i].close,
              volume: dailyCandles[i].volume,
              volume_avg_20: Math.floor(dailyCandles.slice(Math.max(0, i - 20), i).reduce((sum, c) => sum + c.volume, 0) / 20),
            });
          }
        }

        await supabase.from('breakout_signals').delete().eq('stock_id', stockId);
        if (signals.length > 0) {
          const { error: signalsError } = await supabase
            .from('breakout_signals')
            .insert(signals);

          if (signalsError) throw signalsError;
        }

        const latestPrice = prices[prices.length - 1];
        const supportResistance = [
          {
            stock_id: stockId,
            level: latestPrice * 0.95,
            type: 'support',
            strength: 7,
            timeframe: 'daily',
          },
          {
            stock_id: stockId,
            level: latestPrice * 1.05,
            type: 'resistance',
            timeframe: 'daily',
            strength: 8,
          },
        ];

        await supabase.from('support_resistance').delete().eq('stock_id', stockId);
        const { error: srError } = await supabase
          .from('support_resistance')
          .insert(supportResistance);

        if (srError) throw srError;

        const news = [
          {
            stock_id: stockId,
            title: `${stockData.symbol} Shows Strong Momentum`,
            description: 'Technical indicators suggest continued upward movement',
            url: '#',
            source: 'Market News',
            published_at: new Date().toISOString(),
            sentiment: 'positive',
          },
          {
            stock_id: stockId,
            title: `Analysts Upgrade ${stockData.symbol} Rating`,
            description: 'Multiple analysts raise price targets',
            url: '#',
            source: 'Financial Times',
            published_at: new Date(Date.now() - 86400000).toISOString(),
            sentiment: 'positive',
          },
        ];

        await supabase.from('news').delete().eq('stock_id', stockId);
        const { error: newsError } = await supabase
          .from('news')
          .insert(news);

        if (newsError) throw newsError;
      }

      alert('Sample data added successfully! Refresh the page to see the data.');
      window.location.reload();
    } catch (error) {
      console.error('Error generating sample data:', error);
      alert('Error generating sample data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generateSampleData}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          Adding Sample Data...
        </>
      ) : (
        <>
          <Database className="w-4 h-4" />
          Add Sample Data
        </>
      )}
    </button>
  );
}
