/**
 * IDENTITY: Psicologia High Stakes - Artigo Completo
 * PATH: src/app/psicologia-hs/page.tsx
 * ROLE: Artigo acadêmico completo portado do legado psicologia-hs.html.
 * BINDING: [layout.tsx, globals.css]
 */

import Link from 'next/link';

export const metadata = {
  title: 'Psicologia High Stakes | Raphael Vitoi',
  description: 'Protocolo de Análise Psicológica para Mesas Finais de Poker. Fenomenologia da incerteza e tomada de decisão sob pressão ICM.',
};

export default function PsicologiaHSPage() {
  return (
    <main className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <header className="page-header" style={{ paddingBottom: '1rem' }}>
        <p className="page-label">
          <span className="fa-solid fa-brain"></span> Protocolo de Análise Textual Complexa
        </p>
        <h1>Psicologia High Stakes</h1>
        <p className="page-subtitle">Fenomenologia da Incerteza e Tomada de Decisão sob Pressão ICM.</p>
      </header>

      <section>
        <article>
          <h2 className="article-title">A Fenomenologia da Incerteza e a Transubstanciação do Valor</h2>
          <p style={{ textAlign: 'center', fontStyle: 'italic', opacity: 0.8, marginBottom: '3rem' }}>Uma Exegese Crítica das Heurísticas de ICM e da Arquitetura de Solvers em Ambientes de Informação Imperfeita</p>

          <p>A ontogênese da estratégia contemporânea no âmbito dos torneios de poker multimesas (MTT) não pode ser dissociada de uma reavaliação radical da teleologia do risco, onde o valor nominal das fichas é subsumido por uma métrica de valor monetário extrínseco, definida pelo Independent Chip Model (ICM). Esta análise propõe uma investigação hermenêutica das estruturas de decisão pós-flop, contrastando as implementações algorítmicas do GTO Wizard e do Hold&apos;em Resources Calculator (HRC).</p>

          <h3>A Divergência Arquitetônica: GTO Wizard vs HRC</h3>
          <p>A avaliação das árvores de decisão pós-flop revela uma dicotomia fundamental. O sistema HRC pós-flop executa uma análise recursiva que incorpora o impacto das cartas descartadas pelos jogadores que desistiram pré-flop (&quot;Bunching Effect&quot;). O GTO Wizard restringe a análise apenas aos dois competidores envolvidos.</p>

          <table>
            <thead><tr><th>Variável Analítica</th><th>GTO Wizard (ChipEV)</th><th>HRC (ICMev)</th><th>Implicação</th></tr></thead>
            <tbody>
              <tr><td><strong>Bunching Effect</strong></td><td>Restrito aos ativos</td><td>Inclui ranges foldados</td><td>Recalibração da densidade de cartas.</td></tr>
              <tr><td><strong>Análise de Stacks</strong></td><td>Stack efetiva</td><td>Global (ativos e inativos)</td><td>Precisão na avaliação do prizepool.</td></tr>
              <tr><td><strong>Precisão (-Nash)</strong></td><td>Distância variável</td><td>Geralmente menor e mais preciso</td><td>Maior confiabilidade operacional.</td></tr>
              <tr><td><strong>Heurística Pós-Flop</strong></td><td>Equidade bruta</td><td>Prêmio de risco (RP)</td><td>Adaptação ao contexto de Mesa Final.</td></tr>
            </tbody>
          </table>

          <h3>A Ontologia do Risk Premium e o &quot;Teto do RP&quot;</h3>
          <p>O Risk Premium (RP) funciona como uma taxa de câmbio entre fichas e dinheiro real: representa a equidade adicional necessária para que uma decisão de call ou raise se torne lucrativa em termos de valor monetário. O <strong>&quot;Teto do RP&quot;</strong> define o limite superior de defesa onde, independentemente da frequência de blefes do agressor, o defensor é impedido de realizar sua equidade devido ao risco existencial que o confronto impõe à sua stack.</p>
          <p>A dinâmica entre o <strong>RP de ida</strong> (agressor) e o <strong>RP de volta</strong> (defensor) determina a polarização das estratégias. Se o RP de volta for o dobro do RP de ida, o defensor deve agir com cautela extrema — permitindo que o agressor utilize o ICM como instrumento de coerção estratégica. Essa pressão não é linear: ela é influenciada pela proximidade de eliminações (payjumps) e pela estrutura de premiação.</p>

          <div className="callout">
            <h4 style={{ marginTop: 0 }}>Dialética dos Toy Games — Dados Quantitativos</h4>
            <p><strong>Toy Game 1 (ChipEV):</strong> OOP (KK) defende 50% para tornar os blefes do IP indiferentes. IP tem 3 combinações de blefe para 6 de valor. Equilíbrio estável.</p>
            <p><strong>Toy Game 2 (ICM Moderado — RP baixo):</strong> Com RP baixo no OOP, o IP aumenta seus blefes de <strong>3 para 4.2 combinações</strong>, explorando a aversão ao risco. O OOP já não pode defender os 50% sem custo matemático.</p>
            <p style={{ marginBottom: 0 }}><strong>Toy Game 3-5 (Desproporção Extrema — RP do OOP até 24%):</strong> O IP chega a <strong>8 combinações de blefe contra 6 de valor</strong> — desbalanceado sob qualquer critério de ChipEV — e ainda assim o OOP é forçado a foldar na maioria das vezes. Não por falha estratégica: é o equilíbrio de Nash em ambiente de ICM. O OOP aceita a exploração para preservar a esperança matemática de premiação.</p>
          </div>

          <h3>Impacto da Inscrição Tardia (Late Reg)</h3>
          <table>
            <thead><tr><th>Momento do Registro</th><th>Stack Inicial</th><th>Buy-in Efetivo</th><th>Valor ICM</th><th>Incremento</th></tr></thead>
            <tbody>
              <tr><td>Início do Torneio</td><td>25,000</td><td>$500</td><td>$500.00</td><td className="numeric">0.0%</td></tr>
              <tr><td>Fim do Registro (Online)</td><td>25,000</td><td>$500</td><td>$581.00</td><td className="numeric" style={{ color: 'var(--accent-emerald)' }}>+16.2%</td></tr>
              <tr><td>Início do Dia 2 (Live)</td><td>25,000</td><td>$4,650</td><td>$5,117.00</td><td className="numeric" style={{ color: 'var(--accent-emerald)' }}>+10.0%</td></tr>
            </tbody>
          </table>

          <h3>A Pedagogia &quot;Homem Bomba&quot;</h3>
          <p>A abordagem de Raphael Vitoi caracteriza-se por uma fusão disruptiva entre GTO e psicologia analítica. A obra &quot;Homem Bomba&quot; utiliza a metáfora da bomba para descrever o excesso de &quot;gozo&quot; (jouissance) lacaniano. A metodologia propõe a substituição da intuição cega pela <strong>&quot;Antevisão&quot;</strong>, uma preparação estratégica baseada em dados massivos (MDA).</p>

          <h3>Redes Neurais vs. Árvores de Decisão</h3>
          <table>
            <thead><tr><th>Modelo</th><th>Vantagem</th><th>Desvantagem</th><th>Precisão</th></tr></thead>
            <tbody>
              <tr><td><strong>Árvores de Decisão</strong></td><td>Treinamento rápido; Interpretabilidade</td><td>Dificuldade com variáveis contínuas</td><td>63.6% - 66.7%</td></tr>
              <tr><td><strong>Redes Neurais</strong></td><td>Captura padrões não lineares</td><td>&quot;Caixa Preta&quot;; Treino lento</td><td>Superior</td></tr>
              <tr><td><strong>CFR (Auto-play)</strong></td><td>Equilíbrio de Nash teórico</td><td>Computacionalmente caro</td><td>Máxima</td></tr>
            </tbody>
          </table>

          <h3>Heurísticas de Defesa: BTN vs BB em Mesas Finais</h3>
          <table>
            <thead><tr><th>Textura do Flop</th><th>Freq. BTN (Cobrindo)</th><th>Freq. BTN (Coberto)</th><th>Sizing</th></tr></thead>
            <tbody>
              <tr><td>Broadway / Paired High</td><td style={{ color: 'var(--accent-emerald)' }}>Alta (~70%)</td><td style={{ color: 'var(--accent-sky)' }}>Moderada (~66%)</td><td>Small</td></tr>
              <tr><td>Monotone / Low</td><td style={{ color: 'var(--accent-secondary)' }}>Baixa</td><td style={{ color: 'var(--accent-secondary)' }}>Baixa</td><td>Small</td></tr>
            </tbody>
          </table>

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

          <div className="article-references">
            <strong>Referências:</strong> Chen &amp; Ankenman (The Mathematics of Poker), GTO Wizard Blog, HRC Simulations, Raphael Vitoi (Homem Bomba).
          </div>
        </article>
      </section>

      <nav className="article-nav" style={{ marginTop: '4rem' }}>
        <Link href="/">&larr; Hub Central</Link>
        <Link href="/biblioteca">Biblioteca &rarr;</Link>
      </nav>
    </main>
  );
}
