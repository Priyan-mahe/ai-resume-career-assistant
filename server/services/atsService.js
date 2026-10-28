const ragService = require('./ragService');
const llmService = require('./llmService');

class ATSService {
  /**
   * Analyze resume text against ATS rules and optional target job description
   */
  async analyzeResume({ resumeText = '', resumeData = null, jobDescription = '' }) {
    console.log('[ATS Service] Initiating resume scoring & ATS analysis...');

    // Extract raw text from resume object if provided
    let textToAnalyze = resumeText;
    if (!textToAnalyze && resumeData) {
      textToAnalyze = this._extractTextFromResumeObject(resumeData);
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 20) {
      return {
        score: 60,
        strengths: ["Clean foundational layout structure."],
        missingKeywords: ["React", "Node.js", "REST APIs", "Git"],
        skillGaps: ["Add detailed quantitative metrics to experience bullet points."],
        formattingIssues: ["Resume text length is very brief. Expand on key responsibilities."],
        suggestions: ["Add a strong 2-3 sentence professional summary at the top.", "Include measurable results for each work experience."]
      };
    }

    // 1. Algorithmic base scoring
    const keywordMatch = this._checkKeywordMatch(textToAnalyze, jobDescription);
    const actionVerbCheck = this._checkActionVerbs(textToAnalyze);
    const sectionCheck = this._checkSections(textToAnalyze, resumeData);
    const lengthCheck = this._checkLengthAndFormatting(textToAnalyze);

    let calculatedScore = Math.round(
      keywordMatch.score * 0.35 +
      actionVerbCheck.score * 0.25 +
      sectionCheck.score * 0.20 +
      lengthCheck.score * 0.20
    );

    // Clamp score between 40 and 98
    calculatedScore = Math.min(Math.max(calculatedScore, 45), 98);

    // 2. RAG Context Retrieval for ATS Best Practices
    const ragQuery = `ATS resume analysis scoring best practices for ${jobDescription ? 'job description: ' + jobDescription : 'software engineering roles'}`;
    const ragContext = ragService.searchRelevantContext(ragQuery, 2);

    // 3. LLM Refinement for specific actionable insights
    const prompt = `Perform a comprehensive ATS resume evaluation.
Resume Text:
"""
${textToAnalyze.substring(0, 3000)}
"""

${jobDescription ? `Target Job Description:\n"""\n${jobDescription.substring(0, 1500)}\n"""` : ''}

Calculated Algorithmic Score: ${calculatedScore}/100

Please provide JSON output with fields:
- score (number from 0 to 100)
- strengths (array of strings)
- missingKeywords (array of strings)
- skillGaps (array of strings)
- formattingIssues (array of strings)
- suggestions (array of strings)`;

    try {
      const llmResult = await llmService.generateCompletion({
        prompt,
        systemPrompt: "You are a senior ATS algorithms engineer and recruiter.",
        context: ragContext,
        jsonMode: true
      });

      if (llmResult && typeof llmResult === 'object' && Array.isArray(llmResult.strengths)) {
        return {
          score: llmResult.score || calculatedScore,
          strengths: llmResult.strengths || ["Strong technical stack alignment."],
          missingKeywords: llmResult.missingKeywords || keywordMatch.missing,
          skillGaps: llmResult.skillGaps || ["Add quantifiable impact metrics to bullets."],
          formattingIssues: llmResult.formattingIssues || lengthCheck.issues,
          suggestions: llmResult.suggestions || ["Tailor bullet points to match target job keywords."]
        };
      }
    } catch (e) {
      console.warn(`[ATS Service Warning] LLM analysis fallback: ${e.message}`);
    }

    // Fallback response if LLM refinement is skipped or fails
    return {
      score: calculatedScore,
      strengths: [
        sectionCheck.score > 70 ? "Well-organized section headers (Summary, Skills, Experience)." : "Includes core contact information.",
        actionVerbCheck.score > 70 ? "Good utilization of action verbs in experience section." : "Clear tech stack listed."
      ],
      missingKeywords: keywordMatch.missing.length > 0 ? keywordMatch.missing : ["AWS", "Docker", "CI/CD", "Jest"],
      skillGaps: [
        "Include more numerical outcome metrics (e.g. 'improved performance by 30%').",
        "Highlight cloud and deployment experience."
      ],
      formattingIssues: lengthCheck.issues.length > 0 ? lengthCheck.issues : ["Ensure single-column layout for ATS parser compatibility."],
      suggestions: [
        "Integrate missing technical keywords naturally within job experience descriptions.",
        "Add GitHub and live demo links for major technical projects."
      ]
    };
  }

  _extractTextFromResumeObject(r) {
    let parts = [];
    if (r.summary) parts.push(r.summary);
    if (r.skills) {
      if (Array.isArray(r.skills)) parts.push(r.skills.join(' '));
      else {
        Object.values(r.skills).forEach(arr => {
          if (Array.isArray(arr)) parts.push(arr.join(' '));
        });
      }
    }
    if (r.experience && Array.isArray(r.experience)) {
      r.experience.forEach(exp => {
        parts.push(`${exp.role || ''} ${exp.company || ''}`);
        if (exp.responsibilities) {
          parts.push(Array.isArray(exp.responsibilities) ? exp.responsibilities.join(' ') : exp.responsibilities);
        }
      });
    }
    if (r.education && Array.isArray(r.education)) {
      r.education.forEach(ed => parts.push(`${ed.degree || ''} ${ed.college || ''}`));
    }
    return parts.join('\n');
  }

  _checkKeywordMatch(text, jobDesc) {
    if (!jobDesc) {
      const commonTech = ['javascript', 'react', 'node', 'express', 'mongodb', 'sql', 'git', 'rest api'];
      const textLower = text.toLowerCase();
      const matched = commonTech.filter(t => textLower.includes(t));
      const missing = commonTech.filter(t => !textLower.includes(t));
      return { score: Math.round((matched.length / commonTech.length) * 100), matched, missing };
    }

    const jobWords = jobDesc.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
    const uniqueJobKeywords = Array.from(new Set(jobWords)).slice(0, 15);
    
    const textLower = text.toLowerCase();
    const matched = uniqueJobKeywords.filter(k => textLower.includes(k));
    const missing = uniqueJobKeywords.filter(k => !textLower.includes(k));

    const score = uniqueJobKeywords.length > 0 ? Math.round((matched.length / uniqueJobKeywords.length) * 100) : 80;
    return { score, matched, missing };
  }

  _checkActionVerbs(text) {
    const actionVerbs = ['developed', 'engineered', 'built', 'architected', 'implemented', 'optimized', 'spearheaded', 'created', 'designed', 'reduced', 'increased', 'managed'];
    const textLower = text.toLowerCase();
    const count = actionVerbs.filter(v => textLower.includes(v)).length;
    const score = Math.min(Math.round((count / 5) * 100), 100);
    return { score, count };
  }

  _checkSections(text, resumeData) {
    const sections = ['summary', 'experience', 'education', 'skills', 'projects'];
    const textLower = text.toLowerCase();
    const found = sections.filter(s => textLower.includes(s));
    return { score: Math.round((found.length / sections.length) * 100), found };
  }

  _checkLengthAndFormatting(text) {
    const issues = [];
    const wordCount = text.trim().split(/\s+/).length;

    if (wordCount < 100) issues.push("Resume content is too short (under 100 words).");
    if (wordCount > 1000) issues.push("Resume content is very long (over 1000 words). Aim for 1-2 concise pages.");
    if (!text.includes('@') && !text.toLowerCase().includes('email')) issues.push("Missing clear email contact information.");

    const score = issues.length === 0 ? 95 : Math.max(100 - issues.length * 20, 50);
    return { score, issues };
  }
}

module.exports = new ATSService();
