import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Bell, Search } from 'lucide-react';

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 glass-panel border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <h1 className="text-sm font-semibold text-slate-300">
              Welcome back, <span className="text-white font-bold">{user?.name || 'Professional'}</span>
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              AI Active
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <Search className="w-3.5 h-3.5" />
              <span>Search resumes, jobs, roles...</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400">⌘K</kbd>
            </div>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
