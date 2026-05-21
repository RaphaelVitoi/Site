import { useState, useCallback } from 'react';

export function useAudioFeedback() {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const _playTone = useCallback((type: 'predator' | 'death', intensity: number) => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'predator') {
        const freq = 1200 + ((intensity - 40) * 25);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'death') {
        const freq = Math.max(40, 80 - ((intensity - 40) * 1));
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Silencioso se o autoplay for bloqueado
    }
  }, [isMuted]);

  const playDeathZone = useCallback((rp: number) => _playTone('death', rp), [_playTone]);
  const playPredatorZone = useCallback((rp: number) => _playTone('predator', rp), [_playTone]);

  return { isMuted, toggleMute, playDeathZone, playPredatorZone };
}