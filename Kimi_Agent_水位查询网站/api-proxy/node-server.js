/**
 * 四川水情 API 代理 - Node.js 版本
 *
 * 部署方式（任选一种）：
 *
 * 【方式1：直接运行】
 *   npm install
 *   node node-server.js
 *
 * 【方式2：PM2 守护】
 *   npm install -g pm2
 *   pm2 start node-server.js --name river-proxy
 *   pm2 save && pm2 startup
 *
 * 【方式3：Docker】
 *   docker build -t river-proxy .
 *   docker run -d -p 3001:3001 --name river-proxy river-proxy
 *
 * 部署后，将地址填入前端 riverData.ts 的 PROXY_URL 中
 * 例如：PROXY_URL = 'https://你的域名/proxy'
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3001;
const TARGET_HOST = 'www.schwr.com';
const TARGET_PATH = '/api/sl/stRiverR/listRelRvfcch';
const TARGET_PORT = 8088;

// CORS 允许的源
const ALLOWED_ORIGINS = [
  'https://hdukzc66zmez6.ok.kimi.link',
  'http://localhost:5173',
  // 添加你的前端域名
];

function getCorsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || '';

  // CORS 预检
  if (req.method === 'OPTIONS') {
    const headers = getCorsHeaders(origin);
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res.writeHead(204);
    res.end();
    return;
  }

  // 只接受 POST
  if (req.method !== 'POST') {
    const headers = getCorsHeaders(origin);
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // 代理请求到目标 API
  const proxyReq = http.request({
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: TARGET_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': 2, // '{}' 的长度
    },
    timeout: 3000, // 3秒超时
  }, (proxyRes) => {
    const headers = getCorsHeaders(origin);
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    const headers = getCorsHeaders(origin);
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    const headers = getCorsHeaders(origin);
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res.writeHead(504);
    res.end(JSON.stringify({ error: 'Gateway timeout' }));
  });

  proxyReq.write('{}');
  proxyReq.end();
});

server.listen(PORT, () => {
  console.log(`River API proxy running on port ${PORT}`);
  console.log(`Proxy: http://localhost:${PORT} → http://${TARGET_HOST}:${TARGET_PORT}${TARGET_PATH}`);
});
