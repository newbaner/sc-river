const http = require('node:http');
const dns = require('node:dns');
const { promisify } = require('node:util');

const dnsLookup = promisify(dns.lookup);

module.exports = async function handler(req, res) {
  // CORS 预检
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
    // Step 1: DNS
    diagnostics.push('1. DNS...');
    try {
      const { address } = await dnsLookup('www.schwr.com');
      diagnostics.push('1. DNS OK: ' + address);
    } catch (e) {
      diagnostics.push('1. DNS FAIL: ' + (e.code || e.message));
    }

    // Step 2: Test outbound HTTP to httpbin
    diagnostics.push('2. HTTPbin...');
    try {
      const result = await new Promise((resolve, reject) => {
        const r = http.request({ hostname: 'httpbin.org', path: '/get', method: 'GET', timeout: 5000 }, (resp) => {
          let d = ''; resp.on('data', c => d += c); resp.on('end', () => resolve({ s: resp.statusCode }));
        });
        r.on('error', reject); r.on('timeout', () => { r.destroy(); reject(new Error('T/O')); }); r.end();
      });
      diagnostics.push('2. HTTPbin OK: ' + result.s);
    } catch (e) {
      diagnostics.push('2. HTTPbin FAIL: ' + (e.code || e.message));
    }

    // Step 3: Request to schwr.com:8088
    diagnostics.push('3. schwr...');
    const proxyRes = await new Promise((resolve, reject) => {
      const proxyReq = http.request(
        {
          hostname: 'www.schwr.com',
          port: 8088,
          path: '/api/sl/stRiverR/listRelRvfcch',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        },
        (proxyRes) => resolve(proxyRes)
      );
      proxyReq.on('error', (err) => reject(err));
      proxyReq.on('timeout', () => { proxyReq.destroy(); reject(new Error('Timeout')); });
      proxyReq.write('{}');
      proxyReq.end();
    });

    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      diagnostics.push('3. schwr OK: status=' + proxyRes.statusCode + ', len=' + data.length);
      res.writeHead(proxyRes.statusCode || 200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });

  } catch (err) {
    diagnostics.push('4. ERROR: ' + (err.code || err.message));
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      error: 'Proxy failed',
      message: err.message,
      diagnostics: diagnostics
    }));
  }
};
