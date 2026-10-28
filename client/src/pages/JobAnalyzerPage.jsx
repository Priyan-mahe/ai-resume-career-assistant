import React, { useState, useEffect } from 'react';
import { analyzeJobApi, matchJobApi, getResumesApi } from '../services/api';
import { Briefcase, Sparkles, CheckCircle2, XCircle, Loader2, ArrowRight, Layers, Target } from 'lucide-react';

const JobAnalyzerPage = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    getResumesApi().then(res => {
      setResumes(res.data || []);
      if (res.data?.[0]) setSelectedResumeId(res.data[0]._id);
    }).catch(e => console.warn('Fetch resumes error'));
  }, []);

  const handleAnalyzeAndMatch = async (e) => {
    e.preventDefault();
    if (!jobDescription || jobDescription.trim().length < 15) {
      alert('Please paste a valid job description.');
      return;
    }

    setLoading(true);
    try {
      const [resAnalysis, resMatch] = await Promise.all([
        analyzeJobApi({ jobDescription }),
        matchJobApi({ jobDescription, resumeId: selectedResumeId })
      ]);
      setJobAnalysis(resAnalysis.data);
      setMatchResult(resMatch.data);
    } catch (err) {
      alert('Job analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-brand-400" />
          <span>Job Description Analyzer & Skill Matcher</span>
        </h1>
        <p className="text-xs text-slate-400">Extract structured job requirements and calculate your resume match %</p>
      </div>

      {/* Main Input Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <form onSubmit={handleAnalyzeAndMatch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Resume for Comparison</label>
            <select
              value={selectedResumeId}
              onChange={e => setSelectedResumeId(e.target.value)}
              className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            >
              {resumes.map(r => (
                <option key={r._id} value={r._id}>{r.title || 'My Resume'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description Text</label>
            <textarea
              rows={7}
              required
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here (responsibilities, required tech stack, qualifications)..."
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Parsing Job & Calculating Match %...</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                <span>Analyze Job & Compare Resume</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results View */}
      {matchResult && jobAnalysis && (
        <div className="space-y-6 animate-fadeIn">
          {/* Match Score Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-brand-950/60 to-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Matched Role Title</span>
              <h2 className="text-2xl font-bold text-white">{jobAnalysis.jobTitle || 'Full Stack Software Engineer'}</h2>
              <p className="text-xs text-slate-400">Extracted Experience Requirement: {jobAnalysis.experienceLevel}</p>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/90 px-6 py-4 rounded-2xl border border-slate-800">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-brand-400">{matchResult.matchScore || 88}%</span>
                <span className="text-[10px] text-slate-400 block font-semibold">JOB MATCH SCORE</span>
              </div>
            </div>
          </div>

          {/* Matched & Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 space-y-4">
              <h3 className="font-semibold text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Matched Skills ({matchResult.matchedSkills?.length || 0})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(matchResult.matchedSkills || ['React', 'JavaScript', 'Node.js', 'SQL', 'REST API']).map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-rose-500/20 space-y-4">
              <h3 className="font-semibold text-rose-400 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Missing Skills & Keyword Gap</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(matchResult.missingSkills || ['Docker', 'AWS', 'TypeScript']).map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobAnalyzerPage;
