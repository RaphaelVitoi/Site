/**
 * IDENTITY: Psicologia High Stakes - Artigo Completo
 * PATH: src/app/psicologia-hs/page.tsx
 * ROLE: Artigo acadêmico completo portado do legado psicologia-hs.html.
 * BINDING: [layout.tsx, globals.css]
 */

import ContentFooter from '@/components/content/ContentFooter';
import PsychologyHub, { SpecPost } from '@/components/content/PsychologyHub';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Psicologia High Stakes | Raphael Vitoi',
  description: 'Protocolo de Análise Psicológica para Mesas Finais de Poker. Fenomenologia da incerteza e tomada de decisão sob pressão ICM.',
};

// Fallback posts para o Laboratório Clínico
const fallbackPosts: SpecPost[] = [
  {
    id: 'a-ameaca-organica',
    slug: 'a-ameaca-organica',
    title: 'A Ameaça Orgânica no River',
    excerpt: 'A sobrecarga de Risk Premium em retas finais afeta diretamente a amígdala cerebral, induzindo o jogador a cometer blefes irracionais sob a perspectiva da neurociência.',
    readTime: '08 MIN',
    tags: ['Mindset', 'Neurobiologia']
  },
  {
    id: 'paradoxo-do-valuation',
    slug: 'paradoxo-do-valuation',
    title: 'O Paradoxo do Valuation no ICM',
    excerpt: 'Por que acumular fichas pode diminuir sua esperança matemática quando as dinâmicas de poder na mesa final são ignoradas.',
    readTime: '12 MIN',
    tags: ['Teoria', 'ICM']
  }
];

export default function PsicologiaHSPage() {
  const pageUrl = "https://www.pokerracional.com/artigos/psicologia-hs";
  const pageTitle = "Psicologia High Stakes | Raphael Vitoi";
  const posts = fallbackPosts;

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', overflowX: 'hidden' }}>

      {/* Header Central de Página */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0,
              letterSpacing: '-0.03em', background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Psicologia High Stakes
            </h1>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '580px' }}>
              A Fenomenologia da Incerteza. Exegese crítica das heurísticas de ICM, vieses cognitivos e a taxa de maluquice humana sob pressão.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0.35rem 0.75rem', borderRadius: '8px',
                background: 'rgba(217, 70, 239, 0.15)', border: '1px solid rgba(217, 70, 239, 0.3)',
                fontSize: '0.65rem', fontWeight: 700, color: '#e879f9', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d946ef', boxShadow: '0 0 8px rgba(217,70,239,0.5)' }} />
                {' '}Hub Ativo
              </span>
              <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                Análise Comportamental
              </span>
            </div>
          </div>

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

      <SectionHeader
        step="01"
        label="Contexto"
        title="A Fenomenologia da Incerteza"
        description="Uma exegese crítica das heurísticas de ICM e da arquitetura de solvers em ambientes de informação imperfeita."
      />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-fuchsia-500/10 rounded-2xl">
          <div className="prose prose-invert prose-fuchsia max-w-none text-slate-300">
            <p>A ontogênese da estratégia contemporânea no âmbito dos torneios de poker multimesas (MTT) não pode ser dissociada de uma reavaliação radical da teleologia do risco, onde o valor nominal das fichas é subsumido por uma métrica de valor monetário extrínseco, definida pelo Independent Chip Model (ICM). Esta análise propõe uma investigação hermenêutica das estruturas de decisão pós-flop, contrastando as implementações algorítmicas do GTO Wizard e do Hold&apos;em Resources Calculator (HRC).</p>

            <h3>A Divergência Arquitetônica: GTO Wizard vs HRC</h3>
            <p>A avaliação das árvores de decisão pós-flop revela uma dicotomia fundamental. O sistema HRC pós-flop executa uma análise recursiva que incorpora o impacto das cartas descartadas pelos jogadores que desistiram pré-flop (&quot;Bunching Effect&quot;). O GTO Wizard restringe a análise apenas aos dois competidores envolvidos.</p>

            <div className="not-prose my-8 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="border-b border-white/10 text-slate-300"><th className="py-3 px-4">Variável Analítica</th><th className="py-3 px-4">GTO Wizard (ChipEV)</th><th className="py-3 px-4">HRC (ICMev)</th><th className="py-3 px-4">Implicação</th></tr></thead>
                <tbody className="text-sm text-slate-400">
                  <tr className="border-b border-white/5"><td className="py-3 px-4 text-white"><strong>Bunching Effect</strong></td><td className="py-3 px-4">Restrito aos ativos</td><td className="py-3 px-4">Inclui ranges foldados</td><td className="py-3 px-4">Recalibração da densidade de cartas.</td></tr>
                  <tr className="border-b border-white/5"><td className="py-3 px-4 text-white"><strong>Análise de Stacks</strong></td><td className="py-3 px-4">Stack efetiva</td><td className="py-3 px-4">Global (ativos e inativos)</td><td className="py-3 px-4">Precisão na avaliação do prizepool.</td></tr>
                  <tr className="border-b border-white/5"><td className="py-3 px-4 text-white"><strong>Precisão (-Nash)</strong></td><td className="py-3 px-4">Distância variável</td><td className="py-3 px-4">Geralmente menor e mais preciso</td><td className="py-3 px-4">Maior confiabilidade operacional.</td></tr>
                  <tr><td className="py-3 px-4 text-white"><strong>Heurística Pós-Flop</strong></td><td className="py-3 px-4">Equidade bruta</td><td className="py-3 px-4">Prêmio de risco (RP)</td><td className="py-3 px-4">Adaptação ao contexto de Mesa Final.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader
        step="02"
        label="Fundamentos"
        title="Ontologia do Risk Premium"
        description="O limite superior de defesa onde o defensor é impedido de realizar sua equidade devido ao risco existencial que o confronto impõe."
      />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-fuchsia-500/10 rounded-2xl">
          <div className="prose prose-invert prose-fuchsia max-w-none text-slate-300">
            <h3>A Ontologia do Risk Premium e o &quot;Teto do RP&quot;</h3>
            <p>O Risk Premium (RP) funciona como uma taxa de câmbio entre fichas e dinheiro real: representa a equidade adicional necessária para que uma decisão de call ou raise se torne lucrativa em termos de valor monetário. O <strong>&quot;Teto do RP&quot;</strong> define o limite superior de defesa onde, independentemente da frequência de blefes do agressor, o defensor é impedido de realizar sua equidade devido ao risco existencial que o confronto impõe à sua stack.</p>
            <p>A dinâmica entre o <strong>RP de ida</strong> (agressor) e o <strong>RP de volta</strong> (defensor) determina a polarização das estratégias. Se o RP de volta for o dobro do RP de ida, o defensor deve agir com cautela extrema — permitindo que o agressor utilize o ICM como instrumento de coerção estratégica. Essa pressão não é linear: ela é influenciada pela proximidade de eliminações (payjumps) e pela estrutura de premiação.</p>

            <div className="callout bg-fuchsia-900/10 border-l-4 border-fuchsia-500 p-4 my-6 rounded-r-lg">
              <h4 style={{ marginTop: 0, color: 'var(--color-fuchsia-400)' }}>Dialética dos Toy Games — Dados Quantitativos</h4>
              <p><strong>Toy Game 1 (ChipEV):</strong> OOP (KK) defende 50% para tornar os blefes do IP indiferentes. IP tem 3 combinações de blefe para 6 de valor. Equilíbrio estável.</p>
              <p><strong>Toy Game 2 (ICM Moderado — RP baixo):</strong> Com RP baixo no OOP, o IP aumenta seus blefes de <strong>3 para 4.2 combinações</strong>, explorando a aversão ao risco. O OOP já não pode defender os 50% sem custo matemático.</p>
              <p style={{ marginBottom: 0 }}><strong>Toy Game 3-5 (Desproporção Extrema — RP do OOP até 24%):</strong> O IP chega a <strong>8 combinações de blefe contra 6 de valor</strong> — desbalanceado sob qualquer critério de ChipEV — e ainda assim o OOP é forçado a foldar na maioria das vezes. Não por falha estratégica: é o equilíbrio de Nash em ambiente de ICM. O OOP aceita a exploração para preservar a esperança matemática de premiação.</p>
            </div>

            <h3>Impacto da Inscrição Tardia (Late Reg)</h3>
            <div className="not-prose my-8 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="border-b border-white/10 text-slate-300"><th className="py-3 px-4">Momento do Registro</th><th className="py-3 px-4">Stack Inicial</th><th className="py-3 px-4">Buy-in Efetivo</th><th className="py-3 px-4">Valor ICM</th><th className="py-3 px-4">Incremento</th></tr></thead>
                <tbody className="text-sm text-slate-400">
                  <tr className="border-b border-white/5"><td className="py-3 px-4">Início do Torneio</td><td className="py-3 px-4">25,000</td><td className="py-3 px-4">$500</td><td className="py-3 px-4">$500.00</td><td className="py-3 px-4 font-mono">0.0%</td></tr>
                  <tr className="border-b border-white/5"><td className="py-3 px-4">Fim do Registro (Online)</td><td className="py-3 px-4">25,000</td><td className="py-3 px-4">$500</td><td className="py-3 px-4">$581.00</td><td className="py-3 px-4 font-mono text-emerald-400">+16.2%</td></tr>
                  <tr><td className="py-3 px-4">Início do Dia 2 (Live)</td><td className="py-3 px-4">25,000</td><td className="py-3 px-4">$4,650</td><td className="py-3 px-4">$5,117.00</td><td className="py-3 px-4 font-mono text-emerald-400">+10.0%</td></tr>
                </tbody>
              </table>
            </div>

            <h3>A Pedagogia &quot;Homem Bomba&quot;</h3>
            <p>A abordagem de Raphael Vitoi caracteriza-se por uma fusão disruptiva entre GTO e psicologia analítica. A obra &quot;Homem Bomba&quot; utiliza a metáfora da bomba para descrever o excesso de &quot;gozo&quot; (jouissance) lacaniano. A metodologia propõe a substituição da intuição cega pela <strong>&quot;Antevisão&quot;</strong>, uma preparação estratégica baseada em dados massivos (MDA).</p>
          </div>
        </div>
      </div>

      <SectionHeader
        step="03"
        label="Síntese"
        title="Heurísticas e Responsabilidade"
        description="A maestria no jogo reside na harmonia entre a frieza do código binário dos solvers e a profundidade da reflexão humana sobre o risco, a perda e o valor."
      />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-fuchsia-500/10 rounded-2xl">
          <div className="prose prose-invert prose-fuchsia max-w-none text-slate-300">
            <h3>Redes Neurais vs. Árvores de Decisão</h3>
            <div className="not-prose my-8 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="border-b border-white/10 text-slate-300"><th className="py-3 px-4">Modelo</th><th className="py-3 px-4">Vantagem</th><th className="py-3 px-4">Desvantagem</th><th className="py-3 px-4">Precisão</th></tr></thead>
                <tbody className="text-sm text-slate-400">
                  <tr className="border-b border-white/5"><td className="py-3 px-4 text-white"><strong>Árvores de Decisão</strong></td><td className="py-3 px-4">Treinamento rápido; Interpretabilidade</td><td className="py-3 px-4">Dificuldade com variáveis contínuas</td><td className="py-3 px-4">63.6% - 66.7%</td></tr>
                  <tr className="border-b border-white/5"><td className="py-3 px-4 text-white"><strong>Redes Neurais</strong></td><td className="py-3 px-4">Captura padrões não lineares</td><td className="py-3 px-4">&quot;Caixa Preta&quot;; Treino lento</td><td className="py-3 px-4">Superior</td></tr>
                  <tr><td className="py-3 px-4 text-white"><strong>CFR (Auto-play)</strong></td><td className="py-3 px-4">Equilíbrio de Nash teórico</td><td className="py-3 px-4">Computacionalmente caro</td><td className="py-3 px-4">Máxima</td></tr>
                </tbody>
              </table>
            </div>

            <h3>Heurísticas de Defesa: BTN vs BB em Mesas Finais</h3>
            <div className="not-prose my-8 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="border-b border-white/10 text-slate-300"><th className="py-3 px-4">Textura do Flop</th><th className="py-3 px-4">Freq. BTN (Cobrindo)</th><th className="py-3 px-4">Freq. BTN (Coberto)</th><th className="py-3 px-4">Sizing</th></tr></thead>
                <tbody className="text-sm text-slate-400">
                  <tr className="border-b border-white/5"><td className="py-3 px-4">Broadway / Paired High</td><td className="py-3 px-4 text-emerald-400">Alta (~70%)</td><td className="py-3 px-4 text-sky-400">Moderada (~66%)</td><td className="py-3 px-4">Small</td></tr>
                  <tr><td className="py-3 px-4">Monotone / Low</td><td className="py-3 px-4 text-rose-400">Baixa</td><td className="py-3 px-4 text-rose-400">Baixa</td><td className="py-3 px-4">Small</td></tr>
                </tbody>
              </table>
            </div>

            <h3>A Responsabilidade do Chip Leader</h3>
            <p>
              A frase axiomática do ICM — &ldquo;as fichas que perdemos valem mais do que as fichas que
              ganhamos&rdquo; — é refinada pela compreensão de que o Chip Leader carrega uma
              responsabilidade específica: impedir que outros jogadores acumulem fichas e desafiem sua
              hegemonia. Cada shove descuidado que o Vice dobra é uma transferência de leverage futura.
              O solver não apenas limita a agressão do CL por conservadorismo — ele a limita porque criar
              um rival equipado é uma perda de EV real, não hipotética.
            </p>

            <h3>Síntese Final</h3>
            <p>A maestria no jogo reside na harmonia entre a frieza do código binário dos solvers e a profundidade da reflexão humana sobre o risco, a perda e o valor. O ICM atua como a lei gravitacional que curva a trajetória das estratégias. A vantagem competitiva moderna não está em decorar tabelas pré-flop — está em compreender a elasticidade do Risk Premium no pós-flop: saber quando o &ldquo;Pacto Silencioso&rdquo; permite roubar potes de gigantes aterrorizados, e quando o &ldquo;Teto de Agressão&rdquo; proíbe blefes que seriam triviais em ChipEV.</p>

            <div className="mt-10 p-4 bg-slate-900/50 rounded-lg border border-white/5 text-sm text-slate-400">
              <strong className="text-slate-300">Referências:</strong> Chen &amp; Ankenman (The Mathematics of Poker), GTO Wizard Blog, HRC Simulations, Raphael Vitoi (Homem Bomba).
            </div>
          </div>
        </div>
      </div>

      <SectionHeader
        step="04"
        label="Acervo"
        title="Protocolos Psicológicos"
        description="Mergulhe nas anomalias cognitivas que distorcem a matemática pura. Quando a racionalidade colapsa, a perspectiva deve mapear o viés."
      />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <PsychologyHub posts={posts} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <ContentFooter
          shareTitle={pageTitle}
          shareUrl={pageUrl}
          backLinkHref="/"
          backLinkText="Voltar para o Hub Central"
        />
      </div>
    </div>
  );
}
