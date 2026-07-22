import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.resolve(__dirname, '../public/data.json');

function fetchData() {
  try {
    const result = execSync(
      'curl -s -m 30 -X POST http://www.schwr.com:8088/api/sl/stRiverR/listRelRvfcch -H "Content-Type: application/json" -d "{}"',
      { encoding: 'utf-8', timeout: 35000 }
    );
    const json = JSON.parse(result);
    if (json.code === 200 && Array.isArray(json.result)) return json;
    throw new Error(`API异常: ${JSON.stringify(json).slice(0,200)}`);
  } catch (e) {
    throw new Error(`获取失败: ${e.message}`);
  }
}

const dir = path.dirname(OUTPUT);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

try {
  console.log('[fetch-data] 获取最新水文数据...');
  const data = fetchData();
  fs.writeFileSync(OUTPUT, JSON.stringify({ ...data, _meta: { fetchedAt: new Date().toISOString() } }, null, 2));
  const stations = data.result || [];
  const tm = stations[0]?.tm ? new Date(stations[0].tm).toLocaleString('zh-CN') : '未知';
  console.log(`[fetch-data] 成功获取 ${stations.length} 个站点，数据时间: ${tm}`);
} catch (err) {
  console.error(`[fetch-data] 失败: ${err.message}`);
  if (!fs.existsSync(OUTPUT)) {
    fs.writeFileSync(OUTPUT, JSON.stringify({ code: 200, result: [], _meta: { error: err.message } }, null, 2));
  }
}
