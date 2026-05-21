/**
 * IDENTITY: Glossário Formal — Framework ICM
 * PATH: src/app/conceitos-icm/page.tsx
 * ROLE: Definição formal dos cinco conceitos fundacionais do framework ICM de Raphael Vitoi.
 *       RP vs BF, Expectativa, Perspectiva e Esperança Matemática, separação de ICM EV puro.
 * BINDING: [layout.tsx, globals.css]
 */

import Link from 'next/link';

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
    id: 'expectativa',
    label: 'Referencial',
    title: 'Expectativa Matemática',
    desc: 'A pergunta correta antes de qualquer ação: dentro do meu referencial completo, o que a matemática sustenta?',
  },
  {
    num: '03',
    id: 'perspectiva',
    label: 'Mapa',
    title: 'Perspectiva Matemática',
    desc: 'Distribuição dinâmica de probabilidade sobre os outcomes do torneio. Malmuth-Harville como função contínua.',
  },
  {
    num: '04',
    id: 'esperanca',
    label: 'Decisão',
    title: 'Esperança Matemática',
    desc: 'A métrica de decisão correta: ganho esperado em Perspectiva de uma ação específica.',
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
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', marginBottom: '0.25rem' }} />

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

      <article>

        {/* ==================== 1. RP VS BF ==================== */}
        <h2 id="rp-vs-bf" style={{ scrollMarginTop: '5rem' }}>1. Risk Premium vs. Bubble Factor</h2>

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

        <h3>Bubble Factor</h3>
        <p>
          O BF é um multiplicador: pelo quanto os pot odds precisam ser multiplicados para
          refletir a pressão ICM. BF = 1,0 em ChipEV puro; cresce conforme a pressão aumenta.
          BF = 1,27 significa que você precisa de 27% a mais de equity do que os pot odds
          exigiriam em ChipEV.
        </p>

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

        {/* ==================== 2. EXPECTATIVA ==================== */}
        <h2 id="expectativa" style={{ scrollMarginTop: '5rem' }}>2. Expectativa Matemática</h2>

        <p>
          O conceito de Expectativa Matemática no contexto do ICM pós-flop não é idêntico ao
          EV simples de uma ação de ChipEV. A distinção é de <em>referencial</em>.
        </p>

        <p>
          Em ChipEV, a expectativa de uma ação é calculada sobre o pot: quanto de fichas,
          em média, aquela ação produz ou consome. O modelo é local e estático — descreve
          um pot, não um torneio.
        </p>

        <div className="callout callout-secondary">
          <h4 style={{ marginTop: 0 }}>Definição</h4>
          <p>
            <strong>Expectativa Matemática</strong> é a expectativa fundamentada no referencial
            completo do jogador: estrutura do torneio, payouts, configuração atual de stacks na
            mesa, posição no campo de eliminação.
          </p>
          <p style={{ marginBottom: 0 }}>
            Não é &ldquo;qual o EV deste pot&rdquo; — é &ldquo;dentro do meu referencial atual,
            qual é a expectativa matematicamente sustentável para esta ação, considerando tudo
            o que está em jogo além do pot?&rdquo;
          </p>
        </div>

        <p>
          A Expectativa Matemática é o <em>quadro geral</em> dentro do qual a decisão acontece.
          Ela não é uma equação — é o conjunto de variáveis que define o problema. As equações
          concretas são expressas pela Perspectiva e pela Esperança.
        </p>

        <hr className="section-divider" />

        {/* ==================== 3. PERSPECTIVA ==================== */}
        <h2 id="perspectiva" style={{ scrollMarginTop: '5rem' }}>3. Perspectiva Matemática</h2>

        <p>
          A Perspectiva Matemática é a distribuição de probabilidade de um jogador sobre os
          outcomes finais do torneio — 1º lugar, 2º lugar, ..., N-ésimo lugar — dado o estado
          atual completo da mesa (stacks de todos, estrutura de pagamentos, número de jogadores
          restantes).
        </p>

        <div className="callout callout-emerald">
          <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Base de Cálculo</h4>
          <p>
            O cálculo da Perspectiva usa o modelo de Malmuth-Harville: para cada colocação
            possível, a probabilidade é derivada recursivamente das stacks relativas dos jogadores
            ainda em jogo.
          </p>
          <p style={{ marginBottom: 0 }}>
            O que o framework adiciona é tratá-la como <strong>função contínua e dinâmica</strong>,
            não como um snapshot. A Perspectiva de cada jogador muda a cada pot que é disputado,
            a cada eliminação, a cada street jogada. O jogo é uma trajetória de Perspectivas, não
            uma sequência de pots isolados.
          </p>
        </div>

        <h3>Propriedade competitiva</h3>
        <p>
          As Perspectivas dos jogadores na mesa somam exatamente 100% do prize pool esperado.
          Isso implica que as Perspectivas são <em>competitivas</em>: minha Perspectiva aumenta
          quando a dos outros cai. Não é um jogo de soma positiva dentro da mesa — é redistributivo.
        </p>

        <h3>Exemplo: o Chip Leader e a agressão</h3>
        <p>
          A intuição ingênua do ICM EV puro prediz que o Chip Leader deveria ser passivo,
          porque chips perdidos valem mais do que chips ganhos. A realidade observada — e
          confirmada por solvers — é que o CL é mais agressivo do que o ChipEV indicaria.
        </p>
        <p>
          A explicação via Perspectiva é direta: o CL não maximiza o EV de cada pot. Ele
          gerencia sua Perspectiva contra a trajetória dos rivais. A agressividade do CL é uma
          externalidade positiva na sua Perspectiva porque mantém os mid-stacks abaixo do limiar
          em que passariam a representar ameaça real à liderança.
        </p>

        <div className="callout">
          <p style={{ marginBottom: 0 }}>
            O CL carrega RP real — tipicamente em torno de 12% mesmo liderando com folga.
            Ele não ignora o ICM: ele o usa ativamente para <em>proteger</em> sua Perspectiva
            contra o crescimento dos rivais, não apenas para sobreviver.
          </p>
        </div>

        <hr className="section-divider" />

        {/* ==================== 4. ESPERANÇA ==================== */}
        <h2 id="esperanca" style={{ scrollMarginTop: '5rem' }}>4. Esperança Matemática</h2>

        <p>
          A Esperança Matemática é o ganho esperado em Perspectiva de uma ação específica.
          É a métrica de decisão que o framework substitui pelo EV de pot isolado.
        </p>

        <div className="callout callout-secondary">
          <h4 style={{ marginTop: 0 }}>Equação</h4>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)', lineHeight: 1.8 }}>
            Esperança(ação) = P(ganhar) &times; &Delta;Perspectiva<sub>ganho</sub>
            &nbsp;+ P(perder) &times; &Delta;Perspectiva<sub>perda</sub>
          </p>
          <p style={{ marginBottom: 0 }}>
            Onde &Delta;Perspectiva<sub>ganho</sub> é a variação na Perspectiva do jogador caso
            vença o pot, e &Delta;Perspectiva<sub>perda</sub> é a variação caso perca. Ambas são
            calculadas sobre o estado completo da mesa — stacks de todos, payouts, jogadores
            restantes.
          </p>
        </div>

        <h3>Assimetria intrínseca</h3>
        <p>
          A Esperança captura naturalmente a assimetria que o ICM EV de pot tende a esconder.
          Mesmo que P(ganhar) e P(perder) sejam iguais (call breakeven em ChipEV),
          |&Delta;Perspectiva<sub>perda</sub>| pode ser materialmente maior do que
          |&Delta;Perspectiva<sub>ganho</sub>| — porque perder o pot pode eliminar o jogador
          ou colocá-lo em zona de curta stack, enquanto ganhar apenas aumenta uma stack já
          favorável.
        </p>
        <p>
          O sinal e a magnitude de &Delta;Perspectiva<sub>perda</sub> dependem de onde o
          jogador está no espectro de stacks da mesa. Por isso, a Esperança de uma ação idêntica
          (mesmo pot, mesma equity) pode ser positiva para um mid-stack e negativa para um short
          stack — o referencial é o estado completo da mesa, não apenas o pot.
        </p>

        <h3>Critério de decisão</h3>
        <p>
          A decisão ótima é aquela que maximiza Esperança, não ICM EV do pot isolado.
          Quando os dois divergem — e divergem com frequência em mesas finais — a Esperança
          é o critério correto, porque captura o que realmente muda no torneio.
        </p>

        <div className="callout callout-emerald">
          <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Relação entre os três conceitos</h4>
          <p>
            São camadas, não sinônimos:
          </p>
          <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8, marginBottom: 0 }}>
            <li><strong>Expectativa</strong> — o referencial. Define o espaço do problema.</li>
            <li><strong>Perspectiva</strong> — o mapa. Quantifica onde cada jogador está no torneio.</li>
            <li><strong>Esperança</strong> — a bússola. Indica qual ação move a Perspectiva na direção certa.</li>
          </ul>
        </div>

        <hr className="section-divider" />

        {/* ==================== 5. SEPARAÇÃO DO ICM EV PURO ==================== */}
        <h2 id="separacao" style={{ scrollMarginTop: '5rem' }}>5. Extensão do ICM EV: o que muda e o que permanece</h2>

        <p>
          Este framework não contradiz o ICM EV. ICM EV calcula corretamente o valor esperado
          de um pot isolado sob a pressão do ICM — e continua sendo a base de qualquer análise
          séria. O que o framework faz é <strong>estender o escopo decisório</strong> do pot
          para o torneio inteiro.
        </p>

        <div className="callout">
          <h4 style={{ marginTop: 0 }}>A distinção precisa</h4>
          <p>
            ICM EV responde: &ldquo;qual o valor desta ação sobre este pot?&rdquo;
          </p>
          <p>
            Esperança Matemática responde: &ldquo;qual o impacto desta ação sobre minha
            probabilidade de chegar em cada colocação do torneio?&rdquo;
          </p>
          <p style={{ marginBottom: 0 }}>
            A segunda pergunta <em>usa</em> o ICM EV como insumo — Perspectiva é
            Malmuth-Harville (que é ICM), e Esperança é calculada sobre ΔPerspectiva (que é
            ICM-derivado). ICM EV permanece a fundação; o framework adiciona o mecanismo causal
            que liga cada ação à trajetória do torneio.
          </p>
        </div>

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
            A variável de decisão correta: Esperança sobre a Perspectiva, que integra o estado
            de toda a mesa — não apenas os dois jogadores no pot.
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
              GTO Wizard Blog. &ldquo;MDF vs ICM: Rethinking Bluffing &amp; Defense Strategies in MTTs.&rdquo; 2025.
              &mdash; confirma que MDF quebra sob ICM e que o covering player pode ser mais agressivo
              (validação parcial dos mecanismos descritos neste framework).
            </li>
          </ul>
        </section>

      </article>

      <nav className="article-nav">
        <Link href="/leitura-icm"><i className="fa-solid fa-arrow-left" style={{ marginRight: '4px' }} /> Whitepaper ICM</Link>
        <Link href="/aula-icm">Aula ICM <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></Link>
      </nav>

    </main>
  );
}
