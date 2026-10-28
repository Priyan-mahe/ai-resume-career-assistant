import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortfolioApi, getResumesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Globe, Sparkles, ExternalLink, Copy, Check, Loader2, UserCheck, AlertCircle } from 'lucide-react';

const PortfolioBuilderPage = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [username, setUsername] = useState('');
  const [template, setTemplate] = useState('modern');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  useEffect(() => {
    if (user?.name) {
      setUsername(user.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
    getResumesApi().then(res => {
      setResumes(res.data || []);
      if (res.data?.[0]) setSelectedResumeId(res.data[0]._id);
    });
  }, [user]);

  const handleBuildPortfolio = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessBanner('');

    try {
      const res = await createPortfolioApi({
        username,
        template,
        theme: { primaryColor, darkMode: true },
        resumeId: selectedResumeId
      });
      setPortfolioData(res.data);
      const generatedName = res.data?.content?.name || res.data?.name || user?.name || '';
      setSuccessBanner(
        generatedName
          ? `Portfolio generated successfully for ${generatedName}! Live at /portfolio/${username}`
          : `Portfolio generated successfully! Live at /portfolio/${username}`
      );
    } catch (err) {
      alert('Portfolio generation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = `/portfolio/${username || 'portfolio'}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.origin + publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const selectedResume = resumes.find(r => r._id === selectedResumeId);
  const selectedResumeName = selectedResume?.personalInfo?.fullName;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            <span>AI Portfolio Generator</span>
          </h1>
          <p className="text-xs text-slate-400">Generate a live, responsive portfolio website directly from your resume</p>
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Controls */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <form onSubmit={handleBuildPortfolio} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Resume Source</label>
              {resumes.length > 0 ? (
                <select
                  value={selectedResumeId}
                  onChange={e => setSelectedResumeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.title || 'My Resume'}{r.personalInfo?.fullName ? ` — ${r.personalInfo.fullName}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>No saved resumes yet. Your profile name ({user?.name || 'Account'}) will be used.</span>
                </div>
              )}

              {selectedResumeName && (
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                  <span className="text-slate-500">Portfolio Display Name:</span>
                  <span className="text-emerald-400 font-semibold">{selectedResumeName}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Portfolio Handle / URL Username</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-950 border border-r-0 border-slate-800 text-xs text-slate-500 rounded-l-xl">/portfolio/</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    placeholder="myhandle"
                    className="flex-1 px-3 py-2.5 rounded-r-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">This defines your unique URL path only.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Template Style</label>
                <select
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="modern">Modern Glassmorphism</option>
                  <option value="developer">Developer Dark Mode</option>
                  <option value="minimal">Minimalist Clean</option>
                  <option value="professional">Executive Professional</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Portfolio Website...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Generate & Publish Portfolio</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live URL Link Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Public Portfolio URL</h3>
            <p className="text-xs text-slate-300 mb-4">Share this link with recruiters or feature it on your LinkedIn.</p>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-brand-400 break-all flex items-center justify-between">
              <span>{window.location.origin}{publicUrl}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={copyUrl}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'URL Copied!' : 'Copy Public Link'}</span>
            </button>

            <Link
              to={publicUrl}
              target="_blank"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioBuilderPage;
