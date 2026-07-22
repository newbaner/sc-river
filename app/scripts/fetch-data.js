import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.resolve(__dirname, '../public/data.json');

function fetchData() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'www.schwr.com',
      port: 8088,
      path: '/api/sl/stRiverR/listRelRvfcch',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 200 && Array.isArray(json.result)) resolve(json);
          else reject(new Error(`API异常: ${JSON.stringify(json).slice(0,200)}`));
        } catch (e) { reject(new Error(`解析失败: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('超时')); });
    req.write('{}'); req.end();
  });
}

async function main() {
  console.log('[fetch-data] 获取最新水文数据...');
  const dir = path.dirname(OUTPUT);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  try {
    const data = await fetchData();
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
}
main();
