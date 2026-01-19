
import React from 'react';
import { FUN_MATH_GAMES } from '../constants';

const DifficultyBadge: React.FC<{ level: number }> = ({ level }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-[10px] ${s <= level ? 'text-amber-400' : 'text-slate-200'}`}>
          <i className="fas fa-star"></i>
        </span>
      ))}
    </div>
  );
};

const AdventureMode: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Adventure</h2>
        <p className="text-slate-400 text-sm font-medium">Gamified math missions</p>
      </div>

      <div className="flex flex-col gap-5">
        {FUN_MATH_GAMES.map((game) => (
          <div 
            key={game.id} 
            className="group active:scale-[0.98] bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col gap-5"
          >
            <div className="flex gap-5 items-center">
              <div className={`${game.color} w-20 h-20 rounded-[28px] flex items-center justify-center text-4xl shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                {game.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100/50">
                    {game.category}
                  </span>
                  <DifficultyBadge level={game.difficulty} />
                </div>
                <h3 className="text-xl font-black text-slate-800 truncate leading-tight">{game.title}</h3>
                <div className="mt-3 flex items-center gap-3">
                   <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${game.progress}%` }}></div>
                   </div>
                   <span className="text-[11px] font-black text-slate-400">{game.progress}%</span>
                </div>
              </div>
            </div>
            
            <button className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
              Play Quest
              <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdventureMode;
