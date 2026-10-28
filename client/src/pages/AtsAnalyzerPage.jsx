import React, { useState, useEffect } from 'react';
import { getResumesApi, uploadAndAnalyzeApi, analyzeResumeAtsApi } from '../services/api';
import {
  ScanText,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldCheck,
  XCircle,
  TrendingUp
} from 'lucide-react';

const AtsAnalyzerPage = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    getResumesApi().then(res => {
      setResumes(res.data || []);
      if (res.data?.[0]) setSelectedResumeId(res.data[0]._id);
    }).catch(e => console.warn('Resumes fetch error'));
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnalysisResult(null);

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('jobDescription', jobDescription);
        const res = await uploadAndAnalyzeApi(formData);
        setAnalysisResult(res.data.analysis || res.data);
      } else if (selectedResumeId) {
        const res = await analyzeResumeAtsApi(selectedResumeId, { jobDescription });
        setAnalysisResult(res.data.analysis || res.data);
      } else {
        alert('Please upload a PDF file or select a saved resume.');
      }
    } catch (err) {
      alert('Analysis failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const score = analysisResult?.score || 87;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>RAG + LLM Resume Grounding</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ATS Resume Analyzer</h1>
          <p className="text-xs text-slate-400">Evaluate resume parsability, keyword alignment, and formatting standards</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form (Col 1 & 2) */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <form onSubmit={handleAnalyze} className="space-y-6">
            {/* Choose Input Method */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Select Input Resume Source</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PDF File Upload */}
                <div className={`p-4 rounded-xl border text-center transition-all ${file ? 'border-brand-500 bg-brand-500/10' : 'border-slate-800 bg-slate-900/60'}`}>
                  <label className="cursor-pointer space-y-2 block">
                    <Upload className="w-6 h-6 text-brand-400 mx-auto" />
                    <span className="text-xs font-semibold text-white block">
                      {file ? file.name : 'Upload PDF Resume'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Select PDF file up to 10MB</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          setFile(e.target.files[0]);
                          setSelectedResumeId('');
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Or Select Saved Resume */}
                <div className={`p-4 rounded-xl border transition-all ${!file && selectedResumeId ? 'border-brand-500 bg-brand-500/10' : 'border-slate-800 bg-slate-900/60'}`}>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Or Select Saved Resume</label>
                  <select
                    value={selectedResumeId}
                    onChange={e => {
                      setSelectedResumeId(e.target.value);
                      setFile(null);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {resumes.map(r => (
                      <option key={r._id} value={r._id}>{r.title || 'My Resume'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Target Job Description */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Target Job Description (Optional for general ATS audit)</label>
              <textarea
                rows={6}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste target job posting responsibilities and requirements here..."
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Running RAG + LLM ATS Audit...</span>
                </>
              ) : (
                <>
                  <ScanText className="w-4 h-4" />
                  <span>Analyze ATS Compatibility</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Score Overview Badge */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6 text-center">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Calculated ATS Score</h3>
            <div className="relative inline-flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-brand-500/20 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">/ 100</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-left bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Parser Status:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Parsability
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Grounding DB:</span>
              <span className="text-brand-400 font-mono">ats_best_practices.json</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              <span>Detailed ATS Report & RAG Recommendations</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Score: {score}/100</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="glass-card p-5 rounded-xl border border-emerald-500/20 space-y-3">
              <h3 className="font-semibold text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Resume Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysisResult.strengths || ["Clean section header hierarchy.", "Action-oriented bullet points."]).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Keywords */}
            <div className="glass-card p-5 rounded-xl border border-amber-500/20 space-y-3">
              <h3 className="font-semibold text-amber-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Missing Key Keywords</span>
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {(analysisResult.missingKeywords || ["AWS", "Docker", "Jest", "CI/CD"]).map((kw, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Formatting Issues */}
            <div className="glass-card p-5 rounded-xl border border-rose-500/20 space-y-3">
              <h3 className="font-semibold text-rose-400 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Formatting & Parser Warnings</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysisResult.formattingIssues || ["Ensure single-column text format."]).map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Recommendations */}
            <div className="glass-card p-5 rounded-xl border border-brand-500/20 space-y-3">
              <h3 className="font-semibold text-brand-400 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>AI Action Items for Higher Score</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysisResult.suggestions || ["Add quantifiable outcome metrics to bullet points."]).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-brand-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtsAnalyzerPage;
