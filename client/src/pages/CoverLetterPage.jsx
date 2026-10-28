import React, { useState, useEffect } from 'react';
import { generateCoverLetterApi, getCoverLettersApi, getResumesApi } from '../services/api';
import { FileCode, Sparkles, Copy, Check, Download, RefreshCw, Loader2, Save } from 'lucide-react';

const CoverLetterPage = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('Full Stack Software Engineer');
  const [company, setCompany] = useState('Acme Technologies');
  const [tone, setTone] = useState('Professional');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [savedLetters, setSavedLetters] = useState([]);

  useEffect(() => {
    getResumesApi().then(res => {
      setResumes(res.data || []);
      if (res.data?.[0]) setSelectedResumeId(res.data[0]._id);
    });
    getCoverLettersApi().then(res => {
      setSavedLetters(res.data || []);
    });
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!jobTitle || !company) {
      alert('Please enter target job title and company name.');
      return;
    }

    setLoading(true);
    try {
      const selectedResume = resumes.find(r => String(r._id) === String(selectedResumeId));
      const resumeText = selectedResume ? JSON.stringify(selectedResume) : '';

      const res = await generateCoverLetterApi({
        jobTitle,
        company,
        jobDescription,
        resumeText,
        tone
      });

      const text = res.data.content || res.data;
      setLetterContent(text);
      setSavedLetters(prev => [res.data, ...prev]);
    } catch (err) {
      alert('Failed to generate cover letter: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileCode className="w-6 h-6 text-brand-400" />
          <span>AI Cover Letter Generator</span>
        </h1>
        <p className="text-xs text-slate-400">Generate personalized, grounded cover letters tailored to your resume and target job</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Controls */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Job Title</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Resume Source</label>
                <select
                  value={selectedResumeId}
                  onChange={e => setSelectedResumeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>{r.title || 'My Resume'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Writing Tone</label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="Professional">Professional & Formal</option>
                  <option value="Enthusiastic">Enthusiastic & High Energy</option>
                  <option value="Confident">Confident & Metrics Driven</option>
                  <option value="Direct">Direct & Concise</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Job Description (Optional)</label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities to match exact phrasing..."
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Cover Letter with RAG...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-brand-200" />
                  <span>Generate Personalized Cover Letter</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Letter Display & Editor */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white text-sm">Cover Letter Editor</h3>
            {letterContent && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          <textarea
            rows={16}
            value={letterContent}
            onChange={e => setLetterContent(e.target.value)}
            placeholder="Your AI generated cover letter will appear here..."
            className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPage;
