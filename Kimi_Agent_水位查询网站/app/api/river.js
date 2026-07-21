const http = require('node:http');
const https = require('node:https');
const dns = require('node:dns');
const { promisify } = require('node:util');

const dnsLookup = promisify(dns.lookup);

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const diagnostics = [];

  // Test 1: DNS
  diagnostics.push('T1: DNS www.schwr.com...');
  try {
    const { address } = await dnsLookup('www.schwr.com');
    diagnostics.push(`T1: DNS OK: ${address}`);
  } catch (e) {
    diagnostics.push(`T1: DNS FAIL: ${e.code}`);
  }

  // Test 2: HTTP to httpbin.org (verify outbound HTTP works)
  diagnostics.push('T2: HTTP httpbin.org/get...');
  try {
    const result = await httpRequest({ hostname: 'httpbin.org', path: '/get', method: 'GET', protocol: 'http:', timeout: 5000 });
    diagnostics.push(`T2: HTTPbin OK: ${result.status}`);
  } catch (e) {
    diagnostics.push(`T2: HTTPbin FAIL: ${e.code || e.message}`);
  }

  // Test 3: HTTPS to httpbin.org
  diagnostics.push('T3: HTTPS httpbin.org/get...');
  try {
    const result = await httpRequest({ hostname: 'httpbin.org', path: '/get', method: 'GET', protocol: 'https:', timeout: 5000 });
    diagnostics.push(`T3: HTTPS OK: ${result.status}`);
  } catch (e) {
    diagnostics.push(`T3: HTTPS FAIL: ${e.code || e.message}`);
  }

  // Test 4: HTTP to schwr.com:8088
  diagnostics.push('T4: HTTP schwr.com:8088...');
  try {
    const result = await httpRequest({
      hostname: 'www.schwr.com', port: 8088, path: '/api/sl/stRiverR/listRelRvfcch',
      method: 'POST', protocol: 'http:', timeout: 8000,
      headers: { 'Content-Type': 'application/json' }
    }, '{}');
    diagnostics.push(`T4: schwr OK: ${result.status}, len=${result.data.length}`);
    if (result.status === 200) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).send(result.data);
    }
  } catch (e) {
    diagnostics.push(`T4: schwr FAIL: ${e.code || e.message}`);
  }

  // All tests failed, return diagnostics
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(500).json({ error: 'All outbound requests failed', diagnostics });
};
