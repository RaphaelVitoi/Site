/**
 * IDENTITY: Hermenêutica do Blefe
 * PATH: src/app/biblioteca/hermeneutica-blefe/page.tsx
 * ROLE: Artigo sobre leitura de intenções via psicanálise lacaniana aplicada ao poker.
 * BINDING: [layout.tsx, globals.css, SectionHeader, ContentFooter]
 */

import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Hermenêutica do Blefe | Raphael Vitoi',
  description: 'Lendo as intenções do oponente através da lente do excesso de gozo e da psicanálise lacaniana. A estrutura simbólica do blefe como ato de linguagem.',
};

export default function HermeneuticaBlefePage () {
  const articleUrl = "https://www.pokerracional.com/biblioteca/hermeneutica-blefe";
  const articleTitle = "Hermenêutica do Blefe | Raphael Vitoi";

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
              Hermenêutica do Blefe
            </h1>
            <p style={ { margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '580px' } }>
              A estrutura simbólica da mentira estratégica — lendo intenções através de Lacan.
            </p>
            <div style={ { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' } }>
              <span style={ {
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0.35rem 0.75rem', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-indigo-light)', textTransform: 'uppercase', letterSpacing: '0.1em',
              } }>
                <span style={ { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px rgba(16,185,129,0.5)' } } />
                { 'Artigo' }
              </span>
              <span style={ { fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" } }>
                Psicologia &bull; Comportamento &bull; Filosofia
              </span>
            </div>
          </div>

          <div style={ { display: 'flex', gap: '0.5rem', alignItems: 'center' } }>
            <Link href="/biblioteca" style={ {
              padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)', fontSize: '0.7rem',
              fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
            } }>
              <i className="fa-solid fa-arrow-left" style={ { fontSize: '0.65rem' } }></i> Biblioteca
            </Link>
          </div>
        </div>
      </div>

      {/* Seção 01: Hermenêutica como Ferramenta */ }
      <SectionHeader
        step="01"
        label="Fundação"
        title="Hermenêutica como Ferramenta"
        description="O poker é um texto. Cada ação é um signo que remete a outro signo. O problema do jogador é o mesmo do hermeneuta: extrair sentido de significantes cujo referente está deliberadamente ocultado."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>Hermenêutica é a teoria da interpretação — originalmente aplicada a textos sagrados, depois expandida para qualquer sistema de signos que exige leitura. Paul Ricoeur a definiu como &quot;a teoria das operações do entendimento em relação à interpretação de textos&quot;.</p>
            <p>O poker é um texto. Cada ação — aposta, check, timing, sizing, postura — é um signo que remete a outro signo. O problema do jogador não é diferente do problema do hermeneuta: <strong>como extrair sentido de uma cadeia de significantes cujo referente está deliberadamente ocultado?</strong></p>
            <p>A psicanálise lacaniana oferece um arcabouço único para esse problema: ela teoriza o sujeito como estruturado pela linguagem e, portanto, compulsoriamente revelado por ela — mesmo quando tenta ocultar-se.</p>
            <div className="callout callout-emerald my-8">
              <h4 style={ { marginTop: 0, color: 'var(--accent-emerald)' } }>O Axioma Central</h4>
              <p style={ { marginBottom: 0 } }>&quot;O inconsciente está estruturado como uma linguagem.&quot; — Jacques Lacan. Implicação operacional para o poker: o jogador <em>não pode</em> blefar de forma completamente limpa. O inconsciente vaza. A questão é saber onde e como decodificá-lo.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 02: O Significante e o Blefe */ }
      <SectionHeader
        step="02"
        label="Semiologia"
        title="O Significante e o Blefe"
        description="O blefe é um ato de falsificação simbólica. Mas a cadeia simbólica resiste: o inconsciente do blefador produz deslizamentos — signos que não deveriam estar ali."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>Para Lacan, o <strong>significante</strong> é a unidade básica do sistema simbólico — não a palavra em si, mas sua função diferencial em relação a outros significantes. O que uma palavra <em>significa</em> não é estável; ela significa em relação ao que não é.</p>
            <p>No poker, o bet de 75% do pot é um significante. Seu significado não é absoluto — ele depende do contexto (board, posição, história prévia, stack depth), exatamente como uma palavra depende da frase em que está inserida.</p>
            <p>O blefe, nessa estrutura, é um ato de falsificação simbólica: o jogador tenta fazer o significante &quot;bet grande no river&quot; remeter ao significado &quot;valor&quot; quando o referente real é &quot;vácuo&quot;. Mas a cadeia simbólica resiste: o inconsciente do blefador frequentemente produz <em>deslizamentos</em> — signos que não deveriam estar ali.</p>

            <h3>O Deslizamento do Significante</h3>
            <p>Lacan chamou de <em>glissement</em> (deslizamento) o movimento pelo qual o sentido escapa, transborda. Na clínica, o paciente revela o que não quis dizer. Na mesa, o jogador revela o que não quer mostrar.</p>

            <div className="overflow-x-auto my-8">
              <table className="w-full text-sm">
                <thead>
                  <tr><th>Signo</th><th>Significado pretendido</th><th>Deslizamento possível</th></tr>
                </thead>
                <tbody>
                  <tr><td>Bet rápido no river</td><td>&quot;Tenho valor, aposto com confiança&quot;</td><td>Automático, ausência de deliberação genuína (blefe preparado)</td></tr>
                  <tr><td>Pausa longa antes de bet grande</td><td>&quot;Estou calculando meu valor&quot;</td><td>Encenação de cálculo; blefes não exigem cálculo real</td></tr>
                  <tr><td>Over-bet fora do padrão de sizing</td><td>&quot;Valor máximo&quot;</td><td>Tentativa de intimidação; mão forte não precisa intimidar</td></tr>
                  <tr><td>Olhar direto após aposta</td><td>&quot;Estou confortável&quot;</td><td>Vigilância ansiosa — esperando a reação do outro</td></tr>
                  <tr><td>Conversa durante o pot</td><td>Descontração</td><td>Dissociação defensiva; engajamento verbal supre a ansiedade</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 03: O Gozo e o Blefador Compulsivo */ }
      <SectionHeader
        step="03"
        label="Psicanálise"
        title="O Gozo e o Blefador Compulsivo"
        description="O blefador compulsivo não blefa por +EV. Ele blefa pelo gozo do ato: a satisfação de enganar, de 'matar' o oponente, de provar algo a si mesmo."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>O conceito lacaniano de <em>jouissance</em> — gozo — designa uma satisfação além do prazer, uma satisfação que inclui sofrimento, que não cessa mesmo quando deveria. É o conceito que explica comportamentos autossabotadores e compulsivos.</p>
            <p>No poker, o blefador compulsivo não blefa por +EV. Ele blefa pelo <strong>gozo do ato</strong>: a satisfação de enganar, de &quot;matar&quot; o oponente, de provar algo — a si mesmo, ao adversário, à mesa. O resultado monetário é secundário ao imperativo do gozo.</p>
            <div className="callout callout-emerald my-8">
              <h4 style={ { marginTop: 0, color: 'var(--accent-emerald)' } }>O Blefe como Afirmação do Sujeito</h4>
              <p>O blefe compulsivo frequentemente tem uma estrutura narcísica: <em>&quot;Eu existo porque engano.&quot;</em> O sujeito se constitui através do reconhecimento do Outro (o oponente que foldou). Cada blefe bem-sucedido não é lucro — é confirmação de existência.</p>
              <p style={ { marginBottom: 0 } }>Isso explica a autoexposição: o blefador compulsivo muitas vezes mostra o blefe. Não por erro estratégico — por necessidade estrutural. Precisa ser reconhecido como aquele que enganou.</p>
            </div>
            <p>A implicação para a leitura: identifique quem na mesa tem relação compulsiva com o blefe. O tell não está na mão específica — está no padrão comportamental ao longo da sessão. O gozo tem frequência. Ele volta.</p>
          </div>
        </div>
      </div>

      {/* Seção 04: O Grande Outro e a Construção de Ranges */ }
      <SectionHeader
        step="04"
        label="Estrutura"
        title="O Grande Outro e a Construção de Ranges"
        description="O Grande Outro é a percepção que o oponente tem de você. Cada decisão é simultaneamente uma ação e uma mensagem enviada ao Outro."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>Lacan chamou de <em>Grand Autre</em> — o Grande Outro — o conjunto de normas, expectativas e simbolismo que estrutura o mundo do sujeito. O sujeito sempre age <em>em relação a</em> o Outro, mesmo quando tenta ignorá-lo.</p>
            <p>No poker, o Grande Outro é a <em>percepção que o oponente tem de você</em> — seu range percebido, sua imagem de mesa, sua reputação. Cada decisão é simultaneamente uma ação e uma mensagem enviada ao Outro.</p>
            <p>O jogador avançado explora isso: ele age de forma que o Outro construa um modelo de range errado. O blefe funciona não porque a mão é invisível — mas porque o contexto simbólico (imagem de mesa, histórico de ações, bet sizing padrão) faz o Outro <em>ver</em> valor onde há vazio.</p>

            <h3>A Interpretação como Escuta Flutuante</h3>
            <p>Freud descreveu a atenção analítica ideal como <em>atenção flutuante</em>: sem foco fixo, sem hierarquia de relevância pré-definida. O analista escuta tudo de forma equivalente, porque não sabe de antemão onde o sentido vai emergir.</p>
            <p>A leitura de oponentes exige o mesmo: não fixar atenção exclusivamente em bet sizing ou timing, mas manter escuta flutuante sobre todos os signos — e deixar que padrões emergentes revelem o que o oponente quer ocultar.</p>
            <div className="callout callout-emerald my-8">
              <h4 style={ { marginTop: 0, color: 'var(--accent-emerald)' } }>Protocolo de Escuta Flutuante</h4>
              <ol style={ { margin: 0, paddingLeft: '1.5rem' } }>
                <li>Registre os pots em que o oponente foi a showdown — mãos e linhas tomadas.</li>
                <li>Note quando a linha tomada <em>diverge</em> do esperado pelo range declarado.</li>
                <li>Identifique os signos que acompanharam essa divergência (timing, sizing, comportamento).</li>
                <li>Na próxima divergência de signos, questione o range — não confirme.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 05: Limites e Síntese */ }
      <SectionHeader
        step="05"
        label="Limites"
        title="O Poker como Análise"
        description="A psicanálise aplicada ao poker não produz certezas. Produz hipóteses de range com evidência qualitativa — ajustes probabilísticos, não revelações."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>Toda hermenêutica tem limites. O risco central é a <em>sobreinterpretação</em>: ver sentido onde há ruído. Um bet rápido pode ser gozo — ou pode ser que o jogador estava distraído. A pausa pode ser cálculo real ou encenação.</p>
            <p>A psicanálise lacaniana, aplicada ao poker, não produz certezas. Produz <strong>hipóteses de range</strong> com evidência qualitativa. Essas hipóteses devem ser tratadas como ajustes probabilísticos, não como revelações.</p>
            <p>O método funciona melhor como complemento da análise de frequências, não como substituto. A pergunta certa não é &quot;ele está blefando?&quot; mas &quot;dado tudo que observo, qual é a distribuição mais provável de sua mão?&quot; — e os signos lacanianos são mais uma variável nessa distribuição.</p>
            <hr className="border-white/10 my-8" />
            <p>O analista e o jogador de poker fazem o mesmo trabalho: extraem sentido de uma cadeia de signos cujo referente está oculto, produzido por um sujeito que simultaneamente quer e não quer revelar-se.</p>
            <p>A diferença é que o analista quer a verdade do sujeito para libertá-lo. O jogador quer a verdade do sujeito para explorá-lo. A hermenêutica serve a ambos.</p>
            <div className="callout callout-emerald my-8">
              <h4 style={ { marginTop: 0, color: 'var(--accent-emerald)' } }>Síntese</h4>
              <p style={ { marginBottom: 0 } }>O blefe é um ato de linguagem. Como todo ato de linguagem, ele é atravessado pelo inconsciente e portanto parcialmente legível. A leitura não é mágica — é metodológica. O sujeito revela o que quer ocultar, porque a linguagem que o constitui também o expõe.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referências */ }
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 1rem' } }>
        <div style={ { padding: '1.5rem 2rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)' } }>
          <h4 style={ { margin: '0 0 1rem', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' } }>Referências e Atribuições</h4>
          <ul style={ { margin: 0, padding: '0 0 0 1.2rem', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.6 } }>
            <li><strong style={ { color: 'var(--text-muted)' } }>Jacques Lacan</strong> — <em>Écrits</em> (Seuil, 1966). Conceitos: significante, jouissance, Grand Autre, glissement.</li>
            <li><strong style={ { color: 'var(--text-muted)' } }>Paul Ricoeur</strong> — <em>De l&apos;interprétation: Essai sur Freud</em> (Seuil, 1965). Teoria hermenêutica aplicada.</li>
            <li><strong style={ { color: 'var(--text-muted)' } }>Sigmund Freud</strong> — <em>Ratschläge für den Arzt bei der psychoanalytischen Behandlung</em> (1912). Atenção flutuante.</li>
            <li><strong style={ { color: 'var(--text-muted)' } }>Hermenêutica do Blefe, Protocolo de Escuta Flutuante aplicado ao poker</strong> — Raphael Vitoi (2025).</li>
          </ul>
        </div>
      </div>

      {/* Footer */ }
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <ContentFooter
          shareTitle={ articleTitle }
          shareUrl={ articleUrl }
          backLinkHref="/biblioteca"
          backLinkText="Voltar para a Biblioteca"
        />
      </div>
    </div>
  );
}
