const vercelHandler = require('../api/index');

async function testVercelHandler() {
  console.log('Testing Vercel Serverless Function handler (/api/health)...');
  
  const mockReq = {
    method: 'GET',
    url: '/api/health',
    path: '/api/health',
    headers: { host: 'localhost:5000' }
  };

  let statusCode = 0;
  let headers = {};
  let body = '';

  const mockRes = {
    setHeader: (k, v) => headers[k] = v,
    writeHead: (code, hdrs) => { statusCode = code; if (hdrs) headers = hdrs; },
    status: (code) => { statusCode = code; return mockRes; },
    json: (data) => {
      body = JSON.stringify(data);
      console.log('Handler returned JSON status:', statusCode || 200, 'Body:', body);
    },
    send: (data) => {
      body = data;
      console.log('Handler returned status:', statusCode || 200, 'Body:', body);
    },
    end: (data) => {
      if (data) body = data;
      console.log('Handler finished. Status:', statusCode || 200);
    }
  };

  await vercelHandler(mockReq, mockRes);
  if (body.includes('"status":"online"') && body.includes('"databaseConnected":true')) {
    console.log('✅ Vercel serverless function entrypoint works perfectly!');
    process.exit(0);
  } else {
    console.error('❌ Vercel handler failed');
    process.exit(1);
  }
}

testVercelHandler().catch(err => {
  console.error('Handler test error:', err);
  process.exit(1);
});
