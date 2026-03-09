import { Filter } from 'lucide-react';

interface ScreenerFiltersProps {
  signalType: string;
  timeframe: string;
  onSignalTypeChange: (value: string) => void;
  onTimeframeChange: (value: string) => void;
}

export function ScreenerFilters({
  signalType,
  timeframe,
  onSignalTypeChange,
  onTimeframeChange,
}: ScreenerFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Signal Type
          </label>
          <select
            value={signalType}
            onChange={(e) => onSignalTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Signals</option>
            <option value="ema_crossover_bullish">EMA Crossover (Bullish)</option>
            <option value="ema_crossover_bearish">EMA Crossover (Bearish)</option>
            <option value="resistance_breakout">Resistance Breakout</option>
            <option value="support_breakdown">Support Breakdown</option>
            <option value="reversal_bullish">Reversal (Bullish)</option>
            <option value="reversal_bearish">Reversal (Bearish)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeframe
          </label>
          <select
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Timeframes</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>
    </div>
  );
}
