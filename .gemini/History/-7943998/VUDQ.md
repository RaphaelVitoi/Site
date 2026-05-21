# Entendendo o ICM e suas heuristicas

Aprenda como interpretar o RP e de que maneira podemos usa-lo a nosso favor pos-flop

Nesta aula, Raphael Vitoi aborda de maneira clara e objetiva alguns conceitos essenciais do ICM (Independent Chip Model) utilizando uma variedade de metodologias educativas. Ele emprega desde toy-games sofisticados para destacar teorias relacionadas a situacoes de alto Risk Premium (RP), ate uma analise critica dos cenarios para identificar pontos fortes e fracos atuais. Combinando sua compreensao aprofundada da teoria do jogo com a experiencia adquirida como um dos educadores mais dedicados do jogo, Raphael Vitoi tambem apresenta uma colecao pedagogica de scripts e cenarios que elucidam padroes e situacoes complexas, destacando a premissa de que o ICM pos-flop e muito mais complexo e contra intuitivo do que muitos imaginam, revelando uma grande oportunidade de ganho de vantagem competitiva (Edge).

## Antevisao

Um dos aspectos fundamentais abordados e a "Antevisao". Hoje em dia, o conhecimento teorico sobre poker esta muito mais acessivel e pratico do que ha uma decada, pois esta disponivel atraves de uma variedade de recursos, incluindo materiais gratuitos, cursos avancados, ferramentas educativas poderosas, Solucionadores de Situacoes Complexas (SOLVERS) e trackers rigorosos como o Hand2Note, que coletam e disponibilizam dados de jogadores e seus torneios. Essas informacoes permitem que jogadores e analistas desvendem os jogos da populacao e os padroes de adversarios para desenvolver estrategias precisas de exploracao.

Embora os jogadores estejam se aprimorando teoricamente, Raphael Vitoi observa que ainda existem areas negligenciadas, especialmente o ICM Pos-Flop, onde muitas fraquezas sao perceptiveis mesmo entre jogadores regulares. Ele destaca que muitos profissionais ainda utilizam exercicios baseados em CHIPEV para treinar e estudar o jogo, embora, fora das situacoes de heads-up, praticamente todas as fases do poker sejam influenciadas pelo ICM - desde a primeira mao ate as etapas criticas como a bolha do torneio, Semi-FTs e, claro, as mesas finais. Assim, o dominio do ICM e crucial, particularmente onde o dinheiro esta em jogo.

Por isso, na visao de Raphael Vitoi, a verdadeira vantagem competitiva nao se encontra mais tanto nas decisoes pre-flop baseadas em ICM, especialmente em stakes altos, mas sim no jogo pos-flop, onde ainda ha muito a ser explorado e maximizado em termos de valor esperado (EV).

## TOY GAME

O conceito de "toy-game" no poker refere-se a uma versao simplificada do jogo, comumente utilizada para analises teoricas ou discussoes estrategicas. Sao ferramentas educativas projetadas para descomplicar o universo complexo do poker. Este modelo reduz as variaveis do jogo real para facilitar o entendimento e a analise de conceitos especificos, como Equilibrio de Nash, MDF (Minimum Defense Frequency), ICM (Independent Chip Model), entre outros.

Um exemplo pratico de toy-game sao os **solvers**. Estes programas funcionam como simuladores que simplificam o jogo de poker, utilizando a teoria dos jogos para solucionar maos e oferecer insights sobre estrategias otimizadas. Contudo, e crucial entender que solvers nao representam a realidade completa do poker. Eles sao uma ferramenta valiosa para estudos e evolucao, especialmente quando combinados com tecnicas como nodelocking e uma abordagem meticulosa de MDA (Analise Massiva de Database) - um processo que exige uma amostragem extensa e altamente filtrada para ser eficaz. (Dica: Busque sempre o IDA.)

Importante ressaltar que, embora o GTO (Game Theory Optimal) simboliza o conjunto de conceitos teoricos do poker, a sua utilizacao mecanica esta mais para a construcao de uma EQUACAO ESTRATEGICA do que necessariamente a apresentacao de solucoes e resultados fixos, ja que os dados utilizados nos solvers precisam ser de alta credibilidade para que as solucoes apresentadas sejam confiaveis. A precisao desses dados e crucial, pois o poker e um jogo de informacao incompleta e influenciado fortemente por fatores emocionais e criativos. E extremamente recomendavel que voce nao foque no resultado da solucao de um SOLVER e sim na interpretacao e no reconhecimento da LINGUAGEM TEORICA do solver e dos objetivos teoricos que o solver esta procurando atingir.

**Consideracoes sobre o uso de solvers**:

* Solvers tambem sao uma forma de inteligencia artificial com limitacoes, operando dentro das condicoes definidas pelo usuario. Ao configurar cenarios com premissas como ranges e tamanhos de apostas pre-estimadas, voce pode inadvertidamente restringir o solver a um conjunto limitado de possibilidades.
* Solvers tem dificuldades em incorporar elementos subjetivos do jogo, como percepcao de imagem, tells, FGS, EDGE e outras nuances humanas que sao cruciais nas mesas de poker reais.

## Sobre o RP (Risk Premium)

O RP e uma metrica central no ICM, ajudando a estimar o impacto das decisoes em situacoes especificas de torneio. Ele justifica decisoes baseadas no equilibrio entre o risco envolvido e o potencial retorno. No poker, cada stack tem um valor monetario implicito, que reflete uma parte do prizepool remanescente. Essa distribuicao afeta como os jogadores devem abordar suas decisoes estrategicas, especialmente em situacoes de risco elevado, como colisoes iminentes pre-flop, onde e essencial atribuir equities extras aos ranges para justificar a entrada em situacoes arriscadas.

O RP e influenciado nao apenas pela interacao direta entre duas stacks, mas tambem pela configuracao geral das stacks na mesa. Cada jogador e cada stack exercem influencia mutua, criando um ambiente dinamico onde as decisoes de um jogador repercutem em todo o campo de jogo.

Raphael Vitoi usa o exemplo de um torneio com buy-in de 10k, porem, no contexto do ICM, o valor do buy-in e irrelevante em relacao a proporcao do prizepool que um jogador poderia reivindicar se o torneio terminasse imediatamente. Essa abordagem destaca a importancia de compreender profundamente o ICM e o RP para otimizar as estrategias em torneios de poker.

E crucial reconhecer que o maior stack na mesa nao reflete diretamente o valor do primeiro premio, assim como o menor stack nao corresponde automaticamente ao valor do ultimo premio. O chip leader possui uma avaliacao monetaria inferior ao premio maximo devido a fatores probabilisticos.

**Esperanca Matematica:** Embora o lider em fichas possa eliminar adversarios e aumentar seu proprio stack, ele nunca atingira um valor equivalente ao premio maximo, ja que sempre ha a possibilidade matematica dos demais jogadores acumularem fichas e melhorarem suas perspectivas em relacao aos premios superiores. Por outro lado, o jogador com o menor stack tem, de forma intrinseca, uma avaliacao superior ao premio minimo, pois tambem tem chances de melhorar sua situacao ao acumular fichas. Alem disso, existe a possibilidade de os jogadores intermediarios colidirem, um evento que deveria ser controlado atraves de Risk Premiums (RPs) significativos entre eles.

Existem dois tipos de RPs em um cenario de Single Raised Pot (SRP): podemos denominar o RP do jogador que abre a rodada como "RP de ida" e o do jogador que responde como "RP de volta". Esses RPs geralmente diferem e a dinamica entre eles e crucial na estrategia:

* Se os RPs sao similares, isso pode levar a uma estrategia mais passiva, pois ambos os jogadores enfrentam riscos semelhantes e nao tem incentivos para aplicar pressao adicional ao jogador com o maior RP.
* Se o "RP de ida" for maior que o "RP de volta" (por exemplo, 25% maior), essa diferenca pode simbolizar a quantidade de pressao adicional que o jogador com o menor RP poderia aplicar, bem como o nivel de cautela que o jogador com maior RP deve manter.
* Se o "RP de volta" for o dobro do "RP de ida", o jogador com o menor RP pode exercer uma pressao substancial tanto pre quanto pos-flop, enquanto o jogador com o maior RP deve agir com extrema cautela.

A diferenca entre os RPs e conhecida como Vantagem ou Desvantagem de Risco. Isso indica que um jogador sempre tera uma vantagem de risco, enquanto o outro enfrenta uma desvantagem. E importante notar que o solver nao leva em consideracao desvantagens extras como estar fora de posicao ou desvantagem de edge, ou seja, e possivel que haja um acumulo de desvantagens nao previsto pelo programa.

Adicionalmente, enfrentar um jogador com um RP maior implica que a maxima realizacao desse RP pode resultar em uma situacao critica de dobrar ou ser eliminado para o jogador com o maior RP. Cobrir e ser coberto afeta diretamente essa metrica. Cobrir significativamente diminui o seu RP, especialmente se a confrontacao com uma determinada stack nao prejudicar significativamente suas perspectivas ou sua esperanca matematica na mesa final.

Quando existem jogadores prestes a serem eliminados, o RP medio na mesa aumenta. O jogador capaz de eliminar outros sem prejudicar muito sua propria stack possui uma vantagem estrategica consideravel e deve intensificar a pressao sobre a mesa. A presenca de varias stacks a beira da eliminacao eleva tanto o ICM quanto o RP medio das stacks intermediarias, dificultando sua movimentacao no jogo. O incentivo para jogar pots diminui se houver um chip leader ativo, pois ele pode utilizar a pressao do RP para impor estrategias agressivas.

As configuracoes da mesa geram diversos RPs e a estrutura de payjumps da mesa final influencia diretamente esses valores. Em estruturas "top-heavy", onde a premiacao se concentra no topo, o RP das stacks menores e reduzido, incentivando-os a arriscar mais. Em contraste, em uma estrutura mais equilibrada, o RP das stacks menores aumenta, refletindo um cenario onde a queda em posicoes inferiores e menos punitiva.

Finalmente, a medida que o numero de jogadores na mesa final diminui, o RP medio tambem cai, uma vez que a maior tragedia potencial imediata seria o vice-lider ser eliminado em ultimo lugar numa situacao de poucos jogadores, o que, embora desagradavel, e menos catastrofico do que em um cenario mais amplo.

## TOY GAME CLASSICO CHIP EV pt1

* Range IP: AA, QQ, JJ (18 combos)
* Range OOP: KK (6 combos)
* Pote: 100 fichas
* Unica aposta possivel: 100 fichas (all in)
* OOP (KK) fala primeiro e SEMPRE checka.
* BOARD: 22223

AA (valor), QQ e JJ (potenciais blefes) devem balancear suas estrategias entre shove e check, enquanto o KK (bluffcatcher puro) deve defender uma frequencia adequada para prevenir que seu oponente lucre com quaisquer duas cartas. Raphael Vitoi emprega o Piosolver para ilustrar esses conceitos de maneira didatica, adicionando ainda uma dimensao de analise atraves do contraste entre a teoria pura e a influencia do Risk Premium (RP) nesse contexto.

Esse toy-game e frequentemente encontrado dentro da literatura do poker e esta correlacionado com a apresentacao de conceitos como MDF e Nash Equilibrium.

### Toy Game 1 (Chip EV)

IP (6 combos de value, 3 combos de bluff)

KK paga 50% das vezes para neutralizar o EV dos bluffs do IP.
a = (100 / 200 = 0,5)
0,5 (x100 = 50%)
1-a = 50%

### Toy Game 2 (RP IP 3 OOP 6)

O jogador em posicao (IP) aumentou o numero de bluffs, passando de 3 para 4,2 combinacoes, enquanto o jogador fora de posicao (OOP) comecou a desistir um pouco mais.

**Motivo**: A influencia do ICM. Ambos possuem um Risk Premium (RP) relativamente baixo, indicando baixo risco, embora ainda presente. Para o OOP, o risco e maior. O IP possui uma vantagem de risco significativa e nao enfrenta o risco de eliminacao ao fazer um shove. Dados os RPs, e provavel que ambos nao estejam nas melhores posicoes em termos de perspectiva e expectativa matematica numa mesa final hipotetica.

Quanto menor a diferenca de RP entre os jogadores, mais passivamente eles tendem a jogar, como se houvesse um acordo silencioso para evitar proporcionalmente situacoes de risco. O ICM geralmente incentiva a evitar ao maximo situacoes de alto risco, e neste cenario, o maior risco recai sobre o OOP. Ha uma grande diferenca de risco nessas situacoes: quando alguem faz um shove contra nos, ele impoe o RP+FE (Fold Equity) sobre nos e ainda garante a realizacao total de sua equity. Nao ha possibilidade de devolvermos o RP ao agressor fazendo um re-shove (o efeito de "batata quente"). Por isso, em muitas simulacoes de ICM, vemos o jogador com maior RP optando mais por shove do que por 3-bet ou call. Frequentemente, com cerca de 25bbs ou menos, tambem nao existem flats no arsenal deste jogador, especialmente em situacoes de posicao inicial contra posicao inicial, com varios outros jogadores ainda por agir e eventos a acontecer (como a possibilidade de potes multi-way, que sao prejudiciais para todos). Como mencionado, o RP e uma metrica que avalia apenas a colisao entre duas stacks e nao leva em conta varios outros fatores. Assim, em alguns cenarios, pode haver acumulacao de desvantagens que o solver nao esta necessariamente considerando.

O Risk Premium pos-flop e distribuido ao longo das streets e esta relacionado ao SPR (Stack-to-Pot Ratio): jogar um range condensado versus um range linear pos-flop geralmente nao e tao lucrativo na maioria das vezes em situacoes comuns do jogo. Ranges condensados, em geral, sao projetados para reter equity, nao necessariamente para gerar EV. Quando enfrentamos uma desvantagem de risco e temos poucas fichas, o cenario se torna ainda mais complicado. Afinal, nao e dificil para o jogador que nos cobre colocar-nos all-in ate o river. Nao temos incentivos para aumentar o pote com raises, nem mesmo estando OOP, pois isso iria contra a necessidade de evitar riscos ao mesmo tempo em que aumentaremos o pote e, consequentemente, nossa probabilidade de eliminacao. Tambem nao veremos muitos shoves, pois um range condensado nao e particularmente equipado para isso, especialmente contra um range linear ou polarizado que nos pressiona com as melhores maos de seu range.

Ao optar por jogar de call, a tendencia e continuar enfrentando pressao no turn e no river, e a medida que nossa stack diminui, nosso RP aumenta gradualmente. E improvavel que nosso range condensado consiga resistir e reter equity suficiente para superar a equity extra do Risk Premium ate o river. Portanto, nossa realizacao de equity cai, e muitas vezes temos que desistir de maos relativamente fortes frente a um shove no river ou no turn, respeitando o "Teto do RP" que e intransponivel.

### Toy Game 3 (RP IP 3 OOP 9)

O jogador em posicao (IP) agora blefa mais, aumentando de 4,2 combinacoes de blefe para 5. Contudo, apesar dessa mudanca, o jogador fora de posicao (OOP) nao esta desistindo mais do que no RP (Risk Premium) anterior. Com o RP tao baixo e a distancia significativa entre os RPs do IP e do OOP, e natural que vejamos mais blefes do IP. Entretanto, o aumento de blefes nao e proporcional ao aumento de 50% do RP anterior do OOP, nem ao aumento da distancia entre eles, indicando que ainda ha riscos para o IP e que isso nao se alinha com o conceito de "MDF" (Minimum Defense Frequency) ou de defender a pot-odds, visto que dobrar o OOP pode interferir no nosso RP futuro e ate alterar ou subverter as perspectivas.

O IP nao esta se arriscando excessivamente, maximizando a pressao enquanto minimiza o risco de transferencia de fichas para o OOP, que e seu nemesis neste toy-game (e queremos evitar que o nemesis cresca e se torne um rival mais forte).

Um ponto adicional: A famosa frase do ICM ("As fichas que perdemos valem mais do que as fichas que ganhamos") e verdadeira, mas isso e apenas o inicio da historia. Embora haja uma desproporcao no valor das fichas que ganhamos em detrimento das que perdemos, acumular fichas continua sendo benefico, especialmente se ambos os jogadores estiverem agindo conforme esperado nesse contexto de ICM. Se interpretarmos essa frase ao pe da letra, um CL disparado numa FT apenas se sentaria em sua pilha de fichas e nao jogaria mais nenhuma mao, o que sabemos que nao e pratico. O CL nao so tem interesse em aumentar sua perspectiva de ganhos e sua expectativa matematica de vitoria, mas tambem tem a responsabilidade de dificultar que jogadores que possam rivalizar com ele acumulem fichas dos outros jogadores. Como ja mencionado, um evento de colisao ou de acumulacao/perda de fichas numa FT, mesmo envolvendo apenas dois jogadores, influencia a avaliacao da stack e a expectativa matematica de todos os outros jogadores que NAO PARTICIPARAM do evento! Para alguns, essa influencia sera positiva (por exemplo, o ultimo em fichas que ganha valuation e ainda embolsa um payjump pela queda do terceiro em fichas). Para outros, o efeito sera negativo (como o penultimo em fichas que ve o ultimo dobrar sobre o CL e agora se torna o ultimo, diminuindo sua valorizacao enquanto aumenta sua probabilidade de cair nas ultimas posicoes).

Neste caso, ao permitir que o OOP acumule mais fichas do que deveria, o IP (CL) interfere diretamente em sua propria perspectiva de vitoria e na sua expectativa matematica ao deixar que o stack do seu rival aumente.

O OOP, por sua vez, atingiu o "Teto do RP". Em um range formado inteiramente por bluffcatchers contra um range polarizado que sempre contem o topo, ha sempre uma chance palpavel de ser eliminado. E ser eliminado com 9% de RP nao e desejavel, a menos que a proporcao de blefes do IP esteja extremamente exagerada. Assim, o solver identificou a "linha de corte", equilibrando a frequencia de blefes do IP para manter a frequencia limite em que os bluffcatchers do OOP poderiam ousar pagar o shove. Note que ele nao esta desistindo mais vezes do KK. Ele esta defendendo a mesma quantidade, exatamente onde o RP permite que ele defenda. No entanto, ele esta enfrentando esse evento com uma frequencia maior. O IP, ciente disso (afinal, e o solver e o solver tem essa videncia), esta realizando mais vezes a conquista do pote, com a concordancia do OOP que, de outra forma, estaria assumindo muito mais risco do que seu range pode justificar nesse cenario. De maneira um tanto contra-intuitiva, ambos estao fazendo o que e melhor para eles individualmente, cada um dentro de seu contexto, como se fosse um pacto silencioso (sim, alcancamos o Equilibrio de Nash).

### Toy Game 4 (RP IP 3 OOP 18)

No cenario atual, o jogador em posicao (IP) aumentou ainda mais os blefes! Temos seis combinacoes de valor contra oito de blefe, o que e claramente desbalanceado do ponto de vista de ChipEV. Normalmente, em um contexto de ChipEV equilibrado, o KK pagaria 100% das vezes. No entanto, neste caso especifico, o KK ainda continua pagando apenas ate o "Teto do RP".

### Toy Game 5 (RP IP 3 OOP 24)

Agora, vamos considerar essa notavel diferenca em RP (Risk Premium). Quanto maior for a discrepancia entre os RPs e mais alto o RP do jogador pressionado, mais agressivamente atacamos como jogador em posicao (IP). E, mantendo a mesma linha de raciocinio, o KK continua seguindo a mesma logica: pagando no limite superior do RP.

E importante destacar que, assim como nao podemos pagar com 100% dos bluffcatchers quando o lider de fichas (CL) faz um shove com quase todo o seu range, isso nao implica que devemos sempre evitar dar call com uma frequencia razoavel de bluffcatchers nesse cenario de alta pressao de RP. As respostas adequadas da Teoria do Jogo em ambientes de ICM raramente sao extremas.

O Poker e uma ciencia!

Todos esses resultados tem validacao matematica. Dan Almeida e Raphael Vitoi realizaram esses calculos. Contudo, Raphael Vitoi recomenda nao dedicar excessivo tempo a essa analise, a menos que se tenha um interesse particular e um gosto pela matematica pura dessas situacoes. Ele observa: "E um estudo interessante, porem de pouco valor instrutivo."

Frequentemente, a matematica nao ilumina adequadamente o CONCEITO ou as interacoes entre as diversas variaveis dentro do jogo, especialmente no contexto de toy-games. Mesmo validando essas analises, elas nao necessariamente facilitam o aprendizado. Pessoalmente, eu sugiro adotar abordagens mais voltadas para o raciocinio logico-critico e reflexoes filosoficas ao discutirmos cenarios polemicos na teoria do poker.

Lembre-se sempre: Tenha cuidado com suposicoes que se desviam da teoria estabelecida! Frases como "Esta shovando tudo, vou pagar com qualquer bluffcatcher!" podem ser perigosas. Como vimos, variaveis mecanicas do ICM restringem a possibilidade de fazer ajustes estrategicos que sao tanto arriscados quanto extremos.

## Parte II - Invertendo o RP

### Toy Game 1 (RP IP 9 OOP 3)

IP agora possui RP maior. O que muda?

Podemos observar que, embora o jogador em posicao (IP) nao comece a blefar excessivamente, comparativamente ao Toy Game 3 da Parte I, ele ainda blefa ligeiramente acima do valor esperado em fichas (ChipEV). Mesmo que o risco para o jogador fora de posicao (OOP) seja baixo, nao deixa de ser um risco. As fichas em torneios de MTT (Multi-Table Tournament) nao sao apenas fichas; elas possuem valor monetario intrinseco. E o valor em dinheiro real e superior ao valor nominal das fichas calculado pelo ChipEV.

Agora, segura essa bomba que o Raphael Vitoi aponta:

O OOP, com menor Risk Premium, PAGA MENOS vs o mesmo range que continua mais inclinado para os bluffs.

### Toy Game 2 (IP 18 RP e OOP 3)

O IP agora tem 18% de RP, o que e um valor de risco absurdo, e continua shovando o MESMO range levemente inclinado aos bluffs.

E o OOP, com baixissimo RP e risco, SEGUE A FOLDAR CADA VEZ MAIS vs o mesmo range levemente inclinado a bluff.

### Toy Game 3 (IP RP21 OOP RP3)

Exatamente o mesmo range de shove do IP, levemente inclinado ao bluff.

E o OOP, com baixissimo RP e risco, ja esta alcancando quase 80% de fold!!!

Raphael Vitoi nos apresenta algumas simulacoes para entender o porque disso:

**Conclusoes:**

Os 20bb sao identicos, seja contribuindo para o lider de fichas (CL) ou para um jogador com 20bbs. No entanto, a avaliacao do valor entre as stacks difere significativamente. Isto significa que temos pouco incentivo para jogar como "bluffcatcher" contra stacks medias e curtas, ja que perder fichas tem um impacto mais significativo do que ganha-las.

Reiterando, este e apenas um dos fatores que causam essa distorcao. Para o CL, numa situacao em que recebe um "shove" de um range polarizado e possui um range de "bluffcatchers", mesmo que o range polarizado esteja levemente inclinado ao bluff, geralmente nao ha recompensa suficiente para justificar o uso de um "bluffcatcher". Mesmo que isso nao altere drasticamente a nossa posicao enquanto CL, dobrar e aumentar a valuation para o nosso oponente, consequentemente, reduz a pressao do ICM sobre TODA A MESA (na mesa final, atraves da distribuicao das stacks, a mesa se transforma num organismo. Quanto maior a stack do CL, mais ele pode pressionar quase todos com baixo risco. Quanto maiores os outros em relacao a nos, menos acentuada e essa condicao).

Com mais stacks curtas e stacks menores em media, o CL pode continuar a pressionar e acumular fichas com baixo risco. Isso aproveita a perspectiva de que os stacks medios e ate alguns stacks curtos tem um EV de fold positivo e sao menos propensos a reagir, dado que a probabilidade de alguem ser eliminado em breve e alta e o pagamento e quase garantido.

Acumular fichas nunca e negativo. O problema e arriscar uma quantidade significativa de fichas apenas para acumular, especialmente quando se e o jogador cobrindo o agressor, principalmente se voce enfrenta um "shove" e o stack prejudica voce. Analisando os outputs da calculadora de ICM, onde o CL ganha 20bbs e elimina um oponente, e comparando com onde o CL perde 20bbs e duplica o stack do oponente, tambem e importante notar as flutuacoes na avaliacao das stacks que NAO ESTAVAM ENVOLVIDAS NA JOGADA.

A diferenca de valor que o CL ganha ou perde nessa situacao nao se transfere totalmente para o seu oponente ou para ele mesmo. Parte disso e distribuida pela mesa, com cada um baseado em um criterio relacionado a sua perspectiva. Afinal, quanto menos competidores, mais perto cada um esta das posicoes superiores e maior e o pagamento extra. A perspectiva e a esperanca matematica de todos aumentam, EXCETO a do CL (quando perde).

Quando o CL elimina um stack curto, apesar de adicionar valor a sua stack, ele tambem distribui pagamento para toda a mesa (incluindo a si proprio). No entanto, o pagamento que ele recebeu ja estava bem encaminhado em termos de probabilidade. Portanto, quando o CL elimina um stack curto, o resto da mesa se beneficia mais desse evento do que o proprio CL que ganhou as fichas. E novamente, quanto menos jogadores na mesa final e menos stacks curtos houver, menor e o ICM medio, menor e o RP medio e menor e a capacidade do CL de pressionar os outros jogadores livremente e com baixo risco no futuro.

Dependendo da quantidade de fichas que o CL ganha, pouco muda em seu jogo. No entanto, dependendo da quantidade de fichas que ele perde (especialmente contra stacks que o afetam significativamente), seu jogo futuro fica seriamente comprometido, podendo manter ou perder posicoes na tabela de lideranca, se nao imediatamente, entao possivelmente em um futuro proximo.

Voltando ao principio: e como se cada um tivesse a responsabilidade de realizar o EV monetario daquela stack que possui. Pense sobre "Qual e a sua perspectiva nesta mesa final?", "Qual e a sua esperanca matematica?", "Colocar-se nesta situacao de alto risco realmente vale a pena?"
