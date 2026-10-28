import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  FileText,
  ScanText,
  Briefcase,
  Compass,
  MessageSquareCode,
  GraduationCap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Database,
  Cpu,
  Zap,
  Layers,
  ShieldCheck,
  Star
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-brand-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>MERN Stack + LLM + RAG + CAG Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Build Your Career with <span className="text-gradient">Intelligent AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            Create ATS-friendly resumes, build professional portfolio websites, generate personalized cover letters, and get AI-powered career guidance.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-glow-lg transition-all duration-200 flex items-center justify-center gap-3 text-base"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#architecture"
              className="w-full sm:w-auto px-8 py-4 glass-card hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-700/80 transition-colors flex items-center justify-center gap-2 text-base"
            >
              <span>Explore AI Architecture</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-800/80">
            <div className="p-3">
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-xs text-slate-400">ATS Parsing Accuracy</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-brand-400">RAG</div>
              <div className="text-xs text-slate-400">Knowledge Retrieval</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-cyan-400">CAG</div>
              <div className="text-xs text-slate-400">Sub-second Cache HIT</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-emerald-400">4.9/5</div>
              <div className="text-xs text-slate-400">User Rating Score</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* AI System Architecture Section */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-brand-500/20 shadow-glow relative overflow-hidden">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
              Technical Deep Dive
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Enterprise AI Architecture (LLM + RAG + CAG)
            </h2>
            <p className="text-sm text-slate-400">
              Our triple-engine pipeline guarantees lightning-fast response times via Cache-Augmented Generation, domain accuracy through Retrieval-Augmented Generation, and deep reasoning via LLMs.
            </p>
          </div>

          {/* Architecture Diagram Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="glass-card p-6 rounded-2xl space-y-3 border-l-4 border-l-brand-500">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 mb-2">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">1. MongoDB Atlas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stores encrypted user profiles, multi-version resumes, cover letters, and chat conversation history with full Mongoose schemas.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-3 border-l-4 border-l-cyan-500">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">2. RAG Pipeline</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Queries domain knowledge bases (ATS guidelines, tech role requirements, interview rubrics) to construct grounded LLM prompts.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-3 border-l-4 border-l-emerald-500">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-lg">3. CAG Cache Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Normalizes queries to serve instant cached responses for frequent career advisory questions, reducing LLM latencies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white tracking-tight">Everything You Need for Career Success</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            From resume creation to final offer negotiations, our AI assistant supports every stage of your job search.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4 hover:border-brand-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">ATS Resume Builder</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Multi-step form builder with AI summary generation, past-tense bullet point improver, and instant PDF download.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4 hover:border-brand-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ScanText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">ATS Score Analyzer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload PDF resumes to compute 0-100 ATS match scores, detect missing keywords, formatting issues, and skill gaps.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4 hover:border-brand-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Job Description Matcher</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Paste job descriptions to extract required skills, preferred qualifications, and compute candidate match percentage.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4 hover:border-brand-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Portfolio Generator</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instantly generate a public portfolio site from your resume with custom themes and shareable links.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4 hover:border-brand-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Interactive Mock Interviews</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Practice role-specific interview questions with real-time AI evaluations on technical depth, communication, and confidence.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4 hover:border-brand-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquareCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">RAG + CAG Career Assistant</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              24/7 ChatGPT-style career chatbot grounded in industry knowledge bases with persistent MongoDB session history.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-brand-900/50 via-slate-900 to-indigo-950/60 border border-brand-500/30 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Supercharge Your Career?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Join thousands of developers and professionals using AI to build ATS-friendly resumes and land top engineering offers.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-glow transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
