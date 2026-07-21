import http from 'node:http';
import dns from 'node:dns';
import { promisify } from 'node:util';

const dnsLookup = promisify(dns.lookup);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const diagnostics = [];

  try {
    diagnostics.push('1. DNS...');
    try {
      const { address } = await dnsLookup('www.schwr.com');
      diagnostics.push('1. DNS OK: ' + address);
    } catch (e) {
      diagnostics.push('1. DNS FAIL: ' + (e.code || e.message));
    }

    diagnostics.push('2. HTTPbin...');
    try {
      await new Promise((resolve, reject) => {
        const r = http.request({ hostname: 'httpbin.org', path: '/get', method: 'GET', timeout: 5000 }, (resp) => {
          resp.on('data', () => {}); resp.on('end', () => resolve(null));
        });
        r.on('error', reject); r.on('timeout', () => { r.destroy(); reject(new Error('T/O')); }); r.end();
      });
      diagnostics.push('2. HTTPbin OK');
    } catch (e) {
      diagnostics.push('2. HTTPbin FAIL: ' + (e.code || e.message));
    }

    diagnostics.push('3. schwr...');
    const proxyRes = await new Promise((resolve, reject) => {
      const proxyReq = http.request({
        hostname: 'www.schwr.com', port: 8088,
        path: '/api/sl/stRiverR/listRelRvfcch',
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }, (proxyRes) => resolve(proxyRes));
      proxyReq.on('error', reject);
      proxyReq.on('timeout', () => { proxyReq.destroy(); reject(new Error('Timeout')); });
      proxyReq.write('{}');
      proxyReq.end();
    });

    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      diagnostics.push('3. schwr OK: status=' + proxyRes.statusCode);
      res.writeHead(proxyRes.statusCode || 200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });

  } catch (err) {
    diagnostics.push('4. ERROR: ' + (err.code || err.message));
    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 'Proxy failed', diagnostics }));
  }
}
