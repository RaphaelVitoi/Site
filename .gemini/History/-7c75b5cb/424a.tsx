/**
 * IDENTITY: Whitepaper ICM — Teoria da Perspectiva Matemática
 * PATH: src/app/aulas/leitura-icm/page.tsx
 * ROLE: Framework completo: RP vs BF, hierarquia cognitiva (E/P/E),
 *       extensão do ICM EV, conceitos originais do motor SOTA.
 * BINDING: [layout.tsx, globals.css, SectionHeader, ContentFooter]
 */

import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Teoria da Perspectiva Matemática | Poker Racional',
  description: 'O framework definitivo de ICM: Expectativa, Perspectiva, Esperança e a mecânica oculta do ICM Pós-Flop.',
};

export default function TeoriaICMPage() {
  const pageUrl = "https://www.pokerracional.com/aulas/leitura-icm";
  const pageTitle = "Teoria da Perspectiva Matemática | Poker Racional";

  return (
    <div style={ { minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-bright)', overflowX: 'hidden' } }>

      {/* Header Central de Página */ }
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 0' } }>
        <div style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' } }>
          <div>
            <h1 style={ {
              fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0,
              letterSpacing: '-0.03em', background: 'linear-gradient(to right, var(--text-main), var(--text-muted))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            } }>
              Teoria da Perspectiva Matemática
            </h1>
            <p style={ { margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '580px' } }>
              Um framework de alta resolução que desloca a análise do Poker de um modelo de &ldquo;estado&rdquo; estático (ICM<sub>ev</sub>) para uma análise de &ldquo;fluxo&rdquo; dinâmica, integrando Teoria dos Sistemas, Lógica Bayesiana e Psicologia.
            </p>
            <div style={ { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' } }>
              <span style={ {
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0.35rem 0.75rem', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-indigo-light)', textTransform: 'uppercase', letterSpacing: '0.1em',
              } }>
                <span style={ { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px rgba(16,185,129,0.5)' } } />
                { ' ' }Whitepaper
              </span>
              <span style={ { fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" } }>
                Framework ICM
              </span>
            </div>
          </div>

          <div style={ { display: 'flex', gap: '0.5rem', alignItems: 'center' } }>
            <Link href="/" style={ {
              padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)', fontSize: '0.7rem',
              fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
            } }>
              <i className="fa-solid fa-arrow-left" style={ { fontSize: '0.65rem' } }></i> Início
            </Link>
          </div>
        </div>
      </div>

      {/* 01: Risk Premium vs Bubble Factor */ }
      <SectionHeader
        step="01"
        label="Calibração"
        title="Risk Premium vs. Bubble Factor"
        description="Duas réguas de medição da pressão ICM. Definições, relação matemática e por que RP é o padrão do motor."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>
              Antes de mergulhar na Perspectiva, é essencial calibrar as réguas de medição de pressão do torneio.
              É fundamental distinguir entre <strong>Ruído de Simulação</strong> (comum em modelos simplificados como
              GTO Wizard pós-flop) e a <strong>Influência Real do ICM</strong>. No Framework ICM, calibramos o motor
              contra os 93 nodes do HRC para garantir que os desvios observados sejam fruto da matemática de colisão,
              e não de imprecisões algorítmicas (e-Nash).
            </p>

            <ul style={ { marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8 } }>
              <li>
                <strong>Bubble Factor (BF):</strong> A razão matemática entre o que se PERDE em ICM equity ao perder
                um pote vs o que se GANHA ao vencê-lo (BF = Loss / Gain). O BF cresce assintoticamente (ex: 1,27&times;,
                2,5&times;, 15&times;), o que obscurece a percepção da magnitude real da pressão.
              </li>
              <li>
                <strong>Risk Premium (RP):</strong> É a equity adicional, acima das pot odds puras, necessária para
                justificar um call. O motor SOTA adota o RP como padrão pois ele opera em uma <strong>escala percentual
                  intuitiva</strong> (0% a ~24% em mesas finais reais; teto teórico mais alto em cenários extremos).
              </li>
            </ul>

            <div className="callout callout-emerald my-8">
              <h4 style={ { marginTop: 0, color: 'var(--accent-emerald)' } }>Relação Matemática</h4>
              <p style={ { fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-primary)', lineHeight: 1.8 } }>
                RP = 100 &times; (BF &minus; 1) / BF
              </p>
              <p style={ { marginBottom: 0 } }>
                Por que usar &Delta;RP (Risk Advantage)? Subtrair RPs (IP &minus; OOP) gera um delta percentual linear
                que dita diretamente a proporção de agressividade permitida em um cenário. O BF não permite essa
                extração de forma natural.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 02: Hierarquia Cognitiva */ }
      <SectionHeader
        step="02"
        label="Paradigma"
        title="A Hierarquia Cognitiva da Decisão"
        description="Quatro camadas: ICM EV, Esperança, Expectativa e Perspectiva. Do snapshot financeiro à síntese definitiva."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">

            <h3>Camada 1: O Axioma do EV do Fold e o ICM<sub>ev</sub> Estático</h3>
            <p>
              A premissa comercial de que &ldquo;foldar tem EV zero&rdquo; é uma simplificação que oculta
              o custo de oportunidade. O fold é uma transação de capital.
            </p>
            <ul style={ { marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8 } }>
              <li>
                <strong>ChipEV:</strong> EV<sub>fold</sub> = &minus;antes. O piso é negativo. Para uma ação
                ser coerente, ela não precisa ter EV positivo, basta superar o abismo do fold.
              </li>
              <li>
                <strong>O Paradoxo do ICM:</strong> Em bolhas ou payjumps, o EV<sub>fold</sub> pode ser{ ' ' }
                <strong>Positivo</strong> (&ldquo;passar a vez&rdquo; gera valor passivo). No pós-flop, o{ ' ' }
                <strong>Pot Entrapment</strong> torna o EV<sub>fold</sub> violentamente negativo (desistir do
                pote custa exponencialmente mais em valuation do que o risco residual). O ICM<sub>ev</sub>{ ' ' }
                calcula isso como um &ldquo;snapshot&rdquo; (como se o torneio acabasse na mão atual).
              </li>
            </ul>

            <h3>Camada 2: Esperança Matemática</h3>
            <p>
              A métrica estratégico-lógica. Responde: &ldquo;o que posso concretamente buscar neste cenário
              em termos de probabilidades, riscos e ganhos?&rdquo; Não é o que o jogador quer — é o que a
              matemática sustenta como expectativa realizável de melhora de posição.
            </p>
            <div className="callout callout-secondary my-8">
              <p style={ { fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-secondary)', lineHeight: 1.8, marginBottom: '0.5rem' } }>
                Esperança(ação) = P(win) &times; &Delta;Perspectiva<sub>ganho</sub>{ ' ' }
                + P(lose) &times; &Delta;Perspectiva<sub>perda</sub>
              </p>
              <p style={ { marginBottom: 0 } }>
                <strong>A decisão ótima é aquela que maximiza a Esperança, não o ICM EV do pote isolado.</strong>
              </p>
            </div>

            <h3>Camada 3: Expectativa Matemática</h3>
            <p>
              Opera com cadeia preditiva: &ldquo;SE isso acontecer, o que representa no meu FGS de
              positivo/negativo? Quanto afeta o ICM EV e principalmente a minha Esperança Matemática
              futura?&rdquo; Integra a <strong>Antevisão</strong> (ex: o salto iminente de blinds em
              t&minus;3 degrada a utilidade do stack, alterando a urgência). A Expectativa captura
              consequências encadeadas que a Esperança imediata não alcança.
            </p>

            <h3>Camada 4: Perspectiva Matemática</h3>
            <p>
              A síntese definitiva e fechada. Não é o output simples das camadas anteriores — é uma métrica
              que <strong>aprendeu iterativamente</strong> de todas elas (ICM EV, Esperança, Expectativa com
              FGS integrado). A distribuição de probabilidade sobre os outcomes possíveis (1&ordm;, 2&ordm;,
              ... N&ordm;) dado o estado dinâmico da mesa. Minha Perspectiva aumenta quando a dos outros cai.
              Substitui o ICM EV como refinamento superior.
            </p>
          </div>
        </div>
      </div>

      {/* 03: Dinâmica Oculta */ }
      <SectionHeader
        step="03"
        label="Extensão"
        title="Dinâmica Oculta: A Extensão do ICM EV Puro"
        description="Fenômenos que o ICM clássico não justifica: paradoxo do CL, Fator Psi e o veneno das RIO."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">

            <h3>1. O Paradoxo do Chip Leader (Economia de Perspectiva vs Fichas)</h3>
            <p>
              O ICM puro dita que fichas perdidas valem mais que fichas ganhas, sugerindo passividade ao CL.
              A realidade: o CL é hiperagressivo. Por quê? <strong>O CL não briga por fichas, briga por
                Perspectiva Matemática.</strong> Ele aposta para negar a Perspectiva alheia. Agressividade mantém
              os mid-stacks sob o limiar de ameaça.
            </p>

            <h3>2. O Fator &Psi; (A Taxa de Maluquice Humana)</h3>
            <p>
              Se a probabilidade de o oponente ter nuts é de 4%, mas a taxa estatística de{ ' ' }
              <em>&ldquo;Bobagem Humana&rdquo;</em> (tilt, erro cognitivo) no spot é de 10%, a Esperança
              Matemática exige o call, ignorando o conservadorismo GTO.
            </p>

            <h3>3. O Veneno das RIO e a Falácia das Pot Odds</h3>
            <p>
              Pot Odds são uma heurística engessada de finanças básicas. Elas mascaram as{ ' ' }
              <strong>Reverse Implied Odds (RIO)</strong>. Pagar pelas odds atrai a especulação, prendendo o
              jogador a um passivo estrutural onde ele acerta a mão marginal e perde um pote gigantesco. Na
              Perspectiva, um EV<sub>fold</sub> negativo é superior a um investimento barato insolvente.
            </p>
          </div>
        </div>
      </div>

      {/* 04: Conceitos Originais */ }
      <SectionHeader
        step="04"
        label="Motor"
        title="Conceitos Originais: O Motor SOTA"
        description="Os axiomas que compõem a física do motor Framework ICM. Cada conceito opera como uma grandeza calculável."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <ul style={ { marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8 } }>
              <li>
                <strong>O Teto do RP:</strong> Não é um valor fixo — emerge da equação conforme os RPs,
                payjumps e N players interagem. A âncora empírica é 24% (maior RP observado em mesas finais
                reais). O OOP não defende pelo MDF clássico, mas até onde o RP permite. Conforme o RP cresce,
                a capacidade de defesa comprime assintoticamente — o fold estrutural se amplia mesmo se o IP
                expandir blefes.
              </li>
              <li>
                <strong>&Delta;RP (Diferencial de Risco):</strong> RP<sub>IP</sub> &minus; RP<sub>OOP</sub>.
                A subtração representa quanto a maior stack (RP menor) pode agredir proporcionalmente, e define
                o teto abstrativo de defesa para a stack menor (RP maior).
              </li>
              <li>
                <strong>Especulação Assimétrica:</strong> Mid-stacks entram no pote por <em>implied odds</em>{ ' ' }
                de ICM, não pot odds. Investem pouco, absorvem pressão, e se acertam, a Expectativa explode.
                O inverso de &ldquo;tighten up&rdquo;.
              </li>
              <li>
                <strong>Fold Estrutural:</strong> Foldar 75% contra o CL não é &ldquo;overfold&rdquo; (vício
                de linguagem do ChipEV). É o equilíbrio GTO estrutural sob ICM extremo.
              </li>
              <li>
                <strong>Inversão de Extremos:</strong> Quando a Vantagem de Risco é imensa, o ICM torna-se{ ' ' }
                <strong>MAIS agressivo</strong> que o ChipEV, rompendo o teto de bluff do solver clássico.
              </li>
              <li>
                <strong>Efeito Irradiação:</strong> Um micro-stack não precisa jogar uma mão para alterar o
                Nash de todos. Sua existência altera as funções de utilidade. A variável sobrevivência suplanta
                a equidade das cartas.
              </li>
              <li>
                <strong>Donk Bet &ldquo;Ataque Defensivo&rdquo;:</strong> O ICM algema o IP (forçando check-backs).
                O OOP cria um &ldquo;ataque defensivo&rdquo; liderando pequeno (10%) para proteger a equidade,
                pois o IP não pode punir com raise sem violar seu próprio incentivo ICM.
              </li>
              <li>
                <strong>Faixas Ponderadas:</strong> O RP é uma abstração, não um número fixo. O motor SOTA
                emite distribuições com centro de gravidade (matemática pura) e limites de abstração (edge
                humana, histórico). <em>&ldquo;Honesto é melhor que falso-preciso.&rdquo;</em>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 05: Downward Drift */ }
      <SectionHeader
        step="05"
        label="Atribuição"
        title="O Downward Drift"
        description="O conceito central de O'Kearney & Carter e a contribuição original do motor SOTA."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>
              O conceito de <strong>Downward Drift</strong> — a heurística de que sob pressão ICM as ações
              migram um degrau para baixo na escala de agressividade (grandes apostas viram médias, pequenas
              viram checks) — é atribuído à literatura de <strong>Dara O&apos;Kearney &amp; Barry Carter</strong>.
            </p>
            <div className="callout callout-emerald my-8">
              <h4 style={ { marginTop: 0, color: 'var(--accent-emerald)' } }>Contribuição Vitoi (SOTA)</h4>
              <p style={ { marginBottom: 0 } }>
                A formalização e quantificação do mecanismo qualitativo de O&apos;Kearney em uma equação de
                coeficientes dinâmicos baseada em dissipação de RP por street e calibração matricial (Opção B
                do Motor SOTA).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referências e Atribuições */ }
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 1rem' } }>
        <div style={ { padding: '1.5rem 2rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)' } }>
          <h4 style={ { margin: '0 0 1rem', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' } }>
            Referências e Atribuições
          </h4>
          <ul style={ { margin: 0, padding: '0 0 0 1.2rem', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.6 } }>
            <li>
              <strong style={ { color: 'var(--text-muted)' } }>Downward Drift</strong> — Dara O&apos;Kearney &amp; Barry Carter,{ ' ' }
              <em>Endgame Poker Strategy: The ICM Book</em> (D&amp;B Publishing, 2019). A quantificação via coeficientes
              k<sub>A</sub> e expoente b é extensão original deste framework.
            </li>
            <li>
              <strong style={ { color: 'var(--text-muted)' } }>ICM (Independent Chip Model)</strong> — Algoritmo de Malmuth-Harville
              para conversão de stacks em equity monetária.
            </li>
            <li>
              <strong style={ { color: 'var(--text-muted)' } }>Dados de calibração</strong> — 93 nodes HRC (Aula 1.2). BTN 38bb vs BB 53bb,
              Risk Advantage +8.5pp.
            </li>
            <li>
              <strong style={ { color: 'var(--text-muted)' } }>Framework original</strong> — Perspectiva Matemática, Esperança, Expectativa,
              &Delta;RP, Teto do RP, Especulação Assimétrica, Fold Estrutural, Inversão de Extremos, Efeito Irradiação,
              Donk Bet ICM, Fator &Psi;: Raphael Vitoi (2025-2026).
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */ }
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <ContentFooter
          shareTitle={ pageTitle }
          shareUrl={ pageUrl }
          backLinkHref="/aulas"
          backLinkText="Voltar para Aulas"
        />
      </div>
    </div>
  );
}
