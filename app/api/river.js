export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const diagnostics = [];

  try {
    diagnostics.push('1. fetch httpbin...');
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 5000);
      const r = await fetch('https://httpbin.org/get', { signal: ctrl.signal });
      diagnostics.push('1. httpbin OK: ' + r.status);
    } catch (e) {
      diagnostics.push('1. httpbin FAIL: ' + (e.name || e.message));
    }

    diagnostics.push('2. fetch schwr...');
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 15000);
    const response = await fetch('http://www.schwr.com:8088/api/sl/stRiverR/listRelRvfcch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: ctrl.signal,
    });
    const data = await response.arrayBuffer();
    diagnostics.push('2. schwr OK: ' + response.status + ', len=' + data.byteLength);
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    diagnostics.push('3. ERROR: ' + (err.name || err.message));
    return new Response(JSON.stringify({ error: 'Proxy failed', diagnostics }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
