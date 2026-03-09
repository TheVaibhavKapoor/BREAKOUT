import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Activity } from 'lucide-react';
import { ScreenerRow } from '../types';

interface ScreenerGridProps {
  data: ScreenerRow[];
  loading: boolean;
}

export function ScreenerGrid({ data, loading }: ScreenerGridProps) {
  const getSignalIcon = (signalType: string) => {
    switch (signalType) {
      case 'ema_crossover_bullish':
      case 'reversal_bullish':
      case 'resistance_breakout':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'ema_crossover_bearish':
      case 'reversal_bearish':
      case 'support_breakdown':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSignalLabel = (signalType: string) => {
    const labels: Record<string, string> = {
      ema_crossover_bullish: 'EMA Bull Cross',
      ema_crossover_bearish: 'EMA Bear Cross',
      resistance_breakout: 'Resistance BO',
      support_breakdown: 'Support BD',
      reversal_bullish: 'Bull Reversal',
      reversal_bearish: 'Bear Reversal',
    };
    return labels[signalType] || signalType;
  };

  const getSignalColor = (signalType: string) => {
    if (signalType.includes('bullish') || signalType === 'resistance_breakout') {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (signalType.includes('bearish') || signalType === 'support_breakdown') {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
    return volume.toString();
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading breakout signals...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No breakout signals found</p>
        <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or add sample data</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">EMA 50</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">EMA 200</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Volume</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Signals</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">S/R Levels</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">News</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row) => {
              const latestData = row.latest_daily || row.latest_weekly;
              const ema50 = latestData?.ema_50;
              const ema200 = latestData?.ema_200;
              const price = latestData?.close || 0;

              return (
                <tr key={row.stock.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900">{row.stock.symbol}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{row.stock.name}</div>
                    <div className="text-xs text-gray-500">{row.stock.sector}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(price)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ema50 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-900">{formatPrice(ema50)}</span>
                        {price > ema50 ? (
                          <ArrowUpCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ema200 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-900">{formatPrice(ema200)}</span>
                        {price > ema200 ? (
                          <ArrowUpCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatVolume(latestData?.volume || 0)}</div>
                    {row.signals.length > 0 && row.signals[0].volume_avg_20 && (
                      <div className="text-xs text-gray-500">
                        Avg: {formatVolume(row.signals[0].volume_avg_20)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {row.signals.slice(0, 3).map((signal) => (
                        <div
                          key={signal.id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSignalColor(signal.signal_type)}`}
                        >
                          {getSignalIcon(signal.signal_type)}
                          <span>{getSignalLabel(signal.signal_type)}</span>
                          <span className="text-xs opacity-75">({signal.timeframe})</span>
                        </div>
                      ))}
                      {row.signals.length > 3 && (
                        <span className="text-xs text-gray-500">+{row.signals.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {row.support_resistance.slice(0, 2).map((sr) => (
                        <div key={sr.id} className="text-xs">
                          <span className={sr.type === 'resistance' ? 'text-red-600' : 'text-green-600'}>
                            {sr.type === 'resistance' ? 'R' : 'S'}: {formatPrice(sr.level)}
                          </span>
                          <span className="text-gray-500 ml-1">({sr.strength}/10)</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {row.recent_news.length > 0 ? (
                      <div className="space-y-1">
                        {row.recent_news.slice(0, 2).map((news) => (
                          <div key={news.id} className="text-xs">
                            <a
                              href={news.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline line-clamp-1"
                            >
                              {news.title}
                            </a>
                            <div className="flex items-center gap-1 text-gray-500">
                              <span>{news.source}</span>
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                news.sentiment === 'positive' ? 'bg-green-500' :
                                news.sentiment === 'negative' ? 'bg-red-500' :
                                'bg-gray-400'
                              }`}></span>
                            </div>
                          </div>
                        ))}
                        {row.recent_news.length > 2 && (
                          <span className="text-xs text-gray-500">+{row.recent_news.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No recent news</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
