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
		<div className="my-4 p-4 bg-slate-900/60 border border-accent-indigo/20 rounded-xl font-mono text-[0.7rem] relative overflow-hidden group">
			<div className="absolute top-0 left-0 w-1 h-full bg-accent-indigo" />
			<div className="flex justify-between items-center mb-2">
				<span className="text-accent-indigo-light font-black uppercase tracking-tighter">
					Telemetria de Oráculo
				</span>
				<span className="text-[0.6rem] text-text-muted">ACTIVE SNAPSHOT</span>
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
				('ai' in window &&
					Boolean((window as unknown as { ai?: { languageModel?: unknown } }).ai?.languageModel));
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
			const rec = new (SpeechRec as new () => {
				continuous: boolean;
				interimResults: boolean;
				lang: string;
				onstart: () => void;
				onresult: (e: {
					resultIndex: number;
					results: {
						length: number;
						[index: number]: {
							isFinal?: boolean;
							[altIndex: number]: { transcript?: string } | undefined;
						} | undefined;
					};
				}) => void;
				onerror: (e: { error: string }) => void;
				onend: () => void;
				start: () => void;
				stop: () => void;
			})();

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

			rec.onresult = async (event) => {
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

				if (newFinal) {
					if (dictationMode === 'translate-pt' || dictationMode === 'translate-en') {
						setIsTranslating(true);
						try {
							const targetLang = dictationMode === 'translate-pt' ? 'português brasileiro' : 'inglês';
							const translated = await generateAnalysis(
								`Traduza instantaneamente com máxima fidelidade e fluência natural para o ${targetLang}, retorne apenas a tradução sem comentários:\n"${newFinal.trim()}"`,
								512,
								'e2b',
							);
							if (translated) {
								const clean = translated.trim().replace(/^"|"$/g, '');
								accumulatedFinalRef.current += (accumulatedFinalRef.current ? ' ' : '') + clean;
							} else {
								accumulatedFinalRef.current += (accumulatedFinalRef.current ? ' ' : '') + newFinal.trim();
							}
						} catch (e) {
							console.warn('[Live Translate] Erro:', e);
							accumulatedFinalRef.current += (accumulatedFinalRef.current ? ' ' : '') + newFinal.trim();
						} finally {
							setIsTranslating(false);
						}
					} else {
						accumulatedFinalRef.current += (accumulatedFinalRef.current ? ' ' : '') + newFinal.trim();
					}
				}

				const base = basePromptRef.current;
				const fullText =
					(base ? base + (base.endsWith(' ') ? '' : ' ') : '') +
					accumulatedFinalRef.current +
					(interim ? (accumulatedFinalRef.current ? ' ' : '') + interim : '');
				setPrompt(fullText);
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
			const id = 'att_' + Math.random().toString(36).slice(2, 9);
			const name = file.name || 'anexo';
			const sizeStr = formatBytes(file.size);

			if (file.type.startsWith('image/')) {
				const reader = new FileReader();
				reader.onload = (e) => {
					const base64 = e.target?.result as string;
					const previewUrl = URL.createObjectURL(file);
					setAttachments((prev) => [
						...prev,
						{ id, name, size: sizeStr, type: 'image', previewUrl, base64 },
					]);
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
						canvas.height = Math.round(
							(canvas.width / (video.videoWidth || 1)) * (video.videoHeight || 270),
						);
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
				setAttachments((prev) => [
					...prev,
					{ id, name, size: sizeStr, type: 'audio', previewUrl },
				]);
			} else {
				let textContent = '';
				try {
					textContent = await file.text();
				} catch {
					textContent = '[Documento binário ou codificação não suportada]';
				}
				setAttachments((prev) => [
					...prev,
					{ id, name, size: sizeStr, type: 'doc', textContent },
				]);
			}
		}
	}, []);

	// Drag & Drop & Paste Listeners
	useEffect(() => {
		const handlePaste = (e: ClipboardEvent) => {
			const items = e.clipboardData?.items;
			if (!items) return;
			const files: File[] = [];
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
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
			if (item?.previewUrl && item.previewUrl.startsWith('blob:')) {
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
		const imagesBase64: string[] = [];
		let docsContext = '';

		for (const att of currentAttachments) {
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

		let fullPrompt = userMsg;
		if (docsContext) {
			fullPrompt = `${docsContext}\n\nSolicitação sobre os documentos anexados:\n${fullPrompt || 'Analise e resuma detalhadamente os documentos anexados acima.'}`;
		}

		// Web Search RAG
		let searchSources: WebSearchSource[] = [];
		if (webSearchActive && userMsg) {
			try {
				const searchRes = await fetch(`/api/v1/search?q=${encodeURIComponent(userMsg)}`);
				if (searchRes.ok) {
					const data = await searchRes.json();
					searchSources = data?.results || [];
					if (data?.formatted) {
						fullPrompt = `${data.formatted}\n\nPergunta do usuário:\n${fullPrompt}`;
					}
				}
			} catch (e) {
				console.warn('[WebSearch] Falha:', e);
			}
		}

		// Modulador RAG SOTA Epistêmico
		if (forceRAG) {
			fullPrompt +=
				"\n\n[DIRETRIZ DE AUDITORIA EPISTÊMICA SOTA]: Embase sua resposta rigorosamente na teoria de jogos e fundamentos matemáticos. Ao final, liste as fontes ou axiomas utilizados.";
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

	return (
		<div
			className="min-h-screen bg-bg-base text-text-bright font-body pb-24 sota-grain relative"
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
				<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center border-2 border-dashed border-accent-indigo pointer-events-none animate-in fade-in duration-200">
					<i className="fa-solid fa-cloud-arrow-up text-5xl text-accent-indigo-light mb-4 animate-bounce" />
					<h3 className="text-xl font-black text-white uppercase tracking-widest">
						Solte arquivos para análise multimodal
					</h3>
					<p className="text-xs text-text-muted mt-1 font-mono">
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

			<div className="sota-container -mt-12 relative z-10 max-w-5xl">
				{/* Seletor de Modelos de Borda */}
				<div className="flex items-center gap-2 overflow-x-auto pb-4 mb-3 scrollbar-none">
					{MODELS_CONFIG.map((m) => {
						const isSel = selectedModel === m.id;
						return (
							<button
								key={m.id}
								type="button"
								onClick={() => setSelectedModel(m.id)}
								className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-mono transition-all shrink-0 border cursor-pointer ${
									isSel
										? `${m.bgColor} ${m.borderColor} ${m.color} shadow-lg shadow-black/40 scale-[1.02]`
										: 'bg-black/40 border-white/5 text-text-muted hover:border-white/20 hover:text-white'
								}`}
								title={m.desc}
							>
								<i className={`fa-solid ${m.icon} ${isSel ? m.color : 'text-text-dim'}`} />
								<span className="font-black tracking-wider uppercase">{m.name}</span>
								<span
									className={`text-[0.6rem] px-1.5 py-0.5 rounded uppercase font-sans font-bold ${
										isSel ? 'bg-white/10 text-white' : 'bg-white/5 text-text-dim'
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
							className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-mono transition-all shrink-0 border cursor-pointer ${
								selectedModel === 'nano'
									? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300 shadow-lg'
									: 'bg-black/40 border-white/5 text-text-muted hover:border-cyan-400/20'
							}`}
							title="Gemini Nano on-device Direct3D 11 via Chrome Dev"
						>
							<i className="fa-solid fa-microchip text-cyan-400" />
							<span className="font-black uppercase tracking-wider">Gemini Nano</span>
							<span className="text-[0.6rem] px-1.5 py-0.5 rounded uppercase bg-cyan-500/20 text-cyan-200 font-bold">
								GPU D3D11
							</span>
						</button>
					)}
				</div>

				<GlassPanel
					className={`p-6 sm:p-8 mb-8 border-accent-indigo/30 transition-all duration-700 ${
						status === 'online'
							? 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]'
							: status === 'thinking'
								? 'shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)]'
								: 'shadow-[0_0_50px_-12px_rgba(244,63,94,0.2)]'
					}`}
				>
					{/* Status Bar */}
					<div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
						<div className="flex items-center gap-3">
							<div
								className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(status)}`}
							/>
							<span className="text-xs font-black uppercase tracking-[0.2em]">
								Status: {status.toUpperCase()}
							</span>
							{isSyncHydrated && (
								<span className="text-[0.65rem] font-black text-accent-emerald-light bg-accent-emerald/10 px-2 py-0.5 rounded border border-accent-emerald/20 animate-in fade-in">
									● SYNC: OK
								</span>
							)}
							{webSearchActive && (
								<span className="text-[0.65rem] font-black text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1.5 animate-in fade-in">
									<i className="fa-solid fa-globe" /> WEB RAG
								</span>
							)}
						</div>
						<div className="text-[0.65rem] text-text-muted font-mono flex items-center gap-4">
							<span>MOTOR: {selectedModel.toUpperCase()}</span>
							<span>LATÊNCIA: EDGE LOCAL</span>
						</div>
					</div>

					{/* Feed de Mensagens */}
					<div
						ref={scrollRef}
						className="min-h-100 max-h-160 overflow-y-auto bg-black/40 rounded-xl p-6 mb-6 font-mono text-sm leading-relaxed border border-white/5 selection:bg-accent-indigo/30 scroll-smooth"
					>
						{messages.length === 0 && !streamedText && !isStreaming ? (
							<div className="text-text-muted italic flex flex-col items-center justify-center h-80 gap-3">
								<i className="fa-solid fa-brain text-4xl text-accent-indigo/30" />
								<p>Oráculo pronto no modelo {selectedModel.toUpperCase()}.</p>
								<p className="text-xs text-text-dim">
									Digite sua pergunta, anexe imagens ou documentos, ou dite por voz abaixo.
								</p>
							</div>
						) : (
							<div className="space-y-6">
								{messages.map((msg) => (
									<div
										key={msg.id}
										className={`animate-in fade-in duration-300 ${
											msg.role === 'user' ? 'opacity-95' : ''
										}`}
									>
										{msg.role === 'user' && (
											<div className="mb-2">
												<div className="text-accent-indigo-light text-[0.6rem] font-black uppercase mb-1 tracking-widest flex items-center gap-2">
													<span>VOCÊ</span>
												</div>
												{/* Anexos enviados com clique para modal */}
												{msg.attachments && msg.attachments.length > 0 && (
													<div className="flex flex-wrap gap-2 mb-2">
														{msg.attachments.map((att) => (
															<button
																key={att.id}
																type="button"
																onClick={() => setActiveModalAttachment(att)}
																className="flex items-center gap-2 bg-black/50 border border-white/10 hover:border-accent-indigo/40 rounded-lg px-2.5 py-1 text-xs cursor-pointer transition-all"
																title="Clique para inspecionar em tela cheia"
															>
																{att.type === 'image' && att.previewUrl ? (
																	<img
																		src={att.previewUrl}
																		alt={att.name}
																		className="w-5 h-5 rounded object-cover"
																	/>
																) : att.type === 'video' ? (
																	<span className="text-xs">🎬</span>
																) : att.type === 'audio' ? (
																	<span className="text-xs">🎵</span>
																) : (
																	<i className="fa-solid fa-file-lines text-text-muted" />
																)}
																<span className="font-mono text-[0.7rem] text-text-bright">
																	{att.name}
																</span>
																<span className="text-[0.6rem] text-text-dim uppercase font-mono">
																	{att.size}
																</span>
															</button>
														))}
													</div>
												)}
												<div className="whitespace-pre-wrap text-text-bright bg-white/5 rounded-xl p-4 border border-white/5">
													{msg.content}
												</div>
											</div>
										)}

										{msg.role === 'assistant' && (
											<div>
												<div className="flex items-center justify-between mb-1">
													<div className="text-accent-emerald-light text-[0.6rem] font-black uppercase tracking-widest flex items-center gap-2">
														<span>ORÁCULO</span>
														{msg.modelUsed && (
															<span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded text-[0.55rem]">
																{msg.modelUsed}
															</span>
														)}
													</div>

													{/* Barra de TTS Padrão Ouro por Mensagem */}
													<div className="flex items-center gap-2">
														<button
															type="button"
															onClick={() => speech.toggle(msg.id, msg.content)}
															className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
																speech.activeMessageId === msg.id && speech.isPlaying
																	? 'bg-accent-emerald/20 border-accent-emerald/40 text-accent-emerald-light'
																	: 'bg-white/5 border-white/10 text-text-muted hover:text-white'
															}`}
															title="Ouvir resposta (Síntese Neural Calibrada)"
														>
															<i
																className={`fa-solid ${
																	speech.activeMessageId === msg.id && speech.isPlaying
																		? 'fa-pause'
																		: 'fa-volume-high'
																}`}
															/>
															<span className="text-[0.65rem] font-bold">
																{speech.activeMessageId === msg.id && speech.isPlaying
																	? 'Pausar'
																	: 'Ouvir'}
															</span>
														</button>

														{/* Badge Clicável de Velocidade (1.0x -> 2.0x) */}
														<button
															type="button"
															onClick={speech.cycleRate}
															className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 hover:border-accent-indigo/40 text-[0.65rem] font-mono text-accent-indigo-light cursor-pointer transition-all"
															title="Clique para alternar velocidade (1.0x -> 1.25x -> 1.5x -> 1.75x -> 2.0x)"
														>
															⚡ {speech.rate}x
														</button>
													</div>
												</div>

												{/* Conteúdo Renderizado com SotaMarkdown */}
												<div className="bg-black/30 border border-white/5 rounded-xl p-5 shadow-inner">
													{/* Pílulas de Fontes Web RAG */}
													{msg.sources && msg.sources.length > 0 && (
														<div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-white/10">
															{msg.sources.map((src, sIdx) => (
																<a
																	key={sIdx}
																	href={src.link}
																	target="_blank"
																	rel="noopener noreferrer"
																	title={`${src.title}\n${src.snippet}`}
																	className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-sky-500/10 border border-sky-400/30 text-sky-300 hover:bg-sky-500/20 hover:border-sky-400 transition-all max-w-[240px] truncate"
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
													<div className="flex items-center gap-4 mt-2 text-[0.6rem] font-mono text-text-dim">
														{msg.telemetry.ttftMs !== null && (
															<span>TTFT: {msg.telemetry.ttftMs}ms</span>
														)}
														{msg.telemetry.speedTokPerSec !== null && (
															<span>VEL: {msg.telemetry.speedTokPerSec} tok/s</span>
														)}
														{msg.telemetry.elapsedMs !== null && (
															<span>TEMPO: {msg.telemetry.elapsedMs}ms</span>
														)}
													</div>
												)}
											</div>
										)}

										{msg.role === 'telemetry' && msg.snapshot && (
											<TelemetryCard snapshot={msg.snapshot} />
										)}
									</div>
								))}

								{/* Streaming ao vivo */}
								{isStreaming && streamedText && (
									<div className="animate-in fade-in duration-300">
										<div className="text-accent-emerald-light text-[0.6rem] font-black uppercase mb-1 tracking-widest flex items-center gap-2">
											<span>ORÁCULO (STREAMING)</span>
											<span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
										</div>
										<div className="bg-black/30 border border-white/5 rounded-xl p-5 shadow-inner">
											<SotaMarkdown content={streamedText} />
										</div>
										<span className="inline-block w-2 h-4 bg-accent-indigo ml-1 animate-pulse mt-2" />
									</div>
								)}

								{isStreaming && !streamedText && (
									<div className="flex items-center gap-2 text-text-muted animate-pulse py-4">
										<div className="w-2 h-2 bg-accent-indigo rounded-full animate-ping" />
										<span className="text-[0.65rem] font-black uppercase font-mono tracking-wider">
											Sincronizando Probabilidades ({selectedModel.toUpperCase()})...
										</span>
									</div>
								)}

								{error && !isStreaming && (
									<div className="text-rose-400 p-3 bg-rose-950/30 rounded-xl border border-rose-500/20 text-xs mt-4">
										{error}
									</div>
								)}
							</div>
						)}
					</div>

					{/* Bandeja de Anexos (*Attachment Tray*) */}
					{attachments.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-3 p-3 bg-black/50 border border-white/10 rounded-xl">
							{attachments.map((att) => (
								<div
									key={att.id}
									onClick={() => setActiveModalAttachment(att)}
									className="flex items-center gap-2 bg-slate-900/80 border border-white/15 hover:border-accent-indigo/40 rounded-lg px-2.5 py-1.5 text-xs group cursor-pointer transition-all"
									title="Clique para visualizar anexo"
								>
									{att.type === 'image' && att.previewUrl ? (
										<img
											src={att.previewUrl}
											alt={att.name}
											className="w-7 h-7 rounded object-cover border border-white/10"
										/>
									) : att.type === 'video' ? (
										<span className="text-base">🎬</span>
									) : att.type === 'audio' ? (
										<span className="text-base">🎵</span>
									) : (
										<i className="fa-solid fa-file-code text-accent-indigo-light text-base" />
									)}
									<div className="flex flex-col">
										<span className="font-mono text-[0.7rem] text-white font-medium max-w-35 truncate">
											{att.name}
										</span>
										<span className="text-[0.55rem] text-text-dim uppercase font-mono">
											{att.type.toUpperCase()} • {att.size}
										</span>
									</div>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											removeAttachment(att.id);
										}}
										className="ml-1 text-text-dim hover:text-rose-400 cursor-pointer text-sm p-1"
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
							onKeyDown={(e) =>
								e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleConsult())
							}
							placeholder="Descreva o cenário, cole imagens (Ctrl+V), arraste arquivos ou dite por voz..."
							className="w-full bg-black/60 border border-white/10 rounded-xl p-4 pr-4 focus:outline-none focus:border-accent-indigo/50 transition-all resize-none h-32 pb-16 text-sm"
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
						<div className="absolute left-3 bottom-3 right-3 flex items-center justify-between">
							<div className="flex items-center gap-2">
								{/* Botão Anexar */}
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/25 text-xs text-text-muted hover:text-white cursor-pointer transition-all"
									title="Anexar imagens, documentos, vídeos ou áudio"
								>
									<i className="fa-solid fa-paperclip text-[0.7rem]" />
									<span className="text-[0.65rem] font-bold uppercase">Anexar</span>
								</button>

								{/* Alternador Web Search */}
								<button
									type="button"
									onClick={() => setWebSearchActive((v) => !v)}
									className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
										webSearchActive
											? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
											: 'bg-white/5 border-white/10 text-text-muted hover:text-white'
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
									className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
										isListening
											? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
											: 'bg-white/5 border-white/10 text-text-muted hover:text-white'
									}`}
									title="Ditado por voz e tradução instantânea"
								>
									<i
										className={`fa-solid ${
											isTranslating
												? 'fa-spinner fa-spin text-cyan-400'
												: isListening
													? 'fa-circle-dot text-rose-400'
													: 'fa-microphone'
										} text-[0.7rem]`}
									/>
									<span className="text-[0.65rem] font-bold uppercase">
										{isTranslating ? 'Traduzindo...' : isListening ? 'Ouvindo...' : 'Ditado'}
									</span>
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
									className="bg-black/80 border border-white/10 text-text-muted hover:text-white rounded-lg px-2 py-1 text-[0.65rem] font-mono focus:outline-none cursor-pointer"
								>
									<option value="pt-BR">🇧🇷 Ditado (PT)</option>
									<option value="en-US">🇺🇸 Dictation (EN)</option>
									<option value="translate-pt">🌐 Live Translate → PT</option>
									<option value="translate-en">🌐 Live Translate → EN</option>
								</select>
							</div>

							<div className="flex items-center gap-3">
								<label className="hidden sm:flex items-center gap-2 text-[0.6rem] text-text-muted font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors select-none">
									<input
										type="checkbox"
										checked={forceRAG}
										onChange={(e) => setForceRAG(e.target.checked)}
										className="accent-accent-indigo w-3 h-3 cursor-pointer"
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
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<GlassPanel
						className="p-4 border-white/5 hover:border-accent-indigo/20 transition-all cursor-pointer group"
						onClick={() =>
							setPrompt('Analise a Amortização da Edge em um cenário de 15bb vs Open-Shove.')
						}
					>
						<div className="text-[0.6rem] font-black text-accent-indigo-light mb-1">
							PROMPT SUGERIDO
						</div>
						<div className="text-xs text-text-muted group-hover:text-white transition-colors">
							Amortização de Edge (15bb)
						</div>
					</GlassPanel>
					<GlassPanel
						className="p-4 border-white/5 hover:border-accent-indigo/20 transition-all cursor-pointer group"
						onClick={() =>
							setPrompt('Calcule qualitativamente o Downward Drift em um pote Multiway (4 players).')
						}
					>
						<div className="text-[0.6rem] font-black text-accent-indigo-light mb-1">
							PROMPT SUGERIDO
						</div>
						<div className="text-xs text-text-muted group-hover:text-white transition-colors">
							Downward Drift Multiway
						</div>
					</GlassPanel>
					<GlassPanel
						className="p-4 border-white/5 hover:border-accent-indigo/20 transition-all cursor-pointer group"
						onClick={() =>
							setPrompt('Gere uma síntese do Paradigma VITOI sobre a Insolvência das Pot Odds.')
						}
					>
						<div className="text-[0.6rem] font-black text-accent-indigo-light mb-1">
							PROMPT SUGERIDO
						</div>
						<div className="text-xs text-text-muted group-hover:text-white transition-colors">
							Síntese de Insolvência
						</div>
					</GlassPanel>
				</div>
			</div>

			{/* Modal Lightbox para Mídias e Documentos */}
			{activeModalAttachment && (
				<div
					className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
					onClick={() => setActiveModalAttachment(null)}
				>
					<div
						className="bg-slate-900 border border-accent-indigo/40 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col gap-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between border-b border-white/10 pb-3">
							<div className="flex items-center gap-2">
								<span className="text-accent-indigo-light font-mono text-sm font-bold">
									{activeModalAttachment.type === 'image' && '🖼️ IMAGEM:'}
									{activeModalAttachment.type === 'video' && '🎬 VÍDEO (KEYFRAMES):'}
									{activeModalAttachment.type === 'audio' && '🎵 ÁUDIO:'}
									{activeModalAttachment.type === 'doc' && '📄 DOCUMENTO:'}
								</span>
								<span className="font-mono text-xs text-white truncate max-w-md">
									{activeModalAttachment.name}
								</span>
								<span className="text-[0.65rem] font-mono text-text-dim">
									({activeModalAttachment.size})
								</span>
							</div>
							<button
								type="button"
								onClick={() => setActiveModalAttachment(null)}
								className="text-text-dim hover:text-white text-xl cursor-pointer p-1"
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
									className="max-h-[70vh] max-w-full rounded-xl object-contain border border-white/10"
								/>
							)}

							{activeModalAttachment.type === 'video' && (
								<div className="w-full space-y-4">
									<p className="text-xs text-text-muted font-mono">
										Keyframes temporais extraídos para análise da Gemma 4:
									</p>
									<div className="grid grid-cols-3 gap-3">
										{activeModalAttachment.keyframes?.map((kf, kIdx) => (
											<div
												key={kIdx}
												className="relative rounded-lg overflow-hidden border border-white/15 group"
											>
												<img
													src={kf.previewUrl}
													alt={`Keyframe ${kf.timeLabel}`}
													className="w-full h-32 object-cover"
												/>
												<span className="absolute bottom-1 right-1 bg-black/80 text-cyan-300 font-mono text-[0.65rem] px-1.5 py-0.5 rounded">
													{kf.timeLabel}
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							{activeModalAttachment.type === 'audio' && activeModalAttachment.previewUrl && (
								<div className="w-full py-8 px-4 flex flex-col items-center gap-4">
									<i className="fa-solid fa-volume-high text-5xl text-accent-indigo-light animate-pulse" />
									<audio
										controls
										autoPlay
										src={activeModalAttachment.previewUrl}
										className="w-full max-w-md"
									/>
								</div>
							)}

							{activeModalAttachment.type === 'doc' && (
								<pre className="w-full max-h-[65vh] overflow-auto bg-black/90 p-4 rounded-xl font-mono text-xs text-slate-300 border border-white/10 whitespace-pre-wrap">
									{activeModalAttachment.textContent || '(Documento vazio ou binário)'}
								</pre>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
