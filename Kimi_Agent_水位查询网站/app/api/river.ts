import http from 'node:http';

export default function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const proxyReq = http.request(
    {
      hostname: 'www.schwr.com',
      port: 8088,
      path: '/api/sl/stRiverR/listRelRvfcch',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 8000,
    },
    (proxyRes) => {
      let data = '';
      proxyRes.on('data', (chunk) => (data += chunk));
      proxyRes.on('end', () => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(proxyRes.statusCode || 200).send(data);
      });
    }
  );

  proxyReq.on('error', (err) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: '代理请求失败', message: err.message });
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(504).json({ error: '代理请求超时' });
  });

  proxyReq.write('{}');
  proxyReq.end();
}
