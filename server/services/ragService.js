  const fs = require('fs');
const path = require('path');
const llmService = require('./llmService');

class RAGService {
  constructor() {
    this.knowledgeBaseDir = path.join(__dirname, '..', 'knowledge-base');
    this.documents = [];
    this.initialized = false;
  }

  /**
   * Load and index all JSON and text documents from knowledge-base
   */
  initKnowledgeBase() {
    if (this.initialized) return;

    try {
      this.documents = [];
      this._scanDirectory(this.knowledgeBaseDir);
      console.log(`[RAG Service] Loaded and indexed ${this.documents.length} knowledge base documents.`);
      this.initialized = true;
    } catch (err) {
      console.error(`[RAG Service Error] Failed to index knowledge base: ${err.message}`);
    }
  }

  _scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        this._scanDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.json') || entry.name.endsWith('.txt') || entry.name.endsWith('.md'))) {
        try {
          const rawContent = fs.readFileSync(fullPath, 'utf-8');
          const category = path.basename(path.dirname(fullPath));

          if (entry.name.endsWith('.json')) {
            const parsed = JSON.parse(rawContent);
            this.documents.push({
              id: `${category}-${entry.name}`,
              category,
              fileName: entry.name,
              content: JSON.stringify(parsed, null, 2),
              rawObject: parsed,
              keywords: this._extractKeywords(JSON.stringify(parsed))
            });
          } else {
            this.documents.push({
              id: `${category}-${entry.name}`,
              category,
              fileName: entry.name,
              content: rawContent,
              keywords: this._extractKeywords(rawContent)
            });
          }
        } catch (e) {
          console.warn(`[RAG Warning] Failed to read ${fullPath}`);
        }
      }
    }
  }

  _extractKeywords(text) {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of',
      'with', 'as', 'by', 'that', 'this', 'it', 'from', 'or', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'not',
      'what', 'who', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each',
      'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'too', 'very',
      'can', 'will', 'just', 'should', 'now', 'tell', 'give', 'about', 'your', 'you'
    ]);
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  }

  /**
   * Vector / TF-IDF Keyword Matcher for Top Context Retrieval
   */
  searchRelevantContext(query, topK = 3) {
    this.initKnowledgeBase();

    const queryTokens = this._extractKeywords(query);
    if (queryTokens.length === 0) return [];

    const scoredDocs = this.documents.map(doc => {
      let score = 0;
      queryTokens.forEach(token => {
        // TF count
        const matches = doc.keywords.filter(k => k === token || k.includes(token)).length;
        score += matches;
      });

      // Bonus score if category matches query keywords
      if (queryTokens.some(qt => doc.category.toLowerCase().includes(qt))) {
        score += 5;
      }

      return { doc, score };
    });

    // Sort descending by score
    scoredDocs.sort((a, b) => b.score - a.score);

    const results = scoredDocs
      .filter(item => item.score > 0)
      .slice(0, topK)
      .map(item => `[Document: ${item.doc.id} | Category: ${item.doc.category}]\n${item.doc.content}`);

    // If no relevant documents match the query, return empty context
    return results;
  }

  /**
   * Complete RAG Pipeline Execution:
   * Query -> Retrieval -> Context Construction -> LLM Grounding -> Response
   */
  async answerWithRAG({ query, systemPrompt = '', jsonMode = false, extraContext = [] }) {
    // 1. Retrieve top relevant context documents
    const retrievedDocs = this.searchRelevantContext(query, 3);
    const combinedContext = [...retrievedDocs, ...extraContext];

    console.log(`[RAG Pipeline] Retrieved ${retrievedDocs.length} context documents for query: "${query.substring(0, 40)}..."`);

    // 2. Generate grounded response using LLM
    let groundedSystemPrompt = systemPrompt || 'You are an intelligent, friendly AI assistant.';
    if (combinedContext.length > 0) {
      groundedSystemPrompt += `\n\nUse the provided Reference Context where relevant to formulate accurate, ATS-optimized, and career-grounded guidance.`;
    } else {
      groundedSystemPrompt += `\n\nAnswer the user's question directly, truthfully, and helpfully.`;
    }

    const response = await llmService.generateCompletion({
      prompt: query,
      systemPrompt: groundedSystemPrompt,
      context: combinedContext,
      jsonMode
    });

    return {
      query,
      retrievedContextCount: retrievedDocs.length,
      retrievedDocs,
      response
    };
  }
}

module.exports = new RAGService();
