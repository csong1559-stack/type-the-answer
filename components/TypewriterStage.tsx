import React, { useEffect, useRef, useState } from 'react';
import { useAudioSfx } from '../hooks/useAudioSfx';
import { PAPER_TEXTURE_URL } from '../constants';

interface TypewriterStageProps {
  text: string;
  setText: (s: string) => void;
  isMuted: boolean;
  questionText: string;
  onShowAllQuestions: () => void;
  onShowPicker: () => void;
  questionSetLabel: string;
}

export const TypewriterStage: React.FC<TypewriterStageProps> = ({ 
  text, 
  setText, 
  isMuted,
  questionText,
  onShowAllQuestions,
  onShowPicker,
  questionSetLabel
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { playKeySound, playEnterSound, playBackspaceSound } = useAudioSfx(isMuted);
  const [typedQuestion, setTypedQuestion] = useState<string>('');
  const typingIndexRef = useRef<number>(0);
  const typingTimerRef = useRef<number | null>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setTypedQuestion('');
    typingIndexRef.current = 0;
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    const typeNext = () => {
      if (typingIndexRef.current >= questionText.length) return;
      const ch = questionText[typingIndexRef.current];
      setTypedQuestion((prev) => prev + ch);
      if (ch === '\n') {
        playEnterSound();
      } else {
        playKeySound();
      }
      typingIndexRef.current += 1;
      const delay = 120 + Math.floor(Math.random() * 120);
      typingTimerRef.current = setTimeout(typeNext, delay) as unknown as number;
    };
    const startDelay = 600;
    typingTimerRef.current = setTimeout(typeNext, startDelay) as unknown as number;
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [questionText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const diff = newVal.length - text.length;

    if (diff > 0) {
      // Added character
      const char = newVal.slice(-1);
      if (char === '\n') {
        playEnterSound();
      } else {
        playKeySound();
      }
    } else if (diff < 0) {
      // Deleted character
      playBackspaceSound();
    }

    setText(newVal);
  };

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-start">
      
      {/* Visual Layer (The Paper) */}
      <div
        className="relative w-full max-w-md bg-paper paper-extend paper-curl shadow-2xl p-6 sm:p-8 mt-6 mb-4 ring-1 ring-white/20"
      >
        
        <div className="mb-6 pb-4 border-b-2 border-gray-300/50 relative z-20">
          <div className="flex items-center justify-between">
            <button onClick={onShowAllQuestions} className="font-typewriter text-xs text-gray-500 underline decoration-dotted">
              {questionSetLabel}
            </button>
            <button onClick={onShowPicker} className="font-typewriter text-xs text-gray-500 underline decoration-dotted">
              换个问卷
            </button>
          </div>
          <p className="text-lg font-typewriter text-gray-700 leading-relaxed font-bold whitespace-pre-wrap">
            {typedQuestion}
          </p>
        </div>

        {/* Text Rendering */}
        <div className="font-typewriter text-xl leading-8 text-gray-900 whitespace-pre-wrap break-words min-h-[200px]">
          {text}
          <span className="inline-block w-[10px] h-[24px] bg-red-500/80 align-middle ml-0.5 animate-cursor-blink" />
        </div>
      </div>

      {/* Input Layer (Invisible Textarea) */}
      {/* 
         The textarea needs to cover the screen mostly to catch taps, but visually we focus on the paper.
         We set it to cover the parent container.
      */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 z-10 text-xl leading-8 resize-none outline-none caret-transparent"
        spellCheck={false}
        autoCapitalize="sentences"
      />
    </div>
  );
};
