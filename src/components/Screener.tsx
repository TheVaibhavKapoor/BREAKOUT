import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ScreenerRow, Stock, BreakoutSignal, DailyCandle, WeeklyCandle, SupportResistance, News } from '../types';
import { ScreenerFilters } from './ScreenerFilters';
import { ScreenerGrid } from './ScreenerGrid';
import { SampleDataButton } from './SampleDataButton';

export function Screener() {
  const [data, setData] = useState<ScreenerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signalType, setSignalType] = useState('all');
  const [timeframe, setTimeframe] = useState('all');

  const fetchScreenerData = async () => {
    setLoading(true);
    try {
      const { data: stocks, error: stocksError } = await supabase
        .from('stocks')
        .select('*')
        .order('symbol');

      if (stocksError) throw stocksError;

      const screenerData: ScreenerRow[] = await Promise.all(
        (stocks || []).map(async (stock: Stock) => {
          let signalsQuery = supabase
            .from('breakout_signals')
            .select('*')
            .eq('stock_id', stock.id)
            .order('signal_date', { ascending: false });

          if (signalType !== 'all') {
            signalsQuery = signalsQuery.eq('signal_type', signalType);
          }

          if (timeframe !== 'all') {
            signalsQuery = signalsQuery.eq('timeframe', timeframe);
          }

          const [
            { data: signals },
            { data: dailyCandles },
            { data: weeklyCandles },
            { data: supportResistance },
            { data: news },
          ] = await Promise.all([
            signalsQuery,
            supabase
              .from('daily_candles')
              .select('*')
              .eq('stock_id', stock.id)
              .order('date', { ascending: false })
              .limit(1)
              .maybeSingle(),
            supabase
              .from('weekly_candles')
              .select('*')
              .eq('stock_id', stock.id)
              .order('week_start', { ascending: false })
              .limit(1)
              .maybeSingle(),
            supabase
              .from('support_resistance')
              .select('*')
              .eq('stock_id', stock.id)
              .order('strength', { ascending: false })
              .limit(5),
            supabase
              .from('news')
              .select('*')
              .eq('stock_id', stock.id)
              .order('published_at', { ascending: false })
              .limit(5),
          ]);

          return {
            stock,
            latest_daily: dailyCandles as DailyCandle | null,
            latest_weekly: weeklyCandles as WeeklyCandle | null,
            signals: (signals || []) as BreakoutSignal[],
            support_resistance: (supportResistance || []) as SupportResistance[],
            recent_news: (news || []) as News[],
          };
        })
      );

      const filteredData = screenerData.filter(row => row.signals.length > 0);
      setData(filteredData);
    } catch (error) {
      console.error('Error fetching screener data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenerData();
  }, [signalType, timeframe]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Breakout Screener</h1>
                <p className="text-gray-600 mt-1">EMA Crossovers, Support/Resistance & Volume Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SampleDataButton />
              <button
                onClick={fetchScreenerData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <ScreenerFilters
          signalType={signalType}
          timeframe={timeframe}
          onSignalTypeChange={setSignalType}
          onTimeframeChange={setTimeframe}
        />

        <ScreenerGrid data={data} loading={loading} />
      </div>
    </div>
  );
}
