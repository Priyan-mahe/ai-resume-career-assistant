import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getResumesApi, getResumeByIdApi, createResumeApi, updateResumeApi, generateSummaryApi, improveExperienceApi } from '../services/api';
import {
  FileText,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Eye,
  Download,
  CheckCircle2,
  Loader2,
  Wand2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const ResumeBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    title: 'Full Stack Engineer Resume',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    summary: 'Results-driven Full Stack Engineer with 3+ years of experience developing high-performance MERN web applications, REST APIs, and cloud services.',
    education: [
      {
        degree: 'B.S. in Computer Science',
        college: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        startYear: '2019',
        endYear: '2023',
        cgpa: '3.8 / 4.0',
      }
    ],
    skills: {
      languages: ['JavaScript', 'TypeScript', 'Python', 'SQL'],
      frameworks: ['React', 'Node.js', 'Express', 'Tailwind CSS'],
      databases: ['MongoDB', 'PostgreSQL', 'Redis'],
      tools: ['Git', 'Docker', 'AWS', 'Vite', 'Jest'],
      softSkills: ['Problem Solving', 'Team Leadership', 'Agile/Scrum'],
    },
    experience: [
      {
        company: 'TechPulse Solutions',
        role: 'Full Stack Developer',
        location: 'San Francisco, CA',
        startDate: '2023-06',
        endDate: 'Present',
        responsibilities: [
          'Architected responsive React UI components reducing client page load times by 40%.',
          'Engineered Node.js microservices processing 50,000 daily API requests with 99.9% uptime.'
        ],
      }
    ],
    projects: [
      {
        name: 'AI Resume & Career Assistant',
        description: 'Full-stack platform integrating LLM, RAG, and CAG for ATS scoring and personalized career roadmaps.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
        github: '',
        liveDemo: '',
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Developer - Associate',
        organization: 'Amazon Web Services',
        date: '2023',
        credentialUrl: '',
      }
    ],
    template: 'modern',
  });

  useEffect(() => {
    if (id) {
      getResumeByIdApi(id)
        .then(res => {
          if (res.data) {
            const r = res.data;
            setFormData(prev => ({
              ...prev,
              ...r,
              personalInfo: { ...prev.personalInfo, ...(r.personalInfo || {}) },
              skills: {
                languages: r.skills?.languages || prev.skills.languages || [],
                frameworks: r.skills?.frameworks || prev.skills.frameworks || [],
                databases: r.skills?.databases || prev.skills.databases || [],
                tools: r.skills?.tools || prev.skills.tools || [],
                softSkills: r.skills?.softSkills || prev.skills.softSkills || [],
              },
              education: r.education?.length ? r.education : prev.education,
              experience: r.experience?.length ? r.experience : prev.experience,
              projects: r.projects?.length ? r.projects : prev.projects,
              certifications: r.certifications?.length ? r.certifications : prev.certifications,
            }));
          }
        })
        .catch(err => {
          console.warn('Fetch resume by id error, falling back to all resumes', err);
          getResumesApi().then(res => {
            const found = res.data?.find(r => String(r._id) === String(id));
            if (found) {
              setFormData(prev => ({
                ...prev,
                ...found,
                personalInfo: { ...prev.personalInfo, ...(found.personalInfo || {}) },
                skills: { ...prev.skills, ...(found.skills || {}) },
              }));
            }
          }).catch(e => console.warn('Fetch resumes error', e));
        });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        title: (!prev.personalInfo.fullName && user.name) ? `${user.name}'s Resume` : prev.title,
        personalInfo: {
          ...prev.personalInfo,
          fullName: prev.personalInfo.fullName || user.name || '',
          email: prev.personalInfo.email || user.email || '',
        }
      }));
    }
  }, [id, user]);

  const steps = [
    { num: 1, title: 'Personal Info' },
    { num: 2, title: 'Summary' },
    { num: 3, title: 'Education' },
    { num: 4, title: 'Skills' },
    { num: 5, title: 'Experience' },
    { num: 6, title: 'Projects & Certs' },
  ];

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      if (id) {
        await updateResumeApi(id, formData);
        setSuccessMsg('Resume updated successfully!');
      } else {
        const res = await createResumeApi(formData);
        setSuccessMsg('Resume saved successfully!');
        if (res.data?._id) {
          navigate(`/resume-builder/${res.data._id}`);
        }
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Save error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAISummary = async () => {
    setAiLoading(true);
    try {
      const skillsArray = [
        ...(formData.skills?.languages || []),
        ...(formData.skills?.frameworks || []),
        ...(formData.skills?.databases || []),
      ];
      const res = await generateSummaryApi({
        targetRole: formData.title || 'Full Stack Engineer',
        skills: skillsArray,
      });
      if (res.data?.summary) {
        setFormData(prev => ({ ...prev, summary: res.data.summary }));
      }
    } catch (err) {
      alert('AI Summary generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleImproveExperienceBullet = async (expIdx, respIdx) => {
    setAiLoading(true);
    const exp = formData.experience?.[expIdx] || {};
    const currentResp = exp.responsibilities?.[respIdx] || '';
    try {
      const res = await improveExperienceApi({
        role: exp.role || 'Full Stack Developer',
        company: exp.company || 'Tech Company',
        responsibility: currentResp
      });
      if (res.data?.improvedBullets?.[0]) {
        const updatedExp = [...formData.experience];
        updatedExp[expIdx].responsibilities[respIdx] = res.data.improvedBullets[0];
        setFormData(prev => ({ ...prev, experience: updatedExp }));
      }
    } catch (e) {
      alert('Failed to improve bullet point');
    } finally {
      setAiLoading(false);
    }
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', college: '', location: '', startYear: '', endYear: '', cgpa: '' }
      ]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', role: '', location: '', startDate: '', endDate: 'Present', responsibilities: [''] }
      ]
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index)
    }));
  };

  const addResponsibility = (expIdx) => {
    const updated = [...formData.experience];
    updated[expIdx].responsibilities = [...(updated[expIdx].responsibilities || []), ''];
    setFormData({ ...formData, experience: updated });
  };

  const removeResponsibility = (expIdx, rIdx) => {
    const updated = [...formData.experience];
    updated[expIdx].responsibilities = updated[expIdx].responsibilities.filter((_, i) => i !== rIdx);
    setFormData({ ...formData, experience: updated });
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { name: '', description: '', technologies: [], github: '', liveDemo: '' }
      ]
    }));
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        { name: '', organization: '', date: '', credentialUrl: '' }
      ]
    }));
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, idx) => idx !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-400" />
            <span>ATS Resume Builder</span>
          </h1>
          <p className="text-xs text-slate-400">Step-by-step form with AI enhancement tools</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>{previewMode ? 'Edit Form' : 'Live Preview'}</span>
          </button>
          {previewMode && (
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Print / PDF</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Resume</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Step Indicator Tabs */}
      {!previewMode && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800">
          {steps.map(s => (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeStep === s.num
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-950/40 flex items-center justify-center text-[10px]">
                {s.num}
              </span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Form Content or Preview */}
      {previewMode ? (
        /* Live Resume Preview Component */
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 max-w-4xl mx-auto text-slate-200 font-sans print:bg-white print:text-black">
          {/* Header */}
          <div className="border-b border-slate-800 pb-4 text-center space-y-1">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{formData.personalInfo.fullName}</h2>
            <div className="text-xs text-slate-400 flex flex-wrap items-center justify-center gap-3">
              <span>{formData.personalInfo.email}</span> •
              <span>{formData.personalInfo.phone}</span> •
              <span>{formData.personalInfo.location}</span>
            </div>
            <div className="text-xs text-brand-400 flex flex-wrap items-center justify-center gap-3">
              <span>{formData.personalInfo.linkedin}</span> •
              <span>{formData.personalInfo.github}</span> •
              <span>{formData.personalInfo.portfolio}</span>
            </div>
          </div>

          {/* Summary */}
          {formData.summary && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-1 border-b border-slate-800 pb-1">Professional Summary</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{formData.summary}</p>
            </div>
          )}

          {/* Skills */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-1 border-b border-slate-800 pb-1">Technical Skills</h3>
            <div className="text-xs text-slate-300 space-y-1">
              <div><strong className="text-white">Languages:</strong> {formData.skills.languages?.join(', ')}</div>
              <div><strong className="text-white">Frameworks:</strong> {formData.skills.frameworks?.join(', ')}</div>
              <div><strong className="text-white">Databases & Tools:</strong> {formData.skills.databases?.concat(formData.skills.tools || []).join(', ')}</div>
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2 border-b border-slate-800 pb-1">Work Experience</h3>
            <div className="space-y-3">
              {formData.experience.map((exp, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">{exp.role} — {exp.company}</span>
                    <span className="text-slate-400">{exp.startDate} – {exp.endDate} | {exp.location}</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                    {exp.responsibilities?.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2 border-b border-slate-800 pb-1">Education</h3>
            {formData.education.map((ed, i) => (
              <div key={i} className="flex justify-between text-xs">
                <div>
                  <span className="font-bold text-white">{ed.degree}</span> — <span className="text-slate-300">{ed.college}</span>
                </div>
                <span className="text-slate-400">{ed.startYear} – {ed.endYear} (CGPA: {ed.cgpa})</span>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2 border-b border-slate-800 pb-1">Projects</h3>
            <div className="space-y-2">
              {formData.projects.map((p, i) => (
                <div key={i} className="text-xs space-y-0.5">
                  <div className="font-bold text-white flex justify-between">
                    <span>{p.name} {p.technologies?.length ? `(${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies})` : ''}</span>
                    <span className="text-brand-400">{p.github}</span>
                  </div>
                  <p className="text-slate-300">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {formData.certifications?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2 border-b border-slate-800 pb-1">Certifications</h3>
              <div className="space-y-1">
                {formData.certifications.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="font-bold text-white">{c.name} {c.organization ? `— ${c.organization}` : ''}</span>
                    <span className="text-slate-400">{c.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Form Steps */
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          {activeStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Resume Target Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.personalInfo.fullName}
                    onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, fullName: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, email: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.personalInfo.phone}
                    onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, phone: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location (City, Country)</label>
                  <input
                    type="text"
                    value={formData.personalInfo.location}
                    onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, location: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={formData.personalInfo.linkedin}
                    onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo, linkedin: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Professional Summary</h3>
                <button
                  type="button"
                  onClick={handleGenerateAISummary}
                  disabled={aiLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-600/20 text-brand-300 border border-brand-500/30 text-xs font-semibold hover:bg-brand-600/30 transition-colors flex items-center gap-1.5"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-brand-400" />}
                  <span>Generate with AI</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={formData.summary}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Results-driven Software Engineer with extensive experience in..."
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 leading-relaxed"
              />
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Education History</h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-300 border border-brand-500/30 text-xs font-semibold hover:bg-brand-600/30 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              {formData.education.map((ed, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 relative">
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Remove education"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Degree</label>
                      <input
                        type="text"
                        placeholder="e.g. B.S. in Computer Science"
                        value={ed.degree}
                        onChange={e => {
                          const updated = [...formData.education];
                          updated[idx].degree = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">College / University</label>
                      <input
                        type="text"
                        placeholder="e.g. University of California, Berkeley"
                        value={ed.college}
                        onChange={e => {
                          const updated = [...formData.education];
                          updated[idx].college = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Berkeley, CA"
                        value={ed.location || ''}
                        onChange={e => {
                          const updated = [...formData.education];
                          updated[idx].location = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">CGPA / Grade</label>
                      <input
                        type="text"
                        placeholder="e.g. 3.8 / 4.0"
                        value={ed.cgpa || ''}
                        onChange={e => {
                          const updated = [...formData.education];
                          updated[idx].cgpa = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2019"
                        value={ed.startYear || ''}
                        onChange={e => {
                          const updated = [...formData.education];
                          updated[idx].startYear = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">End Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2023"
                        value={ed.endYear || ''}
                        onChange={e => {
                          const updated = [...formData.education];
                          updated[idx].endYear = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Skills Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Programming Languages (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.skills.languages?.join(', ') || ''}
                    onChange={e => setFormData({
                      ...formData,
                      skills: { ...formData.skills, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                    })}
                    placeholder="JavaScript, TypeScript, Python, SQL"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Frameworks & Libraries (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.skills.frameworks?.join(', ') || ''}
                    onChange={e => setFormData({
                      ...formData,
                      skills: { ...formData.skills, frameworks: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                    })}
                    placeholder="React, Node.js, Express, Tailwind CSS, Next.js"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Databases & Storage (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.skills.databases?.join(', ') || ''}
                    onChange={e => setFormData({
                      ...formData,
                      skills: { ...formData.skills, databases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                    })}
                    placeholder="MongoDB, PostgreSQL, Redis, MySQL"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Developer Tools & Cloud (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.skills.tools?.join(', ') || ''}
                    onChange={e => setFormData({
                      ...formData,
                      skills: { ...formData.skills, tools: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                    })}
                    placeholder="Git, Docker, AWS, Vite, Postman, Jest"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Soft Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.skills.softSkills?.join(', ') || ''}
                    onChange={e => setFormData({
                      ...formData,
                      skills: { ...formData.skills, softSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                    })}
                    placeholder="Problem Solving, Team Leadership, Agile/Scrum, Communication"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Work Experience</h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-300 border border-brand-500/30 text-xs font-semibold hover:bg-brand-600/30 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              {formData.experience.map((exp, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 relative">
                  {formData.experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(i)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Remove experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Company</label>
                      <input
                        type="text"
                        placeholder="Company name"
                        value={exp.company}
                        onChange={e => {
                          const updated = [...formData.experience];
                          updated[i].company = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Role Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Full Stack Developer"
                        value={exp.role}
                        onChange={e => {
                          const updated = [...formData.experience];
                          updated[i].role = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. San Francisco, CA"
                        value={exp.location || ''}
                        onChange={e => {
                          const updated = [...formData.experience];
                          updated[i].location = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Date</label>
                        <input
                          type="text"
                          placeholder="e.g. 2023-06"
                          value={exp.startDate || ''}
                          onChange={e => {
                            const updated = [...formData.experience];
                            updated[i].startDate = e.target.value;
                            setFormData({ ...formData, experience: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">End Date</label>
                        <input
                          type="text"
                          placeholder="e.g. Present"
                          value={exp.endDate || ''}
                          onChange={e => {
                            const updated = [...formData.experience];
                            updated[i].endDate = e.target.value;
                            setFormData({ ...formData, experience: updated });
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-400">Responsibility Bullet Points</label>
                      <button
                        type="button"
                        onClick={() => addResponsibility(i)}
                        className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet</span>
                      </button>
                    </div>

                    {exp.responsibilities?.map((resp, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={resp}
                          placeholder="Describe an accomplishment or impact..."
                          onChange={e => {
                            const updated = [...formData.experience];
                            updated[i].responsibilities[rIdx] = e.target.value;
                            setFormData({ ...formData, experience: updated });
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleImproveExperienceBullet(i, rIdx)}
                          disabled={aiLoading}
                          title="Improve with AI"
                          className="px-2.5 py-1.5 rounded-lg bg-brand-600/20 text-brand-300 border border-brand-500/30 text-[11px] hover:bg-brand-600/40 transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Wand2 className="w-3 h-3 text-brand-400" />
                          <span>AI Improve</span>
                        </button>
                        {exp.responsibilities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeResponsibility(i, rIdx)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                            title="Remove bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeStep === 6 && (
            <div className="space-y-6">
              {/* Projects Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Projects</h3>
                  <button
                    type="button"
                    onClick={addProject}
                    className="px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-300 border border-brand-500/30 text-xs font-semibold hover:bg-brand-600/30 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {formData.projects.map((proj, pIdx) => (
                  <div key={pIdx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 relative">
                    {formData.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProject(pIdx)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Remove project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                      <input
                        type="text"
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={e => {
                          const updated = [...formData.projects];
                          updated[pIdx].name = e.target.value;
                          setFormData({ ...formData, projects: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Technologies (e.g. React, Node.js, MongoDB)"
                        value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies || ''}
                        onChange={e => {
                          const updated = [...formData.projects];
                          updated[pIdx].technologies = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setFormData({ ...formData, projects: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="GitHub URL (optional)"
                        value={proj.github || ''}
                        onChange={e => {
                          const updated = [...formData.projects];
                          updated[pIdx].github = e.target.value;
                          setFormData({ ...formData, projects: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Live Demo URL (optional)"
                        value={proj.liveDemo || ''}
                        onChange={e => {
                          const updated = [...formData.projects];
                          updated[pIdx].liveDemo = e.target.value;
                          setFormData({ ...formData, projects: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Project Description and Key Highlights"
                      value={proj.description}
                      onChange={e => {
                        const updated = [...formData.projects];
                        updated[pIdx].description = e.target.value;
                        setFormData({ ...formData, projects: updated });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                ))}
              </div>

              {/* Certifications Section */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Certifications & Licenses</h3>
                  <button
                    type="button"
                    onClick={addCertification}
                    className="px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-300 border border-brand-500/30 text-xs font-semibold hover:bg-brand-600/30 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certification</span>
                  </button>
                </div>

                {(formData.certifications || []).map((cert, cIdx) => (
                  <div key={cIdx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeCertification(cIdx)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Remove certification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-6">
                      <input
                        type="text"
                        placeholder="Certification Name"
                        value={cert.name || ''}
                        onChange={e => {
                          const updated = [...(formData.certifications || [])];
                          updated[cIdx].name = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Issuing Organization"
                        value={cert.organization || ''}
                        onChange={e => {
                          const updated = [...(formData.certifications || [])];
                          updated[cIdx].organization = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Date (e.g. 2023)"
                        value={cert.date || ''}
                        onChange={e => {
                          const updated = [...(formData.certifications || [])];
                          updated[cIdx].date = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Step Nav Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              disabled={activeStep === 1}
              onClick={() => setActiveStep(prev => prev - 1)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={activeStep === steps.length}
              onClick={() => setActiveStep(prev => prev + 1)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow flex items-center gap-1"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilderPage;
