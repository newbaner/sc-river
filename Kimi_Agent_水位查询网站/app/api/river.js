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
    // DNS
    diagnostics.push('1. DNS...');
    try {
      const { address } = await dnsLookup('www.schwr.com');
      diagnostics.push('1. DNS OK: ' + address);
    } catch (e) {
      diagnostics.push('1. DNS FAIL: ' + (e.code || e.message));
    }

    // HTTPbin via fetch
    diagnostics.push('2. fetch httpbin...');
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch('http://httpbin.org/get', { signal: ctrl.signal });
      clearTimeout(t);
      diagnostics.push('2. fetch httpbin OK: ' + r.status);
    } catch (e) {
      diagnostics.push('2. fetch httpbin FAIL: ' + (e.name || e.message));
    }

    // schwr via fetch
    diagnostics.push('3. fetch schwr...');
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch('http://www.schwr.com:8088/api/sl/stRiverR/listRelRvfcch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: ctrl.signal,
      });
      clearTimeout(t);
      const data = await r.text();
      diagnostics.push('3. fetch schwr OK: ' + r.status + ', len=' + data.length);
      res.writeHead(r.status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(data);
    } catch (e) {
      diagnostics.push('3. fetch schwr FAIL: ' + (e.name || e.message));
    }

    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 'All failed', diagnostics }));

  } catch (err) {
    diagnostics.push('FATAL: ' + (err.name || err.message));
    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 'Fatal', diagnostics }));
  }
}
