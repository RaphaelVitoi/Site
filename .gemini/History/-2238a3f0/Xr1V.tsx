"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SotaMarkdown } from "@/components/ui/SotaMarkdown";

/**
 * IDENTITY: Módulo de Teste Prático - Gamificação Visceral do ICM
 * PATH: src/components/simulator/IcmQuizVisceral.tsx
 * ROLE: Avaliar o entendimento do usuário sobre o Framework PM( Perspectiva Matemática ), Fator R e Axioma Lipe Piv, com UX animada e síntese final.
 */

type Choice = {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
  metricImpact: {
    expectativa: string;
    evFold: string;
    perspectiva: string;
    ci?: string;
  };
};

export type Scenario = {
  id: number | string;
  title: string;
  context: string;
  trap: string;
  choices: Choice[];
};

// SOTA: Auto-Healing e Mock Local O(1) para contornar a ausência de 'quizActions'.
// Permite que o componente escale via DB no futuro sem quebrar o fluxo estático presente.
const fetchVisceralScenarios = async (): Promise<Scenario[]> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(FALLBACK_SCENARIOS), 800),
  );
};

const FALLBACK_SCENARIOS: Scenario[] = [
  {
    id: "tg-1",
    title: "O Canto da Sereia das Pot Odds",
    context:
      "Mesa Final (7 left). UTG (CL, 65bb) abre 2x. Você está no BB com 15bb. Pote: 4.5bb. Você com 97s.",
    trap: "Pagar porque as pot odds (1:4.5) dizem que é lucrativo no vácuo.",
    choices: [
      {
        id: "c1",
        label: "Call. As odds justificam especular no Flop.",
        isCorrect: false,
        feedback:
          "Insolvência (Cᵢ < 1). As pot odds mascaram as Reverse Implied Odds (RIO). Ao pagar OOP contra o CL, o Custo Afundado corrói sua sobrevivência sistêmica.",
        metricImpact: {
          expectativa: "-0.25bb",
          evFold: "-1.12bb",
          perspectiva: "-1.50%",
          ci: "0.75",
        },
      },
      {
        id: "c2",
        label: "Fold. O EV de fold estabelece um teto de segurança.",
        isCorrect: true,
        feedback:
          "Rigor Cirúrgico. O investimento não compensa o Passivo Estrutural. Foldar preserva o capital sistêmico e repele a armadilha do Pot Entrapment.",
        metricImpact: {
          expectativa: "0.00bb",
          evFold: "-1.12bb",
          perspectiva: "+2.10%",
          ci: "1.20",
        },
      },
    ],
  },
  {
    id: "tg-2",
    title: "O Paradoxo do Leverage",
    context:
      "Bolha do Torneio. O SB (20bb) entra de limp. Você está no BB (25bb) com KJo.",
    trap: 'Checkar passivamente para "ver o flop grátis" devido à Bolha.',
    choices: [
      {
        id: "c3",
        label: "Raise (Isolate). Aplicar a pressão da bolha sobre o SB.",
        isCorrect: true,
        feedback:
          "Antevisão Aplicada. Você transfere o Risk Premium para o oponente, alavancando o Bubble Factor dele contra si mesmo e conquistando Fold Equity não-linear.",
        metricImpact: {
          expectativa: "+1.80bb",
          evFold: "-1.00bb",
          perspectiva: "+4.20%",
          ci: "1.50",
        },
      },
      {
        id: "c4",
        label: "Check. Evitar risco de eliminação e realizar equidade.",
        isCorrect: false,
        feedback:
          "Erro de Omissão. Ao abdicar do Leverage, você permite que o SB realize a equidade gratuitamente, negligenciando a Amortização da Edge e a Saúde Estrutural (FGS).",
        metricImpact: {
          expectativa: "+0.15bb",
          evFold: "-1.00bb",
          perspectiva: "-0.80%",
          ci: "0.95",
        },
      },
    ],
  },
  {
    id: "tg-3",
    title: "O Colapso da Árvore (Amortização da Edge)",
    context:
      "Bolha da Mesa Final. Você é o Chip Leader (100bb). O Short Stack (10bb) shova do BTN. Você segura A8o no BB.",
    trap: "Pagar porque A8o tem 55% de equidade e você se considera um jogador muito superior (Edge Alta).",
    choices: [
      {
        id: "c5",
        label: "Call. A Edge garante lucro no longo prazo contra amadores.",
        isCorrect: false,
        feedback:
          'Ilusão de Processamento. Com 10bb a árvore colapsa e a sua Edge é neutralizada pela variância (A Matemática de Colisão Pura). Dobrar o short devolve as "ferramentas de erro" a ele e quebra o ecossistema da mesa.',
        metricImpact: {
          expectativa: "+0.40bb",
          evFold: "0.00bb",
          perspectiva: "-3.20%",
          ci: "0.85",
        },
      },
      {
        id: "c6",
        label: "Fold. O EV do fold é soberano. Manter a inércia.",
        isCorrect: true,
        feedback:
          "A Complexidade é a Arma do Forte. Você abdica de um EV marginal para preservar a sua Edge intacta em potes Deep. Manter o short agonizando sufocado tem valor estratégico infinitamente superior à colisão.",
        metricImpact: {
          expectativa: "0.00bb",
          evFold: "0.00bb",
          perspectiva: "+5.10%",
          ci: "2.50",
        },
      },
    ],
  },
  {
    id: "tg-4",
    title: "O Axioma Lipe Piv (Fator Ψ)",
    context:
      "River. Pote gigante. RP = 25% (Predator Zone). Oponente OOP shova agressivamente representando o nuts absoluto.",
    trap: "Foldar instantaneamente porque a MDF colapsa sob 24% de RP e a teoria manda respeitar a pressão do ICM.",
    choices: [
      {
        id: "c7",
        label: "Fold. O Teto do RP manda evitar colisões.",
        isCorrect: false,
        feedback:
          "Conservadorismo Robótico. Você jogou GTO contra um humano. Ignorou a taxa de maluquice. Se o oponente não executa o GTO de forma perfeita, o overfold sistemático é abstenção pura de lucro.",
        metricImpact: {
          expectativa: "0.00bb",
          evFold: "-15.0bb",
          perspectiva: "-5.00%",
          ci: "0.90",
        },
      },
      {
        id: "c8",
        label: "Call. Integrar a Frequência de Bobagem Humana.",
        isCorrect: true,
        feedback:
          "Regressão Bayesiana Aplicada. Se a probabilidade estatística dele errar emocionalmente (tilt/bluff) for de 10%, e a chance dele ter os 4 combos de nuts for 4%, a Perspectiva exige o call sobrepujando o ICM puro.",
        metricImpact: {
          expectativa: "+8.50bb",
          evFold: "-15.0bb",
          perspectiva: "+12.0%",
          ci: "1.80",
        },
      },
    ],
  },
];

function getChoiceClasses(isSelected: boolean, isCorrect: boolean): string {
  if (!isSelected) return "bg-slate-800/50 border-white/5 text-text-light";
  return isCorrect
    ? "bg-emerald-500/15 border-accent-emerald text-accent-emerald"
    : "bg-red-500/15 border-accent-danger text-accent-danger";
}

// Subcomponente para erradicar a Complexidade Ciclomatica SOTA (Lei de Shannon)
function QuizSynthesis({ onRestart }: { readonly onRestart: () => void }) {
  return (
    <motion.div
      key="synthesis"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="text-center py-4"
    >
      <h3 className="text-[1.4rem] text-accent-emerald-light mb-4 font-extrabold">
        O Córtex da Perspectiva Matemática
      </h3>
      <p className="text-text-muted text-[0.95rem] leading-relaxed max-w-150 mx-auto mb-8">
        As leis da PM Lens destroem a ilusão linear do ChipEV e ancoram suas
        decisões no chão da realidade:
      </p>
      <div className="flex flex-col gap-4 text-left mb-10">
        <div className="bg-slate-800/40 border-l-[3px] border-accent-indigo p-4 rounded-md">
          <strong className="text-accent-indigo-light block mb-1 font-bold">
            1. Equidade não é Destino (Fator R)
          </strong>
          <span className="text-[0.85rem] text-text-dim">
            Estar Fora de Posição dilui estruturalmente o seu poder de fogo. O
            Fator R revela que mãos que parecem lucrativas no vácuo tornam-se
            insustentáveis no mundo real.
          </span>
        </div>
        <div className="bg-slate-800/40 border-l-[3px] border-accent-pink p-4 rounded-md">
          <strong className="text-accent-pink-light block mb-1 font-bold">
            2. Solvers preveem perfeição; humanos entregam entropia (Axioma)
          </strong>
          <span className="text-[0.85rem] text-text-dim">
            O Axioma Lipe Piv utiliza a Regressão Bayesiana para forçar a
            equidade teórica de volta ao baseline passivo sempre que a
            Credibilidade (κ) for baixa. Não confie cegamente no vácuo.
          </span>
        </div>
        <div className="bg-slate-800/40 border-l-[3px] border-accent-amber p-4 rounded-md">
          <strong className="text-accent-amber-light block mb-1 font-bold">
            3. O Zero Não Existe (Sunk Cost)
          </strong>
          <span className="text-[0.85rem] text-text-dim">
            Qualquer decisão agressiva negativa (-3bb) será lucrativa pela Lente
            da Perspectiva se o Custo Afundado da desistência for ainda pior
            (-5bb). O EV do Fold é o seu piso inegociável.
          </span>
        </div>
        <div className="bg-slate-800/40 border-l-[3px] border-accent-pink p-4 rounded-md">
          <strong className="text-accent-pink-light block mb-1 font-bold">
            4. A Ilusão das Pot Odds (Coeficiente Cᵢ)
          </strong>
          <span className="text-[0.85rem] text-text-dim">
            O preço barato mascara o Passivo Estrutural das Reverse Implied Odds
            (RIO). Se o Cᵢ for menor que 1, as odds estão mentindo e a sua
            equity real será devorada pela entropia (Multiway).
          </span>
        </div>
      </div>
      <button
        onClick={onRestart}
        className="py-3 px-8 bg-accent-indigo text-white border-none rounded-lg font-extrabold cursor-pointer uppercase tracking-[0.05em]"
      >
        Reiniciar Calibração
      </button>
    </motion.div>
  );
}

// Subcomponente para renderizar a etapa ativa (Erradicando Complexidade Ciclomatica SOTA)
function ActiveScenarioStep({
  scenario,
  currentStep,
  selectedChoice,
  isAnswered,
  isRevealing,
  choiceData,
  onSelect,
}: {
  readonly scenario: Scenario;
  readonly currentStep: number;
  readonly selectedChoice: string | null;
  readonly isAnswered: boolean;
  readonly isRevealing: boolean;
  readonly choiceData: Choice | undefined;
  readonly onSelect: (choiceId: string) => void;
}) {
  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {/* Área do Cenário */}
      <div className="mb-8">
        <h3 className="text-[1.1rem] text-accent-indigo-light mb-3 font-bold">
          {scenario.title}
        </h3>
        <p className="text-text-muted text-[0.95rem] leading-relaxed mb-4">
          {scenario.context}
        </p>
        <div className="bg-red-500/10 border-l-[3px] border-accent-danger px-4 py-3 rounded-md">
          <span className="text-[0.8rem] font-extrabold text-accent-danger-light uppercase">
            ⚠ Armadilha Cognitiva:{" "}
          </span>
          <span className="text-[0.85rem] text-text-light">
            {scenario.trap}
          </span>
        </div>
      </div>

      {/* Opções de Decisão */}
      <div className="flex flex-col gap-3">
        {scenario.choices.map((choice) => {
          const isSelected = selectedChoice === choice.id;
          const choiceClasses = getChoiceClasses(isSelected, choice.isCorrect);
          const opacityClass =
            isAnswered && !isSelected ? "opacity-40" : "opacity-100";
          const cursorClass =
            isAnswered || isRevealing ? "cursor-default" : "cursor-pointer";
          return (
            <button
              key={choice.id}
              onClick={() => onSelect(choice.id)}
              disabled={isAnswered || isRevealing}
              className={`p-4 text-left rounded-lg transition-all duration-200 border ${choiceClasses} ${opacityClass} ${cursorClass}`}
            >
              <span className="font-bold text-[0.95rem]">{choice.label}</span>
            </button>
          );
        })}
      </div>

      {/* Painel de Resolução (Impacto Visceral) */}
      {isRevealing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 p-6 text-center bg-slate-900/40 rounded-lg border border-dashed border-accent-indigo/20"
        >
          <span className="text-[0.75rem] text-accent-indigo uppercase tracking-widest font-bold">
            <i className="fa-solid fa-microchip fa-fade mr-2" />
            Processando Vetores de Perspectiva...
          </span>
        </motion.div>
      )}

      {isAnswered && !isRevealing && choiceData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mt-8 p-6 rounded-lg border-t-[3px] ${choiceData.isCorrect ? "bg-emerald-500/5 border-accent-emerald" : "bg-red-500/5 border-accent-danger"}`}
        >
          <div className="mb-4">
            <SotaMarkdown content={choiceData.feedback} />
          </div>
          <div className="flex gap-8 flex-wrap font-mono">
            <div>
              <span className="block text-[0.7rem] text-text-dim uppercase">
                Expectativa (P)
              </span>
              <span className="text-[1rem] font-extrabold text-accent-indigo-light">
                {choiceData.metricImpact.expectativa}
              </span>
            </div>
            <div>
              <span className="block text-[0.7rem] text-text-dim uppercase">
                EV_Fold (1ª Ordem)
              </span>
              <span className="text-[1rem] font-extrabold text-accent-danger">
                {choiceData.metricImpact.evFold}
              </span>
            </div>
            <div>
              <span className="block text-[0.7rem] text-text-dim uppercase">
                Perspectiva (PM)
              </span>
              <span
                className={`text-[1rem] font-extrabold ${choiceData.isCorrect ? "text-accent-emerald" : "text-accent-danger"}`}
              >
                {choiceData.metricImpact.perspectiva}
              </span>
            </div>
            {choiceData.metricImpact.ci !== undefined && (
              <div>
                <span className="block text-[0.7rem] text-text-dim uppercase">
                  Insolvência (Cᵢ)
                </span>
                <span
                  className={`text-[1rem] font-extrabold ${Number(choiceData.metricImpact.ci) < 1 ? "text-accent-danger" : "text-accent-emerald"}`}
                >
                  {choiceData.metricImpact.ci}x
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function IcmQuizVisceral() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isRevealing, setIsRevealing] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    fetchVisceralScenarios()
      .then((data: Scenario[]) => {
        if (isMounted) {
          setScenarios(data.length > 0 ? data : FALLBACK_SCENARIOS);
        }
      })
      .catch((error: unknown) => {
        console.warn(
          "[Quiz] Falha ao sincronizar cenarios:",
          error instanceof Error ? error.message : error,
        );
        if (isMounted) setScenarios(FALLBACK_SCENARIOS);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (scenarios.length === 0) {
    return (
      <div className="p-8 text-center text-text-dim italic tracking-[0.05em]">
        <p className="uppercase">Sincronizando Módulo Visceral...</p>
        <div className="flex gap-1.5 justify-center mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse [animation-delay:200ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse [animation-delay:400ms]" />
        </div>
      </div>
    );
  }

  const isFinished = currentStep === scenarios.length;
  const scenario = scenarios[currentStep];
  const selectedChoice = answers[currentStep] || null;
  const isAnswered = selectedChoice !== null;
  const choiceData = scenario?.choices.find((c) => c.id === selectedChoice);

  const handleSelect = (choiceId: string) => {
    if (isAnswered || isRevealing) return;

    setIsRevealing(true);
    setAnswers((prev) => ({ ...prev, [currentStep]: choiceId }));
    setTimeout(() => setIsRevealing(false), 850); // Micro-delay SOTA
  };

  return (
    <div className="max-w-200 my-12 mx-auto p-8 bg-slate-900/60 rounded-xl border border-white/5">
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <h2 className="m-0 text-[1.25rem] text-text-light font-extrabold uppercase tracking-[0.05em]">
          Teste Prático: Lente de Perspectiva
        </h2>
        <span className="text-[0.85rem] text-text-dim font-mono">
          {isFinished
            ? "Síntese Final"
            : `Cenário 0${currentStep + 1} de 0${scenarios.length}`}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {isFinished ? (
          <QuizSynthesis
            onRestart={() => {
              setAnswers({});
              setCurrentStep(0);
              setIsRevealing(false);
            }}
          />
        ) : (
          <ActiveScenarioStep
            scenario={scenario}
            currentStep={currentStep}
            selectedChoice={selectedChoice}
            isAnswered={isAnswered}
            isRevealing={isRevealing}
            choiceData={choiceData}
            onSelect={handleSelect}
          />
        )}
      </AnimatePresence>

      {/* Navegação SOTA */}
      {!isFinished && (
        <div className="flex justify-between mt-8 pt-4 border-t border-white/5">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`py-2 px-4 rounded-md font-semibold transition-all duration-200 border ${currentStep === 0 ? "bg-transparent text-white/10 border-white/5 cursor-not-allowed" : "bg-transparent text-text-dim border-white/20 cursor-pointer"}`}
          >
            &larr; Voltar
          </button>
          <button
            onClick={() => setCurrentStep((prev) => prev + 1)}
            disabled={!isAnswered || isRevealing}
            className={`py-2 px-6 rounded-md font-bold transition-all duration-200 border-none ${isAnswered && !isRevealing ? "bg-accent-indigo text-white cursor-pointer" : "bg-indigo-500/10 text-white/30 cursor-not-allowed"}`}
          >
            {currentStep === scenarios.length - 1
              ? "Ver Síntese"
              : "Avançar \u2192"}
          </button>
        </div>
      )}
    </div>
  );
}
