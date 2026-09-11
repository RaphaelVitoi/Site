/**
 * IDENTITY: Oráculo de Borda (Gemma 4 Portal SOTA v8.0 GOLD)
 * PATH: src/app/(lab)/templo/gemma/page.tsx
 * ROLE: Interface multimodal soberana para comunicação com os agentes locais
 *       Gemma 4 E2B, E4B, 12B, Qwen PMEV e Cloud, com TTS Neural e Web Search.
 * VERSION: v8.0 GOLD
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { useSotaSync } from '@/components/simulator/hooks/useSotaSync';
import { useGemmaStream, type StreamTelemetry } from '@/components/simulator/useGemmaStream';
import { useSotaSpeech } from '@/components/simulator/hooks/useSotaSpeech';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaButton } from '@/components/ui/layout/SotaButton';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import type { PhysicsSnapshot } from '@/lib/schemas';

export interface VideoKeyframe {
  previewUrl: string;
  timeLabel: string;
  base64: string;
}

export interface WebSearchSource {
  title: string;
  link: string;
  snippet: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'video' | 'audio' | 'doc';
  previewUrl?: string | undefined;
  base64?: string | undefined;
  textContent?: string | undefined;
  keyframes?: VideoKeyframe[] | undefined;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'telemetry';
  content: string;
  snapshot?: PhysicsSnapshot | undefined;
  attachments?: ChatAttachment[] | undefined;
  sources?: WebSearchSource[] | undefined;
  telemetry?: StreamTelemetry | undefined;
  modelUsed?: string | undefined;
}

const MODELS_CONFIG = [
  {
    id: 'e2b',
    name: 'Gemma 4 E2B',
    badge: 'Edge 2B',
    desc: 'Inferência ultra-rápida (2B ativos). Latência mínima para consultas táticas.',
    icon: 'fa-bolt',
    color: 'text-amber-400',
    borderColor: 'border-amber-400/40',
    bgColor: 'bg-amber-400/10',
  },
  {
    id: 'e4b',
    name: 'Gemma 4 E4B',
    badge: 'Edge 4B',
    desc: 'Variante eficiente de 4B ativos destilada para raciocínio e cálculo.',
    icon: 'fa-brain',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-400/40',
    bgColor: 'bg-emerald-400/10',
  },
  {
    id: '12b',
    name: 'Gemma 4 12B',
    badge: 'Local 12B',
    desc: 'Cavalo-de-batalha local equilibrado para tarefas complexas.',
    icon: 'fa-shield-halved',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-400/40',
    bgColor: 'bg-indigo-400/10',
  },
  {
    id: 'qwen_pmev_math',
    name: 'Qwen PMEV',
    badge: 'Teoria dos Jogos',
    desc: 'Perfil matemático especializado em Nash, ICM e formulação Bayesiana.',
    icon: 'fa-calculator',
    color: 'text-sky-400',
    borderColor: 'border-sky-400/40',
    bgColor: 'bg-sky-400/10',
  },
  {
    id: '31b_cloud',
    name: 'Gemma 4 31B',
    badge: 'Cloud Zero-RAM',
    desc: 'Intelecção máxima via nuvem sem consumo de RAM ou VRAM local.',
    icon: 'fa-cloud',
    color: 'text-purple-400',
    borderColor: 'border-purple-400/40',
    bgColor: 'bg-purple-400/10',
  },
];

function TelemetryCard({ snapshot }: Readonly<{ snapshot: PhysicsSnapshot }>) {
  return (
    <div className="border-accent-indigo/20 group relative my-4 overflow-hidden rounded-xl border bg-slate-900/60 p-4 font-mono text-[0.7rem]">
      <div className="bg-accent-indigo absolute top-0 left-0 h-full w-1" />
      <div className="mb-2 flex items-center justify-between">
        <span className="text-accent-indigo-light font-black tracking-tighter uppercase">Telemetria de Oráculo</span>
        <span className="text-text-muted text-[0.6rem]">ACTIVE SNAPSHOT</span>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-1">
        <div>
          STACK: <span className="text-white">{snapshot.heroStack}bb</span>
        </div>
        <div>
          POT: <span className="text-white">{snapshot.pot}bb</span>
        </div>
        <div>
          POS: <span className="text-white">{snapshot.position}</span>
        </div>
        <div>
          STATUS: <span className="text-white">{snapshot.referenceStatus}</span>
        </div>
      </div>
    </div>
  );
}

function getStatusShadow(status: string): string {
  if (status === 'online') return 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]';
  if (status === 'thinking') return 'shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)]';
  return 'shadow-[0_0_50px_-12px_rgba(244,63,94,0.2)]';
}

function combinePromptText(base: string, finalTranscript: string, interim: string): string {
  let prefix = '';
  if (base) {
    prefix = base.endsWith(' ') ? base : `${base} `;
  }
  let suffix = '';
  if (interim) {
    suffix = finalTranscript ? ` ${interim}` : interim;
  }
  return `${prefix}${finalTranscript}${suffix}`;
}

function AttachmentIcon({ att }: Readonly<{ att: ChatAttachment }>) {
  if (att.type === 'image' && att.previewUrl) {
    return <img src={att.previewUrl} alt={att.name} className="h-5 w-5 rounded object-cover" />;
  }
  if (att.type === 'video') {
    return <span className="text-xs">🎬</span>;
  }
  if (att.type === 'audio') {
    return <span className="text-xs">🎵</span>;
  }
  return <i className="fa-solid fa-file-lines text-text-muted" />;
}

function TrayAttachmentIcon({ att }: Readonly<{ att: ChatAttachment }>) {
  if (att.type === 'image' && att.previewUrl) {
    return <img src={att.previewUrl} alt={att.name} className="h-7 w-7 rounded border border-white/10 object-cover" />;
  }
  if (att.type === 'video') {
    return <span className="text-base">🎬</span>;
  }
  if (att.type === 'audio') {
    return <span className="text-base">🎵</span>;
  }
  return <i className="fa-solid fa-file-code text-accent-indigo-light text-base" />;
}

function processAttachmentPayload(attachments: ChatAttachment[]) {
  const imagesBase64: string[] = [];
  let docsContext = '';

  for (const att of attachments) {
    if (att.type === 'image' && att.base64) {
      imagesBase64.push(att.base64);
    } else if (att.type === 'video' && att.keyframes?.length) {
      imagesBase64.push(...att.keyframes.map((kf) => kf.base64));
    } else if (att.type === 'video' && att.base64) {
      imagesBase64.push(att.base64);
    } else if (att.type === 'audio') {
      docsContext += `\n\n[Áudio Anexado: "${att.name}" (${att.size}) - Áudio do usuário anexado à consulta]\n`;
    } else if (att.type === 'doc' && att.textContent) {
      docsContext += `\n\n[Documento Anexado: "${att.name}" (${att.size})]\n${att.textContent.slice(0, 15000)}\n`;
    }
  }

  return { imagesBase64, docsContext };
}

interface SpeechRecognitionResultItem {
  isFinal?: boolean;
  [altIndex: number]: { transcript?: string } | undefined;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultItem | undefined;
  };
}

function parseSpeechRecognitionResults(event: SpeechRecognitionEventLike): { newFinal: string; interim: string } {
  let newFinal = '';
  let interim = '';
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    const item = event.results[i];
    const transcript = item?.[0]?.transcript ?? '';
    if (item?.isFinal) {
      newFinal += transcript;
    } else {
      interim += transcript;
    }
  }
  return { newFinal, interim };
}

async function translateSpeechTranscript(
  text: string,
  targetMode: string,
  generateFn: (prompt: string, maxTokens?: number, model?: string) => Promise<string | void>,
): Promise<string> {
  const targetLang = targetMode === 'translate-pt' ? 'português brasileiro' : 'inglês';
  try {
    const translated = await generateFn(
      `Traduza instantaneamente com máxima fidelidade e fluência natural para o ${targetLang}, retorne apenas a tradução sem comentários:\n"${text.trim()}"`,
      512,
      'e2b',
    );
    if (translated) {
      return translated.trim().replace(/^"|"$/g, '');
    }
  } catch (e) {
    console.warn('[Live Translate] Erro:', e);
  }
  return text.trim();
}

async function fetchWebSearchRag(query: string): Promise<{ sources: WebSearchSource[]; formattedText: string }> {
  try {
    const searchRes = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
    if (searchRes.ok) {
      const data = await searchRes.json();
      return {
        sources: data?.results || [],
        formattedText: data?.formatted || '',
      };
    }
  } catch (e) {
    console.warn('[WebSearch] Falha:', e);
  }
  return { sources: [], formattedText: '' };
}

export default function GemmaPortal() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [serverOnline, setServerOnline] = useState(false);
  const [forceRAG, setForceRAG] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('e2b');
  const [webSearchActive, setWebSearchActive] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dictationMode, setDictationMode] = useState<string>('pt-BR');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [hasNanoSupport, setHasNanoSupport] = useState<boolean>(false);
  const [activeModalAttachment, setActiveModalAttachment] = useState<ChatAttachment | null>(null);

  const isListeningRef = useRef<boolean>(false);
  const basePromptRef = useRef<string>('');
  const accumulatedFinalRef = useRef<string>('');
  const promptRef = useRef<string>('');
  promptRef.current = prompt;

  const { physics, isHydrated: isSyncHydrated } = useSotaSync();
  const { streamedText, isStreaming, error, telemetry, generateAnalysis } = useGemmaStream();
  const speech = useSotaSpeech();

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<unknown>(null);

  // Detectar disponibilidade de hardware local no navegador (Chrome Dev / Gemini Nano)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasLM =
        'LanguageModel' in window ||
        ('ai' in window && Boolean((window as unknown as { ai?: { languageModel?: unknown } }).ai?.languageModel));
      setHasNanoSupport(Boolean(hasLM));
    }
  }, []);

  // Checar saúde do servidor local
  useEffect(() => {
    fetch('/api/v1/gemma')
      .then((res) => setServerOnline(res.ok))
      .catch(() => setServerOnline(false));
  }, []);

  // Auto-scroll durante streaming e novas mensagens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedText, messages, isStreaming]);

  // Inicializar Reconhecimento de Fala (Ditado)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (SpeechRec) {
      // Instanciar reconhecimento nativo do Chrome
      const rec = new (
        SpeechRec as new () => {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          onstart: () => void;
          onresult: (e: {
            resultIndex: number;
            results: {
              length: number;
              [index: number]:
                | {
                    isFinal?: boolean;
                    [altIndex: number]: { transcript?: string } | undefined;
                  }
                | undefined;
            };
          }) => void;
          onerror: (e: { error: string }) => void;
          onend: () => void;
          start: () => void;
          stop: () => void;
        }
      )();

      rec.continuous = true;
      rec.interimResults = true;

      rec.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };
      rec.onend = () => {
        if (isListeningRef.current) {
          try {
            rec.start();
            return;
          } catch {
            // Falha silenciosa no auto-restart
          }
        }
        setIsListening(false);
        isListeningRef.current = false;
      };
      rec.onerror = (e) => {
        if (e.error === 'no-speech') {
          // Ignora silêncio para manter o microfone vivo
          return;
        }
        console.warn('[Ditado] Erro:', e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      rec.onresult = (event) => {
        const { newFinal, interim } = parseSpeechRecognitionResults(event);
        if (!newFinal) {
          setPrompt(combinePromptText(basePromptRef.current, accumulatedFinalRef.current, interim));
          return;
        }

        if (dictationMode === 'translate-pt' || dictationMode === 'translate-en') {
          setIsTranslating(true);
          void (async () => {
            try {
              const clean = await translateSpeechTranscript(newFinal, dictationMode, (p, tok, m) =>
                generateAnalysis(p, tok, m),
              );
              accumulatedFinalRef.current += (accumulatedFinalRef.current ? ' ' : '') + clean;
            } finally {
              setIsTranslating(false);
              setPrompt(combinePromptText(basePromptRef.current, accumulatedFinalRef.current, interim));
            }
          })();
          return;
        }

        accumulatedFinalRef.current += (accumulatedFinalRef.current ? ' ' : '') + newFinal.trim();
        setPrompt(combinePromptText(basePromptRef.current, accumulatedFinalRef.current, interim));
      };

      recognitionRef.current = rec;
    }
  }, [dictationMode, generateAnalysis]);

  const toggleListening = () => {
    const rec = recognitionRef.current as {
      start: () => void;
      stop: () => void;
      lang: string;
    } | null;
    if (!rec) return;

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      try {
        rec.stop();
      } catch {
        // No-op
      }
    } else {
      basePromptRef.current = promptRef.current;
      accumulatedFinalRef.current = '';
      rec.lang = dictationMode === 'en-US' || dictationMode === 'translate-pt' ? 'en-US' : 'pt-BR';
      isListeningRef.current = true;
      try {
        rec.start();
      } catch (e) {
        console.warn('[Ditado] Falha ao iniciar:', e);
        isListeningRef.current = false;
        setIsListening(false);
      }
    }
  };

  // Gerenciamento de Anexos
  const formatBytes = (bytes: number): string => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    for (const file of Array.from(fileList)) {
      const id =
        'att_' +
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID().slice(0, 8)
          : Date.now().toString(36));
      const name = file.name || 'anexo';
      const sizeStr = formatBytes(file.size);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          const previewUrl = URL.createObjectURL(file);
          setAttachments((prev) => [...prev, { id, name, size: sizeStr, type: 'image', previewUrl, base64 }]);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        // Extração multi-keyframe de vídeo client-side (15%, 50%, 85%)
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        video.playsInline = true;

        video.onloadeddata = async () => {
          const duration = video.duration || 1;
          const fractions = [0.15, 0.5, 0.85];
          const keyframes: VideoKeyframe[] = [];

          for (const frac of fractions) {
            const targetTime = duration * frac;
            video.currentTime = targetTime;
            await new Promise((r) => {
              video.onseeked = r;
            });
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(video.videoWidth || 480, 480);
            canvas.height = Math.round((canvas.width / (video.videoWidth || 1)) * (video.videoHeight || 270));
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameBase64 = canvas.toDataURL('image/jpeg', 0.85);

            const mins = Math.floor(targetTime / 60);
            const secs = Math.floor(targetTime % 60);
            const timeLabel = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            keyframes.push({ previewUrl: frameBase64, timeLabel, base64: frameBase64 });
          }

          setAttachments((prev) => [
            ...prev,
            {
              id,
              name,
              size: sizeStr,
              type: 'video',
              previewUrl: keyframes[0]?.previewUrl,
              base64: keyframes[0]?.base64,
              keyframes,
            },
          ]);
          URL.revokeObjectURL(url);
        };
      } else if (file.type.startsWith('audio/')) {
        const previewUrl = URL.createObjectURL(file);
        setAttachments((prev) => [...prev, { id, name, size: sizeStr, type: 'audio', previewUrl }]);
      } else {
        let textContent = '';
        try {
          textContent = await file.text();
        } catch {
          textContent = '[Documento binário ou codificação não suportada]';
        }
        setAttachments((prev) => [...prev, { id, name, size: sizeStr, type: 'doc', textContent }]);
      }
    }
  }, []);

  // Drag & Drop & Paste Listeners
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item?.kind === 'file') {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) addFiles(files);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addFiles]);

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const item = prev.find((a) => a.id === id);
      if (item?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  async function handleConsult() {
    if ((!prompt.trim() && attachments.length === 0) || isStreaming) return;

    const userMsg = prompt.trim();
    const currentPhysics = { ...physics };
    const currentAttachments = [...attachments];

    // Limpar entrada imediatamente
    setPrompt('');
    setAttachments([]);
    if (isListening) toggleListening();

    // Montar payload multimodal e textual
    const { imagesBase64, docsContext } = processAttachmentPayload(currentAttachments);

    let fullPrompt = userMsg;
    if (docsContext) {
      fullPrompt = `${docsContext}\n\nSolicitação sobre os documentos anexados:\n${fullPrompt || 'Analise e resuma detalhadamente os documentos anexados acima.'}`;
    }

    // Web Search RAG
    let searchSources: WebSearchSource[] = [];
    if (webSearchActive && userMsg) {
      const rag = await fetchWebSearchRag(userMsg);
      searchSources = rag.sources;
      if (rag.formattedText) {
        fullPrompt = `${rag.formattedText}\n\nPergunta do usuário:\n${fullPrompt}`;
      }
    }

    // Modulador RAG SOTA Epistêmico
    if (forceRAG) {
      fullPrompt +=
        '\n\n[DIRETRIZ DE AUDITORIA EPISTÊMICA SOTA]: Embase sua resposta rigorosamente na teoria de jogos e fundamentos matemáticos. Ao final, liste as fontes ou axiomas utilizados.';
    }

    // 1. Adicionar mensagem do usuário
    const userMsgId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        content: userMsg || (imagesBase64.length ? '🖼️ [Análise Multimodal]' : '📄 [Análise de Documento]'),
        attachments: currentAttachments,
      },
    ]);

    // 2. Snapshot de Telemetria (se hidratado)
    if (isSyncHydrated) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'telemetry',
          content: 'SNAPSHOT_TRIGGERED',
          snapshot: currentPhysics,
        },
      ]);
    }

    // 3. Despachar inferência
    const finalResponse = await generateAnalysis(
      fullPrompt,
      1536,
      selectedModel,
      isSyncHydrated ? currentPhysics : undefined,
      undefined,
      imagesBase64.length > 0 ? imagesBase64 : undefined,
    );

    if (finalResponse) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: finalResponse,
          sources: searchSources.length > 0 ? searchSources : undefined,
          telemetry: { ...telemetry },
          modelUsed: selectedModel,
        },
      ]);
    }
  }

  let status: 'offline' | 'online' | 'thinking' = 'offline';
  if (isStreaming) {
    status = 'thinking';
  } else if (serverOnline) {
    status = 'online';
  }

  const getStatusColor = (s: 'offline' | 'online' | 'thinking') => {
    if (s === 'online') return 'bg-accent-emerald';
    if (s === 'thinking') return 'bg-accent-indigo';
    return 'bg-rose-500';
  };

  let dictationIcon = 'fa-microphone';
  let dictationText = 'Ditado';
  if (isTranslating) {
    dictationIcon = 'fa-spinner fa-spin text-cyan-400';
    dictationText = 'Traduzindo...';
  } else if (isListening) {
    dictationIcon = 'fa-circle-dot text-rose-400';
    dictationText = 'Ouvindo...';
  }

  return (
    <div
      className="bg-bg-base text-text-bright font-body sota-grain relative min-h-screen pb-24"
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragging(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer?.files?.length) {
          addFiles(e.dataTransfer.files);
        }
      }}
    >
      {/* Overlay Drag & Drop */}
      {isDragging && (
        <div className="border-accent-indigo animate-in fade-in pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center border-2 border-dashed bg-black/80 backdrop-blur-md duration-200">
          <i className="fa-solid fa-cloud-arrow-up text-accent-indigo-light mb-4 animate-bounce text-5xl" />
          <h3 className="text-xl font-black tracking-widest text-white uppercase">
            Solte arquivos para análise multimodal
          </h3>
          <p className="text-text-muted mt-1 font-mono text-xs">
            Suporta Imagens (PNG, JPG, WEBP), Documentos (PDF, TXT, CSV) e Vídeos
          </p>
        </div>
      )}

      <ContentPageHeader
        title="Oráculo de Borda"
        subtitle="Cockpit de inferência soberana multimodelo e multimodal operando localmente no seu hardware."
        category="AGN - Local SOTA"
        icon="fa-brain"
      />

      <div className="sota-container relative z-10 -mt-12 max-w-5xl">
        {/* Seletor de Modelos de Borda */}
        <div className="mb-3 flex scrollbar-none items-center gap-2 overflow-x-auto pb-4">
          {MODELS_CONFIG.map((m) => {
            const isSel = selectedModel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModel(m.id)}
                className={`flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2 font-mono text-xs transition-all ${
                  isSel
                    ? `${m.bgColor} ${m.borderColor} ${m.color} scale-[1.02] shadow-lg shadow-black/40`
                    : 'text-text-muted border-white/5 bg-black/40 hover:border-white/20 hover:text-white'
                }`}
                title={m.desc}
              >
                <i className={`fa-solid ${m.icon} ${isSel ? m.color : 'text-text-dim'}`} />
                <span className="font-black tracking-wider uppercase">{m.name}</span>
                <span
                  className={`rounded px-1.5 py-0.5 font-sans text-[0.6rem] font-bold uppercase ${
                    isSel ? 'bg-white/10 text-white' : 'text-text-dim bg-white/5'
                  }`}
                >
                  {m.badge}
                </span>
              </button>
            );
          })}

          {hasNanoSupport && (
            <button
              type="button"
              onClick={() => setSelectedModel('nano')}
              className={`flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2 font-mono text-xs transition-all ${
                selectedModel === 'nano'
                  ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-300 shadow-lg'
                  : 'text-text-muted border-white/5 bg-black/40 hover:border-cyan-400/20'
              }`}
              title="Gemini Nano on-device Direct3D 11 via Chrome Dev"
            >
              <i className="fa-solid fa-microchip text-cyan-400" />
              <span className="font-black tracking-wider uppercase">Gemini Nano</span>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[0.6rem] font-bold text-cyan-200 uppercase">
                GPU D3D11
              </span>
            </button>
          )}
        </div>

        <GlassPanel
          className={`border-accent-indigo/30 mb-8 p-6 transition-all duration-700 sm:p-8 ${getStatusShadow(status)}`}
        >
          {/* Status Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 animate-pulse rounded-full ${getStatusColor(status)}`} />
              <span className="text-xs font-black tracking-[0.2em] uppercase">Status: {status.toUpperCase()}</span>
              {isSyncHydrated && (
                <span className="text-accent-emerald-light bg-accent-emerald/10 border-accent-emerald/20 animate-in fade-in rounded border px-2 py-0.5 text-[0.65rem] font-black">
                  ● SYNC: OK
                </span>
              )}
              {webSearchActive && (
                <span className="animate-in fade-in flex items-center gap-1.5 rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[0.65rem] font-black text-cyan-300">
                  <i className="fa-solid fa-globe" /> WEB RAG
                </span>
              )}
            </div>
            <div className="text-text-muted flex items-center gap-4 font-mono text-[0.65rem]">
              <span>MOTOR: {selectedModel.toUpperCase()}</span>
              <span>LATÊNCIA: EDGE LOCAL</span>
            </div>
          </div>

          {/* Feed de Mensagens */}
          <div
            ref={scrollRef}
            className="selection:bg-accent-indigo/30 mb-6 max-h-160 min-h-100 overflow-y-auto scroll-smooth rounded-xl border border-white/5 bg-black/40 p-6 font-mono text-sm leading-relaxed"
          >
            {messages.length === 0 && !streamedText && !isStreaming ? (
              <div className="text-text-muted flex h-80 flex-col items-center justify-center gap-3 italic">
                <i className="fa-solid fa-brain text-accent-indigo/30 text-4xl" />
                <p>Oráculo pronto no modelo {selectedModel.toUpperCase()}.</p>
                <p className="text-text-dim text-xs">
                  Digite sua pergunta, anexe imagens ou documentos, ou dite por voz abaixo.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`animate-in fade-in duration-300 ${msg.role === 'user' ? 'opacity-95' : ''}`}
                  >
                    {msg.role === 'user' && (
                      <div className="mb-2">
                        <div className="text-accent-indigo-light mb-1 flex items-center gap-2 text-[0.6rem] font-black tracking-widest uppercase">
                          <span>VOCÊ</span>
                        </div>
                        {/* Anexos enviados com clique para modal */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {msg.attachments.map((att) => (
                              <button
                                key={att.id}
                                type="button"
                                onClick={() => setActiveModalAttachment(att)}
                                className="hover:border-accent-indigo/40 flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1 text-xs transition-all"
                                title="Clique para inspecionar em tela cheia"
                              >
                                <AttachmentIcon att={att} />
                                <span className="text-text-bright font-mono text-[0.7rem]">{att.name}</span>
                                <span className="text-text-dim font-mono text-[0.6rem] uppercase">{att.size}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="text-text-bright rounded-xl border border-white/5 bg-white/5 p-4 whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    )}

                    {msg.role === 'assistant' && (
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <div className="text-accent-emerald-light flex items-center gap-2 text-[0.6rem] font-black tracking-widest uppercase">
                            <span>ORÁCULO</span>
                            {msg.modelUsed && (
                              <span className="py-0.2 rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 text-[0.55rem] text-emerald-400">
                                {msg.modelUsed}
                              </span>
                            )}
                          </div>

                          {/* Barra de TTS Padrão Ouro por Mensagem */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => speech.toggle(msg.id, msg.content)}
                              className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition-all ${
                                speech.activeMessageId === msg.id && speech.isPlaying
                                  ? 'bg-accent-emerald/20 border-accent-emerald/40 text-accent-emerald-light'
                                  : 'text-text-muted border-white/10 bg-white/5 hover:text-white'
                              }`}
                              title="Ouvir resposta (Síntese Neural Calibrada)"
                            >
                              <i
                                className={`fa-solid ${
                                  speech.activeMessageId === msg.id && speech.isPlaying ? 'fa-pause' : 'fa-volume-high'
                                }`}
                              />
                              <span className="text-[0.65rem] font-bold">
                                {speech.activeMessageId === msg.id && speech.isPlaying ? 'Pausar' : 'Ouvir'}
                              </span>
                            </button>

                            {/* Badge Clicável de Velocidade (1.0x -> 2.0x) */}
                            <button
                              type="button"
                              onClick={speech.cycleRate}
                              className="hover:border-accent-indigo/40 text-accent-indigo-light cursor-pointer rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[0.65rem] transition-all"
                              title="Clique para alternar velocidade (1.0x -> 1.25x -> 1.5x -> 1.75x -> 2.0x)"
                            >
                              ⚡ {speech.rate}x
                            </button>
                          </div>
                        </div>

                        {/* Conteúdo Renderizado com SotaMarkdown */}
                        <div className="rounded-xl border border-white/5 bg-black/30 p-5 shadow-inner">
                          {/* Pílulas de Fontes Web RAG */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2 border-b border-white/10 pb-3">
                              {msg.sources.map((src) => (
                                <a
                                  key={src.link || `${msg.id}_${src.title}`}
                                  href={src.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`${src.title}\n${src.snippet}`}
                                  className="inline-flex max-w-60 items-center gap-1.5 truncate rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 font-mono text-xs text-sky-300 transition-all hover:border-sky-400 hover:bg-sky-500/20"
                                >
                                  <i className="fa-solid fa-globe text-[10px]" />
                                  <span className="truncate">{src.title}</span>
                                </a>
                              ))}
                            </div>
                          )}
                          <SotaMarkdown content={msg.content} />
                        </div>

                        {/* Rodapé de Telemetria */}
                        {msg.telemetry && (
                          <div className="text-text-dim mt-2 flex items-center gap-4 font-mono text-[0.6rem]">
                            {msg.telemetry.ttftMs !== null && <span>TTFT: {msg.telemetry.ttftMs}ms</span>}
                            {msg.telemetry.speedTokPerSec !== null && (
                              <span>VEL: {msg.telemetry.speedTokPerSec} tok/s</span>
                            )}
                            {msg.telemetry.elapsedMs !== null && <span>TEMPO: {msg.telemetry.elapsedMs}ms</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {msg.role === 'telemetry' && msg.snapshot && <TelemetryCard snapshot={msg.snapshot} />}
                  </div>
                ))}

                {/* Streaming ao vivo */}
                {isStreaming && streamedText && (
                  <div className="animate-in fade-in duration-300">
                    <div className="text-accent-emerald-light mb-1 flex items-center gap-2 text-[0.6rem] font-black tracking-widest uppercase">
                      <span>ORÁCULO (STREAMING)</span>
                      <span className="bg-accent-emerald h-1.5 w-1.5 animate-ping rounded-full" />
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/30 p-5 shadow-inner">
                      <SotaMarkdown content={streamedText} />
                    </div>
                    <span className="bg-accent-indigo mt-2 ml-1 inline-block h-4 w-2 animate-pulse" />
                  </div>
                )}

                {isStreaming && !streamedText && (
                  <div className="text-text-muted flex animate-pulse items-center gap-2 py-4">
                    <div className="bg-accent-indigo h-2 w-2 animate-ping rounded-full" />
                    <span className="font-mono text-[0.65rem] font-black tracking-wider uppercase">
                      Sincronizando Probabilidades ({selectedModel.toUpperCase()})...
                    </span>
                  </div>
                )}

                {error && !isStreaming && (
                  <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-950/30 p-3 text-xs text-rose-400">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bandeja de Anexos (*Attachment Tray*) */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/50 p-3">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="hover:border-accent-indigo/40 group flex items-center gap-2 rounded-lg border border-white/15 bg-slate-900/80 px-2.5 py-1.5 text-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveModalAttachment(att)}
                    className="flex cursor-pointer items-center gap-2 text-left"
                    title="Clique para visualizar anexo"
                  >
                    <TrayAttachmentIcon att={att} />
                    <div className="flex flex-col">
                      <span className="max-w-35 truncate font-mono text-[0.7rem] font-medium text-white">{att.name}</span>
                      <span className="text-text-dim font-mono text-[0.55rem] uppercase">
                        {att.type.toUpperCase()} • {att.size}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="text-text-dim ml-1 cursor-pointer p-1 text-sm hover:text-rose-400"
                    title="Remover anexo"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input e Barra de Ferramentas */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleConsult())}
              placeholder="Descreva o cenário, cole imagens (Ctrl+V), arraste arquivos ou dite por voz..."
              className="focus:border-accent-indigo/50 h-32 w-full resize-none rounded-xl border border-white/10 bg-black/60 p-4 pr-4 pb-16 text-sm transition-all focus:outline-none"
              disabled={isStreaming}
            />

            {/* Input Oculto de Arquivos */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.mp3,.wav,.ogg,.m4a,.webm,.pdf,.txt,.md,.csv,.json,.py,.ts,.tsx,.rs"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  addFiles(e.target.files);
                  e.target.value = '';
                }
              }}
            />

            {/* Barra de Ferramentas Inferior */}
            <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Botão Anexar */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-text-muted flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs transition-all hover:border-white/25 hover:text-white"
                  title="Anexar imagens, documentos, vídeos ou áudio"
                >
                  <i className="fa-solid fa-paperclip text-[0.7rem]" />
                  <span className="text-[0.65rem] font-bold uppercase">Anexar</span>
                </button>

                {/* Alternador Web Search */}
                <button
                  type="button"
                  onClick={() => setWebSearchActive((v) => !v)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                    webSearchActive
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/20'
                      : 'text-text-muted border-white/10 bg-white/5 hover:text-white'
                  }`}
                  title="Ativar/Desativar busca web ao vivo"
                >
                  <i className="fa-solid fa-globe text-[0.7rem]" />
                  <span className="text-[0.65rem] font-bold uppercase">
                    {webSearchActive ? 'Web Search (ON)' : 'Web Search'}
                  </span>
                </button>

                {/* Botão Ditado por Voz & Tradução */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                    isListening
                      ? 'animate-pulse border-rose-500 bg-rose-500/20 text-rose-300'
                      : 'text-text-muted border-white/10 bg-white/5 hover:text-white'
                  }`}
                  title="Ditado por voz e tradução instantânea"
                >
                  <i className={`fa-solid ${dictationIcon} text-[0.7rem]`} />
                  <span className="text-[0.65rem] font-bold uppercase">{dictationText}</span>
                </button>

                {/* Seletor de Modo de Ditado */}
                <select
                  value={dictationMode}
                  onChange={(e) => {
                    const newMode = e.target.value;
                    setDictationMode(newMode);
                    if (isListeningRef.current) {
                      const rec = recognitionRef.current as { stop: () => void } | null;
                      try {
                        rec?.stop();
                      } catch {
                        // No-op
                      }
                    }
                  }}
                  className="text-text-muted cursor-pointer rounded-lg border border-white/10 bg-black/80 px-2 py-1 font-mono text-[0.65rem] hover:text-white focus:outline-none"
                >
                  <option value="pt-BR">🇧🇷 Ditado (PT)</option>
                  <option value="en-US">🇺🇸 Dictation (EN)</option>
                  <option value="translate-pt">🌐 Live Translate → PT</option>
                  <option value="translate-en">🌐 Live Translate → EN</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-text-muted hidden cursor-pointer items-center gap-2 text-[0.6rem] font-black tracking-widest uppercase transition-colors select-none hover:text-white sm:flex">
                  <input
                    type="checkbox"
                    checked={forceRAG}
                    onChange={(e) => setForceRAG(e.target.checked)}
                    className="accent-accent-indigo h-3 w-3 cursor-pointer"
                  />
                  <span>Fontes RAG</span>
                </label>
                <SotaButton
                  onClick={handleConsult}
                  disabled={isStreaming || status === 'offline'}
                  variant="primary"
                  size="sm"
                >
                  {isStreaming ? 'PROCESSANDO...' : 'CONSULTAR'}
                </SotaButton>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Sugestões de Prompt Rápidas */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <GlassPanel
            className="hover:border-accent-indigo/20 group cursor-pointer border-white/5 p-4 transition-all"
            onClick={() => setPrompt('Analise a Amortização da Edge em um cenário de 15bb vs Open-Shove.')}
          >
            <div className="text-accent-indigo-light mb-1 text-[0.6rem] font-black">PROMPT SUGERIDO</div>
            <div className="text-text-muted text-xs transition-colors group-hover:text-white">
              Amortização de Edge (15bb)
            </div>
          </GlassPanel>
          <GlassPanel
            className="hover:border-accent-indigo/20 group cursor-pointer border-white/5 p-4 transition-all"
            onClick={() => setPrompt('Calcule qualitativamente o Downward Drift em um pote Multiway (4 players).')}
          >
            <div className="text-accent-indigo-light mb-1 text-[0.6rem] font-black">PROMPT SUGERIDO</div>
            <div className="text-text-muted text-xs transition-colors group-hover:text-white">
              Downward Drift Multiway
            </div>
          </GlassPanel>
          <GlassPanel
            className="hover:border-accent-indigo/20 group cursor-pointer border-white/5 p-4 transition-all"
            onClick={() => setPrompt('Gere uma síntese do Paradigma VITOI sobre a Insolvência das Pot Odds.')}
          >
            <div className="text-accent-indigo-light mb-1 text-[0.6rem] font-black">PROMPT SUGERIDO</div>
            <div className="text-text-muted text-xs transition-colors group-hover:text-white">
              Síntese de Insolvência
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Modal Lightbox para Mídias e Documentos */}
      {activeModalAttachment && (
        <dialog
          open
          aria-label="Visualizador de anexo"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setActiveModalAttachment(null);
          }}
          className="animate-in fade-in fixed inset-0 z-50 m-0 flex h-full w-full max-h-none max-w-none items-center justify-center border-0 bg-black/85 p-4 backdrop-blur-md"
        >
          <button
            type="button"
            aria-label="Fechar modal"
            className="fixed inset-0 -z-10 cursor-default border-0 bg-transparent"
            onClick={() => setActiveModalAttachment(null)}
            tabIndex={-1}
          />
          <div
            className="border-accent-indigo/40 relative flex max-h-[90vh] w-full max-w-3xl flex-col gap-4 overflow-y-auto rounded-2xl border bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-accent-indigo-light font-mono text-sm font-bold">
                  {activeModalAttachment.type === 'image' && '🖼️ IMAGEM:'}
                  {activeModalAttachment.type === 'video' && '🎬 VÍDEO (KEYFRAMES):'}
                  {activeModalAttachment.type === 'audio' && '🎵 ÁUDIO:'}
                  {activeModalAttachment.type === 'doc' && '📄 DOCUMENTO:'}
                </span>
                <span className="max-w-md truncate font-mono text-xs text-white">{activeModalAttachment.name}</span>
                <span className="text-text-dim font-mono text-[0.65rem]">({activeModalAttachment.size})</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalAttachment(null)}
                className="text-text-dim cursor-pointer p-1 text-xl hover:text-white"
                title="Fechar modal"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col items-center justify-center">
              {activeModalAttachment.type === 'image' && activeModalAttachment.previewUrl && (
                <img
                  src={activeModalAttachment.previewUrl}
                  alt={activeModalAttachment.name}
                  className="max-h-[70vh] max-w-full rounded-xl border border-white/10 object-contain"
                />
              )}

              {activeModalAttachment.type === 'video' && (
                <div className="w-full space-y-4">
                  <p className="text-text-muted font-mono text-xs">
                    Keyframes temporais extraídos para análise da Gemma 4:
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {activeModalAttachment.keyframes?.map((kf) => (
                      <div key={kf.timeLabel || kf.previewUrl} className="group relative overflow-hidden rounded-lg border border-white/15">
                        <img
                          src={kf.previewUrl}
                          alt={`Keyframe ${kf.timeLabel}`}
                          className="h-32 w-full object-cover"
                        />
                        <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[0.65rem] text-cyan-300">
                          {kf.timeLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModalAttachment.type === 'audio' && activeModalAttachment.previewUrl && (
                <div className="flex w-full flex-col items-center gap-4 px-4 py-8">
                  <i className="fa-solid fa-volume-high text-accent-indigo-light animate-pulse text-5xl" />
                  <audio controls autoPlay src={activeModalAttachment.previewUrl} className="w-full max-w-md">
                    <track kind="captions" />
                  </audio>
                </div>
              )}

              {activeModalAttachment.type === 'doc' && (
                <pre className="max-h-[65vh] w-full overflow-auto rounded-xl border border-white/10 bg-black/90 p-4 font-mono text-xs whitespace-pre-wrap text-slate-300">
                  {activeModalAttachment.textContent || '(Documento vazio ou binário)'}
                </pre>
              )}
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
