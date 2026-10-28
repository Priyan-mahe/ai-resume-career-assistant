import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortfolioApi, getResumesApi, getUserPortfolioApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Globe,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  UserCheck,
  AlertCircle,
  Code2,
  Briefcase,
  GraduationCap,
  Terminal,
  Palette,
  Github,
  Linkedin,
  Mail,
  SlidersHorizontal
} from 'lucide-react';

const PortfolioBuilderPage = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [username, setUsername] = useState('');
  const [template, setTemplate] = useState('modern');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Optional custom overrides
  const [subheadline, setSubheadline] = useState('');
  const [bio, setBio] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactGithub, setContactGithub] = useState('');
  const [contactLinkedin, setContactLinkedin] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const defaultHandle = (user?.name || 'portfolio')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    setUsername(defaultHandle || 'myportfolio');

    // 1. Fetch user's resumes
    const loadData = async () => {
      try {
        const [resResumes, resPortfolio] = await Promise.allSettled([
          getResumesApi(),
          getUserPortfolioApi()
        ]);

        if (resResumes.status === 'fulfilled' && resResumes.value?.data) {
          const list = resResumes.value.data || [];
          setResumes(list);
          if (list[0]?._id) setSelectedResumeId(list[0]._id);
        }

        if (resPortfolio.status === 'fulfilled' && resPortfolio.value?.data) {
          const port = resPortfolio.value.data;
          setPortfolioData(port);
          if (port.username) setUsername(port.username);
          if (port.template) setTemplate(port.template);
          if (port.theme?.primaryColor) setPrimaryColor(port.theme.primaryColor);
          if (port.content?.hero?.subheadline) setSubheadline(port.content.hero.subheadline);
          if (port.content?.about?.bio) setBio(port.content.about.bio);
          if (port.content?.contact?.email) setContactEmail(port.content.contact.email);
          if (port.content?.contact?.github) setContactGithub(port.content.contact.github);
          if (port.content?.contact?.linkedin) setContactLinkedin(port.content.contact.linkedin);
        }
      } catch (err) {
        console.warn('Portfolio builder load error:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleBuildPortfolio = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessBanner('');

    try {
      const payload = {
        username,
        template,
        theme: { primaryColor, darkMode: true },
        resumeId: selectedResumeId || undefined,
        customContent: {
          hero: subheadline ? { subheadline } : undefined,
          about: bio ? { bio } : undefined,
          contact: {
            email: contactEmail || undefined,
            github: contactGithub || undefined,
            linkedin: contactLinkedin || undefined
          }
        }
      };

      const res = await createPortfolioApi(payload);
      setPortfolioData(res.data);
      const generatedName = res.data?.content?.name || res.data?.name || user?.name || '';
      setSuccessBanner(
        generatedName
          ? `Portfolio generated successfully for ${generatedName}! Live at /portfolio/${res.data?.username || username}`
          : `Portfolio generated successfully! Live at /portfolio/${res.data?.username || username}`
      );
    } catch (err) {
      alert('Portfolio generation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = `/portfolio/${(username || 'portfolio').toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.origin + publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const selectedResume = resumes.find(r => r._id === selectedResumeId);
  const selectedResumeName = selectedResume?.personalInfo?.fullName;
  const currentDisplayName = portfolioData?.name
    || portfolioData?.content?.name
    || selectedResumeName
    || user?.name
    || 'Professional';

  const templatesList = [
    { id: 'modern', name: 'Modern Glassmorphism', desc: 'Deep violet glow, glass cards & smooth accents' },
    { id: 'developer', name: 'Developer Dark Mode', desc: 'Code terminal, monospace headers & neon highlights' },
    { id: 'minimal', name: 'Minimalist Clean', desc: 'Crisp borders, typographic clarity & slate minimalism' },
    { id: 'professional', name: 'Executive Corporate', desc: 'Structured navy architecture & business timeline' }
  ];

  const colorPresets = [
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Cyan', value: '#06b6d4' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Amber', value: '#f59e0b' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            <span>AI Portfolio Generator & Publisher</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate, customize, and publish a live responsive web portfolio directly from your resume and MongoDB database.
          </p>
        </div>

        {portfolioData && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Portfolio Live</span>
          </div>
        )}
      </div>

      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <Link
            to={publicUrl}
            target="_blank"
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
          >
            <span>View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Controls (Cols 1 & 2) */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <form onSubmit={handleBuildPortfolio} className="space-y-6">
            {/* Source Resume */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Resume Source</label>
              {resumes.length > 0 ? (
                <select
                  value={selectedResumeId}
                  onChange={e => setSelectedResumeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
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

            {/* URL Handle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Portfolio Public Handle / URL Path</label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-slate-950 border border-r-0 border-slate-800 text-xs text-slate-500 rounded-l-xl font-mono">
                  /portfolio/
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  placeholder="myhandle"
                  className="flex-1 px-3 py-2.5 rounded-r-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Letters and numbers only. Your site will be publicly accessible at <span className="text-brand-400 font-mono">{publicUrl}</span>
              </p>
            </div>

            {/* Template Selector Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Portfolio Visual Template</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templatesList.map(t => {
                  const isSelected = template === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/10 shadow-sm'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-brand-300' : 'text-white'}`}>{t.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{t.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-brand-400" />
                <span>Primary Accent Color</span>
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {colorPresets.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setPrimaryColor(c.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      primaryColor === c.value
                        ? 'border-white text-white bg-slate-800 shadow-sm'
                        : 'border-slate-800 text-slate-400 hover:text-white bg-slate-900'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }}></span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Content & Social Links Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1.5 font-medium"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Hide Custom Tagline & Social Links' : 'Customize Tagline, Bio & Social Links'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Custom Headline / Tagline</label>
                    <input
                      type="text"
                      value={subheadline}
                      onChange={e => setSubheadline(e.target.value)}
                      placeholder="Full Stack Software Engineer creating high-performance web applications"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Custom Bio Paragraph</label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Passionate engineer with experience across React, Node.js, and MongoDB..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">GitHub Profile URL</label>
                      <input
                        type="url"
                        value={contactGithub}
                        onChange={e => setContactGithub(e.target.value)}
                        placeholder="https://github.com/yourname"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={contactLinkedin}
                        onChange={e => setContactLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/yourname"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Live Portfolio to MongoDB...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Generate & Publish Live Portfolio</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live URL Link Card & Interactive Preview (Col 3) */}
        <div className="space-y-6">
          {/* Public Link Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Public Portfolio URL</h3>
              <p className="text-xs text-slate-300 mb-3">Share this link with recruiters or feature it on your LinkedIn.</p>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-brand-400 break-all flex items-center justify-between">
                <span>{window.location.origin}{publicUrl}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
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

          {/* Interactive Live Snapshot Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Preview Snapshot</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 capitalize font-mono">
                {template}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs uppercase"
                  style={{ backgroundColor: primaryColor }}
                >
                  {currentDisplayName[0] || 'U'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{currentDisplayName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">@{username}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{subheadline || portfolioData?.content?.hero?.subheadline || 'Full Stack Engineer crafting high-performance web applications.'}"
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-400" />
                  <span>{portfolioData?.content?.projects?.length || 2} Projects</span>
                </span>
                <span className="flex items-center gap-1">
                  <Code2 className="w-3 h-3 text-emerald-400" />
                  <span>{portfolioData?.content?.skills?.length || 8} Skills</span>
                </span>
                <span className="text-emerald-400 font-medium">Ready</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              Changes reflect immediately on your live site when published.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioBuilderPage;
