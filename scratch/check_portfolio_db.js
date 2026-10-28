const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const User = require('../server/models/User');
const Resume = require('../server/models/Resume');
const Portfolio = require('../server/models/Portfolio');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_resume_assistant';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected successfully!');

  const userCount = await User.countDocuments();
  const resumeCount = await Resume.countDocuments();
  const portfolioCount = await Portfolio.countDocuments();

  console.log(`Counts -> Users: ${userCount}, Resumes: ${resumeCount}, Portfolios: ${portfolioCount}`);

  const portfolios = await Portfolio.find().lean();
  console.log('Existing portfolios in DB:');
  console.log(JSON.stringify(portfolios.map(p => ({
    _id: p._id,
    userId: p.userId,
    name: p.name,
    username: p.username,
    title: p.title,
    publicUrl: p.publicUrl,
    hasContent: Boolean(p.content),
    contentName: p.content?.name,
    contentHero: p.content?.hero,
    projectsCount: p.content?.projects?.length || 0,
    skillsCount: p.content?.skills?.length || 0
  })), null, 2));

  await mongoose.disconnect();
  console.log('Disconnected cleanly.');
}

main().catch(err => {
  console.error('Check failed:', err);
  process.exit(1);
});
