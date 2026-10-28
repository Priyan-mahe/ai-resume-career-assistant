const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const { connectDB } = require('../server/config/db');
const { createOrUpdatePortfolio } = require('../server/controllers/portfolioController');
const User = require('../server/models/User');
const Resume = require('../server/models/Resume');

async function testWithResume() {
  await connectDB();
  const user = await User.findOne({ name: 'rathish' });
  console.log('User found:', user?._id, user?.name);

  // Find or create a resume for rathish to test with
  let resume = await Resume.findOne({ userId: user._id });
  if (!resume) {
    resume = await Resume.create({
      userId: user._id,
      title: "rathish's Resume",
      personalInfo: {
        fullName: 'rathish',
        email: 'rathishkamaraj@gmail.com'
      },
      skills: {
        languages: ['JavaScript', 'Python'],
        frameworks: ['React', 'Express'],
        tools: ['Git', 'Docker']
      },
      projects: [
        {
          name: 'AI Resume Assistant',
          description: 'Full stack AI platform',
          technologies: ['React', 'Node.js', 'MongoDB']
        }
      ]
    });
    console.log('Created test resume:', resume._id);
  } else {
    console.log('Found existing resume:', resume._id);
  }

  // Now call createOrUpdatePortfolio with resumeId
  const req = {
    user: { _id: user._id, name: user.name, email: user.email },
    body: {
      username: 'rathish',
      template: 'developer',
      theme: { primaryColor: '#6366f1', darkMode: true },
      resumeId: resume._id.toString()
    }
  };

  let statusCode = 200;
  let responseData = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
        }
      };
    },
    json: (data) => {
      responseData = data;
    }
  };

  await createOrUpdatePortfolio(req, res);
  console.log('STATUS:', statusCode);
  console.log('PORTFOLIO SAVED:');
  console.log('- Name:', responseData?.name);
  console.log('- Username:', responseData?.username);
  console.log('- Template:', responseData?.template);
  console.log('- Projects:', responseData?.content?.projects?.length);
  console.log('- Skills:', responseData?.content?.skills?.length);

  if (statusCode === 200 && responseData?.content?.name === 'rathish') {
    console.log('\n>>> SUCCESS: createOrUpdatePortfolio WITH resumeId WORKED PERFECTLY! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> FAILED! <<<', responseData);
    process.exit(1);
  }
}

testWithResume().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
