import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  ScanText,
  Briefcase,
  FileCode,
  Globe,
  Compass,
  MessageSquareCode,
  GraduationCap,
  LogOut,
  BrainCircuit,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume Builder', path: '/resume-builder', icon: FileText, badge: 'ATS' },
    { label: 'ATS Analyzer', path: '/ats-analyzer', icon: ScanText, badge: 'RAG' },
    { label: 'Job Description Matcher', path: '/job-analyzer', icon: Briefcase },
    { label: 'Cover Letter Generator', path: '/cover-letter', icon: FileCode },
    { label: 'Portfolio Builder', path: '/portfolio-builder', icon: Globe },
    { label: 'AI Career Advisor', path: '/career-advisor', icon: Compass, badge: 'LLM' },
    { label: 'Interview Prep', path: '/interview-prep', icon: GraduationCap },
    { label: 'AI Career Assistant', path: '/career-chat', icon: MessageSquareCode, badge: 'CAG' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 h-screen flex flex-col justify-between p-4 sticky top-0 shrink-0 hidden md:flex">
      <div>
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2 py-3 mb-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-glow">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-tight text-base">CareerAI</h2>
            <p className="text-[10px] text-brand-400 font-mono tracking-wider">MERN + RAG + CAG</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-8 h-8 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Professional'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
