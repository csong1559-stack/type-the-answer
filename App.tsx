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
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  // --- State ---
  const [route, setRoute] = useState<AppRoute>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.APP_ROUTE);
    return (saved as AppRoute) || 'HOME';
  });
  const [qIndex, setQIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.MUTE_PREF);
    return saved ? JSON.parse(saved) : false;
  });
  const [sizePreset, setSizePreset] = useState<NoteCardSize>('THREE_FOUR');
  const [showQuestions, setShowQuestions] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS);
  const [answersById, setAnswersById] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showContact, setShowContact] = useState<boolean>(false);
  const [contactUrl, setContactUrl] = useState<string | undefined>(undefined);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<string | null>(null);
  
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
    localStorage.setItem(LOCAL_STORAGE_KEYS.APP_ROUTE, route);
  }, [route]);
  useEffect(() => {
    const q = questions[qIndex];
    if (q) {
      setAnswersById((prev) => {
        if (prev[q.id] === answer) return prev;
        return { ...prev, [q.id]: answer };
      });
    }
  }, [answer, qIndex, questions]);

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

  useEffect(() => {
    if (route === 'EXPORT') {
      const answered = Object.entries(answersById)
        .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
        .map(([id]) => id);
      setSelectedIds(answered);
    }
  }, [route, answersById]);
  

  // --- Handlers ---
  const handleStart = async () => {
    await unlockAudio();
    // Pick random question if fresh start, otherwise keep 0
    const randomIndex = Math.floor(Math.random() * questions.length);
    setQIndex(randomIndex);
    const nextId = questions[randomIndex]?.id;
    setAnswer(nextId ? (answersById[nextId] ?? '') : '');
    setRoute('EDITOR');
  };

  const handleNextQuestion = () => {
    const next = (qIndex + 1) % questions.length;
    setQIndex(next);
    const nextId = questions[next]?.id;
    setAnswer(nextId ? (answersById[nextId] ?? '') : '');
  };
  const handlePrevQuestion = () => {
    const prev = (qIndex - 1 + questions.length) % questions.length;
    setQIndex(prev);
    const prevId = questions[prev]?.id;
    setAnswer(prevId ? (answersById[prevId] ?? '') : '');
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handleExport = async () => {
    setIsExporting(true);
    const nodeToExport =
      selectedIds.length > 0 ? compositeRef.current : cardRef.current;
    if (!nodeToExport) return;
    const title =
      selectedIds.length > 0
        ? `Selected_${new Date().getFullYear()}_${selectedIds.length}items`
        : questions[qIndex].text.substring(0, 10).replace(/[^a-z0-9]/gi, '_');
    const filename = `YearlyNote_${new Date().getFullYear()}_${title}`;
    try {
      const result = await exportToPNG(nodeToExport, filename);
      const objectUrl = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.download = result.fileName;
      link.href = objectUrl;
      link.target = '_self';
      link.rel = 'noopener';
      link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
      setExportToast('图片已下载');
      setTimeout(() => setExportToast(null), 2000);
    } finally {
      setIsExporting(false);
    }
  };
  const openContact = async () => {
    try {
      const { data } = supabase.storage.from('public-contact').getPublicUrl('wechat-contact.jpg');
      setContactUrl(data?.publicUrl);
    } catch {
      setContactUrl(undefined);
    } finally {
      setShowContact(true);
    }
  };
  
  const compositeRef = useRef<HTMLDivElement | null>(null);
  const answeredIds = Object.entries(answersById)
    .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
    .map(([id]) => id);
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // --- Render Helpers ---
  const currentQuestion = questions[qIndex];

  // --- Views ---

  const renderHome = () => (
    <div className="relative flex flex-col items-center justify-center h-full p-8 bg-paper text-center">
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

      <div className="absolute bottom-3 right-3 text-xs text-gray-600 font-typewriter">
        vibe coded by 聪明盖
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
        <div className="w-10"></div>
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
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 pb-safe grid grid-cols-3 items-center gap-4 z-40">
        <button 
          onClick={handlePrevQuestion} 
          className="justify-self-start font-typewriter text-sm text-gray-500 uppercase tracking-widest px-4 py-3 bg-transparent border border-transparent transition-all"
        >
          上一题
        </button>
        <button 
          onClick={() => setRoute('EXPORT')}
          disabled={answeredIds.length === 0}
          className="justify-self-center font-typewriter text-sm text-gray-500 uppercase tracking-widest px-4 py-3 bg-transparent border border-transparent transition-all disabled:opacity-40"
        >
          回答完毕
        </button>
        <button 
          onClick={handleNextQuestion} 
          className="justify-self-end font-typewriter text-sm text-gray-500 uppercase tracking-widest px-4 py-3 bg-transparent border border-transparent transition-all"
        >
          下一题
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
        <button onClick={openContact} className="text-gray-600 font-typewriter text-sm">
          谁是聪明盖？
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-6 bg-gray-200/50 overflow-y-auto">
        {selectedIds.length > 0 ? (
          <div
            ref={compositeRef}
            className="relative bg-paper text-gray-900 flex flex-col p-10 sm:p-14 shadow-2xl font-typewriter"
            style={{ boxSizing: 'border-box' }}
          >
            <div className="w-full max-w-[62ch] mx-auto">
              <div className="flex justify-between items-end border-b-4 border-gray-800 pb-6 mb-10">
                <div className="flex flex-col">
                  <span className="font-typewriter text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-500 mb-1">
                  </span>
                  <span className="font-typewriter text-2xl sm:text-3xl font-normal text-gray-800">
                    年度40问
                  </span>
                </div>
              </div>
              <div className="flex-1 flex flex-col space-y-10">
                {selectedIds.map((id) => {
                  const q = questions.find((qq) => qq.id === id);
                  if (!q) return null;
                  const ans = answersById[id] ?? '';
                  return (
                    <div key={id} className="relative">
                      <div className="mb-4">
                        <p className="font-typewriter text-gray-500 text-sm sm:text-base not-italic">
                          问：{q.text}
                        </p>
                      </div>
                      <p className="font-typewriter text-lg sm:text-xl md:text-2xl leading-loose whitespace-pre-wrap text-gray-900 font-normal">
                        {ans}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-12 pt-6 border-t border-gray-300 flex justify-between items-center opacity-60">
                <span className="font-typewriter text-xs text-gray-500">Type the Answer</span>
                <span className="font-typewriter text-xs text-gray-400">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="transform scale-90 sm:scale-100 shadow-2xl origin-top sm:origin-center">
            <NoteCard 
              ref={cardRef}
              question={currentQuestion}
              answer={answer}
              title={'年度40问'}
              size={sizePreset}
            />
          </div>
        )}
      </div>

      {/* Bottom Drawer */}
      <div className="bg-white border-t border-gray-200 p-6 pb-safe space-y-6 z-30">
        

        {/* Select questions to export */}
        <div>
          <div className="font-typewriter text-xs text-gray-500 uppercase tracking-widest mb-2">选择要导出的题目</div>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {answeredIds.map((id) => {
              const q = questions.find((qq) => qq.id === id);
              if (!q) return null;
              return (
                <label key={id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(id)}
                    onChange={() => toggleSelect(id)}
                  />
                  <span className="font-typewriter text-sm text-gray-700">{q.text}</span>
                </label>
              );
            })}
            {answeredIds.length === 0 && (
              <div className="font-typewriter text-sm text-gray-400">暂无已回答的题目</div>
            )}
          </div>
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
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded-none shadow-2xl w-1/2">
            <div className="flex justify-between items-center mb-3">
              <div className="font-typewriter text-sm text-gray-700">微信联系</div>
              <button onClick={() => setShowContact(false)} className="text-gray-500 font-typewriter text-sm">关闭</button>
            </div>
            {contactUrl ? (
              <img src={contactUrl} alt="wechat-contact" className="w-full h-auto" />
            ) : (
              <div className="font-typewriter text-sm text-gray-500">未获取到联系卡片</div>
            )}
          </div>
        </div>
      )}
      {isExporting && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
          <div className="bg-white px-4 py-3 shadow font-typewriter text-sm text-gray-700 flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
            <span>正在生成图片...</span>
          </div>
        </div>
      )}
      {exportToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-4 py-2 rounded-none shadow font-typewriter text-sm">
          {exportToast}
        </div>
      )}
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

export default App;
