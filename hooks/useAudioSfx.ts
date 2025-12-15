import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Using a simple oscillator-based synth to avoid external asset dependencies for the demo.
// In production, this would load MP3s from /public/sfx/
export const useAudioSfx = (isMuted: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPlayTime = useRef<number>(0);
  const keyBufferRef = useRef<AudioBuffer | null>(null);
  const enterBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    // Initialize Audio Context on mount
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }
    const loadKeySound = async () => {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      const { data } = supabase.storage.from('public-soundeffect').getPublicUrl('keysound.wav');
      const url = data?.publicUrl;
      if (!url) return;
      const resp = await fetch(url);
      const arr = await resp.arrayBuffer();
      const buf = await new Promise<AudioBuffer>((resolve, reject) =>
        ctx.decodeAudioData(arr, resolve, reject)
      );
      keyBufferRef.current = buf;
    };
    const loadEnterSound = async () => {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      const { data } = supabase.storage.from('public-soundeffect').getPublicUrl('entersound.wav');
      const url = data?.publicUrl;
      if (!url) return;
      const resp = await fetch(url);
      const arr = await resp.arrayBuffer();
      const buf = await new Promise<AudioBuffer>((resolve, reject) =>
        ctx.decodeAudioData(arr, resolve, reject)
      );
      enterBufferRef.current = buf;
    };
    loadKeySound();
    loadEnterSound();
    
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const unlockAudio = useCallback(async () => {
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  const playKeySound = useCallback(() => {
    if (isMuted || !audioContextRef.current) return;
    const now = Date.now();
    if (now - lastPlayTime.current < 40) return;
    lastPlayTime.current = now;
    const ctx = audioContextRef.current;
    const buf = keyBufferRef.current;
    if (buf) {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = 0.6;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    }
  }, [isMuted]);

  const playEnterSound = useCallback(() => {
    if (isMuted || !audioContextRef.current) return;
    const now = Date.now();
    if (now - lastPlayTime.current < 40) return;
    lastPlayTime.current = now;
    const ctx = audioContextRef.current;
    const buf = enterBufferRef.current;
    if (buf) {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = 0.7;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    }
  }, [isMuted]);

  const playBackspaceSound = useCallback(() => {
    if (isMuted || !audioContextRef.current) return;
    const now = Date.now();
    if (now - lastPlayTime.current < 40) return;
    lastPlayTime.current = now;
    const ctx = audioContextRef.current;
    const buf = keyBufferRef.current;
    if (buf) {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = 0.55;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    }
  }, [isMuted]);

  return {
    unlockAudio,
    playKeySound,
    playEnterSound,
    playBackspaceSound,
  };
};
