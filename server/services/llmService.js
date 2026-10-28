const axios = require('axios');

/**
 * Reusable LLM Service
 * Handles API calls to Gemini / OpenAI or falls back to intelligent demo mode.
 */

class LLMService {
  constructor() {
    this.apiKey = process.env.LLM_API_KEY || '';
    this.provider = process.env.LLM_PROVIDER || (this.apiKey ? 'gemini' : 'ollama');
    this.ollamaUrl = process.env.OLLAMA_URL || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:3b';
    this.model = process.env.LLM_MODEL || (this.provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini');
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  /**
   * Main completion function with optional RAG context grounding
   */
  async generateCompletion({ prompt, systemPrompt = '', context = [], jsonMode = false }) {
    console.log(`[LLM Service] Requesting completion. Key configured: ${this.isConfigured()}`);

    // 1. External Cloud API (Gemini / OpenAI)
    if (this.isConfigured() && this.provider !== 'ollama') {
      try {
        if (this.provider === 'gemini') {
          return await this._callGeminiAPI({ prompt, systemPrompt, context, jsonMode });
        } else if (this.provider === 'openai') {
          return await this._callOpenAIAPI({ prompt, systemPrompt, context, jsonMode });
        }
      } catch (err) {
        console.error(`[LLM Service Error] External call failed (${err.message}). Trying Ollama local LLM.`);
      }
    }

    // 2. Local Ollama LLM (e.g. llama3.2:3b)
    try {
      const ollamaRes = await this._callOllamaAPI({ prompt, systemPrompt, context, jsonMode });
      if (ollamaRes) return ollamaRes;
    } catch (ollamaErr) {
      console.warn(`[LLM Service] Ollama unavailable (${ollamaErr.message}). Using dynamic fallback.`);
    }

    // 3. Dynamic Fallback Mode
    return this._generateMockResponse({ prompt, systemPrompt, context, jsonMode });
  }

  async _callOllamaAPI({ prompt, systemPrompt, context, jsonMode }) {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    if (context && context.length > 0) {
      messages.push({ role: 'system', content: `Reference Context:\n${context.join('\n\n')}` });
    }
    messages.push({ role: 'user', content: prompt });

    const payload = {
      model: this.ollamaModel,
      messages,
      stream: false,
      ...(jsonMode ? { format: 'json' } : {})
    };

    const response = await axios.post(
      `${this.ollamaUrl}/api/chat`,
      payload,
      { timeout: 45000 }
    );

    const text = response.data?.message?.content?.trim() || '';
    if (jsonMode) {
      try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (e) {
        return { response: text };
      }
    }
    return text;
  }

  async _callGeminiAPI({ prompt, systemPrompt, context, jsonMode }) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    let fullPrompt = '';
    if (systemPrompt) fullPrompt += `System Instructions:\n${systemPrompt}\n\n`;
    if (context && context.length > 0) {
      fullPrompt += `Grounding Context:\n${context.join('\n\n')}\n\n`;
    }
    fullPrompt += `User Request:\n${prompt}`;
    if (jsonMode) {
      fullPrompt += `\n\nIMPORTANT: Respond ONLY with valid JSON output. No markdown, no commentary.`;
    }

    const payload = {
      contents: [{ parts: [{ text: fullPrompt }] }]
    };

    const response = await axios.post(endpoint, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (jsonMode) {
      try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      } catch (e) {
        console.warn('[LLM Service] JSON parse warning on raw Gemini output');
        return { rawText: text };
      }
    }

    return text;
  }

  async _callOpenAIAPI({ prompt, systemPrompt, context, jsonMode }) {
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    if (context && context.length > 0) {
      messages.push({ role: 'system', content: `Grounding Context:\n${context.join('\n\n')}` });
    }
    messages.push({ role: 'user', content: prompt });

    const payload = {
      model: this.model || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
    };

    const response = await axios.post(endpoint, payload, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const text = response.data?.choices?.[0]?.message?.content || '';
    if (jsonMode) {
      return JSON.parse(text);
    }
    return text;
  }

  _generateMockResponse({ prompt, systemPrompt, context, jsonMode }) {
    const lowPrompt = prompt.toLowerCase();

    // 1. Resume Summary Generation
    if (lowPrompt.includes('summary') || lowPrompt.includes('professional summary')) {
      if (jsonMode) {
        return {
          summary: "Results-driven Software Engineer with extensive experience building scalable web applications, REST APIs, and modern frontend interfaces. Adept at leveraging JavaScript, React, Node.js, and cloud services to engineer high-performance systems and optimize user experience."
        };
      }
      return "Results-driven Software Engineer with extensive experience building scalable web applications, REST APIs, and modern frontend interfaces. Adept at leveraging JavaScript, React, Node.js, and cloud services to engineer high-performance systems and optimize user experience.";
    }

    // 2. Experience Bullet Point Improvement
    if (lowPrompt.includes('improve experience') || lowPrompt.includes('bullet points') || lowPrompt.includes('responsibilities')) {
      const bullets = [
        "Architected and deployed high-availability RESTful APIs using Node.js and Express, improving system response times by 35%.",
        "Engineered responsive UI components with React.js and Tailwind CSS, increasing user engagement and mobile conversion by 40%.",
        "Implemented database indexing and query optimization in MongoDB, reducing database latency from 450ms to 80ms.",
        "Collaborated in an Agile team of 6 engineers using Git, JIRA, and CI/CD pipelines to deliver features 2 weeks ahead of schedule."
      ];
      if (jsonMode) return { bulletPoints: bullets };
      return bullets.map(b => `• ${b}`).join('\n');
    }

    // 3. Cover Letter Generation
    if (lowPrompt.includes('cover letter')) {
      const text = `Dear Hiring Manager,

I am writing to express my strong interest in the open software engineering position at your esteemed company. With a solid foundation in full-stack web development, modern frontend frameworks, and robust API design, I am confident in my ability to immediately add value to your engineering team.

In my recent projects, I spearheaded the development of scalable applications utilizing React, Node.js, and cloud databases. My focus on performance, clean code standards, and seamless user experiences directly aligns with the technical goals outlined in your job description.

I am particularly excited about your company's innovative work and would welcome the opportunity to discuss how my skill set and passion for technology can contribute to your team's success.

Thank you for your time and consideration.

Sincerely,
Candidate`;
      if (jsonMode) return { coverLetter: text };
      return text;
    }

    // 4. Career Recommendations & Skill Gap
    if (lowPrompt.includes('suitable for me') || lowPrompt.includes('career recommendation') || lowPrompt.includes('which career')) {
      const data = {
        recommendations: [
          {
            role: "Full Stack Developer",
            matchPercent: 94,
            whyItMatches: "Your strong proficiency in React, Node.js, and database design directly fits modern full-stack web engineering requirements.",
            requiredSkills: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Git"],
            missingSkills: ["Docker", "TypeScript", "AWS"],
            learningRoadmap: [
              "Step 1: Master TypeScript for type-safe full-stack code.",
              "Step 2: Containerize Node and React services using Docker.",
              "Step 3: Deploy applications to AWS Elastic Beanstalk or EC2."
            ]
          },
          {
            role: "Backend Engineer",
            matchPercent: 88,
            whyItMatches: "Solid grasp of API architecture, SQL/NoSQL databases, and server-side business logic.",
            requiredSkills: ["Node.js", "SQL", "MongoDB", "REST APIs", "Git"],
            missingSkills: ["Redis", "Microservices", "Kafka"],
            learningRoadmap: [
              "Step 1: Implement Redis for caching hot endpoints.",
              "Step 2: Study microservice communication patterns."
            ]
          }
        ]
      };
      if (jsonMode) return data;
      return JSON.stringify(data, null, 2);
    }

    // 5. Interview Questions & Evaluation
    if (lowPrompt.includes('interview questions') || lowPrompt.includes('mock interview')) {
      const qData = {
        questions: [
          {
            id: 1,
            category: "Technical",
            question: "How does the Event Loop handle asynchronous operations in Node.js?",
            expectedAnswer: "Explain call stack, libuv thread pool, event queue, microtasks (Promises), and macrotasks (setTimeout)."
          },
          {
            id: 2,
            category: "React",
            question: "What is the purpose of `useCallback` and `useMemo` hooks in React?",
            expectedAnswer: "They memoize function instances and calculated values respectively between re-renders to avoid unnecessary computations."
          },
          {
            id: 3,
            category: "Behavioral",
            question: "Describe a situation where you had to debug a critical production bug under time pressure.",
            expectedAnswer: "Use STAR method. Detail initial triage, log analysis, quick isolation, patch deployment, and post-mortem creation."
          }
        ]
      };
      if (jsonMode) return qData;
      return JSON.stringify(qData, null, 2);
    }

    // 6. Generic Assistant Fallback
    const genericResponse = `Regarding your question ("${prompt}"): As your Career Assistant, I am ready to help. Please ensure Ollama or an external LLM API key is connected for comprehensive AI completions.`;

    if (jsonMode) return { response: genericResponse };
    return genericResponse;
  }
}

module.exports = new LLMService();
