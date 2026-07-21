export interface StationData {
  stcd: string;      // 站点代码
  stnm: string;      // 站点名称
  rvnm: string;      // 河名
  sttp: string | null; // 站点类型
  tm: number;        // 时间戳
  day: number | null;
  month: number | null;
  z: number;         // 当前水位
  q: number | null;  // 流量
  lgtd: number | null; // 经度
  lttd: number | null; // 纬度
  wptn: string;      // 水势: 4=落, 5=涨, 6=平
  wrz: number | null; // 警戒水位
  wrq: number | null; // 警戒流量
  grz: number | null; // 保证水位
  grq: number | null; // 保证流量
  stlc: string;      // 站址
}

export type WaterTrend = 'rising' | 'falling' | 'stable';

export interface ProcessedStation extends StationData {
  riverName: string;     // 清理后的河名
  location: string;      // 清理后的站址
  trend: WaterTrend;     // 水势趋势
  overWarning: boolean;  // 是否超警
  overEnsure: boolean;   // 是否超保
  warningDiff: number;   // 超警差值 (正数表示超警)
  ensureDiff: number;    // 超保差值
}

// 水势代码映射
export const WPTN_MAP: Record<string, WaterTrend> = {
  '4': 'falling',
  '5': 'rising',
  '6': 'stable',
};
