
import React from 'react';
import { BRAIN_TRAINING_GAMES } from '../constants';

const BrainTrainingMode: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 gap-4">
        {BRAIN_TRAINING_GAMES.map((game) => (
          <div 
            key={game.id} 
            className="group bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5 active:scale-[0.98]"
          >
            <div className="w-16 h-16 bg-rose-50 rounded-[24px] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform text-rose-500">
              {game.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-rose-500 font-black px-2 py-0.5 bg-rose-50 rounded-lg uppercase tracking-wider mb-1 inline-block">
                {game.tag}
              </span>
              <h3 className="font-black text-slate-800 text-lg leading-tight truncate">{game.title}</h3>
              <div className="flex gap-4 mt-1">
                 <p className="text-[10px] text-slate-400 font-bold uppercase">Best: <span className="text-slate-800">{game.score.toLocaleString()}</span></p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase">Rank: <span className="text-emerald-500">A+</span></p>
              </div>
            </div>
            <button className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs shadow-lg">
               <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        ))}
      </div>
      
      {/* Daily Challenge Card */}
      <div className="mt-4 p-6 bg-gradient-to-br from-rose-500 to-rose-600 rounded-[32px] text-white shadow-xl shadow-rose-100 relative overflow-hidden">
         <div className="relative z-10">
            <h4 className="font-black text-xl">Daily Challenge</h4>
            <p className="text-rose-100 text-xs font-bold mt-1">Complete 3 games to get 2x XP!</p>
            <div className="mt-4 flex gap-1">
               {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 1 ? 'bg-white' : 'bg-rose-400/50'}`}></div>
               ))}
            </div>
         </div>
         <i className="fas fa-trophy absolute -right-4 -bottom-4 text-8xl text-white/10 rotate-12"></i>
      </div>
    </div>
  );
};

export default BrainTrainingMode;
