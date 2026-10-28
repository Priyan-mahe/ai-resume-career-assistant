import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPortfolioApi } from '../services/api';
import { Github, Linkedin, Mail, ExternalLink, Award, Briefcase, GraduationCap, Code2, Sparkles, BrainCircuit } from 'lucide-react';

const PublicPortfolioPage = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    getPublicPortfolioApi(username)
      .then(res => setPortfolio(res.data))
      .catch(e => console.warn('Fetch public portfolio error:', e))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400 animate-spin">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-400">Loading Portfolio Site...</p>
        </div>
      </div>
    );
  }

  const content = portfolio?.content;
  const rawHeadline = content?.hero?.headline || '';
  const parsedHeadlineName = rawHeadline.startsWith('Hi, I am ') ? rawHeadline.replace('Hi, I am ', '').trim() : '';

  const personName = portfolio?.name
    || content?.name
    || (content?.hero?.name)
    || (parsedHeadlineName && parsedHeadlineName.toLowerCase() !== 'alex morgan' ? parsedHeadlineName : '')
    || '';

  const displayHeadline = rawHeadline && !rawHeadline.includes('Alex Morgan')
    ? rawHeadline
    : (personName ? `Hi, I am ${personName}` : 'My Portfolio');

  const displayTitle = personName || 'Portfolio';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-600 selection:text-white">
      {/* Portfolio Navbar */}
      <nav className="glass-panel border-b border-slate-800 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-lg text-white tracking-tight">{displayTitle}</span>
          <div className="flex items-center space-x-6 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            {content?.skills?.length > 0 && <a href="#skills" className="hover:text-white transition-colors">Skills</a>}
            {content?.experience?.length > 0 && <a href="#experience" className="hover:text-white transition-colors">Experience</a>}
            {content?.projects?.length > 0 && <a href="#projects" className="hover:text-white transition-colors">Projects</a>}
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Professional Portfolio</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">{displayHeadline}</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {content?.hero?.subheadline || 'Full Stack Engineer crafting high-performance web applications.'}
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <a href="#projects" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow transition-all">
            {content?.hero?.ctaText || 'View Projects'}
          </a>
          <a href="#contact" className="px-6 py-3 glass-card hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors">
            Get In Touch
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-6 max-w-5xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-white tracking-tight border-b border-slate-800 pb-3">About Me</h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          {content?.about?.bio && !content.about.bio.includes('Alex Morgan')
            ? content.about.bio
            : (personName
              ? `Passionate software developer with experience building modern web applications, scalable architectures, and clean user experiences.`
              : 'Welcome to this professional portfolio site. Projects and technical experience are featured below.')}
        </p>
      </section>

      {/* Skills Section */}
      {content?.skills?.length > 0 && (
        <section id="skills" className="py-16 px-6 max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-brand-400" />
            <span>Technical Skills</span>
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {content.skills.map((skill, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-xl glass-card border border-slate-800 text-xs font-semibold text-slate-200">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience Section */}
      {content?.experience?.length > 0 && (
        <section id="experience" className="py-16 px-6 max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-400" />
            <span>Work Experience</span>
          </h2>
          <div className="space-y-6">
            {content.experience.map((exp, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white">{exp.role}</h3>
                    <p className="text-xs text-brand-400 font-medium">{exp.company}</p>
                  </div>
                  {exp.duration && <span className="text-xs text-slate-400 font-mono">{exp.duration}</span>}
                </div>
                {exp.highlights?.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pt-2">
                    {exp.highlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {content?.projects?.length > 0 && (
        <section id="projects" className="py-16 px-6 max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span>Featured Projects</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.projects.map((proj, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                  {proj.tech?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {proj.tech.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 text-[10px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {(proj.github || proj.liveUrl) && (
                  <div className="pt-4 border-t border-slate-800/60 flex items-center gap-4 text-xs font-medium">
                    {proj.github && (
                      <a href={proj.github} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white flex items-center gap-1">
                        <Github className="w-4 h-4" /> Code
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" /> Live Demo
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Section */}
      <footer id="contact" className="py-20 px-6 max-w-5xl mx-auto border-t border-slate-800 text-center space-y-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">Let's Connect</h2>
        <p className="text-xs text-slate-400">
          {personName
            ? `Open for software engineering opportunities and collaborations with ${personName}.`
            : 'Open for full-time software engineering opportunities and collaborations.'}
        </p>
        {content?.contact?.email && (
          <div className="flex justify-center gap-4 text-xs font-semibold">
            <a href={`mailto:${content.contact.email}`} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-glow transition-all flex items-center gap-2">
              <Mail className="w-4 h-4" /> {content.contact.email}
            </a>
          </div>
        )}
      </footer>
    </div>
  );
};

export default PublicPortfolioPage;
