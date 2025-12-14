import React, { useEffect, useRef } from 'react';
import { useAudioSfx } from '../hooks/useAudioSfx';
import { useTypewriterEffects } from '../hooks/useTypewriterEffects';

interface TypewriterStageProps {
  text: string;
  setText: (s: string) => void;
  isMuted: boolean;
  questionText: string;
}

export const TypewriterStage: React.FC<TypewriterStageProps> = ({ 
  text, 
  setText, 
  isMuted,
  questionText 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { playKeySound, playEnterSound, playBackspaceSound } = useAudioSfx(isMuted);
  const { isShaking, triggerShake } = useTypewriterEffects();

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

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
      triggerShake();
    } else if (diff < 0) {
      // Deleted character
      playBackspaceSound();
      triggerShake();
    }

    setText(newVal);
  };

  return (
    <div className={`relative w-full flex-1 flex flex-col items-center justify-start transition-transform duration-75 ${isShaking ? 'translate-y-[1px] translate-x-[1px]' : ''}`}>
      
      {/* Visual Layer (The Paper) */}
      <div className="relative w-full max-w-md bg-paper shadow-2xl min-h-[60vh] p-6 sm:p-8 mt-6 mb-32 rounded-sm ring-1 ring-white/20">
        
        {/* Question Header */}
        <div className="mb-6 pb-4 border-b-2 border-gray-300/50">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Question</h2>
          <p className="text-lg font-typewriter text-gray-700 leading-relaxed font-bold">
            {questionText}
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