/**
 * 四川水情 API 代理 - Cloudflare Worker 版本
 * 
 * 部署步骤：
 * 1. 登录 https://workers.cloudflare.com/
 * 2. 创建新 Worker，粘贴此代码
 * 3. 保存并部署
 * 4. 将 WORKER_URL 填入前端 src/services/riverData.ts 的 PROXY_URL 中
 * 
 * 特点：全球边缘节点，响应 30-80ms，无 CORS 限制
 */

const TARGET_API = 'http://www.schwr.com:8088/api/sl/stRiverR/listRelRvfcch';
const ALLOWED_ORIGINS = [
  'https://hdukzc66zmez6.ok.kimi.link',  // 你的站点
  'http://localhost:5173',               // 本地开发
  // 添加其他允许的域名
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request),
      });
    }

    // 只接受 POST 请求
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: getCorsHeaders(request),
      });
    }

    try {
      // 请求目标 API（使用 Cloudflare 的边缘网络，非常快）
      const response = await fetch(TARGET_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{}',
        // 设置较短的超时，让 Worker 快速响应
        cf: {
          cacheTtl: 60,           // 缓存1分钟，减少重复请求
          cacheEverything: true,  // 缓存所有内容
        },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: 'Upstream API error', status: response.status }),
          { status: 502, headers: getCorsHeaders(request) }
        );
      }

      // 直接透传响应体，减少处理开销
      const body = await response.arrayBuffer();

      return new Response(body, {
        status: 200,
        headers: getCorsHeaders(request),
      });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Proxy error', message: err.message }),
        { status: 500, headers: getCorsHeaders(request) }
      );
    }
  },
};
