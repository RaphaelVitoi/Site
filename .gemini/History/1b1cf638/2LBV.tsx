'use client';

/**
 * IDENTITY: Painel de Interação AI
 * PATH: src/components/simulator/panels/AICoachPanel.tsx
 * ROLE: Recriando a sessão de chat e prompts do protótipo em React.
 * BINDING: [engine/types.ts, simulator.module.css]
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Scenario, NashResult } from '../engine/types';
import styles from '../simulator.module.css';

type ChatMode = 'coach' | 'villain' | 'simulator' | 'psychologist';

interface ChatEntry {
  id: number;
  role: 'user' | 'assistant' | 'system';
  text: string;
  mode: ChatMode;
}

const MODE_META: Record<ChatMode, { label: string; accent: string; description: string }> = {
  coach: {
    label: 'Oráculo AI',
    accent: '#a855f7',
    description: 'Consultoria pragmática e analítica; responde como Raphael Vitoi.',
  },
  villain: {
    label: 'Vilão',
    accent: '#fb7185',
    description: 'Personagem provocador com persona baseada na stack do vilão.',
  },
  simulator: {
    label: 'Simulador',
    accent: '#34d399',
    description: 'Dealer simula board e provocação pós-flop.',
  },
  psychologist: {
    label: 'Psicólogo',
    accent: '#0ea5e9',
    description: 'Diagnóstico mental: fadiga, tilt e peso cognitivo (TDAH/AHSD).',
  },
};

const QUICK_PROMPTS: { mode: ChatMode; text: string }[] = [
  {
    mode: 'coach',
    text: 'Explica detalhadamente o EV deste confronto específico e como devo ajustar o meu range.',
  },
  {
    mode: 'simulator',
    text: 'Cria um flop e descreve a ação do vilão sob pressão de ICM.',
  },
  {
    mode: 'villain',
    text: 'Trash talk: por que estás a implodir o torneio com esse range? Fala como Vilão.',
  },
  {
    mode: 'psychologist',
    text: 'Analise o peso mental e o risco de tilt ao tomar esta decisão sob pressão extrema de ICM.',
  },
];

function describeFlop(scenario: Scenario): string {
  const textures: Record<Scenario['category'], string[]> = {
    clinical: [
      'Flop: K♠ 9♣ 4♦ — textura seca que deixa o RP do IP ainda mais precioso.',
      'Flop: A♦ 7♠ 3♣ — dois overcards e um lowcard que valorizam pressões de fold equity.',
    ],
    baseline: [
      'Flop: Q♣ J♠ 6♥ — spread broadway que aceita floats mas exige cuidado com RP.',
      'Flop: T♠ 8♦ 5♠ — draw semi-ombrado onde o vilão tenta estrangular o MDF.',
    ],
    toyGame: [
      'Flop: 7♣ 6♦ 2♠ — textura offsuit que convida a barra de controle.',
      'Flop: J♥ 10♣ 8♦ — board conectado para testar ranges condensados.',
    ],
  };
  const options = textures[scenario.category] ?? textures.baseline;
  const selected = options[scenario.name.length % options.length];
  return selected;
}

function buildRangeNarrative(scenario: Scenario): string {
  return `O IP age como ${scenario.ipMorph}, forçando pares altos e blefes densos; o OOP responde como ${scenario.oopMorph}, sustentando um range polarizado com top pairs e bluffcatchers rígidos.`;
}

function formatResponse(mode: ChatMode, prompt: string, scenario: Scenario, nash: NashResult) {
  const base = `Cenário: ${scenario.name} | IP (${scenario.ipPos}): ${scenario.ipRp.toFixed(1)}% RP vs OOP (${scenario.oopPos}): ${scenario.oopRp.toFixed(1)}% RP.`;
  const delta = (nash.bluffFreq - 33.3).toFixed(1);
  const sens = (nash.defenseFreq - 50).toFixed(1);
  const isAllInPreflop = scenario.ipPos.toLowerCase().includes('shove');

  if (mode === 'villain') {
    return `Vilão respondendo: O ${scenario.oopPos} (Bluffcatcher Rígido) sente o shove polar do ${scenario.ipPos} e, com ${scenario.oopRp.toFixed(
      1,
    )}% de RP, sabe que manter o range condensado com top pairs e blocos de bluff é a resposta. ${scenario.verdict} segue controlando a dinâmica — o Pacto Silencioso mantém o equilíbrio. Diga: como você desfaz essa transferência de fardo antes que o Downward Drift se aprofunde?`;
  }

  if (mode === 'simulator') {
    const flopText = describeFlop(scenario);
    const preflop = `Pré-flop: o ${scenario.ipPos} (RP ${scenario.ipRp.toFixed(
      1,
    )}%) foi all-in com 25bb (toy-game “Efeito Batata Quente”) e o ${scenario.oopPos} (RP ${scenario.oopRp.toFixed(
      1,
    )}%) pagou como Bluffcatcher Rígido, mantendo o RP maior para o showdown.`;
    const ranges = buildRangeNarrative(scenario);
    if (isAllInPreflop) {
      return `IA Dealer: ${base}\n${preflop}\nEste spot é all-in pré-flop: não há decisões pós-flop, apenas showdown. O ${scenario.oopPos} paga porque o RP maior (${scenario.oopRp.toFixed(
        1,
      )}%) suporta o risco e os valores de MDF/alpha (${nash.defenseFreq.toFixed(1)}% / ${nash.bluffFreq.toFixed(
        1,
      )}%) mostram que o call é consistente. Use este cenário para comparar ChipEV vs ICMev em shoves; para estudar sizing e Downward Drift, abra um cenário sem all-in pré-flop.`;
    }
    return `IA Dealer: ${base}\n${flopText}\n${preflop}\n${ranges}\nO vilão paga porque o MDF é ${nash.defenseFreq.toFixed(
      1,
    )}%, o alpha ${nash.bluffFreq.toFixed(1)}% (Δ ${delta} / ${sens}) e o RP maior garante o call; o all-in já definiu o showdown.`;
  }

  if (mode === 'psychologist') {
    return `Psicólogo AI: ${base} O peso cognitivo desta decisão aciona gatilhos severos de fadiga e ego. Em mentes hiperfocadas (TDAH/AHSD), o risco de Tilt na Death Zone se multiplica pela paralisia por análise. Como você está gerenciando o limite de sua atenção neste momento exato?`;
  }

  return `Coach ICM: ${base} Seu prompt "${prompt}" ativa o mote ${scenario.verdict}. Com 42,8% de alpha e 27,2% de MDF, mantenha o equilíbrio do Downward Drift e só aumente a agressão se o RP residual do board cair abaixo do Teto do RP. A diferença de RP (${(
    scenario.ipRp - scenario.oopRp
  ).toFixed(
    1,
  )}%) define quem tem a responsabilidade de arriscar. Imagine o checklist de decisão da aula: quem cobre quem? Qual ação você toma no próximo street para preservar o RP e evitar o colapso?`;
}

export interface AICoachPanelProps {
  scenario: Scenario;
  nash: NashResult;
  onClose?: () => void;
}

export default function AICoachPanel({ scenario, nash, onClose }: Readonly<AICoachPanelProps>) {
  const [mode, setMode] = useState<ChatMode>('coach');
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>(() => [
    {
      id: Date.now(),
      role: 'system',
      text: `Modo ${MODE_META['coach'].label} ativo. ${MODE_META['coach'].description}`,
      mode: 'coach',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (text: string, selectedMode: ChatMode = mode) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userEntry: ChatEntry = {
      id: Date.now(),
      role: 'user',
      text: trimmed,
      mode: selectedMode,
    };

    setChatHistory((prev) => [...prev, userEntry]);
    setMode(selectedMode);
    setInputValue('');
    setLoading(true);

    try {
      let responseText = formatResponse(selectedMode, trimmed, scenario, nash);

      const scenarioContext = `Cenário: ${scenario.name}
IP: ${scenario.ipPos} com Risk Premium de ${scenario.ipRp.toFixed(1)}%.
OOP: ${scenario.oopPos} com Risk Premium de ${scenario.oopRp.toFixed(1)}%.
Alpha Nash Ideal: ${nash.bluffFreq.toFixed(1)}% | MDF Nash Ideal: ${nash.defenseFreq.toFixed(1)}%`;

      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed, scenarioContext, mode: selectedMode }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          responseText = data.answer; // Resposta 100% dinâmica gerada pelo LLM SOTA
        } else if (data.context && data.context.trim() !== '') {
          responseText += `\n\n[RAG RAW]\n${data.context}`;
        } else {
          responseText = `[ALERTA DE SISTEMA]\nA chave da API não foi detectada e o motor RAG não encontrou memórias.\n\n[RESPOSTA LOCAL DE CONTINGÊNCIA]\n${responseText}`;
        }
      } else {
        const errData = await res.json();
        console.warn('[RAG] Falha na consulta SOTA:', errData);
        responseText = `[FALHA DE COMUNICAÇÃO SOTA]\nOráculo offline. Erro interno: ${errData.error || res.statusText}\n\n[RESPOSTA LOCAL DE CONTINGÊNCIA]\n${responseText}`;
      }

      const assistantEntry: ChatEntry = {
        id: Date.now() + 1,
        role: 'assistant',
        text: responseText,
        mode: selectedMode,
      };
      setChatHistory((prev) => [...prev, assistantEntry]);
    } catch (error) {
      console.error('[Oráculo] Erro de comunicação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (modeToSend: ChatMode, text: string) => {
    handleSend(text, modeToSend);
  };

  const handleClearChat = () => {
    setChatHistory([
      {
        id: Date.now(),
        role: 'system',
        text: `Modo ${MODE_META[mode].label} ativo. ${MODE_META[mode].description}`,
        mode: mode,
      },
    ]);
  };

  const handleMinimize = () => {
    if (onClose) {
      onClose();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (chatHistory.length === 0) return;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const currentModeCopy = useMemo(() => MODE_META[mode], [mode]);

  return (
    <div className={`${styles.glassPanel} ${styles.aiPanelWrapper}`}>
      <div className={styles.aiPanelHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3>Circuito AI</h3>
            {chatHistory.length > 1 && (
              <button type="button" onClick={handleClearChat} style={{ fontSize: '0.6rem', padding: '2px 8px', background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
                Limpar Chat
              </button>
            )}
          </div>
          <p>{currentModeCopy.description}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleMinimize}
            style={{ fontSize: '0.55rem', padding: '4px 8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s' }}
          >
            <i className="fa-solid fa-chevron-up" style={{ color: '#818cf8' }}></i> Pausar e Voltar para Configurações
          </button>
          <div className={styles.aiModeBadge} style={{ borderColor: currentModeCopy.accent, color: currentModeCopy.accent }}>
            {currentModeCopy.label}
          </div>
        </div>
      </div>

      <div className={styles.aiQuickButtons}>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.text}
            type="button"
            onClick={() => handleQuickPrompt(prompt.mode, prompt.text)}
            className={`${styles.toolButton} ${styles.aiQuickButton}`}
          >
            {prompt.text}
          </button>
        ))}
      </div>

      <div className={styles.aiChatHistory}>
        {chatHistory.map((entry) => (
          <div
            key={entry.id}
            className={`${styles.aiChatBubble} ${entry.role === 'user' ? styles.aiChatUser : styles.aiChatAssistant}`}
          >
            <div className={styles.aiChatLabel}>
              <strong>{entry.role === 'user' ? 'Você' : MODE_META[entry.mode].label}</strong>
            </div>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.5 }}>{entry.text}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className={styles.aiInputArea}>
        <textarea
          placeholder="Digite um pedido para o Oráculo..."
          className={styles.aiPromptInput}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          rows={2}
        />
        <div className={styles.aiControls}>
          <div className={styles.aiModePills}>
            {(Object.keys(MODE_META) as ChatMode[]).map((candidate) => (
              <button
                key={candidate}
                type="button"
                onClick={() => setMode(candidate)}
                className={`${styles.aiModePill} ${mode === candidate ? styles.aiModePillActive : ''}`}
                style={{ borderColor: MODE_META[candidate].accent, color: MODE_META[candidate].accent }}
              >
                {MODE_META[candidate].label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.aiSubmitButton}
            onClick={() => handleSend(inputValue, mode)}
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Analisar ✨'}
          </button>
        </div>
      </div>
    </div>
  );
}
