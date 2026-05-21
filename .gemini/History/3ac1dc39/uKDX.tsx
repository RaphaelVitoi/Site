import Link from 'next/link';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import ShareButtons from '@/components/content/ShareButtons';
import Dashboard from '@/components/nexus/Dashboard';

export const metadata = {
    title: 'Entendendo o ICM e suas heurísticas | Poker Racional',
    description: 'Compreenda o ICM e suas heurísticas através da análise de RPs e Toy Games.',
  title: 'Nexus Orchestrator | Telemetria SOTA',
};

const markdownContent = String.raw`
> Aprenda como interpretar o RP e de que maneira podemos usá-lo à nosso favor pós-flop

Nesta aula, Raphael Vitoi aborda de maneira clara e objetiva alguns conceitos essenciais do ICM (Independent Chip Model) utilizando uma variedade de metodologias educativas. Ele emprega desde toy-games sofisticados para destacar teorias relacionadas a situações de alto Risk Premium (RP), até uma análise crítica dos cenários para identificar pontos fortes e fracos atuais. Combinando sua compreensão aprofundada da teoria do jogo com a experiência adquirida como um dos melhores jogadores do mundo, Raphael Vitoi também apresenta uma coleção pedagógica de scripts e cenários que elucidam padrões e situações complexas, destacando a premissa de que o ICM pós-flop é muito mais complexo e contra intuitivo do que muitos imaginam, revelando uma grande oportunidade de ganho de vantagem competitiva (Edge).

## Antevisão

Um dos aspectos fundamentais abordados é a "Antevisão". Hoje em dia, o conhecimento teórico sobre poker está muito mais acessível e prático do que há uma década, pois está disponível através de uma variedade de recursos, incluindo materiais gratuitos, cursos avançados, ferramentas educativas poderosas, Solucionadores de Situações Complexas (SOLVERS) e trackers rigorosos como o Hand2Note, que coletam e disponibilizam dados de jogadores e seus torneios. Essas informações permitem que jogadores e analistas desvendem os jogos da população e os padrões de adversários para desenvolver estratégias precisas de exploração.

Embora os jogadores estejam se aprimorando teoricamente, Raphael Vitoi observa que ainda existem áreas negligenciadas, especialmente o ICM Pós-Flop, onde muitas fraquezas são perceptíveis mesmo entre jogadores regulares. Ele destaca que muitos profissionais ainda utilizam exercícios baseados em CHIPEV para treinar e estudar o jogo, embora, fora das situações de heads-up, praticamente todas as fases do poker sejam influenciadas pelo ICM — desde a primeira mão até as etapas críticas como a bolha do torneio, Semi-FTs e, claro, as mesas finais. Assim, o domínio do ICM é crucial, particularmente onde o dinheiro está em jogo.

Por isso, na visão de Raphael Vitoi, a verdadeira vantagem competitiva não se encontra mais tanto nas decisões pré-flop baseadas em ICM, especialmente em stakes altos, mas sim no jogo pós-flop, onde ainda há muito a ser explorado e maximizado em termos de valor esperado (EV).

## TOY GAME

O conceito de "toy-game" no poker refere-se a uma versão simplificada do jogo, comumente utilizada para análises teóricas ou discussões estratégicas. São ferramentas educativas projetadas para descomplicar o universo complexo do poker. Este modelo reduz as variáveis do jogo real para facilitar o entendimento e a análise de conceitos específicos, como Equilíbrio de Nash, MDF (Minimum Defense Frequency), ICM (Independent Chip Model), entre outros.

Um exemplo prático de toy-game são os **solvers**. Estes programas funcionam como simuladores que simplificam o jogo de poker, utilizando a teoria dos jogos para solucionar mãos e oferecer insights sobre estratégias otimizadas. Contudo, é crucial entender que solvers não representam a realidade completa do poker. Eles são uma ferramenta valiosa para estudos e evolução, especialmente quando combinados com técnicas como nodelocking e uma abordagem meticulosa de MDA (Análise Massiva de Database) — um processo que exige uma amostragem extensa e altamente filtrada para ser eficaz. (Dica: Busque sempre o IDA.)

Importante ressaltar que, embora o GTO (Game Theory Optimal) simboliza o conjunto de conceitos teóricos do poker, a sua utilização mecânica está mais para a construção de uma EQUAÇÃO ESTRATÉGICA do que necessariamente a apresentação de soluções e resultados fixos, já que os dados utilizados nos solvers precisam ser de alta credibilidade para que as soluções apresentadas sejam confiáveis. A precisão desses dados é crucial, pois o poker é um jogo de informação incompleta e influenciado fortemente por fatores emocionais e criativos. É extremamente recomendável que você não foque no resultado da solução de um SOLVER e sim na interpretação e no reconhecimento da LINGUAGEM TEÓRICA do solver e dos objetivos teóricos que o solver está procurando atingir. 

**Considerações sobre o uso de solvers**:
- Solvers também são uma forma de inteligência artificial com limitações, operando dentro das condições definidas pelo usuário. Ao configurar cenários com premissas como ranges e tamanhos de apostas pré-estimadas, você pode inadvertidamente restringir o solver a um conjunto limitado de possibilidades.
- Solvers têm dificuldades em incorporar elementos subjetivos do jogo, como percepção de imagem, tells, FGS, EDGE e outras nuances humanas que são cruciais nas mesas de poker reais.

## Sobre o RP (Risk Premium)

O RP é uma métrica central no ICM, ajudando a estimar o impacto das decisões em situações específicas de torneio. Ele justifica decisões baseadas no equilíbrio entre o risco envolvido e o potencial retorno. No poker, cada stack tem um valor monetário implícito, que reflete uma parte do prizepool remanescente. Essa distribuição afeta como os jogadores devem abordar suas decisões estratégicas, especialmente em situações de risco elevado, como colisões iminentes pré-flop, onde é essencial atribuir equities extras aos ranges para justificar a entrada em situações arriscadas.

O RP é influenciado não apenas pela interação direta entre duas stacks, mas também pela configuração geral das stacks na mesa. Cada jogador e cada stack exercem influência mútua, criando um ambiente dinâmico onde as decisões de um jogador repercutem em todo o campo de jogo.

Raphael Vitoi usa o exemplo de um torneio com buy-in de 10k, porém, no contexto do ICM, o valor do buy-in é irrelevante em relação a proporção do prizepool que um jogador poderia reivindicar se o torneio terminasse imediatamente. Essa abordagem destaca a importância de compreender profundamente o ICM e o RP para otimizar as estratégias em torneios de poker.

É crucial reconhecer que o maior stack na mesa não reflete diretamente o valor do primeiro prêmio, assim como o menor stack não corresponde automaticamente ao valor do último prêmio. O chip leader possui uma avaliação monetária inferior ao prêmio máximo devido a fatores probabilísticos.

**Esperança Matemática:** Embora o líder em fichas possa eliminar adversários e aumentar seu próprio stack, ele nunca atingirá um valor equivalente ao prêmio máximo, já que sempre há a possibilidade matemática dos demais jogadores acumularem fichas e melhorarem suas perspectivas em relação aos prêmios superiores. Por outro lado, o jogador com o menor stack tem, de forma intrínseca, uma avaliação superior ao prêmio mínimo, pois também tem chances de melhorar sua situação ao acumular fichas. Além disso, existe a possibilidade de os jogadores intermediários colidirem, um evento que deveria ser controlado através de Risk Premiums (RPs) significativos entre eles.

Existem dois tipos de RPs em um cenário de Single Raised Pot (SRP): podemos denominar o RP do jogador que abre a rodada como "RP de ida" e o do jogador que responde como "RP de volta". Esses RPs geralmente diferem e a dinâmica entre eles é crucial na estratégia:

- Se os RPs são similares, isso pode levar a uma estratégia mais passiva, pois ambos os jogadores enfrentam riscos semelhantes e não têm incentivos para aplicar pressão adicional ao jogador com o maior RP.
- Se o "RP de ida" for maior que o "RP de volta" (por exemplo, 25% maior), essa diferença pode simbolizar a quantidade de pressão adicional que o jogador com o menor RP poderia aplicar, bem como o nível de cautela que o jogador com maior RP deve manter.
- Se o "RP de volta" for o dobro do "RP de ida", o jogador com o menor RP pode exercer uma pressão substancial tanto pré quanto pós-flop, enquanto o jogador com o maior RP deve agir com extrema cautela.

A diferença entre os RPs é conhecida como Vantagem ou Desvantagem de Risco. Isso indica que um jogador sempre terá uma vantagem de risco, enquanto o outro enfrenta uma desvantagem. É importante notar que o solver não leva em consideração desvantagens extras como estar fora de posição ou desvantagem de edge, ou seja, é possível que haja um acúmulo de desvantagens não previsto pelo programa.

Adicionalmente, enfrentar um jogador com um RP maior implica que a máxima realização desse RP pode resultar em uma situação crítica de dobrar ou ser eliminado para o jogador com o maior RP. Cobrir e ser coberto afeta diretamente essa métrica. Cobrir significativamente diminui o seu RP, especialmente se a confrontação com uma determinada stack não prejudicar significativamente suas perspectivas ou sua esperança matemática na mesa final.

Quando existem jogadores prestes a serem eliminados, o RP médio na mesa aumenta. O jogador capaz de eliminar outros sem prejudicar muito sua própria stack possui uma vantagem estratégica considerável e deve intensificar a pressão sobre a mesa. A presença de várias stacks à beira da eliminação eleva tanto o ICM quanto o RP médio das stacks intermediárias, dificultando sua movimentação no jogo. O incentivo para jogar pots diminui se houver um chip leader ativo, pois ele pode utilizar a pressão do RP para impor estratégias agressivas.

As configurações da mesa geram diversos RPs e a estrutura de payjumps da mesa final influencia diretamente esses valores. Em structures "top-heavy", onde a premiação se concentra no topo, o RP das stacks menores é reduzido, incentivando-os a arriscar mais. Em contraste, em uma estrutura mais equilibrada, o RP das stacks menores aumenta, refletindo um cenário onde a queda em posições inferiores é menos punitiva.

Finalmente, à medida que o número de jogadores na mesa final diminui, o RP médio também cai, uma vez que a maior tragédia potencial imediata seria o vice-líder ser eliminado em último lugar numa situação de poucos jogadores, o que, embora desagradável, é menos catastrófico do que em um cenário mais amplo.

## TOY GAME CLÁSSICO CHIP EV pt1
 
- Range IP: AA, QQ, JJ (18 combos)
- Range OOP: KK (6 combos)
- Pote: 100 fichas
- Única aposta possível: 100 fichas (all in)
- OOP (KK) fala primeiro e SEMPRE checka.
- BOARD: 22223

AA (valor), QQ e JJ (potenciais blefes) devem balancear suas estratégias entre shove e check, enquanto o KK (bluffcatcher puro) deve defender uma frequência adequada para prevenir que seu oponente lucre com quaisquer duas cartas. Raphael Vitoi emprega o Piosolver para ilustrar esses conceitos de maneira didática, adicionando ainda uma dimensão de análise através do contraste entre a teoria pura e a influência do Risk Premium (RP) nesse contexto.

### Toy Game 1 (Chip EV)
IP (6 combos de value, 3 combos de bluff)

!Range IP (Toy Game 1 - Chip EV)
!Range OOP (Toy Game 1 - Chip EV)

KK paga 50% das vezes para neutralizar o EV dos bluffs do IP.  
a = (100 / 200 = 0,5)
0,5 (x100 = 50%)
1-a = 50% 

### Toy Game 2 (RP IP 3 OOP 6)

!Range IP (Toy Game 2 - RP IP 3 OOP 6)
!Range OOP (Toy Game 2 - RP IP 3 OOP 6)

O jogador em posição (IP) aumentou o número de bluffs, passando de 3 para 4,2 combinações, enquanto o jogador fora de posição (OOP) começou a desistir um pouco mais.

**Motivo**: A influência do ICM. Ambos possuem um Risk Premium (RP) relativamente baixo, indicando baixo risco, embora ainda presente. Para o OOP, o risco é maior. O IP possui uma vantagem de risco significativa e não enfrenta o risco de eliminação ao fazer um shove. Dados os RPs, é provável que ambos não estejam nas melhores posições em termos de perspectiva e expectativa matemática numa mesa final hipotética.

### Toy Game 3 (RP IP 3 OOP 9)

!Range IP (Toy Game 3)
!Range OOP (Toy Game 3)

O jogador em posição (IP) agora blefa mais, aumentando de 4,2 combinações de blefe para 5. Contudo, apesar dessa mudança, o jogador fora de posição (OOP) não está desistindo mais do que no RP (Risk Premium) anterior.

### Toy Game 4 (RP IP 3 OOP 18)

!Range IP (Toy Game 4)
!Range OOP (Toy Game 4)

No cenário atual, o jogador em posição (IP) aumentou ainda mais os blefes! Temos seis combinações de valor contra oito de blefe, o que é claramente desbalanceado do ponto de vista de ChipEV. 

### Toy Game 5 (RP IP 3 OOP 24)

!Range IP (Toy Game 5 - RP IP 3 OOP 24)
!Range OOP (Toy Game 5 - RP IP 3 OOP 24)

Agora, vamos considerar essa notável diferença em RP (Risk Premium). Quanto maior for a discrepância entre os RPs e mais alto o RP do jogador pressionado, mais agressivamente atacamos como jogador em posição (IP).

## Parte II - Invertendo o RP
 
### Toy Game 1 (RP IP 9 OOP 3)
 
IP agora possui RP maior. O que muda?

!Range IP (Inversão 1 - RP IP 9 OOP 3)
!Range OOP (Inversão 1 - RP IP 9 OOP 3)

O OOP, com menor Risk Premium, PAGA MENOS vs o mesmo range que continua mais inclinado para os bluffs.
 
### Toy Game 2 (IP 18 RP e OOP 3)
 
O IP agora tem 18% de RP, o que é um valor de risco absurdo, e continua shovando o MESMO range levemente inclinado aos bluffs.

!Range IP (Inversão 2 - RP IP 18 OOP 3)
!Range OOP (Inversão 2 - RP IP 18 OOP 3)

E o OOP, com baixíssimo RP e risco, SEGUE A FOLDAR CADA VEZ MAIS vs o mesmo range levemente inclinado a bluff.
 
### Toy Game 3 (IP RP21 OOP RP3)
 
Exatamente o mesmo range de shove do IP, levemente inclinado ao bluff.

!Range IP (Inversão 3 - RP IP 21 OOP 3)
!Range OOP (Inversão 3 - RP IP 21 OOP 3)

E o OOP, com baixíssimo RP e risco, já está alcançando quase 80% de fold!!!
`;

export default function EntendendoIcmPage() {
    // Estimativa SOTA de tempo de leitura
    const wordCount = markdownContent.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-900 selection:text-cyan-50 py-20 px-6">
            <article className="max-w-4xl mx-auto relative">

                {/* Botao Voltar */}
                <Link href="/biblioteca" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 hover:text-indigo-400 transition-colors uppercase mb-12">
                    <i className="fa-solid fa-arrow-left"></i> Voltar para o Acervo
                </Link>

                {/* Hero do Artigo */}
                <header className="mb-14 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-3 py-1.5 rounded border border-indigo-500/20">
                            <i className="fa-solid fa-book-journal-whills mr-1.5"></i> biblioteca
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                            <i className="fa-regular fa-clock"></i> {readTime} min de leitura
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-400 mb-6 leading-tight">
                        Entendendo o ICM e suas heurísticas
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed border-l-2 border-indigo-500/30 pl-4">Compreenda o ICM e suas heurísticas através da análise de RPs e Toy Games.</p>
                </header>

                {/* Corpo do Documento */}
                <div className="p-8 md:p-12 bg-[#0a0f1d] border border-slate-800/80 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] prose prose-invert prose-slate prose-lg max-w-none prose-headings:text-slate-100 prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-img:rounded-xl prose-img:border prose-img:border-slate-800 prose-hr:border-slate-800/80 relative z-10">
                    <MarkdownRenderer content={markdownContent} />
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800/80 flex justify-between items-center relative z-10">
                    <ShareButtons title="Entendendo o ICM e suas heurísticas" url={`https://pokerracional.com/biblioteca/entendendo-o-icm-e-suas-heuristicas`} />
                </div>

                {/* Glow de Fundo SOTA */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            </article>
        </main>
    );
export default function DashboardRoute() {
  return <Dashboard />;
}