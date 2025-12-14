import { useEffect, useRef, useCallback } from 'react';

// Using a simple oscillator-based synth to avoid external asset dependencies for the demo.
// In production, this would load MP3s from /public/sfx/
export const useAudioSfx = (isMuted: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPlayTime = useRef<number>(0);

  useEffect(() => {
    // Initialize Audio Context on mount
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }
    
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const unlockAudio = useCallback(async () => {
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  const playTone = (frequency: number, type: 'square' | 'sine' | 'sawtooth' | 'triangle', duration: number, gainVal: number) => {
    if (isMuted || !audioContextRef.current) return;

    // Rate limit to prevent machine-gun sound effect artifacts
    const now = Date.now();
    if (now - lastPlayTime.current < 40) return;
    lastPlayTime.current = now;

    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Envelope
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playKeySound = useCallback(() => {
    // Simulate a mechanical "thwack"
    // Low thud + higher click
    playTone(150, 'square', 0.1, 0.15); 
    setTimeout(() => playTone(600, 'triangle', 0.05, 0.05), 10);
  }, [isMuted]);

  const playEnterSound = useCallback(() => {
    // Distinct "ding" + carriage return slide sound
    playTone(120, 'sawtooth', 0.3, 0.2);
    setTimeout(() => playTone(800, 'sine', 0.6, 0.1), 100); // The bell
  }, [isMuted]);

  const playBackspaceSound = useCallback(() => {
    // A quick scratchy sound
    playTone(100, 'sawtooth', 0.1, 0.2);
  }, [isMuted]);

  return {
    unlockAudio,
    playKeySound,
    playEnterSound,
    playBackspaceSound,
  };
};