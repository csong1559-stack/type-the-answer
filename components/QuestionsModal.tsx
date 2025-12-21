import React from 'react';
import { Question } from '../types';

export const QuestionsModal = ({
  questions,
  onClose,
  onUpload,
  onReload,
  onJump,
  answeredIds,
}: {
  questions: Question[];
  onClose: () => void;
  onUpload?: () => void;
  onReload?: () => void;
  onJump?: (id: string) => void;
  answeredIds?: string[];
}) => {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-lg max-h-[80vh] overflow-y-auto no-scrollbar shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <span className="font-typewriter text-sm text-gray-700">年度40问</span>
          <button onClick={onClose} aria-label="关闭" className="font-typewriter text-sm text-gray-500">×</button>
        </div>
        <div className="p-4 space-y-3">
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => { onJump?.(q.id); onClose(); }}
              className="w-full flex items-center justify-between px-1 py-1 bg-transparent transition-colors font-typewriter text-gray-800 text-sm leading-relaxed hover:text-gray-900"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-gray-400">{q.id}.</span>
                <span>{q.text}</span>
              </div>
              {answeredIds?.includes(q.id) && (
                <span className="text-red-500 font-bold">✔</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
