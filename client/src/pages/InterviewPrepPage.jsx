import React, { useState } from 'react';
import { getInterviewQuestionsApi, evaluateInterviewAnswerApi } from '../services/api';
import { GraduationCap, Play, Sparkles, CheckCircle2, ArrowRight, Loader2, Award, RefreshCw, BarChart2 } from 'lucide-react';

const InterviewPrepPage = () => {
  const [role, setRole] = useState('Full Stack Developer');
  const [experience, setExperience] = useState('Mid Level (2-4 yrs)');
  const [technology, setTechnology] = useState('React, Node.js & MongoDB');
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);

  const [questions, setQuestions] = useState(null);
  const [activeMode, setActiveMode] = useState('generator'); // 'generator' | 'mock'

  // Interactive Mock Interview State
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentAnswerInput, setCurrentAnswerInput] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [mockFinished, setMockFinished] = useState(false);

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    setLoading(true);
    setQuestions(null);
    setMockFinished(false);
    setEvaluations([]);
    setCurrentQIdx(0);

    try {
      const res = await getInterviewQuestionsApi({ role, experience, technology, difficulty });
      setQuestions(res.data.questions || []);
    } catch (err) {
      alert('Failed to generate interview questions');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateCurrentAnswer = async () => {
    if (!currentAnswerInput.trim()) return;
    setEvalLoading(true);

    const q = questions[currentQIdx];
    try {
      const res = await evaluateInterviewAnswerApi({
        question: q.question,
        userAnswer: currentAnswerInput,
        expectedAnswer: q.expectedAnswer,
        role
      });

      const evalData = res.data;
      setEvaluations(prev => [...prev, { qId: q.id, question: q.question, userAnswer: currentAnswerInput, eval: evalData }]);
      setUserAnswers(prev => ({ ...prev, [currentQIdx]: currentAnswerInput }));
      setCurrentAnswerInput('');

      if (currentQIdx + 1 < questions.length) {
        setCurrentQIdx(prev => prev + 1);
      } else {
        setMockFinished(true);
      }
    } catch (e) {
      alert('Answer evaluation error');
    } finally {
      setEvalLoading(false);
    }
  };

  // Compute final mock report scores
  const avgOverallScore = evaluations.length > 0 ? Math.round(evaluations.reduce((a, b) => a + (b.eval?.overallScore || 80), 0) / evaluations.length) : 85;
  const avgTechScore = evaluations.length > 0 ? Math.round(evaluations.reduce((a, b) => a + (b.eval?.technicalScore || 85), 0) / evaluations.length) : 88;
  const avgCommScore = evaluations.length > 0 ? Math.round(evaluations.reduce((a, b) => a + (b.eval?.communicationScore || 80), 0) / evaluations.length) : 82;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand-400" />
            <span>AI Interview Preparation & Mock Interview Simulator</span>
          </h1>
          <p className="text-xs text-slate-400">Generate role-specific technical/behavioral question sets & practice interactive mock sessions</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveMode('generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'generator' ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Question Bank
          </button>
          <button
            onClick={() => setActiveMode('mock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'mock' ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Mock Interview
          </button>
        </div>
      </div>

      {/* Setup Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <form onSubmit={handleGenerateQuestions} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Job Role</label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Experience Level</label>
              <select
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              >
                <option value="Entry Level (0-2 yrs)">Entry Level (0-2 yrs)</option>
                <option value="Mid Level (2-4 yrs)">Mid Level (2-4 yrs)</option>
                <option value="Senior Level (5+ yrs)">Senior Level (5+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Technology Focus</label>
              <input
                type="text"
                value={technology}
                onChange={e => setTechnology(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard / Senior</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Retrieving RAG Interview Knowledge...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Questions & Start Practice</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Mode 1: Question Bank View */}
      {questions && activeMode === 'generator' && (
        <div className="space-y-4 animate-fadeIn">
          <h2 className="text-lg font-bold text-white tracking-tight">Generated Question Bank for {role}</h2>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20 uppercase">
                    {q.category}
                  </span>
                  <span className="text-slate-500 font-mono">Q{idx + 1} of {questions.length}</span>
                </div>

                <h3 className="text-base font-bold text-white">{q.question}</h3>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1 text-xs">
                  <span className="font-semibold text-brand-300 block">Expected Model Answer Guidance:</span>
                  <p className="text-slate-300 leading-relaxed">{q.expectedAnswer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: Interactive AI Mock Interview Simulator */}
      {questions && activeMode === 'mock' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 animate-fadeIn">
          {!mockFinished ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                  Question {currentQIdx + 1} of {questions.length}
                </span>
                <span className="text-xs text-slate-400 font-mono">{questions[currentQIdx]?.category} Category</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-white leading-snug">{questions[currentQIdx]?.question}</h2>
                {questions[currentQIdx]?.hints && (
                  <p className="text-xs text-slate-400 italic">Hint: {questions[currentQIdx]?.hints.join(' ')}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Your Answer (Type your technical response)</label>
                <textarea
                  rows={6}
                  value={currentAnswerInput}
                  onChange={e => setCurrentAnswerInput(e.target.value)}
                  placeholder="Explain your approach, tech stack choices, and step-by-step logic here..."
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
                />
              </div>

              <button
                onClick={handleEvaluateCurrentAnswer}
                disabled={evalLoading || !currentAnswerInput.trim()}
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
              >
                {evalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Evaluating Your Answer...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Final Mock Interview Performance Summary Report */
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center space-y-2 border-b border-slate-800 pb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Mock Interview Evaluation Report</h2>
                <p className="text-xs text-slate-400">Comprehensive score breakdown based on your technical responses</p>
              </div>

              {/* Overall Scores Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Overall Performance Score</span>
                  <div className="text-4xl font-extrabold text-brand-400 mt-2">{avgOverallScore}/100</div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Technical Depth Score</span>
                  <div className="text-4xl font-extrabold text-emerald-400 mt-2">{avgTechScore}/100</div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Communication Score</span>
                  <div className="text-4xl font-extrabold text-cyan-400 mt-2">{avgCommScore}/100</div>
                </div>
              </div>

              {/* Individual Question Evaluations */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-base font-bold text-white">Question-by-Question AI Feedback</h3>

                <div className="space-y-4">
                  {evaluations.map((item, idx) => (
                    <div key={idx} className="glass-card p-5 rounded-xl border border-slate-800 space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white text-sm">Q{idx + 1}: {item.question}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 font-mono font-bold">
                          {item.eval?.overallScore || 85}/100
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                        <strong className="text-slate-400 block mb-1">Your Answer:</strong>
                        <p>{item.userAnswer}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-200">
                        <strong className="block mb-1">AI Evaluator Feedback:</strong>
                        <p>{item.eval?.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewPrepPage;
