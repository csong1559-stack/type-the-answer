import { useState, useCallback, useRef } from 'react';

export const useTypewriterEffects = () => {
  const [isShaking, setIsShaking] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Explicitly cast setTimeout return value to any to avoid type mismatch
    // if the environment has mixed typings (Node vs DOM), though usually
    // in browser apps it returns a number.
    timeoutRef.current = setTimeout(() => {
      setIsShaking(false);
    }, 100) as unknown as number; // Short duration for crisp feel
  }, []);

  return {
    isShaking,
    triggerShake,
  };
};