'use client';

import { useEffect, useRef, useState } from 'react';

export function QuemSouVideo() {
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play()
      .then(() => {
        setIsPlaying(true);
        setVideoReady(true);
      })
      .catch(() => setVideoReady(true));
  }, []);

  return (
    <div className="relative overflow-hidden rounded border border-[#DED9D2] bg-[#0D0C0A] shadow-[0_8px_64px_rgba(13,12,10,0.12),0_2px_8px_rgba(13,12,10,0.06)]">
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-[#0D0C0A] px-5 py-3.5 font-mono text-xs tracking-[0.14em] text-white uppercase">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-1.25 w-1.25 rounded-full ${isPlaying ? 'bg-white/50' : 'bg-white/15'}`}
          />{' '}
          raphaelvitoi.mp4
        </div>
        <span>Raphael Vitoi · Poker Racional</span>
      </div>
      <video
        ref={videoRef}
        src="/raphaelvitoi.mp4"
        autoPlay
        muted
        loop
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onCanPlay={() => setVideoReady(true)}
        className={`block aspect-video w-full object-cover transition-opacity duration-[1.2s] ease-in-out ${videoReady ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
