import React, { useState } from 'react';
import { getCareerRecommendApi, getCareerRoadmapApi } from '../services/api';
import { Compass, Sparkles, CheckCircle2, AlertTriangle, BookOpen, Loader2, ArrowRight, Layers, Target } from 'lucide-react';

const CareerAdvisorPage = () => {
  const [skills, setSkills] = useState('JavaScript, React, Node.js, Express, MongoDB, SQL, Git');
  const [interests, setInterests] = useState('Building full-stack web applications, cloud architectures, AI features');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecommendations(null);
    setRoadmap(null);

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await getCareerRecommendApi({
        skills: skillsArray,
        interests
      });
      const recs = res.data.recommendations || [];
      setRecommendations(recs);
      if (recs[0]) {
        setSelectedRole(recs[0]);
        fetchRoadmap(recs[0].role, skillsArray);
      }
    } catch (err) {
      alert('Career recommendation error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmap = async (roleName, currentSkills) => {
    try {
      const res = await getCareerRoadmapApi({ targetRole: roleName, currentSkills });
      setRoadmap(res.data);
    } catch (e) {
      console.warn('Fetch roadmap error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-brand-400" />
          <span>AI Career Advisor & Skill Gap Analyzer</span>
        </h1>
        <p className="text-xs text-slate-400">RAG-grounded career role matching, skill gap analysis, and learning roadmaps</p>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <form onSubmit={handleRecommend} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Current Skills (Comma Separated)</label>
            <input
              type="text"
              required
              value={skills}
              onChange={e => setSkills(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Career Interests & Target Domain</label>
            <textarea
              rows={3}
              value={interests}
              onChange={e => setInterests(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Retrieving Grounded Career Matches...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-brand-200" />
                <span>Get Career Recommendations</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results View */}
      {recommendations && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedRole(rec);
                  fetchRoadmap(rec.role, skills.split(','));
                }}
                className={`glass-card p-6 rounded-2xl border cursor-pointer transition-all ${
                  selectedRole?.role === rec.role ? 'border-brand-500 bg-brand-500/10 shadow-glow' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Match Rank #{idx + 1}</span>
                  <span className="text-xl font-extrabold text-brand-400">{rec.matchPercent}%</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{rec.role}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{rec.whyItMatches}</p>
              </div>
            ))}
          </div>

          {/* Detailed Selected Role View */}
          {selectedRole && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-8">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedRole.role} Roadmap & Analysis</h2>
                  <p className="text-xs text-slate-400">RAG Context: knowledge-base/career-roadmaps</p>
                </div>
                <span className="text-lg font-bold text-brand-400 font-mono">{selectedRole.matchPercent}% Match Fit</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Required vs Missing Skills */}
                <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Required Skills for {selectedRole.role}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.requiredSkills?.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="font-semibold text-amber-400 text-xs uppercase tracking-wider">Missing Skill Gaps to Bridge</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.missingSkills?.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
                        ! {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Learning Roadmap */}
              {roadmap && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand-400" />
                    <span>Personalized Step-by-Step Learning Roadmap</span>
                  </h3>

                  <div className="space-y-3">
                    {roadmap.steps?.map((stepItem, sIdx) => (
                      <div key={sIdx} className="glass-card p-4 rounded-xl border border-slate-800 flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {stepItem.step || sIdx + 1}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">{stepItem.title} <span className="text-xs text-brand-400 font-normal">({stepItem.phase})</span></h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{stepItem.description || stepItem.topics?.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerAdvisorPage;
