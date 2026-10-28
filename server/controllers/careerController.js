const ragService = require('../services/ragService');
const llmService = require('../services/llmService');
const cacheService = require('../services/cacheService');
const Chat = require('../models/Chat');
const { getIsConnected } = require('../config/db');

// @desc Career Role Recommendations & Skill Gap Analysis
// @route POST /api/career/recommend
const getCareerRecommendations = async (req, res) => {
  try {
    const { skills = [], education = [], experience = [], interests = '' } = req.body;
    const userQuery = `Career recommendations for skills: ${skills.join(', ')}. Experience: ${JSON.stringify(experience)}. Interests: ${interests}`;

    // CAG Check
    const cached = await cacheService.get(userQuery);
    if (cached) {
      console.log('[Career Controller] Returning cached career recommendation (CAG HIT)');
      return res.json({ fromCache: true, ...cached });
    }

    // RAG Search
    const ragContext = ragService.searchRelevantContext(`Tech career roles required skills for ${skills.join(' ')}`, 3);

    const prompt = `Based on candidate profile:
Skills: ${skills.join(', ') || 'JavaScript, React, Node.js, SQL, Git'}
Interests: ${interests || 'Full stack web development, cloud architectures, building scalable apps'}

Generate JSON output with top 3 recommended tech career roles.
Format:
{
  "recommendations": [
    {
      "role": "Full Stack Developer",
      "matchPercent": 94,
      "whyItMatches": "Direct alignment with React frontend and Node/Express backend expertise.",
      "requiredSkills": ["JavaScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Git"],
      "missingSkills": ["Docker", "AWS", "TypeScript"],
      "recommendedProjects": ["Build an AI SaaS platform", "E-commerce Microservices application"],
      "interviewTopics": ["Event Loop", "React Reconciliation", "MongoDB Indexing", "REST vs GraphQL"]
    }
  ]
}`;

    const result = await llmService.generateCompletion({
      prompt,
      systemPrompt: "You are a career counselor and tech talent advisor.",
      context: ragContext,
      jsonMode: true
    });

    const recommendations = result?.recommendations || [
      {
        role: "Full Stack Developer",
        matchPercent: 94,
        whyItMatches: "Your skill set in React, Node.js, and database design directly fits full-stack engineering roles.",
        requiredSkills: ["JavaScript", "React", "Node.js", "Express.js", "MongoDB", "REST APIs", "Git"],
        missingSkills: ["Docker", "AWS", "TypeScript"],
        recommendedProjects: ["AI Career Assistant", "Real-time Collaboration Platform"],
        interviewTopics: ["System Architecture", "React Performance", "Node Asynchronous I/O"]
      },
      {
        role: "Java Developer",
        matchPercent: 91,
        whyItMatches: "Strong foundational logic, object-oriented concepts, and API development proficiency.",
        requiredSkills: ["Java", "Spring Boot", "SQL", "REST API", "Git", "Maven"],
        missingSkills: ["Microservices", "Kafka", "Docker"],
        recommendedProjects: ["Spring Boot Microservices Gateway", "Banking Transaction Service"],
        interviewTopics: ["Java Garbage Collection", "Spring IoC & Dependency Injection", "Multithreading"]
      }
    ];

    const responsePayload = { recommendations };

    // Store in CAG cache (24 hours TTL)
    await cacheService.set(userQuery, responsePayload, 86400);

    return res.json({ fromCache: false, ...responsePayload });
  } catch (error) {
    console.error('[Career Recommend Error]', error);
    return res.status(500).json({ message: 'Failed to generate career recommendations' });
  }
};

// @desc AI Career Chatbot with CAG + RAG + LLM Pipeline
// @route POST /api/career/chat
const careerChat = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user._id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // 1. CAG Check
    const cachedAnswer = await cacheService.get(`chat_${message}`);
    if (cachedAnswer) {
      console.log(`[Career Chat] Returning cached chatbot answer (CAG HIT) for: "${message}"`);

      // Update chat session in DB if connected
      if (getIsConnected() && chatId) {
        await Chat.findByIdAndUpdate(chatId, {
          $push: {
            messages: [
              { sender: 'user', content: message },
              { sender: 'assistant', content: cachedAnswer, fromCache: true }
            ]
          }
        });
      }

      return res.json({
        chatId: chatId || 'chat_demo_' + Date.now(),
        answer: cachedAnswer,
        fromCache: true,
        ragContextUsed: []
      });
    }

    // 2. RAG Document Retrieval
    const ragResult = await ragService.answerWithRAG({
      query: message,
      systemPrompt: "You are an intelligent, friendly AI Career Assistant.",
    });

    const botAnswer = typeof ragResult.response === 'string'
      ? ragResult.response
      : ragResult.response.response || JSON.stringify(ragResult.response);

    // 3. Store in CAG Cache (12 hrs TTL)
    await cacheService.set(`chat_${message}`, botAnswer, 43200);

    // 4. Save to MongoDB chat history
    let activeChatId = chatId;
    if (getIsConnected()) {
      let chatObj = null;
      if (chatId) {
        chatObj = await Chat.findById(chatId);
      }
      if (!chatObj) {
        chatObj = await Chat.create({
          userId,
          title: message.substring(0, 30) + '...',
          messages: []
        });
        activeChatId = chatObj._id;
      }

      chatObj.messages.push(
        { sender: 'user', content: message },
        { sender: 'assistant', content: botAnswer, ragContext: ragResult.retrievedDocs, fromCache: false }
      );
      await chatObj.save();
    }

    return res.json({
      chatId: activeChatId || 'chat_demo_' + Date.now(),
      answer: botAnswer,
      fromCache: false,
      ragContextCount: ragResult.retrievedContextCount,
      retrievedDocs: ragResult.retrievedDocs
    });
  } catch (error) {
    console.error('[Career Chat Error]', error);
    return res.status(500).json({ message: 'Career assistant chat failed' });
  }
};

// @desc Generate Step-by-step Career Roadmap
// @route POST /api/career/roadmap
const getCareerRoadmap = async (req, res) => {
  try {
    const { targetRole = 'Full Stack Developer', currentSkills = [] } = req.body;

    const ragQuery = `Career roadmap learning steps for ${targetRole}`;
    const ragContext = ragService.searchRelevantContext(ragQuery, 2);

    const prompt = `Generate a 5-step detailed learning roadmap for target role: ${targetRole}.
Candidate Current Skills: ${currentSkills.join(', ') || 'HTML, CSS, basic JavaScript'}

Return JSON format:
{
  "targetRole": "${targetRole}",
  "estimatedDuration": "3-6 months",
  "steps": [
    {
      "step": 1,
      "phase": "Foundations",
      "title": "Master Core Concepts",
      "description": "Deep dive into language fundamentals.",
      "topics": ["Syntax", "Data Structures", "Async JS"],
      "recommendedProjects": ["Build CLI utilities"]
    }
  ]
}`;

    const roadmapData = await llmService.generateCompletion({
      prompt,
      systemPrompt: "You are a senior tech curriculum director.",
      context: ragContext,
      jsonMode: true
    });

    return res.json(roadmapData);
  } catch (error) {
    console.error('[Career Roadmap Error]', error);
    return res.status(500).json({ message: 'Roadmap generation failed' });
  }
};

module.exports = { getCareerRecommendations, careerChat, getCareerRoadmap };
