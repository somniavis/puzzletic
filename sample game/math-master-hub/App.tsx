
import React, { useState } from 'react';
import { GameMode, Subject } from './types';
import Layout from './components/Layout';
import AdventureMode from './components/AdventureMode';
import DrillMode from './components/DrillMode';
import BrainTrainingMode from './components/BrainTrainingMode';

const App: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState<Subject>(Subject.MATH);
  const [mathMode, setMathMode] = useState<GameMode>(GameMode.FUN);

  const renderContent = () => {
    if (activeSubject === Subject.BRAIN) {
      return <BrainTrainingMode />;
    }

    if (activeSubject === Subject.MATH) {
      return mathMode === GameMode.FUN ? <AdventureMode /> : <DrillMode />;
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm animate-pulse">🚧</div>
        <h2 className="text-xl font-bold text-slate-800">Coming Soon!</h2>
        <p className="text-sm text-slate-500 mt-2">The {activeSubject} curriculum is currently being developed.</p>
      </div>
    );
  };

  return (
    <Layout activeSubject={activeSubject} onSubjectChange={setActiveSubject}>
      {/* 2-Mode Segmented Control (Math Only) */}
      {activeSubject === Subject.MATH && (
        <div className="flex p-1.5 bg-slate-100 rounded-full mb-8 sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 border border-slate-200/40 max-w-sm mx-auto">
          {/* Adventure Tab */}
          <button
            onClick={() => setMathMode(GameMode.FUN)}
            className={`flex-1 py-3 px-4 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2.5 ${
              mathMode === GameMode.FUN 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            <i className={`fas fa-map-marked-alt text-sm ${mathMode === GameMode.FUN ? 'text-white' : 'text-slate-300'}`}></i>
            ADVENTURE
          </button>

          {/* Vertical Divider */}
          <div className="w-px bg-slate-200/60 my-2.5"></div>

          {/* Genius Tab */}
          <button
            onClick={() => setMathMode(GameMode.DRILL)}
            className={`flex-1 py-3 px-4 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2.5 ${
              mathMode === GameMode.DRILL 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            <i className={`fas fa-bolt text-sm ${mathMode === GameMode.DRILL ? 'text-white' : 'text-slate-300'}`}></i>
            GENIUS
          </button>
        </div>
      )}

      {/* Title section for Brain subject */}
      {activeSubject === Subject.BRAIN && (
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Brain Gym</h2>
          <p className="text-slate-400 text-sm font-medium">Boost your cognitive power</p>
        </div>
      )}

      <div className="pb-8">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
