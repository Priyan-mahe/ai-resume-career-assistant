import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Github, Twitter, Linkedin, Heart, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1 */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">CareerAI</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The intelligent career acceleration platform powered by LLM, RAG, and CAG architecture.
          </p>
          <div className="flex items-center space-x-3 text-slate-500 pt-2">
            <a href="#" className="hover:text-brand-400 transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="hover:text-brand-400 transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-brand-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-semibold text-white text-sm mb-4 tracking-wider uppercase">AI Core Features</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/resume-builder" className="hover:text-white transition-colors">ATS Resume Builder</Link></li>
            <li><Link to="/ats-analyzer" className="hover:text-white transition-colors">ATS Score Analyzer</Link></li>
            <li><Link to="/job-analyzer" className="hover:text-white transition-colors">Job Description Matcher</Link></li>
            <li><Link to="/cover-letter" className="hover:text-white transition-colors">AI Cover Letter</Link></li>
            <li><Link to="/portfolio-builder" className="hover:text-white transition-colors">Portfolio Generator</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-semibold text-white text-sm mb-4 tracking-wider uppercase">Career Growth</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/career-advisor" className="hover:text-white transition-colors">AI Career Advisor</Link></li>
            <li><Link to="/interview-prep" className="hover:text-white transition-colors">Mock Interview Prep</Link></li>
            <li><Link to="/career-chat" className="hover:text-white transition-colors">AI Career Assistant Chat</Link></li>
            <li><a href="#architecture" className="hover:text-white transition-colors">RAG & CAG Architecture</a></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="font-semibold text-white text-sm mb-4 tracking-wider uppercase">System Architecture</h4>
          <div className="p-4 rounded-xl glass-card space-y-2 border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>MERN Stack</span>
              <span className="text-emerald-400 font-mono">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Vector Database</span>
              <span className="text-brand-400 font-mono">MongoDB / FAISS</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Cache Layer (CAG)</span>
              <span className="text-cyan-400 font-mono">Redis / Mongo Cache</span>
            </div>
            <div className="pt-2 border-t border-slate-700/50 flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Production Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} AI Resume & Career Assistant. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for modern job seekers.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
