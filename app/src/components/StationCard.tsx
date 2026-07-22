import { TrendingUp, TrendingDown, Minus, MapPin, AlertTriangle, Shield } from 'lucide-react';
import type { ProcessedStation } from '@/types/river';
import MiniChart from './MiniChart';

interface StationCardProps {
  station: ProcessedStation;
  index: number;
}

export default function StationCard({ station, index }: StationCardProps) {
  const isDangerous = station.overWarning || station.trend === 'rising';

  const trendConfig = {
    rising: {
      label: '涨水',
      icon: TrendingUp,
      badgeClass: 'bg-red-50 dark:bg-[#EF4444]/15 text-red-600 dark:text-[#EF4444] border-red-200 dark:border-[#EF4444]/30',
    },
    falling: {
      label: '落水',
      icon: TrendingDown,
      badgeClass: 'bg-emerald-50 dark:bg-[#10B981]/15 text-emerald-600 dark:text-[#10B981] border-emerald-200 dark:border-[#10B981]/30',
    },
    stable: {
      label: '持平',
      icon: Minus,
      badgeClass: 'bg-slate-100 dark:bg-[#94A3B8]/10 text-slate-500 dark:text-[#94A3B8] border-slate-200 dark:border-[#94A3B8]/20',
    },
  };

  const trend = trendConfig[station.trend];
  const TrendIcon = trend.icon;

  const date = new Date(station.tm);
  const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div
      className={`
        group relative bg-white dark:bg-[#1E2330] rounded-xl border transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-lg
        ${isDangerous
          ? 'border-red-200 dark:border-[#EF4444]/20 shadow-red-100 dark:shadow-[#EF4444]/[0.08] hover:border-red-300 dark:hover:border-[#EF4444]/40'
          : 'border-slate-200 dark:border-[#2D3548] hover:border-blue-300 dark:hover:border-[#3B82F6]/40'
        }
      `}
      style={{ animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s both` }}
    >
      {station.trend === 'rising' && station.overWarning && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 20px rgba(239,68,68,0.06)', animation: 'breathe 2s ease-in-out infinite alternate' }}
        />
      )}

      <div className="p-4">
        {/* 卡片头部 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate" title={station.stnm}>
              {station.stnm}
            </h2>
            {station.overWarning && (
              <AlertTriangle className="w-4 h-4 text-red-500 dark:text-[#EF4444] flex-shrink-0 animate-pulse" />
            )}
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${trend.badgeClass}`}>
            <TrendIcon className="w-3 h-3" />
            {trend.label}
          </span>
        </div>

        {/* 河名和地址 */}
        <div className="flex items-center gap-1.5 mb-4">
          <MapPin className="w-3 h-3 text-slate-400 dark:text-[#94A3B8] flex-shrink-0" />
          <span className="text-xs text-slate-500 dark:text-[#94A3B8] truncate">
            {station.riverName} · {station.location}
          </span>
        </div>

        {/* 核心水位数据 */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight tabular-nums ${station.overWarning ? 'text-red-500 dark:text-[#EF4444]' : 'text-slate-900 dark:text-white'}`}>
              {station.z.toFixed(2)}
            </span>
            <span className="text-sm text-slate-400 dark:text-[#94A3B8]">m</span>
          </div>
          {station.q !== null && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-slate-400 dark:text-[#94A3B8]">流量</span>
              <span className="text-sm font-medium text-blue-500 dark:text-[#3B82F6] tabular-nums">
                {station.q.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 dark:text-[#94A3B8]">m³/s</span>
            </div>
          )}
        </div>

        {/* 警戒线数据区 */}
        <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-t border-slate-100 dark:border-[#2D3548]">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3 text-amber-500 dark:text-[#F59E0B]" />
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">超警水位</span>
            </div>
            {station.wrz !== null ? (
              <div>
                <span className={`text-sm font-semibold tabular-nums ${station.warningDiff > 0 ? 'text-red-500 dark:text-[#EF4444]' : 'text-emerald-600 dark:text-[#10B981]'}`}>
                  {station.warningDiff > 0 ? '+' : ''}{station.warningDiff.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 dark:text-[#94A3B8] ml-1">m</span>
              </div>
            ) : (
              <span className="text-sm text-slate-400 dark:text-[#94A3B8]">—</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <Shield className="w-3 h-3 text-red-500 dark:text-[#EF4444]" />
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">超保水位</span>
            </div>
            {station.grz !== null ? (
              <div>
                <span className={`text-sm font-semibold tabular-nums ${station.ensureDiff > 0 ? 'text-red-500 dark:text-[#EF4444]' : 'text-emerald-600 dark:text-[#10B981]'}`}>
                  {station.ensureDiff > 0 ? '+' : ''}{station.ensureDiff.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 dark:text-[#94A3B8] ml-1">m</span>
              </div>
            ) : (
              <span className="text-sm text-slate-400 dark:text-[#94A3B8]">—</span>
            )}
          </div>
        </div>

        {/* 迷你图表 */}
        <MiniChart station={station} />

        {/* 底部时间 */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#2D3548]">
          <span className="text-xs text-slate-400 dark:text-[#94A3B8]">
            今日 {timeStr} 数据
          </span>
        </div>
      </div>
    </div>
  );
}
