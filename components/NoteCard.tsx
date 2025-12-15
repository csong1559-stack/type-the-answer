import React, { forwardRef } from 'react';
import { Question, NoteCardSize } from '../types';
import { CARD_DIMENSIONS } from '../constants';

interface NoteCardProps {
  question: Question;
  answer: string;
  year: number;
  size: NoteCardSize;
}

export const NoteCard = forwardRef<HTMLDivElement, NoteCardProps>(({ 
  question, 
  answer, 
  year,
  size 
}, ref) => {
  const aspectClass = CARD_DIMENSIONS[size].aspectClass;

  return (
    <div 
      ref={ref}
      className={`relative bg-paper text-gray-900 flex flex-col p-8 sm:p-12 shadow-2xl mx-auto w-full max-w-md ${aspectClass}`}
      style={{
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-end border-b-4 border-gray-800 pb-4 mb-8">
        <div className="flex flex-col">
          <span className="font-typewriter text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-500 mb-1">
            年度40问
          </span>
          <span className="font-typewriter text-2xl sm:text-3xl font-bold text-gray-800">
            {year}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Question */}
        <div className="mb-6">
          <p className="font-typewriter text-gray-500 text-sm sm:text-base italic mb-2">
            问：{question.text}
          </p>
        </div>

        {/* Answer */}
        <div className="flex-1 relative">
           <p className="font-typewriter text-lg sm:text-xl md:text-2xl leading-relaxed whitespace-pre-wrap text-gray-900 font-medium">
             {answer}
           </p>
        </div>
      </div>

      {/* Footer / Branding */}
      <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-center opacity-60">
        <span className="font-typewriter text-xs text-gray-500">
          Type the Answer
        </span>
        <span className="font-typewriter text-xs text-gray-400">
          {new Date().toLocaleDateString()}
        </span>
      </div>
      
      {/* Decorative Texture Overlay (Grain) */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-repeat z-20 mix-blend-multiply" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
});

NoteCard.displayName = 'NoteCard';
