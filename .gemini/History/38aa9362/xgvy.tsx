/**
 * IDENTITY: Glossário Formal — Framework ICM
 * PATH: src/app/aulas/conceitos-icm/page.tsx
 * ROLE: Definição formal dos cinco conceitos fundacionais do framework ICM de Raphael Vitoi.
 *       RP vs BF, Expectativa, Perspectiva e Esperança Matemática, separação de ICM EV puro.
 * BINDING: [layout.tsx, globals.css]
 */

import Link from 'next/link';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Conceitos ICM | Raphael Vitoi',
  description:
    'Definição formal de Risk Premium, Bubble Factor, Expectativa, Perspectiva e Esperança Matemática — o framework que estende ICM EV para o espaço decisório do torneio inteiro.',
};

const toc = [
  {
    num: '01',
    id: 'rp-vs-bf',
    label: 'Fundamento',
    title: 'Risk Premium vs. Bubble Factor',
    desc: 'Dois lados da mesma assimetria. Definições, relação matemática e por que RP é o padrão do framework.',
  },
  {
    num: '02',
    id: 'esperanca',
    label: 'Estratégico-Lógica',
    title: 'Esperança Matemática',
    desc: 'A métrica de decisão correta: ganho esperado em posição de torneio de uma ação específica.',
  },
  {
    num: '03',
    id: 'expectativa',
    label: 'Preditiva',
    title: 'Expectativa Matemática',
    desc: 'SE isso acontecer, o que muda no meu FGS e na minha Esperança futura? Cadeia de consequências encadeadas.',
  },
  {
    num: '04',
    id: 'perspectiva',
    label: 'Síntese',
    title: 'Perspectiva Matemática',
    desc: 'Síntese definitiva e fechada. Aprendeu iterativamente de todas as camadas. Substitui o ICM EV como refinamento superior.',
  },
  {
    num: '05',
    id: 'separacao',
    label: 'Estrutura',
    title: 'Extensão do ICM EV',
    desc: 'O que ICM EV captura, o que o framework adiciona, e por que não são concorrentes.',
  },
] as const;

export default function ConceitosICM() {
  return (
    <main className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1.5rem' }}>
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', overflowX: 'hidden' }}>

      {/* ==================== HEADER ==================== */}
      <header className="page-header" style={{ paddingBottom: '1rem' }}>
        <p className="page-label">Documento Técnico &bull; Framework ICM</p>
        <h1 style={{
          background: 'linear-gradient(135deg, #fff 0%, #6366f1 50%, #38bdf8 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 800,
          lineHeight: 1.2,
          marginTop: 0,
        }}>
          Glossário Formal do Framework
        </h1>
        <p className="page-subtitle">
          Risk Premium, Perspectiva, Esperança e Expectativa Matemática — os conceitos que organizam
          o raciocínio ICM pós-flop para além do EV de pot isolado.
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          Autor: Raphael Vitoi &bull; 2026
        </p>
      </header>
      {/* Header Central de Página */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0,
              letterSpacing: '-0.03em', background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Glossário Formal
            </h1>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '580px' }}>
              Risk Premium, Perspectiva, Esperança e Expectativa Matemática — os conceitos que organizam o raciocínio ICM pós-flop para além do EV de pot isolado.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0.35rem 0.75rem', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
                Glossário
              </span>
              <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                Framework ICM
              </span>
            </div>
          </div>

      {/* ==================== ÍNDICE ==================== */}
      <section style={{
        marginBottom: '4rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '2rem',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.2))' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.24em' }}>
            Índice
          </span>
          <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(99,102,241,0.2))' }} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link href="/" style={{
              padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8', fontSize: '0.7rem',
              fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.65rem' }}></i> Início
            </Link>
          </div>
        </div>
      </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', marginBottom: '0.25rem' }} />
      {/* ==================== ÍNDICE ==================== */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
        <section style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '2rem',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.2))' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.24em' }}>
              Índice
            </span>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(99,102,241,0.2))' }} />
          </div>

        {toc.map(({ num, id, label, title, desc }) => (
          <a key={id} href={`#${id}`} className="toc-row">
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '1.1rem',
              fontWeight: 900,
              color: 'var(--accent-primary)',
              opacity: 0.6,
              lineHeight: 1,
            }}>{num}</span>
            <div>
              <strong style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                display: 'block',
                marginBottom: '0.2rem',
              }}>{title}</strong>
          <div style={{ height: '1px', background: 'var(--glass-border)', marginBottom: '0.25rem' }} />

          {toc.map(({ num, id, label, title, desc }) => (
            <a key={id} href={`#${id}`} className="toc-row">
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                lineHeight: 1.45,
              }}>{desc}</span>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              fontWeight: 700,
              color: 'var(--accent-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              whiteSpace: 'nowrap',
            }}>{label} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
          </a>
        ))}
      </section>
                fontFamily: 'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '1.1rem',
                fontWeight: 900,
                color: 'var(--accent-primary)',
                opacity: 0.6,
                lineHeight: 1,
              }}>{num}</span>
              <div>
                <strong style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  display: 'block',
                  marginBottom: '0.2rem',
                }}>{title}</strong>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.45,
                }}>{desc}</span>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                whiteSpace: 'nowrap',
              }}>{label} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
            </a>
          ))}
        </section>
      </div>

      <article>

        {/* ==================== 1. RP VS BF ==================== */}
        <h2 id="rp-vs-bf" style={{ scrollMarginTop: '5rem' }}>1. Risk Premium vs. Bubble Factor</h2>
      <div id="rp-vs-bf">
        <SectionHeader
          step="01"
          label="Fundamento"
          title="Risk Premium vs. Bubble Factor"
          description="Dois lados da mesma assimetria. Definições, relação matemática e por que RP é o padrão do framework."
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
          <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
            <div className="prose prose-invert prose-lg max-w-none text-slate-300">
              <p>
                ICM impõe assimetria ao valor das fichas: cada chip perdido vale mais do que cada chip
                ganho, e a magnitude dessa assimetria varia por jogador conforme sua stack e a estrutura
                de pagamentos. Essa assimetria pode ser expressa de duas formas. O <strong>Risk
                  Premium (RP)</strong> e o <strong>Bubble Factor (BF)</strong> medem o mesmo fenômeno
                — mas de ângulos diferentes.
              </p>

        <p>
          ICM impõe assimetria ao valor das fichas: cada chip perdido vale mais do que cada chip
          ganho, e a magnitude dessa assimetria varia por jogador conforme sua stack e a estrutura
          de pagamentos. Essa assimetria pode ser expressa de duas formas. O <strong>Risk
            Premium (RP)</strong> e o <strong>Bubble Factor (BF)</strong> medem o mesmo fenômeno
          — mas de ângulos diferentes.
        </p>
              <h3>Risk Premium</h3>
              <p>
                O RP é a equity adicional, acima dos pot odds puros, que um jogador precisa ter para
                justificar um call de all-in sob a pressão do ICM. É um percentual que responde à
                pergunta: <em>quanto a mais do que o equilíbrio de ChipEV eu preciso ganhar para que
                  este call tenha EV positivo em torneio?</em>
              </p>
              <p>
                Um jogador com RP de 21% que enfrenta pot odds de 33% (call 1/3 do pote) precisa
                ter equity suficiente para cobrir os 33% de pot odds <em>mais</em> 21% de custo ICM.
                Em prática: só chama se a equity esperada superar a barreira ICM.
              </p>

        <h3>Risk Premium</h3>
        <p>
          O RP é a equity adicional, acima dos pot odds puros, que um jogador precisa ter para
          justificar um call de all-in sob a pressão do ICM. É um percentual que responde à
          pergunta: <em>quanto a mais do que o equilíbrio de ChipEV eu preciso ganhar para que
            este call tenha EV positivo em torneio?</em>
        </p>
        <p>
          Um jogador com RP de 21% que enfrenta pot odds de 33% (call 1/3 do pote) precisa
          ter equity suficiente para cobrir os 33% de pot odds <em>mais</em> 21% de custo ICM.
          Em prática: só chama se a equity esperada superar a barreira ICM.
        </p>
              <h3>Bubble Factor</h3>
              <p>
                O BF é um multiplicador: pelo quanto os pot odds precisam ser multiplicados para
                refletir a pressão ICM. BF = 1,0 em ChipEV puro; cresce conforme a pressão aumenta.
                BF = 1,27 significa que você precisa de 27% a mais de equity do que os pot odds
                exigiriam em ChipEV.
              </p>

        <h3>Bubble Factor</h3>
        <p>
          O BF é um multiplicador: pelo quanto os pot odds precisam ser multiplicados para
          refletir a pressão ICM. BF = 1,0 em ChipEV puro; cresce conforme a pressão aumenta.
          BF = 1,27 significa que você precisa de 27% a mais de equity do que os pot odds
          exigiriam em ChipEV.
        </p>
              <div className="callout callout-emerald my-8">
                <h4 style={{ marginTop: 0, color: 'var(--accent-emerald)' }}>Relação Matemática</h4>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
                  BF = 100 / (100 &minus; RP)
                </p>
                <p>
                  Equivalentemente: RP = 100 &times; (1 &minus; 1/BF)
                </p>
                <p style={{ marginBottom: 0 }}>
                  Exemplo: RP de 21% &rarr; BF = 100 / 79 &asymp; 1,27.<br/>
                  Exemplo inverso: BF de 1,5 &rarr; RP = 100 &times; (1 &minus; 1/1,5) &asymp; 33%.
                </p>
              </div>

        <div className="callout">
          <h4 style={{ marginTop: 0 }}>Relação Matemática</h4>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
            BF = 100 / (100 &minus; RP)
          </p>
          <p>
            Equivalentemente: RP = 100 &times; (1 &minus; 1/BF)
          </p>
          <p style={{ marginBottom: 0 }}>
            Exemplo: RP de 21% &rarr; BF = 100 / 79 &asymp; 1,27.
            Exemplo inverso: BF de 1,5 &rarr; RP = 100 &times; (1 &minus; 1/1,5) &asymp; 33%.
          </p>
              <h3>Por que RP é o padrão do framework</h3>
              <p>
                Ambos são matematicamente equivalentes. A escolha de RP como eixo central do
                framework não é arbitrária — três razões convergem:
              </p>
              <ol style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
                <li>
                  <strong>Escala percentual imediata.</strong> &ldquo;Seu RP é 21%&rdquo; é
                  operacionalmente claro: você precisa de 21 pontos percentuais adicionais de equity.
                  &ldquo;Seu BF é 1,27&rdquo; exige uma operação mental extra. Em sala de torneio,
                  a velocidade de leitura importa.
                </li>
                <li>
                  <strong>ΔRP funciona naturalmente em pontos percentuais.</strong> O eixo central do
                  motor ICM deste framework é ΔRP = RP_IP &minus; RP_OOP, expresso em pp. Toda a
                  distorção das 6 frequências pós-flop é organizada em torno desse diferencial. Se o
                  eixo fosse BF, a equação precisaria de razões de multiplicadores — menos intuitiva,
                  mais propensa a erro de calibração.
                </li>
                <li>
                  <strong>BF cresce assintoticamente e obscurece a magnitude.</strong> Quando RP
                  vai de 50% para 90%, o BF vai de 2,0 para 10,0 — um salto de 8× que parece enorme
                  mas representa pressão ICM extrema em ambos os casos. O RP linear deixa a diferença
                  visível: são apenas 40pp, mas já estamos em território de teto absoluto do framework.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

        <h3>Por que RP é o padrão do framework</h3>
        <p>
          Ambos são matematicamente equivalentes. A escolha de RP como eixo central do
          framework não é arbitrária — três razões convergem:
        </p>
        <ol style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
          <li>
            <strong>Escala percentual imediata.</strong> &ldquo;Seu RP é 21%&rdquo; é
            operacionalmente claro: você precisa de 21 pontos percentuais adicionais de equity.
            &ldquo;Seu BF é 1,27&rdquo; exige uma operação mental extra. Em sala de torneio,
            a velocidade de leitura importa.
          </li>
          <li>
            <strong>ΔRP funciona naturalmente em pontos percentuais.</strong> O eixo central do
            motor ICM deste framework é ΔRP = RP_IP &minus; RP_OOP, expresso em pp. Toda a
            distorção das 6 frequências pós-flop é organizada em torno desse diferencial. Se o
            eixo fosse BF, a equação precisaria de razões de multiplicadores — menos intuitiva,
            mais propensa a erro de calibração.
          </li>
          <li>
            <strong>BF cresce assintoticamente e obscurece a magnitude.</strong> Quando RP
            vai de 50% para 90%, o BF vai de 2,0 para 10,0 — um salto de 8× que parece enorme
            mas representa pressão ICM extrema em ambos os casos. O RP linear deixa a diferença
            visível: são apenas 40pp, mas já estamos em território de teto absoluto do framework.
          </li>
        </ol>

        <hr className="section-divider" />

        {/* ==================== 2. ESPERANÇA ==================== */}
        <h2 id="esperanca" style={{ scrollMarginTop: '5rem' }}>2. Esperança Matemática</h2>
      <div id="esperanca">
        <SectionHeader
          step="02"
          label="Estratégico-Lógica"
          title="Esperança Matemática"
          description="A métrica de decisão correta: ganho esperado em posição de torneio de uma ação específica."
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
          <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
            <div className="prose prose-invert prose-lg max-w-none text-slate-300">
              <p>
                A Esperança Matemática é a métrica de decisão estratégico-lógica do framework.
                Responde: <em>o que posso concretamente buscar neste cenário, em termos de probabilidades,
                  riscos e ganhos?</em> Não é o que o jogador quer — é o que a matemática sustenta como
                expectativa realizável de melhora de posição no torneio.
              </p>

        <p>
          A Esperança Matemática é a métrica de decisão estratégico-lógica do framework.
          Responde: <em>o que posso concretamente buscar neste cenário, em termos de probabilidades,
            riscos e ganhos?</em> Não é o que o jogador quer — é o que a matemática sustenta como
          expectativa realizável de melhora de posição no torneio.
        </p>
              <div className="callout callout-secondary my-8">
                <h4 style={{ marginTop: 0, color: 'var(--accent-secondary)' }}>Equação</h4>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-secondary)', lineHeight: 1.8 }}>
                  Esperança(ação) = P(ganhar) &times; &Delta;Equity<sub>ganho</sub>
                  &nbsp;+ P(perder) &times; &Delta;Equity<sub>perda</sub>
                </p>
                <p style={{ marginBottom: 0 }}>
                  Onde &Delta;Equity<sub>ganho</sub> é a variação na posição financeira do jogador no torneio
                  caso vença o pot, e &Delta;Equity<sub>perda</sub> é a variação caso perca. Ambas são
                  calculadas via Malmuth-Harville sobre o estado completo da mesa — stacks de todos,
                  payouts, jogadores restantes.
                </p>
              </div>

        <div className="callout callout-secondary">
          <h4 style={{ marginTop: 0 }}>Equação</h4>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)', lineHeight: 1.8 }}>
            Esperança(ação) = P(ganhar) &times; &Delta;Equity<sub>ganho</sub>
            &nbsp;+ P(perder) &times; &Delta;Equity<sub>perda</sub>
          </p>
          <p style={{ marginBottom: 0 }}>
            Onde &Delta;Equity<sub>ganho</sub> é a variação na posição financeira do jogador no torneio
            caso vença o pot, e &Delta;Equity<sub>perda</sub> é a variação caso perca. Ambas são
            calculadas via Malmuth-Harville sobre o estado completo da mesa — stacks de todos,
            payouts, jogadores restantes.
          </p>
        </div>
              <h3>Assimetria intrínseca</h3>
              <p>
                A Esperança captura naturalmente a assimetria que o ICM EV de pot tende a esconder.
                Mesmo que P(ganhar) e P(perder) sejam iguais (call breakeven em ChipEV),
                |&Delta;Equity<sub>perda</sub>| pode ser materialmente maior do que
                |&Delta;Equity<sub>ganho</sub>| — porque perder o pot pode eliminar o jogador
                ou colocá-lo em zona de curta stack, enquanto ganhar apenas aumenta uma stack já
                favorável.
              </p>
              <p>
                O sinal e a magnitude de &Delta;Equity<sub>perda</sub> dependem de onde o
                jogador está no espectro de stacks da mesa. Por isso, a Esperança de uma ação idêntica
                (mesmo pot, mesma equity) pode ser positiva para um mid-stack e negativa para um short
                stack — o referencial é o estado completo da mesa, não apenas o pot.
              </p>

        <h3>Assimetria intrínseca</h3>
        <p>
          A Esperança captura naturalmente a assimetria que o ICM EV de pot tende a esconder.
          Mesmo que P(ganhar) e P(perder) sejam iguais (call breakeven em ChipEV),
          |&Delta;Equity<sub>perda</sub>| pode ser materialmente maior do que
          |&Delta;Equity<sub>ganho</sub>| — porque perder o pot pode eliminar o jogador
          ou colocá-lo em zona de curta stack, enquanto ganhar apenas aumenta uma stack já
          favorável.
        </p>
        <p>
          O sinal e a magnitude de &Delta;Equity<sub>perda</sub> dependem de onde o
          jogador está no espectro de stacks da mesa. Por isso, a Esperança de uma ação idêntica
          (mesmo pot, mesma equity) pode ser positiva para um mid-stack e negativa para um short
          stack — o referencial é o estado completo da mesa, não apenas o pot.
        </p>
              <h3>EV do fold como threshold correto</h3>
              <p>
                A decisão ótima maximiza Esperança contra o baseline de fold, não contra zero.
                Em ChipEV, o EV do fold é sempre negativo em torneios (equivale a &minus;antes).
                Em ICM, o EV do fold <em>pode ser positivo</em>: foldar quando há short stacks
                prestes a ser eliminados gera payjumps passivos sem investimento.
              </p>
              <div className="callout my-8">
                <p style={{ marginBottom: 0 }}>
                  <strong>Threshold correto:</strong> uma ação é superior ao fold se, e somente se,
                  Esperança(ação) &gt; EV_fold. Uma Esperança negativa ainda pode ser a decisão
                  correta — desde que seja menos negativa do que o fold.
                </p>
              </div>

        <h3>EV do fold como threshold correto</h3>
        <p>
          A decisão ótima maximiza Esperança contra o baseline de fold, não contra zero.
          Em ChipEV, o EV do fold é sempre negativo em torneios (equivale a &minus;antes).
          Em ICM, o EV do fold <em>pode ser positivo</em>: foldar quando há short stacks
          prestes a ser eliminados gera payjumps passivos sem investimento.
        </p>
        <div className="callout">
          <p style={{ marginBottom: 0 }}>
            <strong>Threshold correto:</strong> uma ação é superior ao fold se, e somente se,
            Esperança(ação) &gt; EV_fold. Uma Esperança negativa ainda pode ser a decisão
            correta — desde que seja menos negativa do que o fold.
          </p>
              <div className="callout callout-emerald my-8">
                <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Pipeline do framework</h4>
                <p>As quatro camadas formam um pipeline iterativo, do mais simples ao mais completo:</p>
                <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8, marginBottom: 0 }}>
                  <li><strong>ICM EV</strong> — snapshot financeiro. &ldquo;O que tenho agora?&rdquo;</li>
                  <li><strong>Esperança</strong> — estratégico-lógica. &ldquo;O que posso concretamente buscar neste cenário?&rdquo;</li>
                  <li><strong>Expectativa</strong> — preditiva com cadeia. &ldquo;SE isso acontecer, o que muda no meu FGS e Esperança futura?&rdquo;</li>
                  <li><strong>Perspectiva</strong> — síntese definitiva. Aprendeu iterativamente de todas as camadas. Métrica fechada.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="callout callout-emerald">
          <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Pipeline do framework</h4>
          <p>As quatro camadas formam um pipeline iterativo, do mais simples ao mais completo:</p>
          <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8, marginBottom: 0 }}>
            <li><strong>ICM EV</strong> — snapshot financeiro. &ldquo;O que tenho agora?&rdquo;</li>
            <li><strong>Esperança</strong> — estratégico-lógica. &ldquo;O que posso concretamente buscar neste cenário?&rdquo;</li>
            <li><strong>Expectativa</strong> — preditiva com cadeia. &ldquo;SE isso acontecer, o que muda no meu FGS e Esperança futura?&rdquo;</li>
            <li><strong>Perspectiva</strong> — síntese definitiva. Aprendeu iterativamente de todas as camadas. Métrica fechada.</li>
          </ul>
        </div>
        {/* ==================== 3. EXPECTATIVA ==================== */}
      <div id="expectativa">
        <SectionHeader
          step="03"
          label="Preditiva"
          title="Expectativa Matemática"
          description="SE isso acontecer, o que muda no meu FGS e na minha Esperança futura? Cadeia de consequências encadeadas."
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
          <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
            <div className="prose prose-invert prose-lg max-w-none text-slate-300">
              <p>
                A Expectativa Matemática é a camada probabilístico-preditiva do framework. Opera com
                cadeia de consequências: <em>SE isso acontecer, o que representa no meu Future Game
                  Simulation (FGS) de positivo/negativo? Quanto afeta o ICM EV e — principalmente —
                  a minha Esperança Matemática futura?</em>
              </p>

        <hr className="section-divider" />
              <p>
                A distinção em relação à Esperança é de escopo temporal. A Esperança mede o impacto
                imediato de uma ação sobre a posição no torneio. A Expectativa captura a <strong>cadeia
                  de consequências encadeadas</strong> — o que aquele outcome específico abre ou fecha
                para o restante da trajetória.
              </p>

        {/* ==================== 3. EXPECTATIVA ==================== */}
        <h2 id="expectativa" style={{ scrollMarginTop: '5rem' }}>3. Expectativa Matemática</h2>
              <div className="callout callout-secondary my-8">
                <h4 style={{ marginTop: 0, color: 'var(--accent-secondary)' }}>Exemplo: especular contra o Chip Leader</h4>
                <p>
                  Ganhar um pot de especulação contra o CL não vale apenas o delta de equity imediato
                  (Esperança). A Expectativa encadeia:
                </p>
                <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: 0 }}>
                  <li>Passo a ser o novo CL &mdash; ferramentas de pressão amplificadas.</li>
                  <li>Mitigo o principal adversário da mesa &mdash; pressão estrutural reduzida.</li>
                  <li>Minha Esperança nas próximas mãos aumenta porque tenho mais leverage.</li>
                  <li>O CL anterior passa a ter Esperança comprimida &mdash; jogo soma zero.</li>
                </ul>
              </div>

        <p>
          A Expectativa Matemática é a camada probabilístico-preditiva do framework. Opera com
          cadeia de consequências: <em>SE isso acontecer, o que representa no meu Future Game
            Simulation (FGS) de positivo/negativo? Quanto afeta o ICM EV e — principalmente —
            a minha Esperança Matemática futura?</em>
        </p>
              <p>
                A Expectativa opera com desvio padrão e condicionais. Não pergunta apenas &ldquo;qual
                o EV médio desta ação?&rdquo; — pergunta &ldquo;quais são as distribuições de outcome,
                e qual o impacto de cada ramo sobre o FGS inteiro?&rdquo; O CL que já tem Esperança
                e Expectativa positivas cristalizadas não precisa buscar mais — sua Perspectiva já é
                dominante. Forçar ação agressiva nessa posição é erro de Expectativa, não de Esperança.
              </p>

        <p>
          A distinção em relação à Esperança é de escopo temporal. A Esperança mede o impacto
          imediato de uma ação sobre a posição no torneio. A Expectativa captura a <strong>cadeia
            de consequências encadeadas</strong> — o que aquele outcome específico abre ou fecha
          para o restante da trajetória.
        </p>

        <div className="callout callout-secondary">
          <h4 style={{ marginTop: 0 }}>Exemplo: especular contra o Chip Leader</h4>
          <p>
            Ganhar um pot de especulação contra o CL não vale apenas o delta de equity imediato
            (Esperança). A Expectativa encadeia:
          </p>
          <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: 0 }}>
            <li>Passo a ser o novo CL &mdash; ferramentas de pressão amplificadas.</li>
            <li>Mitigo o principal adversário da mesa &mdash; pressão estrutural reduzida.</li>
            <li>Minha Esperança nas próximas mãos aumenta porque tenho mais leverage.</li>
            <li>O CL anterior passa a ter Esperança comprimida &mdash; jogo soma zero.</li>
          </ul>
              <h3>Relação com os solvers</h3>
              <p>
                Future Game Simulations (FGS) em solvers como HRC resolvem computacionalmente ~6 mãos
                de profundidade, consumindo RAM e tempo proibitivos. Na prática, são ignorados.
                O framework articula o <em>mecanismo causal</em> da Expectativa sem simulação exaustiva:
                a intuição transferível que generaliza para estruturas novas onde nenhum solver tem âncora.
              </p>
            </div>
          </div>
        </div>
      </div>

        <p>
          A Expectativa opera com desvio padrão e condicionais. Não pergunta apenas &ldquo;qual
          o EV médio desta ação?&rdquo; — pergunta &ldquo;quais são as distribuições de outcome,
          e qual o impacto de cada ramo sobre o FGS inteiro?&rdquo; O CL que já tem Esperança
          e Expectativa positivas cristalizadas não precisa buscar mais — sua Perspectiva já é
          dominante. Forçar ação agressiva nessa posição é erro de Expectativa, não de Esperança.
        </p>

        <h3>Relação com os solvers</h3>
        <p>
          Future Game Simulations (FGS) em solvers como HRC resolvem computacionalmente ~6 mãos
          de profundidade, consumindo RAM e tempo proibitivos. Na prática, são ignorados.
          O framework articula o <em>mecanismo causal</em> da Expectativa sem simulação exaustiva:
          a intuição transferível que generaliza para estruturas novas onde nenhum solver tem âncora.
        </p>

        <hr className="section-divider" />

        {/* ==================== 4. PERSPECTIVA ==================== */}
        <h2 id="perspectiva" style={{ scrollMarginTop: '5rem' }}>4. Perspectiva Matemática</h2>
      <div id="perspectiva">
        <SectionHeader
          step="04"
          label="Síntese"
          title="Perspectiva Matemática"
          description="Síntese definitiva e fechada. Aprendeu iterativamente de todas as camadas. Substitui o ICM EV como refinamento superior."
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
          <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
            <div className="prose prose-invert prose-lg max-w-none text-slate-300">
              <p>
                A Perspectiva Matemática é a síntese definitiva do framework. Não é o output simples
                das três camadas anteriores — é uma métrica que <strong>aprendeu iterativamente</strong> de
                todas elas (ICM EV, Esperança, Expectativa com FGS integrado) e as encapsula em uma
                única medida fechada, sem abstração residual.
              </p>

        <p>
          A Perspectiva Matemática é a síntese definitiva do framework. Não é o output simples
          das três camadas anteriores — é uma métrica que <strong>aprendeu iterativamente</strong> de
          todas elas (ICM EV, Esperança, Expectativa com FGS integrado) e as encapsula em uma
          única medida fechada, sem abstração residual.
        </p>
              <div className="callout callout-emerald my-8">
                <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Características</h4>
                <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8, marginBottom: 0 }}>
                  <li><strong>Fechada</strong> — sem termos abertos ou aproximações pendentes.</li>
                  <li><strong>Definitiva</strong> — o que faz sentido lógico, matemático, estratégico e científico irrefutável.</li>
                  <li><strong>Substitui ICM EV</strong> completamente — não como simplificação, mas como refinamento superior.</li>
                  <li><strong>Não é um snapshot.</strong> ICM EV trata a mão como se o torneio terminasse ali. Perspectiva corrige isso ao integrar cadeia futura.</li>
                </ul>
              </div>

        <div className="callout callout-emerald">
          <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Características</h4>
          <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8, marginBottom: 0 }}>
            <li><strong>Fechada</strong> — sem termos abertos ou aproximações pendentes.</li>
            <li><strong>Definitiva</strong> — o que faz sentido lógico, matemático, estratégico e científico irrefutável.</li>
            <li><strong>Substitui ICM EV</strong> completamente — não como simplificação, mas como refinamento superior.</li>
            <li><strong>Não é um snapshot.</strong> ICM EV trata a mão como se o torneio terminasse ali. Perspectiva corrige isso ao integrar cadeia futura.</li>
          </ul>
        </div>
              <h3>Equação Formal</h3>
              <p>
                A forma formal da Perspectiva Matemática integra os termos positivos e negativos da
                posição do jogador no torneio:
              </p>
              <div className="callout my-8">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)', lineHeight: 1.8, marginBottom: '0.5rem' }}>
                  PM = [(Equity &times; R) &times; Valuation_stack] &minus; [EV_fold + RIO<sub>mw</sub>]
                </p>
                <ul style={{ marginLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: 0 }}>
                  <li><strong style={{ color: 'var(--text-main)' }}>R</strong> — Fator de Realização de Equidade. HU ≈ 1,0; multiway cai com o número de oponentes.</li>
                  <li><strong style={{ color: 'var(--text-main)' }}>EV_fold</strong> — baseline dinâmico do fold (nunca zero em torneios; pode ser positivo em ICM).</li>
                  <li><strong style={{ color: 'var(--text-main)' }}>RIO<sub>mw</sub></strong> — Passivo Estrutural Multiway. Cresce em taxa x² enquanto pot odds são lineares.</li>
                </ul>
              </div>

        <h3>Equação Formal</h3>
        <p>
          A forma formal da Perspectiva Matemática integra os termos positivos e negativos da
          posição do jogador no torneio:
        </p>
        <div className="callout">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)', lineHeight: 1.8, marginBottom: '0.5rem' }}>
            PM = [(Equity &times; R) &times; Valuation_stack] &minus; [EV_fold + RIO<sub>mw</sub>]
          </p>
          <ul style={{ marginLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: 0 }}>
            <li><strong style={{ color: 'var(--text-main)' }}>R</strong> — Fator de Realização de Equidade. HU ≈ 1,0; multiway cai com o número de oponentes.</li>
            <li><strong style={{ color: 'var(--text-main)' }}>EV_fold</strong> — baseline dinâmico do fold (nunca zero em torneios; pode ser positivo em ICM).</li>
            <li><strong style={{ color: 'var(--text-main)' }}>RIO<sub>mw</sub></strong> — Passivo Estrutural Multiway. Cresce em taxa x² enquanto pot odds são lineares.</li>
          </ul>
              <h3>Propriedade competitiva</h3>
              <p>
                As Perspectivas dos jogadores na mesa somam exatamente 100% do prize pool esperado.
                Perspectiva é <em>competitiva</em>: minha Perspectiva aumenta quando a dos outros cai.
                Não é jogo de soma positiva dentro da mesa — é redistributivo. A agressividade do Chip
                Leader não maximiza EV de pot — ela gerencia Perspectiva contra a trajetória dos rivais.
              </p>
            </div>
          </div>
        </div>
      </div>

        <h3>Propriedade competitiva</h3>
        <p>
          As Perspectivas dos jogadores na mesa somam exatamente 100% do prize pool esperado.
          Perspectiva é <em>competitiva</em>: minha Perspectiva aumenta quando a dos outros cai.
          Não é jogo de soma positiva dentro da mesa — é redistributivo. A agressividade do Chip
          Leader não maximiza EV de pot — ela gerencia Perspectiva contra a trajetória dos rivais.
        </p>

        <hr className="section-divider" />

        {/* ==================== 5. SEPARAÇÃO DO ICM EV PURO ==================== */}
        <h2 id="separacao" style={{ scrollMarginTop: '5rem' }}>5. Extensão do ICM EV: o que muda e o que permanece</h2>
      <div id="separacao">
        <SectionHeader
          step="05"
          label="Estrutura"
          title="Extensão do ICM EV"
          description="O que ICM EV captura, o que o framework adiciona, e por que não são concorrentes."
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
          <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
            <div className="prose prose-invert prose-lg max-w-none text-slate-300">
              <p>
                Este framework não contradiz o ICM EV. ICM EV calcula corretamente o valor esperado
                de um pot isolado sob a pressão do ICM — e continua sendo a base de qualquer análise
                séria. O que o framework faz é <strong>estender o escopo decisório</strong> do pot
                para o torneio inteiro.
              </p>

        <p>
          Este framework não contradiz o ICM EV. ICM EV calcula corretamente o valor esperado
          de um pot isolado sob a pressão do ICM — e continua sendo a base de qualquer análise
          séria. O que o framework faz é <strong>estender o escopo decisório</strong> do pot
          para o torneio inteiro.
        </p>
              <div className="callout my-8">
                <h4 style={{ marginTop: 0 }}>A distinção precisa</h4>
                <p>
                  ICM EV responde: &ldquo;qual o valor desta ação sobre este pot?&rdquo;
                </p>
                <p>
                  Esperança Matemática responde: &ldquo;qual o impacto desta ação sobre minha
                  posição financeira no torneio?&rdquo;
                </p>
                <p style={{ marginBottom: 0 }}>
                  A segunda pergunta <em>usa</em> o ICM EV como insumo — o Mapa ICM (Malmuth-Harville)
                  calcula as equities posicionais sobre as quais a Esperança é derivada. ICM EV permanece
                  a fundação; o framework adiciona o mechanism causal que liga cada ação à trajetória
                  do torneio.
                </p>
              </div>

        <div className="callout">
          <h4 style={{ marginTop: 0 }}>A distinção precisa</h4>
          <p>
            ICM EV responde: &ldquo;qual o valor desta ação sobre este pot?&rdquo;
          </p>
          <p>
            Esperança Matemática responde: &ldquo;qual o impacto desta ação sobre minha
            posição financeira no torneio?&rdquo;
          </p>
          <p style={{ marginBottom: 0 }}>
            A segunda pergunta <em>usa</em> o ICM EV como insumo — o Mapa ICM (Malmuth-Harville)
            calcula as equities posicionais sobre as quais a Esperança é derivada. ICM EV permanece
            a fundação; o framework adiciona o mecanismo causal que liga cada ação à trajetória
            do torneio.
          </p>
        </div>
              <h3>O que ICM EV captura</h3>
              <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
                <li>A assimetria de valor entre chips ganhos e chips perdidos, no contexto de um pot específico.</li>
                <li>A pressão da estrutura de payouts sobre a frequência ótima de call/fold.</li>
                <li>O Bubble Factor implícito em cada decisão de all-in.</li>
              </ul>

        <h3>O que ICM EV captura</h3>
        <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
          <li>A assimetria de valor entre chips ganhos e chips perdidos, no contexto de um pot específico.</li>
          <li>A pressão da estrutura de payouts sobre a frequência ótima de call/fold.</li>
          <li>O Bubble Factor implícito em cada decisão de all-in.</li>
        </ul>
              <h3>O que o framework adiciona</h3>
              <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
                <li>
                  O mecanismo causal por trás dos fenômenos que solvers descrevem sem explicar:
                  por que o CL é mais agressivo, por que large bets colapsam sob pressão ICM, por que
                  o OOP com RP alto folda mesmo contra ranges inclinados ao bluff.
                </li>
                <li>
                  A variável de decisão correta: Esperança sobre o delta de equity posicional, que integra
                  o estado de toda a mesa — não apenas os dois jogadores no pot.
                </li>
                <li>
                  Intuição transferível para estruturas novas. Solvers produzem o número correto sem
                  revelar o mecanismo. O framework articula o mecanismo — o que tem valor independente:
                  generalização para cenários fora da âncora empírica, base intelectual do motor ICM.
                </li>
              </ul>

        <h3>O que o framework adiciona</h3>
        <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
          <li>
            O mecanismo causal por trás dos fenômenos que solvers descrevem sem explicar:
            por que o CL é mais agressivo, por que large bets colapsam sob pressão ICM, por que
            o OOP com RP alto folda mesmo contra ranges inclinados ao bluff.
          </li>
          <li>
            A variável de decisão correta: Esperança sobre o delta de equity posicional, que integra
            o estado de toda a mesa — não apenas os dois jogadores no pot.
          </li>
          <li>
            Intuição transferível para estruturas novas. Solvers produzem o número correto sem
            revelar o mecanismo. O framework articula o mecanismo — o que tem valor independente:
            generalização para cenários fora da âncora empírica, base intelectual do motor ICM.
          </li>
        </ul>

        <div className="verdict-box">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            Princípio Estruturante
          </p>
          <p style={{ fontSize: '1.05rem', fontStyle: 'italic', marginBottom: 0 }}>
            &ldquo;Solvers raciocinam perfeitamente sobre o pot. O framework raciocina sobre o torneio.
            São respostas corretas a perguntas diferentes — e a pergunta do torneio é a que importa.&rdquo;
          </p>
              <div className="verdict-box mt-8">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                  Princípio Estruturante
                </p>
                <p style={{ fontSize: '1.05rem', fontStyle: 'italic', marginBottom: 0 }}>
                  &ldquo;Solvers raciocinam perfeitamente sobre o pot. O framework raciocina sobre o torneio.
                  São respostas corretas a perguntas diferentes — e a pergunta do torneio é a que importa.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>

        <hr className="section-divider" />

        {/* ==================== ATRIBUIÇÕES ==================== */}
        <section style={{ marginTop: '3rem' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.24em',
            marginBottom: '1.25rem',
          }}>
            Atribuições
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid var(--glass-border)' }}>
            <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>
      <SectionHeader
        step="06"
        label="Referências"
        title="Atribuições e Fontes"
        description="Fundamentação teórica, bibliográfica e metodológica do framework."
      />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div className="glass-panel p-8 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '0 0 1rem 0', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>
              O&apos;Kearney, D. &amp; Carter, B. <em>PKO Poker Strategy</em>. D&amp;B Poker, 2023.
              &mdash; origem do conceito <strong style={{ color: 'var(--text-main)' }}>Downward Drift</strong> (apostas grandes
              migram para apostas menores, que migram para calls, conforme pressão ICM aumenta).
              A quantificação do fenômeno via coeficientes k<sub>A</sub> e expoente b é extensão
              original deste framework.
            </li>
            <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>
              <strong style={{ color: 'var(--text-main)' }}>Risk Premium (RP), ΔRP, Expectativa, Perspectiva e Esperança Matemática</strong>,
              motor ICM pós-flop e equação de distorção côncava — Raphael Vitoi, 2025-2026.
            </li>
            <li style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>
            <li style={{ padding: '1rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>
              GTO Wizard Blog. &ldquo;MDF vs ICM: Rethinking Bluffing &amp; Defense Strategies in MTTs.&rdquo; 2025.
              &mdash; confirma que MDF quebra sob ICM e que o covering player pode ser mais agressivo
              (validação parcial dos mecanismos descritos neste framework).
            </li>
          </ul>
        </section>
        </div>
      </div>

      </article>

      <nav className="article-nav">
        <Link href="/aulas/leitura-icm"><i className="fa-solid fa-arrow-left" style={{ marginRight: '4px' }} /> Whitepaper ICM</Link>
        <Link href="/aulas/icm-masterclass">Aula ICM <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></Link>
      </nav>

    </main>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <nav className="article-nav">
          <Link href="/aulas/leitura-icm"><i className="fa-solid fa-arrow-left" style={{ marginRight: '4px' }} /> Whitepaper ICM</Link>
          <Link href="/aulas/icm-masterclass">Aula ICM <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></Link>
        </nav>
      </div>
    </div>
  );
}
