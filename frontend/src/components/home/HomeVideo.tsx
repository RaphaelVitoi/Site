'use client';

import { useEffect, useRef, useState } from 'react';

export function HomeVideo() {
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const playPromise = v.play();
    if (playPromise !== undefined && typeof playPromise.then === 'function') {
      playPromise.then(() => setVideoReady(true)).catch(() => setVideoReady(true));
    } else {
      setVideoReady(true);
    }
  }, []);

  return (
    <div className="rounded-md border border-[#DED9D2] bg-[#FAFAF8] p-3 shadow-[0_8px_32px_rgba(13,12,10,0.04)]">
      <div className="relative overflow-hidden rounded border border-[#B09460] bg-[#0D0C0A]">
        {/* Overlay label */}
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-[#0D0C0A] px-6 py-3.5 font-mono text-xs tracking-[0.14em] text-white uppercase">
          <span>raphaelvitoi.mp4</span>
          <span>Poker Racional · SOTA</span>
        </div>
        <video
          ref={videoRef}
          src="/raphaelvitoi.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-describedby="video-raphaelvitoi-description"
          className={`block aspect-video w-full object-cover transition-opacity duration-[1.2s] ${videoReady ? 'opacity-100' : 'opacity-0'}`}
          onCanPlay={() => setVideoReady(true)}
        >
          <track
            kind="captions"
            src="/captions/raphaelvitoi.pt-BR.vtt"
            srcLang="pt-BR"
            label="Português"
            default
          />
          Seu navegador não suporta a tag de vídeo.
        </video>
        <p id="video-raphaelvitoi-description" className="sr-only">
          Vídeo visual de apresentação do Poker Racional. O áudio permanece desativado nesta página; o conteúdo
          técnico está disponível em texto nas seções adjacentes.
        </p>
      </div>
    </div>
  );
}
