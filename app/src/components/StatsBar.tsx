import { TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
import type { ProcessedStation } from '@/types/river';

interface StatsBarProps {
  stations: ProcessedStation[];
}

export default function StatsBar({ stations }: StatsBarProps) {
  const total = stations.length;
  const rising = stations.filter(s => s.trend === 'rising').length;
  const falling = stations.filter(s => s.trend === 'falling').length;
  const warning = stations.filter(s => s.overWarning).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div className="bg-white dark:bg-[#1E2330] rounded-lg border border-slate-200 dark:border-[#2D3548] p-3 transition-colors duration-300">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-blue-500 dark:text-[#3B82F6]" />
          <span className="text-xs text-slate-500 dark:text-[#94A3B8]">监控站点</span>
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{total}</span>
      </div>

      <div className="bg-white dark:bg-[#1E2330] rounded-lg border border-slate-200 dark:border-[#2D3548] p-3 transition-colors duration-300">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-red-500 dark:text-[#EF4444]" />
          <span className="text-xs text-slate-500 dark:text-[#94A3B8]">涨水站点</span>
        </div>
        <span className="text-xl font-bold text-red-500 dark:text-[#EF4444] tabular-nums">{rising}</span>
      </div>

      <div className="bg-white dark:bg-[#1E2330] rounded-lg border border-slate-200 dark:border-[#2D3548] p-3 transition-colors duration-300">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="w-4 h-4 text-emerald-500 dark:text-[#10B981]" />
          <span className="text-xs text-slate-500 dark:text-[#94A3B8]">落水站点</span>
        </div>
        <span className="text-xl font-bold text-emerald-600 dark:text-[#10B981] tabular-nums">{falling}</span>
      </div>

      <div className={`rounded-lg border p-3 transition-colors duration-300 ${warning > 0 ? 'bg-red-50 dark:bg-[#EF4444]/10 border-red-200 dark:border-[#EF4444]/30' : 'bg-white dark:bg-[#1E2330] border-slate-200 dark:border-[#2D3548]'}`}>
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className={`w-4 h-4 ${warning > 0 ? 'text-red-500 dark:text-[#EF4444]' : 'text-slate-400 dark:text-[#94A3B8]'}`} />
          <span className="text-xs text-slate-500 dark:text-[#94A3B8]">超警站点</span>
        </div>
        <span className={`text-xl font-bold tabular-nums ${warning > 0 ? 'text-red-500 dark:text-[#EF4444]' : 'text-emerald-600 dark:text-[#10B981]'}`}>
          {warning}
        </span>
      </div>
    </div>
  );
}
