/**
 * 四川水情 API 代理 - Cloudflare Worker
 * 
 * 部署步骤（5分钟搞定）：
 * 1. 打开 https://workers.cloudflare.com/ （用邮箱注册/登录，免费）
 * 2. 点击 "Create a Service" 或 "创建服务"
 * 3. 服务名称随便填，比如 "river-proxy"，点击 "Create service"
 * 4. 进入代码编辑器，删除默认代码，把下面这段全部粘贴进去
 * 5. 点击 "Save and deploy"
 * 6. 复制你的Worker地址（类似 https://river-proxy.xxx.workers.dev）
 * 7. 发给我，我帮你填到前端代码里
 */

const TARGET = 'http://www.schwr.com:8088/api/sl/stRiverR/listRelRvfcch';

export default {
  async fetch(request, env, ctx) {
    // 处理CORS预检
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

    try {
      const response = await fetch(TARGET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });

      const body = await response.arrayBuffer();

      return new Response(body, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
