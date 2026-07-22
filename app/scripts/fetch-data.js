/**
 * 构建前自动获取最新水文数据
 * 从源站 http://www.schwr.com:8088/api/sl/stRiverR/listRelRvfcch 获取
 * 保存到 public/data.json，供前端同域加载
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET = 'www.schwr.com';
const API_PATH = '/api/sl/stRiverR/listRelRvfcch';
const OUTPUT = path.resolve(__dirname, '../public/data.json');

function fetchData() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: TARGET,
        port: 8088,
        path: API_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 15000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.code === 200 && Array.isArray(json.result)) {
              resolve(json);
            } else {
              reject(new Error(`API返回异常: ${JSON.stringify(json).slice(0, 200)}`));
            }
          } catch (e) {
            reject(new Error(`解析失败: ${e.message}, 原始数据: ${data.slice(0, 200)}`));
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.write('{}');
    req.end();
  });
}

async function main() {
  console.log('[fetch-data] 正在获取最新水文数据...');

  // 确保 public 目录存在
  const publicDir = path.dirname(OUTPUT);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  try {
    const data = await fetchData();

    // 添加元数据
    const output = {
      ...data,
      _meta: {
        fetchedAt: new Date().toISOString(),
        source: 'http://www.schwr.com:8088/river',
      },
    };

    fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));

    const stations = data.result || [];
    const tm = stations[0]?.tm ? new Date(stations[0].tm).toLocaleString('zh-CN') : '未知';
    console.log(`[fetch-data] 成功获取 ${stations.length} 个站点，数据时间: ${tm}`);
    console.log(`[fetch-data] 已保存到: ${OUTPUT}`);
  } catch (err) {
    console.error(`[fetch-data] 获取失败: ${err.message}`);

    // 如果已有旧数据，保留旧数据继续构建
    if (fs.existsSync(OUTPUT)) {
      console.log('[fetch-data] 保留已有的旧数据继续构建...');
      process.exit(0);
    }

    // 如果完全没有数据，创建一个空结构保证构建不中断
    console.log('[fetch-data] 创建空数据结构作为保底...');
    const emptyData = {
      code: 200,
      result: [],
      _meta: { fetchedAt: new Date().toISOString(), source: 'fallback', error: err.message },
    };
    fs.writeFileSync(OUTPUT, JSON.stringify(emptyData, null, 2));
    process.exit(0);
  }
}

main();
