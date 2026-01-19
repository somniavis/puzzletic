
import React from 'react';
import { Subject } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeSubject: Subject;
  onSubjectChange: (s: Subject) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeSubject, onSubjectChange }) => {
  const navItems = [
    { id: Subject.MATH, icon: 'fa-calculator', label: 'Math', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: Subject.BRAIN, icon: 'fa-brain', label: 'Brain', color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: Subject.SCIENCE, icon: 'fa-flask', label: 'Science', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: Subject.SOFTWARE, icon: 'fa-code', label: 'Soft', color: 'text-amber-600', bg: 'bg-amber-50' }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden select-none">
      <header className="px-6 py-3 flex justify-between items-center bg-white shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <i className="fas fa-gamepad text-lg"></i>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Play & Learn</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
          <i className="fas fa-xmark text-xl"></i>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-4">
        {children}
      </main>

      <nav className="bg-white border-t border-slate-100 px-1 py-2 pb-6 flex justify-around items-center shrink-0">
        {navItems.map((sub) => (
          <button
            key={sub.id}
            onClick={() => onSubjectChange(sub.id)}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${
              activeSubject === sub.id ? sub.color : 'text-slate-400 opacity-60'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              activeSubject === sub.id ? sub.bg : 'bg-transparent'
            }`}>
              <i className={`fas ${sub.icon} text-base`}></i>
            </div>
            <span className="text-[8px] font-black uppercase tracking-wider">{sub.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
