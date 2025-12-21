import React from 'react';
import { Question } from '../types';

export const QuestionsModal = ({
  questions,
  onClose,
  onUpload,
  onReload,
}: {
  questions: Question[];
  onClose: () => void;
  onUpload?: () => void;
  onReload?: () => void;
}) => {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-lg max-h-[80vh] overflow-y-auto no-scrollbar shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <span className="font-typewriter text-sm text-gray-700">年度40问</span>
          <button onClick={onClose} aria-label="关闭" className="font-typewriter text-sm text-gray-500">×</button>
        </div>
        <div className="p-4 space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="font-typewriter text-gray-800 text-sm leading-relaxed">
              <span className="text-gray-400 mr-2">{q.id}.</span>
              {q.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
