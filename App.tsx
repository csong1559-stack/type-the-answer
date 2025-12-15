import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from './data/questions';
import { Question, AppRoute, NoteCardSize } from './types';
import { LOCAL_STORAGE_KEYS, CARD_DIMENSIONS } from './constants';
import { useAudioSfx } from './hooks/useAudioSfx';
import { TypewriterStage } from './components/TypewriterStage';
import { NoteCard } from './components/NoteCard';
import { exportToPNG } from './platform/save';
import { QuestionsModal } from './components/QuestionsModal';
import { fetchQuestions } from './services/questions';

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
  const [showQuestions, setShowQuestions] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS);
  
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

  useEffect(() => {
    (async () => {
      try {
        const remote = await fetchQuestions();
        if (remote && remote.length > 0) {
          setQuestions(remote);
          setQIndex((idx) => Math.min(idx, remote.length - 1));
        }
      } catch {}
    })();
  }, []);

  

  // --- Handlers ---
  const handleStart = async () => {
    await unlockAudio();
    // Pick random question if fresh start, otherwise keep 0
    const randomIndex = Math.floor(Math.random() * questions.length);
    setQIndex(randomIndex);
    setRoute('EDITOR');
  };

  const handleNextQuestion = () => {
    setQIndex((prev) => (prev + 1) % questions.length);
    setAnswer('');
  };
  const handlePrevQuestion = () => {
    setQIndex((prev) => (prev - 1 + questions.length) % questions.length);
    setAnswer('');
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handleExport = async () => {
    if (!cardRef.current) return;
    
    const q = questions[qIndex];
    // Sanitize filename
    const safeQ = q.text.substring(0, 10).replace(/[^a-z0-9]/gi, '_');
    const filename = `YearlyNote_${new Date().getFullYear()}_${safeQ}`;

    const dims = CARD_DIMENSIONS[sizePreset];
    await exportToPNG(cardRef.current, filename, { width: dims.width, height: dims.height });
  };

  // --- Render Helpers ---
  const currentQuestion = questions[qIndex];

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-paper text-center">
      <div className="mb-8">
        <h1 className="font-typewriter text-4xl font-bold mb-4 tracking-tighter text-gray-800">
          好问题值得<br/>更好的答案
        </h1>
        <p className="font-typewriter text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
          <br/>
        </p>
      </div>

      <button 
        onClick={handleStart}
        className="group relative inline-flex items-center justify-center px-8 py-3 font-typewriter font-bold text-white transition-all duration-200 bg-gray-900 font-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
      >
        <span>开始回答</span>
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
          &larr; 返回首页
        </button>
        <div className="text-gray-500 text-xs tracking-widest uppercase">Type the Answer</div>
        <button onClick={handleNextQuestion} className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
          <span className="font-typewriter text-xs uppercase tracking-wide">换一题</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      {/* Main Stage (Scrollable) */}
      <div className="flex-1 flex flex-col relative overflow-y-auto no-scrollbar pb-8 z-10">
        <TypewriterStage 
          text={answer} 
          setText={setAnswer} 
          isMuted={isMuted} 
          questionText={currentQuestion.text}
          onShowAllQuestions={() => setShowQuestions(true)}
        />
        {showQuestions && (
          <QuestionsModal 
            questions={questions}
            onClose={() => setShowQuestions(false)}
            onReload={async () => {
              try {
                const remote = await fetchQuestions();
                if (remote && remote.length > 0) {
                  setQuestions(remote);
                  setQIndex((idx) => Math.min(idx, remote.length - 1));
                }
              } catch {}
            }}
          />
        )}
      </div>

      

      {/* Bottom Action Bar (Styled like Typewriter Keys/Body) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe flex items-center justify-end gap-4 z-40">
        <button 
          onClick={handlePrevQuestion} 
          className="font-typewriter text-sm text-gray-500 uppercase tracking-widest px-4 py-3 bg-transparent border border-transparent transition-all"
        >
          上一题
        </button>
        <button 
          onClick={handleNextQuestion} 
          className="font-typewriter text-sm text-gray-500 uppercase tracking-widest px-4 py-3 bg-transparent border border-transparent transition-all"
        >
          下一题
        </button>
        <button 
          onClick={() => setRoute('EXPORT')}
          disabled={!answer.trim()}
          className="font-typewriter text-sm text-gray-500 uppercase tracking-widest px-4 py-3 bg-transparent border border-transparent transition-all disabled:opacity-40"
        >
          回答完毕
        </button>
      </div>
    </div>
  );

  const renderExport = () => (
    <div className="flex flex-col h-full bg-gray-100 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white shadow-sm z-20">
        <button onClick={() => setRoute('EDITOR')} className="text-gray-600 font-typewriter text-sm">
          &larr; 返回编辑
        </button>
        <span className="font-typewriter font-bold text-gray-800">预览</span>
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
        <div className="flex justify-center items-center space-x-4">
           {(['SQUARE', 'PORTRAIT'] as NoteCardSize[]).map((s) => (
             <button 
               key={s}
               onClick={() => setSizePreset(s)}
               className={`flex flex-col items-center space-y-2 group ${sizePreset === s ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
             >
               <div className="h-14 flex items-center justify-center">
                <div className={`border-2 ${sizePreset === s ? 'border-gray-900 bg-gray-100' : 'border-gray-300'} w-10 ${s === 'SQUARE' ? 'h-10' : 'h-14'} transition-all`}></div>
               </div>
             </button>
           ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleExport}
            className="col-span-2 bg-gray-900 text-white py-3 px-4 font-typewriter font-bold text-sm uppercase tracking-wide shadow-md active:bg-gray-800"
          >
            保存图片
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
  <button onClick={toggle} className="p-2 bg-white/50 backdrop-blur hover:bg-white transition-colors">
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
