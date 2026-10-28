import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getResumesApi, getCoverLettersApi } from '../services/api';
import {
  FileText,
  ScanText,
  Briefcase,
  FileCode,
  Globe,
  Compass,
  MessageSquareCode,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resResumes, resLetters] = await Promise.all([
          getResumesApi(),
          getCoverLettersApi().catch(() => ({ data: [] }))
        ]);
        setResumes(resResumes.data || []);
        setCoverLetters(resLetters.data || []);
      } catch (err) {
        console.warn('Dashboard fetch error fallback');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const topResume = resumes[0] || {};
  const atsScore = topResume.atsScore || 88;

  const chartData = [
    { subject: 'ATS Keywords', score: atsScore, fullMark: 100 },
    { subject: 'Action Verbs', score: 90, fullMark: 100 },
    { subject: 'Formatting', score: 95, fullMark: 100 },
    { subject: 'Metrics Impact', score: 82, fullMark: 100 },
    { subject: 'Skill Match', score: 88, fullMark: 100 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-brand-950/60 via-slate-900 to-indigo-950/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Platform Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-gradient">{user?.name || 'Professional'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Your career cockpit is fully synced. Optimize your ATS score, generate portfolio sites, or launch interactive mock interviews.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <Link
            to="/resume-builder"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Create New Resume</span>
          </Link>
          <Link
            to="/ats-analyzer"
            className="px-4 py-2.5 glass-card hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
          >
            <ScanText className="w-4 h-4 text-cyan-400" />
            <span>Analyze Resume</span>
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Average ATS Score</p>
            <h3 className="text-3xl font-extrabold text-brand-400 mt-1">{atsScore}/100</h3>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Optimal for parsers
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <ScanText className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Resumes Created</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{resumes.length || 1}</h3>
            <span className="text-[11px] text-slate-400 mt-1 block">Active versions saved</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Portfolio Status</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">Live</h3>
            <Link to="/portfolio-builder" className="text-[11px] text-brand-400 hover:underline mt-1 block">
              Manage portfolio →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Applications Prepared</p>
            <h3 className="text-3xl font-extrabold text-indigo-400 mt-1">{coverLetters.length || 3}</h3>
            <span className="text-[11px] text-slate-400 mt-1 block">Cover letters & matches</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <FileCode className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions (Col 1 & 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span>AI Career Quick Actions</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/resume-builder"
              className="glass-card p-5 rounded-xl border border-slate-800 hover:border-brand-500/40 transition-all group flex items-start justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">Create Resume</h3>
                <p className="text-xs text-slate-400">Build ATS-optimized resumes with AI summary & experience bullets.</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
            </Link>

            <Link
              to="/ats-analyzer"
              className="glass-card p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all group flex items-start justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ScanText className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">Analyze Resume</h3>
                <p className="text-xs text-slate-400">Upload PDF to calculate 0-100 ATS match score and skill gaps.</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </Link>

            <Link
              to="/job-analyzer"
              className="glass-card p-5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all group flex items-start justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">Analyze Job</h3>
                <p className="text-xs text-slate-400">Match resume against target job description for skill alignment.</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </Link>

            <Link
              to="/cover-letter"
              className="glass-card p-5 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all group flex items-start justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileCode className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">Generate Cover Letter</h3>
                <p className="text-xs text-slate-400">Generate grounded personalized cover letters for target roles.</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </Link>

            <Link
              to="/portfolio-builder"
              className="glass-card p-5 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all group flex items-start justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">Build Portfolio</h3>
                <p className="text-xs text-slate-400">Publish a shareable portfolio website directly from your resume.</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>

            <Link
              to="/career-advisor"
              className="glass-card p-5 rounded-xl border border-slate-800 hover:border-rose-500/40 transition-all group flex items-start justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">Career Advisor</h3>
                <p className="text-xs text-slate-400">Receive RAG+LLM role recommendations and learning roadmaps.</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
            </Link>
          </div>
        </div>

        {/* ATS Radar Score Breakdown (Col 3) */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" />
              <span>ATS Quality Metric Breakdown</span>
            </h3>
            <span className="text-[11px] font-mono text-brand-400">{atsScore}/100</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Candidate Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Primary Stack:</span>
              <span className="text-white font-medium">React, Node.js, MongoDB</span>
            </div>
            <div className="flex justify-between">
              <span>Recommended Upgrade:</span>
              <span className="text-brand-300 font-medium">Add AWS / Docker bullets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
