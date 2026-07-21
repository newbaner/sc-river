export const config = {
  runtime: 'nodejs22.x',
};

const http = require('node:http');
const dns = require('node:dns');
const { promisify } = require('node:util');

const dnsLookup = promisify(dns.lookup);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const diagnostics = { steps: [] };

  try {
    diagnostics.steps.push('1. DNS lookup...');
    try {
      const { address, family } = await dnsLookup('www.schwr.com');
      diagnostics.steps.push(`1. DNS OK: ${address} (IPv${family})`);
    } catch (dnsErr) {
      diagnostics.steps.push(`1. DNS FAIL: ${dnsErr.code} - ${dnsErr.message}`);
    }

    diagnostics.steps.push('2. HTTP request...');
    const proxyRes = await new Promise((resolve, reject) => {
      const proxyReq = http.request(
        {
          hostname: 'www.schwr.com',
          port: 8088,
          path: '/api/sl/stRiverR/listRelRvfcch',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          timeout: 8000,
        },
        (proxyRes) => resolve(proxyRes)
      );

      proxyReq.on('error', (err) => {
        diagnostics.steps.push(`2. HTTP FAIL: code=${err.code}, syscall=${err.syscall}, message=${err.message}`);
        reject(err);
      });

      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        diagnostics.steps.push('2. HTTP TIMEOUT after 8s');
        reject(new Error('Timeout'));
      });

      proxyReq.write('{}');
      proxyReq.end();
    });

    let data = '';
    for await (const chunk of proxyRes) {
      data += chunk;
    }

    diagnostics.steps.push(`3. HTTP OK: status=${proxyRes.statusCode}, bodyLen=${data.length}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(proxyRes.statusCode || 200).send(data);

  } catch (err) {
    diagnostics.steps.push(`4. Final error: ${err.message}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({
      error: '代理请求失败',
      message: err.message,
      code: err.code || null,
      diagnostics: diagnostics.steps,
    });
  }
}
