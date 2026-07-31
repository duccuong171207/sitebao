import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MarketIndex } from '../types';

const INITIAL_MARKETS: MarketIndex[] = [
  { symbol: 'S&P 500', name: 'S&P 500', value: '5,682.14', change: '+24.12 (+0.43%)', isPositive: true },
  { symbol: 'NASDAQ', name: 'Nasdaq Comp', value: '18,124.80', change: '+128.40 (+0.71%)', isPositive: true },
  { symbol: 'DOW', name: 'Dow Jones', value: '40,890.22', change: '-12.30 (-0.03%)', isPositive: false },
  { symbol: 'BRENT', name: 'Brent Crude', value: '$84.15', change: '+$1.12 (+1.35%)', isPositive: true },
  { symbol: 'GOLD', name: 'Gold Oz', value: '$2,412.50', change: '+$8.20 (+0.34%)', isPositive: true },
  { symbol: 'BTC', name: 'Bitcoin', value: '$68,450.00', change: '+$1,240.00 (+1.85%)', isPositive: true }
];

export const MarketTicker: React.FC = () => {
  return (
    <div className="bg-[#FCFAF7] text-[#1A1A1A] text-[11px] uppercase tracking-widest font-bold border-b border-black/5 py-1.5 px-4 sm:px-6 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 whitespace-nowrap">
        <span className="text-black/50 font-bold text-[10px] flex items-center gap-1.5 border-r border-black/10 pr-4 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          Live Indices
        </span>

        <div className="flex items-center gap-6 divide-x divide-black/10">
          {INITIAL_MARKETS.map((m) => (
            <div key={m.symbol} className="flex items-center gap-2 pl-4 first:pl-0">
              <span className="font-bold text-black">{m.symbol}</span>
              <span className="text-gray-600 font-mono text-[10px]">{m.value}</span>
              <span className={`font-mono flex items-center gap-0.5 text-[10px] font-bold ${m.isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                {m.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {m.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
