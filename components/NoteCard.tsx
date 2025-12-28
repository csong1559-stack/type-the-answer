import React, { forwardRef } from 'react';
import { Question, NoteCardSize } from '../types';
import { CARD_DIMENSIONS } from '../constants';

interface NoteCardProps {
  question: Question;
  answer: string;
  title: string;
  size: NoteCardSize;
}

export const NoteCard = forwardRef<HTMLDivElement, NoteCardProps>(({ 
  question, 
  answer, 
  title,
  size 
}, ref) => {
  const aspectClass = CARD_DIMENSIONS[size].aspectClass;

  return (
    <div 
      ref={ref}
      className={`relative bg-paper text-gray-900 flex flex-col p-8 sm:p-12 shadow-2xl font-typewriter ${aspectClass}`}
      style={{
        boxSizing: 'border-box'
      }}
    >
      <div className="w-full max-w-[62ch] mx-auto">
        <div className="flex justify-between items-end border-b-4 border-gray-800 pb-6 mb-10">
          <div className="flex flex-col">
            <span className="font-typewriter text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-500 mb-1">{title}</span>
            <span className="font-typewriter text-2xl sm:text-3xl font-normal text-gray-800">
              {title}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="mb-8">
            <p className="font-typewriter text-gray-500 text-sm sm:text-base not-italic mb-2">
              问：{question.text}
            </p>
          </div>

          <div className="flex-1 relative">
            <p className="font-typewriter text-lg sm:text-xl md:text-2xl leading-loose whitespace-pre-wrap text-gray-900 font-normal">
              {answer}
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-300 flex justify-between items-center opacity-60">
          <span className="font-typewriter text-xs text-gray-500">
            Type the Answer
          </span>
          <span className="font-typewriter text-xs text-gray-400">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {/* Decorative Texture Overlay (Grain) */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-repeat z-20 mix-blend-multiply" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
});

NoteCard.displayName = 'NoteCard';
