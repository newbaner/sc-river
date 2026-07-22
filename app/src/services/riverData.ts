import type { StationData, ProcessedStation, WaterTrend } from '@/types/river';

const WPTN_MAP: Record<string, WaterTrend> = {
  '4': 'falling',
  '5': 'rising',
  '6': 'stable',
};

const FALLBACK_DATA: StationData[] = [
  { stcd: "60104500", stnm: "泸州", rvnm: "长江", sttp: null, tm: 1752633600000, day: null, month: null, z: 230.01, q: 10700.0, lgtd: null, lttd: null, wptn: "5", wrz: 239.5, wrq: 39100.0, grz: 241.0, grq: 45400.0, stlc: "川泸州市" },
  { stcd: "60303400", stnm: "德昌", rvnm: "安宁河", sttp: null, tm: 1752633600000, day: null, month: null, z: 1329.1, q: 118.0, lgtd: null, lttd: null, wptn: "5", wrz: null, wrq: 1430.0, grz: null, grq: 2050.0, stlc: "川凉山州德昌县德州镇凤凰村" },
  { stcd: "60602600", stnm: "彭山（四）", rvnm: "岷江", sttp: null, tm: 1752633600000, day: null, month: null, z: 425.91, q: null, lgtd: null, lttd: null, wptn: "4", wrz: 423.5, wrq: 10800.0, grz: 424.5, grq: 14200.0, stlc: "川眉山市彭山区观音街道滨江路" },
  { stcd: "60603100", stnm: "五通桥（二）", rvnm: "岷江", sttp: null, tm: 1752633600000, day: null, month: null, z: 335.57, q: 4780.0, lgtd: null, lttd: null, wptn: "4", wrz: 342.2, wrq: 19200.0, grz: 343.5, grq: 24600.0, stlc: "川乐山市五通桥区金粟镇老龙坝村" },
  { stcd: "60608800", stnm: "沙湾", rvnm: "大渡河", sttp: null, tm: 1752633600000, day: null, month: null, z: 399.82, q: 2530.0, lgtd: null, lttd: null, wptn: "5", wrz: 405.1, wrq: 7000.0, grz: 405.95, grq: 8280.0, stlc: "川乐山市沙湾区沙湾镇" },
  { stcd: "60612000", stnm: "夹江", rvnm: "青衣江", sttp: null, tm: 1752633600000, day: null, month: null, z: 407.85, q: 1040.0, lgtd: null, lttd: null, wptn: "4", wrz: 412.0, wrq: 8640.0, grz: 413.5, grq: 13600.0, stlc: "川乐山市夹江县青衣街道千佛社区" },
  { stcd: "60612800", stnm: "三皇庙（二）", rvnm: "沱江", sttp: null, tm: 1752633600000, day: null, month: null, z: 435.57, q: 394.0, lgtd: null, lttd: null, wptn: "4", wrz: null, wrq: 4000.0, grz: null, grq: 5500.0, stlc: "川成都市金堂县赵镇狮子村" },
  { stcd: "60613300", stnm: "登瀛岩", rvnm: "沱江", sttp: null, tm: 1752633600000, day: null, month: null, z: 320.4, q: 347.0, lgtd: null, lttd: null, wptn: "5", wrz: 330.6, wrq: 6730.0, grz: 334.1, grq: 10200.0, stlc: "川内江市资中县归德镇特建村" },
  { stcd: "60711700", stnm: "风滩", rvnm: "巴河", sttp: null, tm: 1752633600000, day: null, month: null, z: 286.43, q: null, lgtd: null, lttd: null, wptn: "5", wrz: 300.2, wrq: 19200.0, grz: 301.4, grq: 22500.0, stlc: "川巴中市平昌县江口镇红庙村" },
  { stcd: "60711800", stnm: "三汇", rvnm: "渠江", sttp: null, tm: 1752633600000, day: null, month: null, z: 242.99, q: 217.0, lgtd: null, lttd: null, wptn: "4", wrz: 258.64, wrq: 16900.0, grz: 261.14, grq: 20300.0, stlc: "川达州市渠县三汇镇大盘村" },
  { stcd: "60713170", stnm: "罗江", rvnm: "州河", sttp: null, tm: 1752633600000, day: null, month: null, z: 271.44, q: null, lgtd: null, lttd: null, wptn: "5", wrz: 286.47, wrq: 12400.0, grz: 288.01, grq: 15200.0, stlc: "川达州市通川区北外镇徐家坝社区" },
  { stcd: "60714700", stnm: "涪江桥（二）", rvnm: "涪江", sttp: null, tm: 1752633600000, day: null, month: null, z: 460.37, q: null, lgtd: null, lttd: null, wptn: "5", wrz: 463.8, wrq: null, grz: 465.0, grq: null, stlc: "川绵阳市游仙区石马镇七姓村" },
];

function processStation(raw: StationData): ProcessedStation {
  const riverName = raw.rvnm.trim();
  const location = raw.stlc.trim();
  const trend = WPTN_MAP[raw.wptn] || 'stable';
  const overWarning = raw.wrz !== null ? raw.z > raw.wrz : false;
  const overEnsure = raw.grz !== null ? raw.z > raw.grz : false;
  const warningDiff = raw.wrz !== null ? raw.z - raw.wrz : -999;
  const ensureDiff = raw.grz !== null ? raw.z - raw.grz : -999;
  return { ...raw, riverName, location, trend, overWarning, overEnsure, warningDiff, ensureDiff };
}

export function generateMockHistory(baseZ: number, trend: WaterTrend): { time: string; value: number }[] {
  const data: { time: string; value: number }[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = t.getHours().toString().padStart(2, '0');
    const minute = t.getMinutes().toString().padStart(2, '0');
    const volatility = (Math.random() - 0.5) * 0.5;
    let current: number;
    if (trend === 'rising') current = baseZ - (i * 0.1) + volatility;
    else if (trend === 'falling') current = baseZ + (i * 0.1) + volatility;
    else current = baseZ + volatility;
    data.push({ time: `${hour}:${minute}`, value: parseFloat(current.toFixed(2)) });
  }
  data[data.length - 1].value = baseZ;
  return data;
}

async function loadFromStaticJson(): Promise<ProcessedStation[] | null> {
  try {
    const res = await fetch('/data.json', { cache: 'no-cache' });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code === 200 && Array.isArray(json.result) && json.result.length > 0) {
      return json.result.map((item: StationData) => processStation(item));
    }
    return null;
  } catch { return null; }
}

export function loadStationsFast(
  onUpdate: (stations: ProcessedStation[], fromApi: boolean) => void
): void {
  const fallback = FALLBACK_DATA.map(processStation);
  onUpdate(fallback, false);
  (async () => {
    const data = await loadFromStaticJson();
    if (data && data.length > 0) onUpdate(data, true);
  })();
}

export function getRiverList(stations: ProcessedStation[]): string[] {
  const rivers = new Set<string>();
  stations.forEach(s => rivers.add(s.riverName));
  return Array.from(rivers).sort();
}
