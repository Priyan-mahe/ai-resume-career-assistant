import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicPortfolioApi } from '../services/api';
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Award,
  Briefcase,
  GraduationCap,
  Code2,
  Sparkles,
  BrainCircuit,
  Terminal,
  ArrowRight,
  User,
  Globe
} from 'lucide-react';

const PublicPortfolioPage = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getPublicPortfolioApi(username)
      .then(res => {
        if (res.data) {
          setPortfolio(res.data);
        } else {
          setError('No portfolio found for this username.');
        }
      })
      .catch(e => {
        console.warn('Fetch public portfolio error:', e);
        setError('Unable to load portfolio for @' + username);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400 animate-spin">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-300">Loading Portfolio Site...</p>
          <p className="text-[11px] text-slate-500 font-mono">@{username}</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Globe className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Portfolio Not Found</h1>
            <p className="text-xs text-slate-400">
              No published portfolio was found at <span className="font-mono text-brand-400">/portfolio/{username}</span>.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/portfolio-builder"
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow transition-all"
            >
              Build & Publish Your Portfolio
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 px-4 glass-card hover:bg-slate-900 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const content = portfolio?.content || {};
  const template = portfolio?.template || 'modern';
  const theme = portfolio?.theme || { primaryColor: '#6366f1' };
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
  const contact = content?.contact || {};

  // Template-specific style classes
  const isDev = template === 'developer';
  const isMinimal = template === 'minimal';
  const isPro = template === 'professional';

  const rootBg = isDev
    ? 'bg-black text-slate-100 font-mono selection:bg-emerald-500 selection:text-black'
    : isMinimal
    ? 'bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-700 selection:text-white'
    : isPro
    ? 'bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white'
    : 'bg-slate-950 text-slate-100 font-sans selection:bg-brand-600 selection:text-white';

  const cardClass = isDev
    ? 'bg-zinc-950/90 border border-emerald-900/40 rounded-xl'
    : isMinimal
    ? 'bg-zinc-900/40 border border-zinc-800/80 rounded-xl'
    : isPro
    ? 'bg-slate-900/80 border border-slate-800 rounded-xl shadow-sm'
    : 'glass-card border border-slate-800 rounded-2xl';

  const badgeClass = isDev
    ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400'
    : isMinimal
    ? 'bg-zinc-900 border border-zinc-800 text-zinc-300'
    : isPro
    ? 'bg-blue-950/40 border border-blue-800/40 text-blue-300'
    : 'bg-brand-500/10 border border-brand-500/20 text-brand-300';

  const primaryBtnClass = isDev
    ? 'bg-emerald-600 hover:bg-emerald-500 text-black font-bold'
    : isMinimal
    ? 'bg-zinc-200 hover:bg-white text-zinc-900 font-semibold'
    : isPro
    ? 'bg-blue-600 hover:bg-blue-500 text-white font-semibold'
    : 'bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-glow';

  return (
    <div className={`min-h-screen ${rootBg}`}>
      {/* Portfolio Navbar */}
      <nav className={`sticky top-0 z-50 px-6 py-4 backdrop-blur-md border-b ${
        isDev ? 'border-emerald-900/40 bg-black/80' : isMinimal ? 'border-zinc-800/80 bg-zinc-950/80' : 'border-slate-800/80 bg-slate-950/80'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isDev && <Terminal className="w-5 h-5 text-emerald-400" />}
            <span className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              {displayTitle}
              {isDev && <span className="text-[10px] text-emerald-400 font-normal">$ bash</span>}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-6 text-xs font-medium text-slate-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            {content?.skills?.length > 0 && <a href="#skills" className="hover:text-white transition-colors">Skills</a>}
            {content?.projects?.length > 0 && <a href="#projects" className="hover:text-white transition-colors">Projects</a>}
            {content?.experience?.length > 0 && <a href="#experience" className="hover:text-white transition-colors">Experience</a>}
            {content?.education?.length > 0 && <a href="#education" className="hover:text-white transition-colors">Education</a>}
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all ${primaryBtnClass}`}
            >
              Hire Me
            </a>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${badgeClass}`}>
          {isDev ? <Terminal className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{isDev ? 'Terminal v2.6 // Full Stack' : isPro ? 'Executive Career Profile' : 'Professional Portfolio'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          {displayHeadline}
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {content?.hero?.subheadline || 'Full Stack Engineer crafting high-performance web applications and digital architectures.'}
        </p>

        {/* Location & Contact Meta */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-slate-400 pt-1">
          {contact.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{contact.location}</span>
            </span>
          )}
          {contact.github && (
            <a href={contact.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
          {contact.linkedin && (
            <a href={contact.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
          )}
        </div>

        <div className="pt-4 flex flex-wrap justify-center gap-3.5">
          <a href="#projects" className={`px-6 py-3 rounded-xl text-xs flex items-center gap-2 transition-all ${primaryBtnClass}`}>
            <span>{content?.hero?.ctaText || 'Explore Projects'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="#contact"
            className="px-6 py-3 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
          >
            Get In Touch
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-6 max-w-5xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-400" />
          <span>About Me</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          {content?.about?.bio && !content.about.bio.includes('Alex Morgan')
            ? content.about.bio
            : (personName
              ? `Passionate developer with experience building modern web applications, scalable architectures, and clean user experiences.`
              : 'Welcome to this professional portfolio site. Featured projects, skills, and experience are detailed below.')}
        </p>

        {content?.about?.highlights?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            {content.about.highlights.map((h, i) => (
              <div key={i} className={`${cardClass} p-3.5 text-xs text-slate-300 flex items-center gap-2`}>
                <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}
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
              <span key={i} className={`px-3.5 py-1.5 text-xs font-semibold ${cardClass}`}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Featured Projects Section */}
      {content?.projects?.length > 0 && (
        <section id="projects" className="py-16 px-6 max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span>Featured Projects</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.projects.map((proj, i) => (
              <div key={i} className={`${cardClass} p-6 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all`}>
                <div className="space-y-2.5">
                  <h3 className="text-lg font-bold text-white tracking-tight">{proj.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                  {proj.tech?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {proj.tech.map((t, idx) => (
                        <span key={idx} className={`px-2.5 py-0.5 rounded text-[10px] font-mono ${badgeClass}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {(proj.github || proj.liveUrl) && (
                  <div className="pt-4 border-t border-slate-800/80 flex items-center gap-4 text-xs font-medium">
                    {proj.github && (
                      <a href={proj.github} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                        <Github className="w-4 h-4" /> Code Repository
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors">
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

      {/* Work Experience Section */}
      {content?.experience?.length > 0 && (
        <section id="experience" className="py-16 px-6 max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-400" />
            <span>Work Experience</span>
          </h2>
          <div className="space-y-5">
            {content.experience.map((exp, i) => (
              <div key={i} className={`${cardClass} p-6 space-y-2.5`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h3 className="text-base font-bold text-white">{exp.role}</h3>
                    <p className="text-xs text-brand-400 font-medium">{exp.company}</p>
                  </div>
                  {exp.duration && <span className="text-xs text-slate-400 font-mono">{exp.duration}</span>}
                </div>
                {exp.highlights?.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pt-2">
                    {exp.highlights.map((h, idx) => (
                      <li key={idx} className="leading-relaxed">{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {content?.education?.length > 0 && (
        <section id="education" className="py-16 px-6 max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-400" />
            <span>Education</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.education.map((edu, i) => (
              <div key={i} className={`${cardClass} p-5 space-y-1.5`}>
                <h3 className="text-sm font-bold text-white">{edu.degree}</h3>
                <p className="text-xs text-brand-400 font-medium">{edu.college}</p>
                {edu.year && <p className="text-[11px] text-slate-400 font-mono">{edu.year}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {content?.certifications?.length > 0 && (
        <section id="certifications" className="py-16 px-6 max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-400" />
            <span>Certifications</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.certifications.map((c, i) => (
              <div key={i} className={`${cardClass} p-5 space-y-1.5 flex items-start gap-3`}>
                <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">{c.name}</h3>
                  {c.issuer && <p className="text-xs text-slate-400">{c.issuer}</p>}
                  {c.year && <p className="text-[11px] text-slate-500 font-mono">{c.year}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Section */}
      <footer id="contact" className={`py-20 px-6 max-w-5xl mx-auto border-t text-center space-y-6 ${
        isDev ? 'border-emerald-900/40' : 'border-slate-800'
      }`}>
        <h2 className="text-3xl font-bold text-white tracking-tight">Let's Connect</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {personName
            ? `Open for software engineering opportunities, contract projects, and collaborations with ${personName}.`
            : 'Open for full-time software engineering roles and contract opportunities.'}
        </p>

        <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold pt-2">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${primaryBtnClass}`}>
              <Mail className="w-4 h-4" /> {contact.email}
            </a>
          )}
          {contact.github && (
            <a href={contact.github} target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2">
              <Github className="w-4 h-4" /> GitHub
            </a>
          )}
          {contact.linkedin && (
            <a href={contact.linkedin} target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4" /> {contact.phone}
            </a>
          )}
        </div>

        <p className="text-[10px] text-slate-600 font-mono pt-8">
          Powered by AI Career Assistant Portfolio Engine // Verified MERN Stack
        </p>
      </footer>
    </div>
  );
};

export default PublicPortfolioPage;
