import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import type { ProcessedStation } from '@/types/river';
import { generateMockHistory } from '@/services/riverData';

interface MiniChartProps {
  station: ProcessedStation;
}

export default function MiniChart({ station }: MiniChartProps) {
  const data = generateMockHistory(station.z, station.trend);

  const strokeColor = station.trend === 'rising'
    ? '#EF4444'
    : station.trend === 'falling'
    ? '#10B981'
    : '#3B82F6';

  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${station.stcd}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={['auto', 'auto']} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#gradient-${station.stcd})`}
            dot={false}
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
