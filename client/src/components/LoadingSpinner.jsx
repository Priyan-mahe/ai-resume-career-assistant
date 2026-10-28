import React from 'react';
import { Loader2, BrainCircuit } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, label = 'Processing AI Request...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center animate-pulse">
            <BrainCircuit className="w-8 h-8 text-brand-400 animate-bounce" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-brand-500/20 blur-lg -z-10"></div>
        </div>
        <p className="text-sm font-medium text-slate-300 animate-pulse">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6 space-x-3 text-slate-400">
      <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
