const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing Health Check ---');
  const health = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('Health Status:', health.status, 'DB Connected:', health.data?.databaseConnected);

  console.log('\n--- 2. Testing Auth Login ---');
  const loginRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'rathishkamaraj@gmail.com', password: 'password123' });

  let token = loginRes.data?.token;
  if (!token) {
    // Try registering if password was different
    const regRes = await request({
      host: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Rathish Test', email: 'rathishtest_' + Date.now() + '@example.com', password: 'password123' });
    token = regRes.data?.token;
  }
  console.log('Token acquired:', Boolean(token));

  console.log('\n--- 3. Testing GET /api/portfolio/me/current ---');
  const myPortRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/portfolio/me/current',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log('Current portfolio status:', myPortRes.status, 'Username:', myPortRes.data?.username);

  const myHandle = 'rathishtest' + Math.floor(Math.random() * 1000);
  console.log('\n--- 4. Testing POST /api/portfolio (Create/Update Portfolio) with handle: ' + myHandle + ' ---');
  const postRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/portfolio',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    username: myHandle,
    template: 'developer',
    theme: { primaryColor: '#10b981', darkMode: true },
    customContent: {
      hero: { subheadline: 'Full Stack Developer & AI Systems Engineer' },
      about: { bio: 'Specialized in building full-stack platforms with modern React and Node.js.' },
      contact: {
        email: 'test@example.com',
        github: 'https://github.com/rathishtest',
        linkedin: 'https://linkedin.com/in/rathishtest'
      }
    }
  });
  console.log('Create/Update status:', postRes.status, 'Saved template:', postRes.data?.template, 'Username:', postRes.data?.username);

  console.log('\n--- 4b. Testing GET /api/portfolio/me/current (Verify retrieval of own portfolio) ---');
  const verifyMeRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/portfolio/me/current',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log('User portfolio retrieved:', verifyMeRes.status, 'Matched Username:', verifyMeRes.data?.username);

  console.log('\n--- 5. Testing Public GET /api/portfolio/' + myHandle + ' (No Auth Needed) ---');
  const publicRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/portfolio/' + myHandle,
    method: 'GET'
  });
  console.log('Public Portfolio Status:', publicRes.status);
  console.log('Public Data Checks:');
  console.log('- Name:', publicRes.data?.name);
  console.log('- Username:', publicRes.data?.username);
  console.log('- Template:', publicRes.data?.template);
  console.log('- Subheadline:', publicRes.data?.content?.hero?.subheadline);
  console.log('- Bio:', publicRes.data?.content?.about?.bio);
  console.log('- Skills Count:', publicRes.data?.content?.skills?.length);
  console.log('- Projects Count:', publicRes.data?.content?.projects?.length);
  console.log('- Education Count:', publicRes.data?.content?.education?.length);
  console.log('- Experience Count:', publicRes.data?.content?.experience?.length);
  console.log('- Contact Email:', publicRes.data?.content?.contact?.email);
  console.log('- Contact GitHub:', publicRes.data?.content?.contact?.github);
  console.log('- Contact LinkedIn:', publicRes.data?.content?.contact?.linkedin);

  if (
    publicRes.status === 200 &&
    publicRes.data?.username === myHandle &&
    publicRes.data?.content?.projects?.length > 0 &&
    publicRes.data?.content?.skills?.length > 0
  ) {
    console.log('\n>>> ALL PORTFOLIO API CHECKS PASSED SUCCESSFULLY! <<<');
  } else {
    console.error('\n>>> SOME CHECKS FAILED! <<<');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
