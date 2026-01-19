
import React, { useState } from 'react';
import { DRILL_DATA } from '../constants';
import { Operator, CalculationDrill } from '../types';

const DrillItem: React.FC<{ drill: CalculationDrill }> = ({ drill }) => {
  const isUnlocked = drill.level === 1 || drill.completedCount > 0;

  return (
    <div 
      className={`group relative flex items-center p-4 rounded-3xl border transition-all active:scale-[0.98] ${
        isUnlocked 
          ? 'bg-white border-slate-100 shadow-sm' 
          : 'bg-slate-50 border-slate-50 opacity-60'
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${
        isUnlocked ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'
      }`}>
        {drill.level}
      </div>
      
      <div className="ml-4 flex-1">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          {drill.leftDigits}D <span className="text-slate-300 font-light">{drill.operator}</span> {drill.rightDigits}D
          {drill.completedCount > 5 && <i className="fas fa-check-circle text-emerald-500 text-[10px]"></i>}
        </h4>
        <div className="flex gap-3 mt-1">
          {drill.bestTime ? (
            <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1 uppercase tracking-wider">
              <i className="fas fa-stopwatch"></i> {drill.bestTime}s
            </span>
          ) : (
             <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider italic">No record</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isUnlocked ? (
           <div className="w-10 h-10 rounded-full bg-slate-900 group-hover:bg-indigo-600 text-white flex items-center justify-center text-xs shadow-lg transition-colors">
             <i className="fas fa-play"></i>
           </div>
        ) : (
          <i className="fas fa-lock text-slate-300"></i>
        )}
      </div>
    </div>
  );
};

const DrillMode: React.FC = () => {
  const [selectedOp, setSelectedOp] = useState<Operator>(Operator.ADD);

  const filteredDrills = DRILL_DATA.filter(d => d.operator === selectedOp);
  const stats = {
    total: filteredDrills.length,
    completed: filteredDrills.filter(d => d.completedCount > 0).length,
  };
  const progressPercentage = (stats.completed / stats.total) * 100;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Genius Calc</h2>
        <p className="text-slate-400 text-sm font-medium">Step-by-step arithmetic mastery</p>
      </div>

      {/* Operator Tabs */}
      <div className="grid grid-cols-4 gap-2">
        {[Operator.ADD, Operator.SUB, Operator.MUL, Operator.DIV].map(op => (
          <button
            key={op}
            onClick={() => setSelectedOp(op)}
            className={`py-3 rounded-2xl font-black text-lg transition-all border-2 ${
              selectedOp === op 
                ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-sm' 
                : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200'
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      {/* Stats Dashboard */}
      <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl flex items-center justify-between overflow-hidden relative">
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">Drill Progress</p>
          <div className="flex items-baseline gap-2">
             <h3 className="text-4xl font-black italic">{stats.completed}</h3>
             <span className="text-slate-500 font-bold">/ {stats.total} levels</span>
          </div>
        </div>
        <div className="relative w-16 h-16 flex items-center justify-center z-10">
           <svg className="w-full h-full transform -rotate-90">
             <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-800" />
             <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" strokeDasharray={176} strokeDashoffset={176 - (176 * progressPercentage) / 100} strokeLinecap="round" className="text-indigo-400 transition-all duration-1000" />
           </svg>
           <span className="absolute text-[10px] font-black">{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      {/* Drill List as a Path */}
      <div className="flex flex-col gap-3 relative">
        {/* Subtle path line */}
        <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-slate-100 -z-10"></div>
        
        {filteredDrills.map(drill => (
          <DrillItem key={drill.id} drill={drill} />
        ))}
      </div>
    </div>
  );
};

export default DrillMode;
