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

async function runFullSuite() {
  const results = {};
  console.log('====================================================');
  console.log('🧪 RUNNING FULL SYSTEM TEST SUITE');
  console.log('====================================================\n');

  // 1. Health & Database Connectivity
  const healthRes = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  const dbConnected = healthRes.data?.databaseConnected === true;
  results['1. MongoDB Connectivity'] = dbConnected ? 'PASS' : 'FAIL';
  console.log(`[Test 1] Health & MongoDB: ${results['1. MongoDB Connectivity']} (DB: ${healthRes.data?.databaseHost})`);

  // 2. User Registration
  const testEmail = `suite_test_${Date.now()}@example.com`;
  const regRes = await request({
    host: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'Suite Tester', email: testEmail, password: 'Password123!' });
  const regPassed = regRes.status === 201 && Boolean(regRes.data?.token);
  results['2. User Registration'] = regPassed ? 'PASS' : 'FAIL';
  console.log(`[Test 2] Registration: ${results['2. User Registration']} (Status: ${regRes.status})`);

  // 3. User Login
  const loginRes = await request({
    host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: testEmail, password: 'Password123!' });
  const token = loginRes.data?.token;
  const loginPassed = loginRes.status === 200 && Boolean(token);
  results['3. User Login & JWT'] = loginPassed ? 'PASS' : 'FAIL';
  console.log(`[Test 3] Login & JWT: ${results['3. User Login & JWT']} (Token received: ${Boolean(token)})`);

  const authHeader = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 4. Auth Me (Protected Route)
  const meRes = await request({ host: 'localhost', port: 5000, path: '/api/auth/me', method: 'GET', headers: authHeader });
  results['4. Auth /me (Protected)'] = meRes.status === 200 && meRes.data?.email === testEmail ? 'PASS' : 'FAIL';
  console.log(`[Test 4] Protected /me: ${results['4. Auth /me (Protected)']}`);

  // 5. Resume Creation
  const resumePayload = {
    title: 'Full Stack Engineer Resume',
    personalInfo: { fullName: 'Suite Tester', email: testEmail, phone: '555-0199', location: 'San Francisco, CA' },
    summary: 'Experienced full stack developer with expertise in React, Node.js, and MongoDB.',
    skills: {
      languages: ['JavaScript', 'TypeScript', 'Python'],
      frameworks: ['React', 'Node.js', 'Express'],
      databases: ['MongoDB', 'PostgreSQL'],
      tools: ['Git', 'Docker']
    },
    education: [{ degree: 'B.S. in Computer Science', college: 'Tech University', startYear: '2020', endYear: '2024' }],
    experience: [{ company: 'WebCorp', role: 'Full Stack Engineer', startDate: '2023', endDate: 'Present', responsibilities: ['Built React web applications', 'Optimized APIs'] }],
    projects: [{ name: 'AI Career Assistant', description: 'MERN stack AI career platform', technologies: ['React', 'Node.js', 'MongoDB'] }]
  };

  const createResumeRes = await request({
    host: 'localhost', port: 5000, path: '/api/resumes', method: 'POST', headers: authHeader
  }, resumePayload);
  const resumeId = createResumeRes.data?._id;
  results['5. Resume Creation (DB)'] = createResumeRes.status === 201 && Boolean(resumeId) ? 'PASS' : 'FAIL';
  console.log(`[Test 5] Resume Creation: ${results['5. Resume Creation (DB)']} (Resume ID: ${resumeId})`);

  // 6. Resume Listing & Retrieval
  const listRes = await request({ host: 'localhost', port: 5000, path: '/api/resumes', method: 'GET', headers: authHeader });
  const getOneRes = await request({ host: 'localhost', port: 5000, path: `/api/resumes/${resumeId}`, method: 'GET', headers: authHeader });
  const listPassed = listRes.status === 200 && Array.isArray(listRes.data) && getOneRes.status === 200;
  results['6. Resume Listing & Retrieval'] = listPassed ? 'PASS' : 'FAIL';
  console.log(`[Test 6] Resume Listing/Get: ${results['6. Resume Listing & Retrieval']}`);

  // 7. Resume Update
  const updateRes = await request({
    host: 'localhost', port: 5000, path: `/api/resumes/${resumeId}`, method: 'PUT', headers: authHeader
  }, { title: 'Updated Senior Full Stack Resume' });
  results['7. Resume Update'] = updateRes.status === 200 && updateRes.data?.title === 'Updated Senior Full Stack Resume' ? 'PASS' : 'FAIL';
  console.log(`[Test 7] Resume Update: ${results['7. Resume Update']}`);

  // 8. AI Resume Summary Generation
  const aiSummaryRes = await request({
    host: 'localhost', port: 5000, path: '/api/resumes/summary', method: 'POST', headers: authHeader
  }, { role: 'Full Stack Developer', skills: ['React', 'Node.js', 'MongoDB'], experienceLevel: 'Mid-Level' });
  results['8. AI Summary Generation'] = aiSummaryRes.status === 200 && Boolean(aiSummaryRes.data?.summary) ? 'PASS' : 'FAIL';
  console.log(`[Test 8] AI Summary Generation: ${results['8. AI Summary Generation']}`);

  // 9. AI Experience Bullet Optimization
  const aiBulletsRes = await request({
    host: 'localhost', port: 5000, path: '/api/resumes/improve-experience', method: 'POST', headers: authHeader
  }, { responsibility: 'I made the website faster and created some APIs', role: 'Full Stack Developer', company: 'WebCorp' });
  results['9. AI Bullet Optimization'] = aiBulletsRes.status === 200 && Boolean(aiBulletsRes.data?.improvedBullets || aiBulletsRes.data?.improvedText) ? 'PASS' : 'FAIL';
  console.log(`[Test 9] AI Bullet Optimization: ${results['9. AI Bullet Optimization']}`);

  // 10. ATS Resume Analysis
  const atsRes = await request({
    host: 'localhost', port: 5000, path: `/api/resumes/${resumeId}/ats`, method: 'POST', headers: authHeader
  }, { targetJobTitle: 'Full Stack Engineer' });
  results['10. ATS Resume Analysis'] = atsRes.status === 200 && typeof atsRes.data?.atsScore === 'number' ? 'PASS' : 'FAIL';
  console.log(`[Test 10] ATS Resume Analysis: ${results['10. ATS Resume Analysis']} (ATS Score: ${atsRes.data?.atsScore})`);

  // 11. Job Description Matcher
  const jobMatchRes = await request({
    host: 'localhost', port: 5000, path: '/api/job/match', method: 'POST', headers: authHeader
  }, { resumeId, jobDescription: 'Seeking Full Stack Engineer with strong React, Node.js, and MongoDB experience.' });
  results['11. Job Description Matcher'] = jobMatchRes.status === 200 ? 'PASS' : 'FAIL';
  console.log(`[Test 11] Job Description Matcher: ${results['11. Job Description Matcher']}`);

  // 12. AI Cover Letter Generator
  const clRes = await request({
    host: 'localhost', port: 5000, path: '/api/cover-letter/generate', method: 'POST', headers: authHeader
  }, { resumeId, jobTitle: 'Senior Full Stack Engineer', company: 'Acme Cloud Inc.' });
  console.log('Cover Letter Res:', clRes.status, JSON.stringify(clRes.data));
  results['12. AI Cover Letter'] = (clRes.status === 200 || clRes.status === 201) && Boolean(clRes.data?.content || clRes.data?.coverLetter) ? 'PASS' : 'FAIL';
  console.log(`[Test 12] AI Cover Letter: ${results['12. AI Cover Letter']}`);

  // 13. AI Career Recommendations
  const careerRes = await request({
    host: 'localhost', port: 5000, path: '/api/career/recommend', method: 'POST', headers: authHeader
  }, { skills: ['React', 'Node.js', 'MongoDB'], experience: '3 years' });
  results['13. AI Career Recommendations'] = careerRes.status === 200 ? 'PASS' : 'FAIL';
  console.log(`[Test 13] AI Career Recommendations: ${results['13. AI Career Recommendations']}`);

  // 14. Interview Questions Generator
  const interviewRes = await request({
    host: 'localhost', port: 5000, path: '/api/interview/questions', method: 'POST', headers: authHeader
  }, { role: 'Full Stack Developer', topic: 'React and Node.js' });
  results['14. Interview Prep'] = interviewRes.status === 200 ? 'PASS' : 'FAIL';
  console.log(`[Test 14] Interview Prep: ${results['14. Interview Prep']}`);

  // 15. Portfolio Create / Publish
  const portfolioUsername = `suitetest${Date.now()}`;
  const portCreateRes = await request({
    host: 'localhost', port: 5000, path: '/api/portfolio', method: 'POST', headers: authHeader
  }, { username: portfolioUsername, template: 'developer', resumeId });
  results['15. Portfolio Create & Publish'] = portCreateRes.status === 200 && portCreateRes.data?.username === portfolioUsername ? 'PASS' : 'FAIL';
  console.log(`[Test 15] Portfolio Create: ${results['15. Portfolio Create & Publish']}`);

  // 16. Portfolio me/current
  const portMeRes = await request({
    host: 'localhost', port: 5000, path: '/api/portfolio/me/current', method: 'GET', headers: authHeader
  });
  results['16. Current User Portfolio'] = portMeRes.status === 200 && portMeRes.data?.username === portfolioUsername ? 'PASS' : 'FAIL';
  console.log(`[Test 16] Current Portfolio: ${results['16. Current User Portfolio']}`);

  // 17. Public Portfolio
  const publicPortRes = await request({
    host: 'localhost', port: 5000, path: `/api/portfolio/${portfolioUsername}`, method: 'GET'
  });
  results['17. Public Portfolio Endpoint'] = publicPortRes.status === 200 && publicPortRes.data?.content?.name ? 'PASS' : 'FAIL';
  console.log(`[Test 17] Public Portfolio: ${results['17. Public Portfolio Endpoint']}`);

  console.log('\n====================================================');
  console.log('📊 FINAL TEST RESULTS SUMMARY:');
  console.log('====================================================');
  let allPass = true;
  for (const [test, status] of Object.entries(results)) {
    console.log(`${status === 'PASS' ? '✅' : '❌'} ${test}: ${status}`);
    if (status !== 'PASS') allPass = false;
  }
  console.log('====================================================');
  if (allPass) {
    console.log('🎉 ALL 17 TESTS PASSED SUCCESSFULLY ON REAL SYSTEM!');
  } else {
    console.log('⚠️ SOME TESTS DID NOT PASS.');
  }
  process.exit(allPass ? 0 : 1);
}

runFullSuite().catch(err => {
  console.error('Fatal suite failure:', err);
  process.exit(1);
});
