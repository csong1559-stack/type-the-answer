import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from './data/questions';
import { Question, AppRoute, NoteCardSize } from './types';
import { LOCAL_STORAGE_KEYS } from './constants';
import { useAudioSfx } from './hooks/useAudioSfx';
import { TypewriterStage } from './components/TypewriterStage';
import { NoteCard } from './components/NoteCard';
import { exportToPNG, exportToPDF } from './platform/save';
import { shareContent } from './platform/share';

const App: React.FC = () => {
  // --- State ---
  const [route, setRoute] = useState<AppRoute>('HOME');
  const [qIndex, setQIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.MUTE_PREF);
    return saved ? JSON.parse(saved) : false;
  });
  const [sizePreset, setSizePreset] = useState<NoteCardSize>('SQUARE');
  
  // Refs
  const cardRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { unlockAudio } = useAudioSfx(isMuted);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MUTE_PREF, JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    // Basic draft saving
    if (route === 'EDITOR') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ANSWER_DRAFT, answer);
    }
  }, [answer, route]);

  // --- Handlers ---
  const handleStart = async () => {
    await unlockAudio();
    // Pick random question if fresh start, otherwise keep 0
    const randomIndex = Math.floor(Math.random() * QUESTIONS.length);
    setQIndex(randomIndex);
    setRoute('EDITOR');
  };

  const handleNextQuestion = () => {
    setQIndex((prev) => (prev + 1) % QUESTIONS.length);
    setAnswer('');
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handleExport = async (type: 'PNG' | 'PDF') => {
    if (!cardRef.current) return;
    
    const q = QUESTIONS[qIndex];
    // Sanitize filename
    const safeQ = q.text.substring(0, 10).replace(/[^a-z0-9]/gi, '_');
    const filename = `YearlyNote_${new Date().getFullYear()}_${safeQ}`;

    if (type === 'PNG') {
      await exportToPNG(cardRef.current, filename);
      await shareContent('My Yearly Review', 'Created with Typewriter Notes', '');
    } else {
      await exportToPDF(cardRef.current, filename);
    }
  };

  // --- Render Helpers ---
  const currentQuestion = QUESTIONS[qIndex];

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-paper text-center">
      <div className="mb-8">
        <h1 className="font-typewriter text-4xl font-bold mb-4 tracking-tighter text-gray-800">
          The Annual<br/>Typewriter
        </h1>
        <p className="font-typewriter text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
          Reflect on your year. One question at a time. 
          <br/>Listen to the keys. Print your memory.
        </p>
      </div>

      <button 
        onClick={handleStart}
        className="group relative inline-flex items-center justify-center px-8 py-3 font-typewriter font-bold text-white transition-all duration-200 bg-gray-900 font-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
      >
        <span>Start Typing</span>
        <div className="absolute inset-0 h-full w-full border-2 border-gray-900 translate-x-1 translate-y-1 -z-10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0 bg-white"></div>
      </button>

      <div className="mt-12 absolute top-4 right-4">
        <MuteButton isMuted={isMuted} toggle={toggleMute} />
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="flex flex-col h-full bg-[#1a1a1a] overflow-hidden relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 pt-safe z-30 bg-[#1a1a1a]/90 backdrop-blur-sm border-b border-white/5">
        <button onClick={() => setRoute('HOME')} className="text-gray-400 hover:text-white font-typewriter text-sm flex items-center gap-1 transition-colors">
          &larr; Home
        </button>
        <div className="text-gray-500 text-xs tracking-widest uppercase">Typewriter Model 2024</div>
        <button onClick={handleNextQuestion} className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
          <span className="font-typewriter text-xs uppercase tracking-wide">Shuffle</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      {/* Main Stage (Scrollable) */}
      <div className="flex-1 flex flex-col relative overflow-y-auto no-scrollbar pb-32 z-10">
        <TypewriterStage 
          text={answer} 
          setText={setAnswer} 
          isMuted={isMuted} 
          questionText={currentQuestion.text}
        />
      </div>

      {/* Typewriter Body Visuals (Fixed at bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-20 flex flex-col justify-end">
         
         {/* The Ribbon Guide (Metal Bracket in front of paper) */}
         <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 w-32 h-12 z-30 flex items-end justify-center">
            {/* Left Wing */}
            <div className="w-10 h-1 bg-gradient-to-t from-gray-400 to-gray-200 rotate-12 -mr-1"></div>
            {/* Center Piece */}
            <div className="w-16 h-8 border-2 border-gray-400 rounded-t-lg bg-transparent border-b-0 shadow-sm relative">
                {/* Red ink strip simulation */}
                <div className="absolute bottom-2 left-0 right-0 h-1 bg-red-900/50"></div>
            </div>
             {/* Right Wing */}
            <div className="w-10 h-1 bg-gradient-to-t from-gray-400 to-gray-200 -rotate-12 -ml-1"></div>
         </div>

         {/* The Platen (Roller) */}
         <div className="w-full h-20 bg-[#0a0a0a] relative flex items-center justify-center border-t border-gray-700 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
            {/* Roller Gradient */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#222] via-[#000] to-[#111]"></div>
            
            {/* Paper Bail (Metal Bar) */}
            <div className="absolute top-4 left-0 right-0 h-1.5 bg-gradient-to-b from-gray-300 to-gray-500 shadow-md mx-4 rounded-full opacity-80"></div>
         </div>
      </div>

      {/* Bottom Action Bar (Styled like Typewriter Keys/Body) */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#151515] p-4 pb-safe flex items-center justify-between z-40 border-t border-white/5 shadow-2xl">
        <button 
          onClick={() => setAnswer('')} 
          className="text-gray-500 font-typewriter text-xs uppercase tracking-widest px-4 py-3 rounded-full border border-gray-700 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 transition-all active:translate-y-0.5"
        >
          Clear
        </button>
        
        {/* Spacebar-like spacer if needed, or just layout */}
        <div className="flex-1 mx-4 h-1 bg-gray-800 rounded-full opacity-30"></div>

        <button 
          onClick={() => setRoute('EXPORT')}
          disabled={!answer.trim()}
          className={`px-6 py-3 bg-[#e5e5e5] text-gray-900 font-typewriter font-bold text-sm uppercase tracking-wider rounded-sm shadow-[0_4px_0_#999] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-30 disabled:shadow-none disabled:translate-y-[2px]`}
        >
          Finish
        </button>
      </div>
    </div>
  );

  const renderExport = () => (
    <div className="flex flex-col h-full bg-gray-100 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white shadow-sm z-20">
        <button onClick={() => setRoute('EDITOR')} className="text-gray-600 font-typewriter text-sm">
          &larr; Edit
        </button>
        <span className="font-typewriter font-bold text-gray-800">Preview</span>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-6 flex items-center justify-center bg-gray-200/50 overflow-y-auto">
        <div className="transform scale-90 sm:scale-100 shadow-2xl origin-top sm:origin-center">
          <NoteCard 
            ref={cardRef}
            question={currentQuestion}
            answer={answer}
            year={new Date().getFullYear()}
            size={sizePreset}
          />
        </div>
      </div>

      {/* Bottom Drawer */}
      <div className="bg-white border-t border-gray-200 p-6 pb-safe space-y-6 z-30">
        
        {/* Size Picker */}
        <div className="flex justify-center space-x-4">
           {(['SQUARE', 'PORTRAIT'] as NoteCardSize[]).map((s) => (
             <button 
               key={s}
               onClick={() => setSizePreset(s)}
               className={`flex flex-col items-center space-y-2 group ${sizePreset === s ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
             >
               <div className={`border-2 ${sizePreset === s ? 'border-gray-900 bg-gray-100' : 'border-gray-300'} w-10 ${s === 'SQUARE' ? 'h-10' : 'h-14'} rounded-sm transition-all`}></div>
               <span className="text-[10px] font-typewriter uppercase tracking-wide">{s}</span>
             </button>
           ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleExport('PNG')}
            className="col-span-2 bg-gray-900 text-white py-3 px-4 font-typewriter font-bold text-sm uppercase tracking-wide rounded-sm shadow-md active:bg-gray-800"
          >
            Save Image
          </button>
          <button 
            onClick={() => handleExport('PDF')}
            className="bg-white border-2 border-gray-900 text-gray-900 py-3 px-4 font-typewriter font-bold text-sm uppercase tracking-wide rounded-sm active:bg-gray-50"
          >
            PDF
          </button>
          <button 
            onClick={() => {
               setAnswer('');
               handleNextQuestion();
               setRoute('EDITOR');
            }}
            className="bg-gray-100 text-gray-600 py-3 px-4 font-typewriter font-bold text-sm uppercase tracking-wide rounded-sm hover:bg-gray-200"
          >
            New Note
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full max-w-lg mx-auto bg-black shadow-2xl overflow-hidden relative">
      {route === 'HOME' && renderHome()}
      {route === 'EDITOR' && renderEditor()}
      {route === 'EXPORT' && renderExport()}
    </div>
  );
};

const MuteButton = ({ isMuted, toggle }: { isMuted: boolean, toggle: () => void }) => (
  <button onClick={toggle} className="p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white transition-colors">
    {isMuted ? (
       <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
       </svg>
    ) : (
      <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    )}
  </button>
);

export default App;