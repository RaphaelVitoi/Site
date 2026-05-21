/**
 * IDENTITY: Whitepaper ICM — Teoria da Perspectiva Matemática
 * PATH: src/app/aulas/leitura-icm/page.tsx
 * ROLE: Framework completo: RP vs BF, hierarquia cognitiva (E/P/E),
 *       extensão do ICM EV, conceitos originais do motor SOTA.
 * BINDING: [layout.tsx, globals.css, SectionHeader, ContentFooter]
 */

import ContentFooter from "@/components/content/ContentFooter";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";

export const metadata = {
  title: "Teoria da Perspectiva Matemática | Poker Racional",
  description:
    "O framework definitivo de ICM: Expectativa, Perspectiva, Esperança e a mecânica oculta do ICM Pós-Flop.",
};

export default function TeoriaICMPage() {
  const pageUrl = "https://www.pokerracional.com/aulas/leitura-icm";
  const pageTitle = "Teoria da Perspectiva Matemática | Poker Racional";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden">
      {/* Header Central de Página */}
      <div className="max-w-300 mx-auto pt-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[clamp(1.4rem,3vw,2rem)] font-black m-0 tracking-tight text-transparent bg-clip-text bg-linear-to-r from-text-main to-text-muted">
              Teoria da Perspectiva Matemática
            </h1>
            <p className="mt-2 mb-0 text-xs text-text-muted leading-relaxed max-w-145">
              {`Um framework de alta resolução que desloca a análise do Poker de um modelo de \u201cestado\u201d estático (`}
              <span className="whitespace-nowrap">
                ICM<sub>ev</sub>
              </span>
              {`) para uma análise de \u201cfluxo\u201d dinâmica, integrando Teoria dos Sistemas, Lógica Bayesiana e Psicologia.`}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-indigo/15 border border-accent-indigo/30 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />{" "}
                Whitepaper
              </span>
              <span className="text-[0.7rem] text-text-light font-bold font-mono">
                Framework ICM
              </span>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-white/5 text-text-muted text-[0.7rem] font-semibold flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-arrow-left text-[0.65rem]"></i> Início
            </Link>
          </div>
        </div>
      </div>

      {/* 01: Risk Premium vs Bubble Factor */}
      <SectionHeader
        step="01"
        label="Calibração"
        title="Risk Premium vs. Bubble Factor"
        description="Duas réguas de medição da pressão ICM. Definições, relação matemática e por que RP é o padrão do motor."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>
              Antes de mergulhar na Perspectiva, é essencial calibrar as réguas
              de medição de pressão do torneio. É fundamental distinguir entre{" "}
              <strong>Ruído de Simulação</strong> (comum em modelos
              simplificados como GTO Wizard pós-flop) e a{" "}
              <strong>Influência Real do ICM</strong>. No Framework ICM,
              calibramos o motor contra os 93 nodes do HRC para garantir que os
              desvios observados sejam fruto da matemática de colisão, e não de
              imprecisões algorítmicas (e-Nash).
            </p>

            <ul className="ml-6 text-text-main leading-relaxed list-disc">
              <li>
                <strong>Bubble Factor (BF):</strong> A razão matemática entre o
                que se PERDE em ICM equity ao perder um pote vs o que se GANHA
                ao vencê-lo (BF = Loss / Gain). O BF cresce assintoticamente
                (ex: 1,27&times;, 2,5&times;, 15&times;), o que obscurece a
                percepção da magnitude real da pressão.
              </li>
              <li>
                <strong>Risk Premium (RP):</strong> É a equity adicional, acima
                das pot odds puras, necessária para justificar um call. O motor
                SOTA adota o RP como padrão pois ele opera em uma{" "}
                <strong>escala percentual intuitiva</strong> (0% a ~24% em mesas
                finais reais; teto teórico mais alto em cenários extremos).
              </li>
            </ul>

            <div className="callout callout-emerald my-8">
              <h4 className="mt-0 text-accent-emerald">Relação Matemática</h4>
              <p className="font-mono text-sm text-accent-indigo-light leading-relaxed">
                RP = 100 &times; (BF &minus; 1) / BF
              </p>
              <p className="mb-0">
                Por que usar &Delta;RP (Risk Advantage)? Subtrair RPs (IP
                &minus; OOP) gera um delta percentual linear que dita
                diretamente a proporção de agressividade permitida em um
                cenário. O BF não permite essa extração de forma natural.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 02: Hierarquia Cognitiva */}
      <SectionHeader
        step="02"
        label="Paradigma"
        title="A Hierarquia Cognitiva da Decisão"
        description="Quatro camadas: ICM EV, Esperança, Expectativa e Perspectiva. Do snapshot financeiro à síntese definitiva."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <h3>
              Camada 1: O Axioma do EV do Fold e o ICM<sub>ev</sub> Estático
            </h3>
            <p>
              A premissa comercial de que &ldquo;foldar tem EV zero&rdquo; é uma
              simplificação que oculta o custo de oportunidade. O fold é uma
              transação de capital.
            </p>
            <ul className="ml-6 text-text-main leading-relaxed list-disc">
              <li>
                <strong>ChipEV:</strong>{" "}
                <span className="whitespace-nowrap">
                  EV<sub>fold</sub>
                </span>{" "}
                = &minus;antes. O piso é negativo. Para uma ação ser coerente,
                ela não precisa ter EV positivo, basta superar o abismo do fold.
              </li>
              <li>
                <strong>O Paradoxo do ICM:</strong> Em bolhas ou payjumps, o
                <span className="whitespace-nowrap">
                  {" "}
                  EV<sub>fold</sub>
                </span>{" "}
                pode ser
                <strong> Positivo</strong> (&ldquo;passar a vez&rdquo; gera
                valor passivo). No pós-flop, o<strong> Pot Entrapment</strong>{" "}
                torna o
                <span className="whitespace-nowrap">
                  {" "}
                  EV<sub>fold</sub>
                </span>{" "}
                violentamente negativo (desistir do pote custa exponencialmente
                mais em valuation do que o risco residual). O
                <span className="whitespace-nowrap">
                  {" "}
                  ICM<sub>ev</sub>
                </span>{" "}
                calcula isso como um &ldquo;snapshot&rdquo; (como se o torneio
                acabasse na mão atual).
              </li>
            </ul>

            <h3>Camada 2: Esperança Matemática</h3>
            <p>
              A métrica estratégico-lógica. Responde: &ldquo;o que posso
              concretamente buscar neste cenário em termos de probabilidades,
              riscos e ganhos?&rdquo; Não é o que o jogador quer — é o que a
              matemática sustenta como expectativa realizável de melhora de
              posição.
            </p>
            <div className="callout callout-secondary my-8">
              <p className="font-mono text-[0.85rem] text-text-main leading-relaxed mb-2">
                {`Esperança(ação) = P(win) \u00d7 `}
                <span className="whitespace-nowrap">
                  &Delta;Perspectiva<sub>ganho</sub>
                </span>
                {` + P(lose) \u00d7 `}
                <span className="whitespace-nowrap">
                  &Delta;Perspectiva<sub>perda</sub>
                </span>
              </p>
              <p className="mb-0">
                <strong>
                  A decisão ótima é aquela que maximiza a Esperança, não o ICM
                  EV do pote isolado.
                </strong>
              </p>
            </div>

            <h3>Camada 3: Expectativa Matemática</h3>
            <p>
              Opera com cadeia preditiva: &ldquo;SE isso acontecer, o que
              representa no meu FGS de positivo/negativo? Quanto afeta o ICM EV
              e principalmente a minha Esperança Matemática futura?&rdquo;
              Integra a <strong>Antevisão</strong> (ex: o salto iminente de
              blinds em t&minus;3 degrada a utilidade do stack, alterando a
              urgência). A Expectativa captura consequências encadeadas que a
              Esperança imediata não alcança.
            </p>

            <h3>Camada 4: Perspectiva Matemática</h3>
            <p>
              A síntese definitiva e fechada. Não é o output simples das camadas
              anteriores — é uma métrica que{" "}
              <strong>aprendeu iterativamente</strong> de todas elas (ICM EV,
              Esperança, Expectativa com FGS integrado). A distribuição de
              probabilidade sobre os outcomes possíveis (1&ordm;, 2&ordm;, ...
              N&ordm;) dado o estado dinâmico da mesa. Minha Perspectiva aumenta
              quando a dos outros cai. Substitui o ICM EV como refinamento
              superior.
            </p>
          </div>
        </div>
      </div>

      {/* 03: Dinâmica Oculta */}
      <SectionHeader
        step="03"
        label="Extensão"
        title="Dinâmica Oculta: A Extensão do ICM EV Puro"
        description="Fenômenos que o ICM clássico não justifica: paradoxo do CL, Fator Psi e o veneno das RIO."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <h3>
              1. O Paradoxo do Chip Leader (Economia de Perspectiva vs Fichas)
            </h3>
            <p>
              O ICM puro dita que fichas perdidas valem mais que fichas ganhas,
              sugerindo passividade ao CL. A realidade: o CL é hiperagressivo.
              Por quê?{" "}
              <strong>
                O CL não briga por fichas, briga por Perspectiva Matemática.
              </strong>{" "}
              Ele aposta para negar a Perspectiva alheia. Agressividade mantém
              os mid-stacks sob o limiar de ameaça.
            </p>

            <h3>2. O Fator &Psi; (A Taxa de Maluquice Humana)</h3>
            <p>
              Se a probabilidade de o oponente ter nuts é de 4%, mas a taxa
              estatística de <em>&ldquo;Bobagem Humana&rdquo;</em> (tilt, erro
              cognitivo) no spot é de 10%, a Esperança Matemática exige o call,
              ignorando o conservadorismo GTO.
            </p>

            <h3>3. O Veneno das RIO e a Falácia das Pot Odds</h3>
            <p>
              Pot Odds são uma heurística engessada de finanças básicas. Elas
              mascaram as <strong>Reverse Implied Odds (RIO)</strong>. Pagar
              pelas odds atrai a especulação, prendendo o jogador a um passivo
              estrutural onde ele acerta a mão marginal e perde um pote
              gigantesco. Na Perspectiva, um{" "}
              <span className="whitespace-nowrap">
                EV<sub>fold</sub>
              </span>{" "}
              negativo é superior a um investimento barato insolvente.
              gigantesco. Na Perspectiva, um{" "}
              <span className="whitespace-nowrap">
                EV<sub>fold</sub>
              </span>{" "}
              negativo é superior a um investimento barato insolvente.
            </p>
          </div>
        </div>
      </div>

      {/* 04: Conceitos Originais */}
      <SectionHeader
        step="04"
        label="Motor"
        title="Conceitos Originais: O Motor SOTA"
        description="Os axiomas que compõem a física do motor Framework ICM. Cada conceito opera como uma grandeza calculável."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <ul className="ml-6 text-text-main leading-relaxed list-disc">
              <li>
                <strong>O Teto do RP:</strong> Não é um valor fixo — emerge da
                equação conforme os RPs, payjumps e N players interagem. A
                âncora empírica é 24% (maior RP observado em mesas finais
                reais). O OOP não defende pelo MDF clássico, mas até onde o RP
                permite. Conforme o RP cresce, a capacidade de defesa comprime
                assintoticamente — o fold estrutural se amplia mesmo se o IP
                expandir blefes.
              </li>
              <li>
                <strong>&Delta;RP (Diferencial de Risco):</strong> RP
                <sub>IP</sub> &minus; RP<sub>OOP</sub>. A subtração representa
                quanto a maior stack (RP menor) pode agredir proporcionalmente,
                e define o teto abstrativo de defesa para a stack menor (RP
                maior).
              </li>
              <li>
                <strong>Especulação Assimétrica:</strong> Mid-stacks entram no
                pote por <em>implied odds</em> de ICM, não pot odds. Investem
                pouco, absorvem pressão, e se acertam, a Expectativa explode. O
                inverso de &ldquo;tighten up&rdquo;.
              </li>
              <li>
                <strong>Fold Estrutural:</strong> Foldar 75% contra o CL não é
                &ldquo;overfold&rdquo; (vício de linguagem do ChipEV). É o
                equilíbrio GTO estrutural sob ICM extremo.
              </li>
              <li>
                <strong>Inversão de Extremos:</strong> Quando a Vantagem de
                Risco é imensa, o ICM torna-se <strong>MAIS agressivo</strong>{" "}
                que o ChipEV, rompendo o teto de bluff do solver clássico.
              </li>
              <li>
                <strong>Efeito Irradiação:</strong> Um micro-stack não precisa
                jogar uma mão para alterar o Nash de todos. Sua existência
                altera as funções de utilidade. A variável sobrevivência
                suplanta a equidade das cartas.
              </li>
              <li>
                <strong>Donk Bet &ldquo;Ataque Defensivo&rdquo;:</strong> O ICM
                algema o IP (forçando check-backs). O OOP cria um &ldquo;ataque
                defensivo&rdquo; liderando pequeno (10%) para proteger a
                equidade, pois o IP não pode punir com raise sem violar seu
                próprio incentivo ICM.
              </li>
              <li>
                <strong>Faixas Ponderadas:</strong> O RP é uma abstração, não um
                número fixo. O motor SOTA emite distribuições com centro de
                gravidade (matemática pura) e limites de abstração (edge humana,
                histórico).{" "}
                <em>&ldquo;Honesto é melhor que falso-preciso.&rdquo;</em>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 05: Downward Drift */}
      <SectionHeader
        step="05"
        label="Atribuição"
        title="O Downward Drift"
        description="O conceito central de O'Kearney & Carter e a contribuição original do motor SOTA."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>
              O conceito de <strong>Downward Drift</strong> — a heurística de
              que sob pressão ICM as ações migram um degrau para baixo na escala
              de agressividade (grandes apostas viram médias, pequenas viram
              checks) — é atribuído à literatura de{" "}
              <strong>Dara O&apos;Kearney &amp; Barry Carter</strong>.
            </p>
            <div className="callout callout-emerald my-8">
              <h4 className="mt-0 text-accent-emerald">
                Contribuição Vitoi (SOTA)
              </h4>
              <p className="mb-0">
                A formalização e quantificação do mecanismo qualitativo de
                O&apos;Kearney em uma equação de coeficientes dinâmicos baseada
                em dissipação de RP por street e calibração matricial (Opção B
                do Motor SOTA).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referências e Atribuições */}
      <div className="max-w-300 mx-auto px-6 pb-4">
        <div className="px-8 py-6 rounded-xl bg-slate-900/40 border border-white/5">
          <h4 className="m-0 mb-4 text-[0.65rem] font-black text-text-muted uppercase tracking-[0.15em]">
            Referências e Atribuições
          </h4>
          <ul className="m-0 pl-5 list-disc flex flex-col gap-2 text-[0.7rem] text-text-dim leading-relaxed">
            <li>
              <strong className="text-text-muted">Downward Drift</strong> — Dara
              O&apos;Kearney &amp; Barry Carter,{" "}
              <em>Endgame Poker Strategy: The ICM Book</em> (D&amp;B Publishing,
              2019). A quantificação via coeficientes{" "}
              <span className="whitespace-nowrap">
                k<sub>A</sub>
              </span>{" "}
              e expoente b é extensão original deste framework. 2019). A
              quantificação via coeficientes{" "}
              <span className="whitespace-nowrap">
                k<sub>A</sub>
              </span>{" "}
              e expoente b é extensão original deste framework.
            </li>
            <li>
              <strong className="text-text-muted">
                ICM (Independent Chip Model)
              </strong>{" "}
              — Algoritmo de Malmuth-Harville para conversão de stacks em equity
              monetária.
            </li>
            <li>
              <strong className="text-text-muted">Dados de calibração</strong> —
              93 nodes HRC (Aula 1.2). BTN 38bb vs BB 53bb, Risk Advantage
              +8.5pp.
            </li>
            <li>
              <strong className="text-text-muted">Framework original</strong> —
              Perspectiva Matemática, Esperança, Expectativa, &Delta;RP, Teto do
              RP, Especulação Assimétrica, Fold Estrutural, Inversão de
              Extremos, Efeito Irradiação, Donk Bet ICM, Fator &Psi;: Raphael
              Vitoi (2025-2026).
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-300 mx-auto px-6 pb-12">
        <ContentFooter
          shareTitle={pageTitle}
          shareUrl={pageUrl}
          backLinkHref="/aulas"
          backLinkText="Voltar para Aulas"
        />
      </div>
    </div>
  );
}
