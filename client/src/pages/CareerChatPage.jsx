import React, { useState, useRef, useEffect } from 'react';
import { sendCareerChatApi } from '../services/api';
import { MessageSquareCode, Send, Bot, User, Zap, Layers, Sparkles, Loader2, BrainCircuit } from 'lucide-react';

const CareerChatPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      content: 'Hello! I am your AI Career Assistant. Ask me anything about resume improvements, ATS scoring, Java/Full Stack interview prep, or career transition roadmaps!',
      fromCache: false,
      retrievedDocs: []
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || loading) return;

    const userText = inputMsg;
    setInputMsg('');
    setMessages(prev => [...prev, { sender: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await sendCareerChatApi({ message: userText, chatId });
      if (res.data?.chatId) setChatId(res.data.chatId);

      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          content: res.data.answer,
          fromCache: res.data.fromCache,
          retrievedDocs: res.data.retrievedDocs || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'assistant', content: 'Apologies, an error occurred while generating your response. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "How can I increase my resume ATS score?",
    "Which career role fits Java, SQL and React?",
    "What are top Full Stack Developer interview questions?",
    "Give me a 3-month roadmap for Backend Engineering"
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 glass-panel border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">AI Career Assistant</h2>
            <p className="text-[10px] text-brand-400 font-mono">CAG Cache + RAG Vector Search Active</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400">
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
            <Zap className="w-3 h-3" /> CAG Ready
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <Layers className="w-3 h-3" /> RAG Grounded
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
              msg.sender === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-900 border border-slate-800 text-brand-400'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[82%] sm:max-w-[75%] space-y-2`}>
              <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none'
                  : 'glass-card border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* RAG / CAG Indicators */}
              {msg.sender === 'assistant' && (msg.fromCache || msg.retrievedDocs?.length > 0) && (
                <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                  {msg.fromCache ? (
                    <span className="text-cyan-400 font-mono font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Instant Response from CAG Cache (HIT)
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Grounded with {msg.retrievedDocs.length} RAG Knowledge Base Docs
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-brand-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="glass-card p-3.5 rounded-2xl rounded-tl-none border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
              <span>Checking CAG Cache & Searching RAG Vector Database...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-semibold text-slate-500 uppercase shrink-0">Prompts:</span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => setInputMsg(qp)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 whitespace-nowrap shrink-0 transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-4 glass-panel border-t border-slate-800 flex items-center gap-3 shrink-0">
        <input
          type="text"
          value={inputMsg}
          onChange={e => setInputMsg(e.target.value)}
          placeholder="Ask AI assistant about your resume, career, or interview prep..."
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={!inputMsg.trim() || loading}
          className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-glow transition-all disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default CareerChatPage;
