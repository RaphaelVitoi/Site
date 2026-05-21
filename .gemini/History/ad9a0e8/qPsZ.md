# Entendendo o ICM e suas heurísticas

Aprenda como interpretar o RP e de que maneira podemos usá-lo à nosso favor pós-flop

Nesta aula, Raphael Vitoi aborda de maneira clara e objetiva alguns conceitos essenciais do ICM (Independent Chip Model) utilizando uma variedade de metodologias educativas. Ele emprega desde toy-games sofisticados para destacar teorias relacionadas a situações de alto Risk Premium (RP), até uma análise crítica dos cenários para identificar pontos fortes e fracos atuais. Combinando sua compreensão aprofundada da teoria do jogo com a experiência adquirida como um dos educadores mais dedicados do jogo, Raphael Vitoi também apresenta uma coleção pedagógica de scripts e cenários que elucidam padrões e situações complexas, destacando a premissa de que o ICM pós-flop é muito mais complexo e contra intuitivo do que muitos imaginam, revelando uma grande oportunidade de ganho de vantagem competitiva (Edge).

## Antevisão

Um dos aspectos fundamentais abordados é a "Antevisão". Hoje em dia, o conhecimento teórico sobre poker está muito mais acessível e prático do que há uma década, pois está disponível através de uma variedade de recursos, incluindo materiais gratuitos, cursos avançados, ferramentas educativas poderosas, Solucionadores de Situações Complexas (SOLVERS) e trackers rigorosos como o Hand2Note, que coletam e disponibilizam dados de jogadores e seus torneios. Essas informações permitem que jogadores e analistas desvendem os jogos da população e os padrões de adversários para desenvolver estratégias precisas de exploração.

Embora os jogadores estejam se aprimorando teoricamente, Raphael Vitoi observa que ainda existem áreas negligenciadas, especialmente o ICM Pós-Flop, onde muitas fraquezas são perceptíveis mesmo entre jogadores regulares. Ele destaca que muitos profissionais ainda utilizam exercícios baseados em CHIPEV para treinar e estudar o jogo, embora, fora das situações de heads-up, praticamente todas as fases do poker sejam influenciadas pelo ICM — desde a primeira mão até as etapas críticas como a bolha do torneio, Semi-FTs e, claro, as mesas finais. Assim, o domínio do ICM é crucial, particularmente onde o dinheiro está em jogo.

Por isso, na visão de Raphael Vitoi, a verdadeira vantagem competitiva não se encontra mais tanto nas decisões pré-flop baseadas em ICM, especialmente em stakes altos, mas sim no jogo pós-flop, onde ainda há muito a ser explorado e maximizado em termos de valor esperado (EV).

## TOY GAME

O conceito de "toy-game" no poker refere-se a uma versão simplificada do jogo, comumente utilizada para análises teóricas ou discussões estratégicas. São ferramentas educativas projetadas para descomplicar o universo complexo do poker. Este modelo reduz as variáveis do jogo real para facilitar o entendimento e a análise de conceitos específicos, como Equilíbrio de Nash, MDF (Minimum Defense Frequency), ICM (Independent Chip Model), entre outros.

Um exemplo prático de toy-game são os **solvers**. Estes programas funcionam como simuladores que simplificam o jogo de poker, utilizando a teoria dos jogos para solucionar mãos e oferecer insights sobre estratégias otimizadas. Contudo, é crucial entender que solvers não representam a realidade completa do poker. Eles são uma ferramenta valiosa para estudos e evolução, especialmente quando combinados com técnicas como nodelocking e uma abordagem meticulosa de MDA (Análise Massiva de Database) — um processo que exige uma amostragem extensa e altamente filtrada para ser eficaz. (Dica: Busque sempre o IDA.)

Importante ressaltar que, embora o GTO (Game Theory Optimal) simboliza o conjunto de conceitos teóricos do poker, a sua utilização mecânica está mais para a construção de uma EQUAÇÃO ESTRATÉGICA do que necessariamente a apresentação de soluções e resultados fixos, já que os dados utilizados nos solvers precisam ser de alta credibilidade para que as soluções apresentadas sejam confiáveis. A precisão desses dados é crucial, pois o poker é um jogo de informação incompleta e influenciado fortemente por fatores emocionais e criativos. É extremamente recomendável que você não foque no resultado da solução de um SOLVER e sim na interpretação e no reconhecimento da LINGUAGEM TEÓRICA do solver e dos objetivos teóricos que o solver está procurando atingir.

**Considerações sobre o uso de solvers**:
*   Solvers também são uma forma de inteligência artificial com limitações, operando dentro das condições definidas pelo usuário. Ao configurar cenários com premissas como ranges e tamanhos de apostas pré-estimadas, você pode inadvertidamente restringir o solver a um conjunto limitado de possibilidades.
*   Solvers têm dificuldades em incorporar elementos subjetivos do jogo, como percepção de imagem, tells, FGS, EDGE e outras nuances humanas que são cruciais nas mesas de poker reais.

## Sobre o RP (Risk Premium)

O RP é uma métrica central no ICM, ajudando a estimar o impacto das decisões em situações específicas de torneio. Ele justifica decisões baseadas no equilíbrio entre o risco envolvido e o potencial retorno. No poker, cada stack tem um valor monetário implícito, que reflete uma parte do prizepool remanescente. Essa distribuição afeta como os jogadores devem abordar suas decisões estratégicas, especialmente em situações de risco elevado, como colisões iminentes pré-flop, onde é essencial atribuir equities extras aos ranges para justificar a entrada em situações arriscadas.

O RP é influenciado não apenas pela interação direta entre duas stacks, mas também pela configuração geral das stacks na mesa. Cada jogador e cada stack exercem influência mútua, criando um ambiente dinâmico onde as decisões de um jogador repercutem em todo o campo de jogo.

Raphael Vitoi usa o exemplo de um torneio com buy-in de 10k, porém, no contexto do ICM, o valor do buy-in é irrelevante em relação a proporção do prizepool que um jogador poderia reivindicar se o torneio terminasse imediatamente. Essa abordagem destaca a importância de compreender profundamente o ICM e o RP para otimizar as estratégias em torneios de poker.

É crucial reconhecer que o maior stack na mesa não reflete diretamente o valor do primeiro prêmio, assim como o menor stack não corresponde automaticamente ao valor do último prêmio. O chip leader possui uma avaliação monetária inferior ao prêmio máximo devido a fatores probabilísticos.

**Esperança Matemática:** Embora o líder em fichas possa eliminar adversários e aumentar seu próprio stack, ele nunca atingirá um valor equivalente ao prêmio máximo, já que sempre há a possibilidade matemática dos demais jogadores acumularem fichas e melhorarem suas perspectivas em relação aos prêmios superiores. Por outro lado, o jogador com o menor stack tem, de forma intrínseca, uma avaliação superior ao prêmio mínimo, pois também tem chances de melhorar sua situação ao acumular fichas. Além disso, existe a possibilidade de os jogadores intermediários colidirem, um evento que deveria ser controlado através de Risk Premiums (RPs) significativos entre eles.

Existem dois tipos de RPs em um cenário de Single Raised Pot (SRP): podemos denominar o RP do jogador que abre a rodada como "RP de ida" e o do jogador que responde como "RP de volta". Esses RPs geralmente diferem e a dinâmica entre eles é crucial na estratégia:

*   Se os RPs são similares, isso pode levar a uma estratégia mais passiva, pois ambos os jogadores enfrentam riscos semelhantes e não têm incentivos para aplicar pressão adicional ao jogador com o maior RP.
*   Se o "RP de ida" for maior que o "RP de volta" (por exemplo, 25% maior), essa diferença pode simbolizar a quantidade de pressão adicional que o jogador com o menor RP poderia aplicar, bem como o nível de cautela que o jogador com maior RP deve manter.
*   Se o "RP de volta" for o dobro do "RP de ida", o jogador com o menor RP pode exercer uma pressão substancial tanto pré quanto pós-flop, enquanto o jogador com o maior RP deve agir com extrema cautela.

A diferença entre os RPs é conhecida como Vantagem ou Desvantagem de Risco. Isso indica que um jogador sempre terá uma vantagem de risco, enquanto o outro enfrenta uma desvantagem. É importante notar que o solver não leva em consideração desvantagens extras como estar fora de posição ou desvantagem de edge, ou seja, é possível que haja um acúmulo de desvantagens não previsto pelo programa.

Adicionalmente, enfrentar um jogador com um RP maior implica que a máxima realização desse RP pode resultar em uma situação crítica de dobrar ou ser eliminado para o jogador com o maior RP. Cobrir e ser coberto afeta diretamente essa métrica. Cobrir significativamente diminui o seu RP, especialmente se a confrontação com uma determinada stack não prejudicar significativamente suas perspectivas ou sua esperança matemática na mesa final.

Quando existem jogadores prestes a serem eliminados, o RP médio na mesa aumenta. O jogador capaz de eliminar outros sem prejudicar muito sua própria stack possui uma vantagem estratégica considerável e deve intensificar a pressão sobre a mesa. A presença de várias stacks à beira da eliminação eleva tanto o ICM quanto o RP médio das stacks intermediárias, dificultando sua movimentação no jogo. O incentivo para jogar pots diminui se houver um chip leader ativo, pois ele pode utilizar a pressão do RP para impor estratégias agressivas.

As configurações da mesa geram diversos RPs e a estrutura de payjumps da mesa final influencia diretamente esses valores. Em estruturas "top-heavy", onde a premiação se concentra no topo, o RP das stacks menores é reduzido, incentivando-os a arriscar mais. Em contraste, em uma estrutura mais equilibrada, o RP das stacks menores aumenta, refletindo um cenário onde a queda em posições inferiores é menos punitiva.

Finalmente, à medida que o número de jogadores na mesa final diminui, o RP médio também cai, uma vez que a maior tragédia potencial imediata seria o vice-líder ser eliminado em último lugar numa situação de poucos jogadores, o que, embora desagradável, é menos catastrófico do que em um cenário mais amplo.

## TOY GAME CLÁSSICO CHIP EV pt1

*   Range IP: AA, QQ, JJ (18 combos)
*   Range OOP: KK (6 combos)
*   Pote: 100 fichas
*   Única aposta possível: 100 fichas (all in)
*   OOP (KK) fala primeiro e SEMPRE checka.
*   BOARD: 22223

AA (valor), QQ e JJ (potenciais blefes) devem balancear suas estratégias entre shove e check, enquanto o KK (bluffcatcher puro) deve defender uma frequência adequada para prevenir que seu oponente lucre com quaisquer duas cartas. Raphael Vitoi emprega o Piosolver para ilustrar esses conceitos de maneira didática, adicionando ainda uma dimensão de análise através do contraste entre a teoria pura e a influência do Risk Premium (RP) nesse contexto.

Esse toy-game é frequentemente encontrado dentro da literatura do poker e está correlacionado com a apresentação de conceitos como MDF e Nash Equilibrium.

### Toy Game 1 (Chip EV)
IP (6 combos de value, 3 combos de bluff)

KK paga 50% das vezes para neutralizar o EV dos bluffs do IP.
a = (100 / 200 = 0,5)
0,5 (x100 = 50%)
1-a = 50%

### Toy Game 2 (RP IP 3 OOP 6)

O jogador em posição (IP) aumentou o número de bluffs, passando de 3 para 4,2 combinações, enquanto o jogador fora de posição (OOP) começou a desistir um pouco mais.

**Motivo**: A influência do ICM. Ambos possuem um Risk Premium (RP) relativamente baixo, indicando baixo risco, embora ainda presente. Para o OOP, o risco é maior. O IP possui uma vantagem de risco significativa e não enfrenta o risco de eliminação ao fazer um shove. Dados os RPs, é provável que ambos não estejam nas melhores posições em termos de perspectiva e expectativa matemática numa mesa final hipotética.

Quanto menor a diferença de RP entre os jogadores, mais passivamente eles tendem a jogar, como se houvesse um acordo silencioso para evitar proporcionalmente situações de risco. O ICM geralmente incentiva a evitar ao máximo situações de alto risco, e neste cenário, o maior risco recai sobre o OOP. Há uma grande diferença de risco nessas situações: quando alguém faz um shove contra nós, ele impõe o RP+FE (Fold Equity) sobre nós e ainda garante a realização total de sua equity. Não há possibilidade de devolvermos o RP ao agressor fazendo um re-shove (o efeito de "batata quente"). Por isso, em muitas simulações de ICM, vemos o jogador com maior RP optando mais por shove do que por 3-bet ou call. Frequentemente, com cerca de 25bbs ou menos, também não existem flats no arsenal deste jogador, especialmente em situações de posição inicial contra posição inicial, com vários outros jogadores ainda por agir e eventos a acontecer (como a possibilidade de potes multi-way, que são prejudiciais para todos). Como mencionado, o RP é uma métrica que avalia apenas a colisão entre duas stacks e não leva em conta vários outros fatores. Assim, em alguns cenários, pode haver acumulação de desvantagens que o solver não está necessariamente considerando.

O Risk Premium pós-flop é distribuído ao longo das streets e está relacionado ao SPR (Stack-to-Pot Ratio): jogar um range condensado versus um range linear pós-flop geralmente não é tão lucrativo na maioria das vezes em situações comuns do jogo. Ranges condensados, em geral, são projetados para reter equity, não necessariamente para gerar EV. Quando enfrentamos uma desvantagem de risco e temos poucas fichas, o cenário se torna ainda mais complicado. Afinal, não é difícil para o jogador que nos cobre colocar-nos all-in até o river. Não temos incentivos para aumentar o pote com raises, nem mesmo estando OOP, pois isso iria contra a necessidade de evitar riscos ao mesmo tempo em que aumentaremos o pote e, consequentemente, nossa probabilidade de eliminação. Também não veremos muitos shoves, pois um range condensado não é particularmente equipado para isso, especialmente contra um range linear ou polarizado que nos pressiona com as melhores mãos de seu range.

Ao optar por jogar de call, a tendência é continuar enfrentando pressão no turn e no river, e à medida que nossa stack diminui, nosso RP aumenta gradualmente. É improvável que nosso range condensado consiga resistir e reter equity suficiente para superar a equity extra do Risk Premium até o river. Portanto, nossa realização de equity cai, e muitas vezes temos que desistir de mãos relativamente fortes frente a um shove no river ou no turn, respeitando o "Teto do RP" que é intransponível.

### Toy Game 3 (RP IP 3 OOP 9)

O jogador em posição (IP) agora blefa mais, aumentando de 4,2 combinações de blefe para 5. Contudo, apesar dessa mudança, o jogador fora de posição (OOP) não está desistindo mais do que no RP (Risk Premium) anterior. Com o RP tão baixo e a distância significativa entre os RPs do IP e do OOP, é natural que vejamos mais blefes do IP. Entretanto, o aumento de blefes não é proporcional ao aumento de 50% do RP anterior do OOP, nem ao aumento da distância entre eles, indicando que ainda há riscos para o IP e que isso não se alinha com o conceito de "MDF" (Minimum Defense Frequency) ou de defender a pot-odds, visto que dobrar o OOP pode interferir no nosso RP futuro e até alterar ou subverter as perspectivas.

O IP não está se arriscando excessivamente, maximizando a pressão enquanto minimiza o risco de transferência de fichas para o OOP, que é seu nêmesis neste toy-game (e queremos evitar que o nêmesis cresça e se torne um rival mais forte).

Um ponto adicional: A famosa frase do ICM ("As fichas que perdemos valem mais do que as fichas que ganhamos") é verdadeira, mas isso é apenas o início da história. Embora haja uma desproporção no valor das fichas que ganhamos em detrimento das que perdemos, acumular fichas continua sendo benéfico, especialmente se ambos os jogadores estiverem agindo conforme esperado nesse contexto de ICM. Se interpretarmos essa frase ao pé da letra, um CL disparado numa FT apenas se sentaria em sua pilha de fichas e não jogaria mais nenhuma mão, o que sabemos que não é prático. O CL não só tem interesse em aumentar sua perspectiva de ganhos e sua expectativa matemática de vitória, mas também tem a responsabilidade de dificultar que jogadores que possam rivalizar com ele acumulem fichas dos outros jogadores. Como já mencionado, um evento de colisão ou de acumulação/perda de fichas numa FT, mesmo envolvendo apenas dois jogadores, influencia a avaliação da stack e a expectativa matemática de todos os outros jogadores que NÃO PARTICIPARAM do evento! Para alguns, essa influência será positiva (por exemplo, o último em fichas que ganha valuation e ainda embolsa um payjump pela queda do terceiro em fichas). Para outros, o efeito será negativo (como o penúltimo em fichas que vê o último dobrar sobre o CL e agora se torna o último, diminuindo sua valorização enquanto aumenta sua probabilidade de cair nas últimas posições).

Neste caso, ao permitir que o OOP acumule mais fichas do que deveria, o IP (CL) interfere diretamente em sua própria perspectiva de vitória e na sua expectativa matemática ao deixar que o stack do seu rival aumente.

O OOP, por sua vez, atingiu o "Teto do RP". Em um range formado inteiramente por bluffcatchers contra um range polarizado que sempre contém o topo, há sempre uma chance palpável de ser eliminado. E ser eliminado com 9% de RP não é desejável, a menos que a proporção de blefes do IP esteja extremamente exagerada. Assim, o solver identificou a "linha de corte", equilibrando a frequência de blefes do IP para manter a frequência limite em que os bluffcatchers do OOP poderiam ousar pagar o shove. Note que ele não está desistindo mais vezes do KK. Ele está defendendo a mesma quantidade, exatamente onde o RP permite que ele defenda. No entanto, ele está enfrentando esse evento com uma frequência maior. O IP, ciente disso (afinal, é o solver e o solver tem essa vidência), está realizando mais vezes a conquista do pote, com a concordância do OOP que, de outra forma, estaria assumindo muito mais risco do que seu range pode justificar nesse cenário. De maneira um tanto contra-intuitiva, ambos estão fazendo o que é melhor para eles individualmente, cada um dentro de seu contexto, como se fosse um pacto silencioso (sim, alcançamos o Equilíbrio de Nash).

### Toy Game 4 (RP IP 3 OOP 18)

No cenário atual, o jogador em posição (IP) aumentou ainda mais os blefes! Temos seis combinações de valor contra oito de blefe, o que é claramente desbalanceado do ponto de vista de ChipEV. Normalmente, em um contexto de ChipEV equilibrado, o KK pagaria 100% das vezes. No entanto, neste caso específico, o KK ainda continua pagando apenas até o "Teto do RP".

### Toy Game 5 (RP IP 3 OOP 24)

Agora, vamos considerar essa notável diferença em RP (Risk Premium). Quanto maior for a discrepância entre os RPs e mais alto o RP do jogador pressionado, mais agressivamente atacamos como jogador em posição (IP). E, mantendo a mesma linha de raciocínio, o KK continua seguindo a mesma lógica: pagando no limite superior do RP.

É importante destacar que, assim como não podemos pagar com 100% dos bluffcatchers quando o líder de fichas (CL) faz um shove com quase todo o seu range, isso não implica que devemos sempre evitar dar call com uma frequência razoável de bluffcatchers nesse cenário de alta pressão de RP. As respostas adequadas da Teoria do Jogo em ambientes de ICM raramente são extremas.

O Poker é uma ciência!

Todos esses resultados têm validação matemática. Dan Almeida e Raphael Vitoi realizaram esses cálculos. Contudo, Raphael Vitoi recomenda não dedicar excessivo tempo a essa análise, a menos que se tenha um interesse particular e um gosto pela matemática pura dessas situações. Ele observa: "É um estudo interessante, porém de pouco valor instrutivo."

Frequentemente, a matemática não ilumina adequadamente o CONCEITO ou as interações entre as diversas variáveis dentro do jogo, especialmente no contexto de toy-games. Mesmo validando essas análises, elas não necessariamente facilitam o aprendizado. Pessoalmente, eu sugiro adotar abordagens mais voltadas para o raciocínio lógico-crítico e reflexões filosóficas ao discutirmos cenários polêmicos na teoria do poker.

Lembre-se sempre: Tenha cuidado com suposições que se desviam da teoria estabelecida! Frases como "Está shovando tudo, vou pagar com qualquer bluffcatcher!" podem ser perigosas. Como vimos, variáveis mecânicas do ICM restringem a possibilidade de fazer ajustes estratégicos que são tanto arriscados quanto extremos.

## Parte II - Invertendo o RP

### Toy Game 1 (RP IP 9 OOP 3)

IP agora possui RP maior. O que muda?

Podemos observar que, embora o jogador em posição (IP) não comece a blefar excessivamente, comparativamente ao Toy Game 3 da Parte I, ele ainda blefa ligeiramente acima do valor esperado em fichas (ChipEV). Mesmo que o risco para o jogador fora de posição (OOP) seja baixo, não deixa de ser um risco. As fichas em torneios de MTT (Multi-Table Tournament) não são “apenas fichas”; elas possuem valor monetário intrínseco. E o valor em dinheiro real é superior ao valor nominal das fichas calculado pelo ChipEV.

Agora, segura essa bomba que o Raphael Vitoi aponta:

O OOP, com menor Risk Premium, PAGA MENOS vs o mesmo range que continua mais inclinado para os bluffs.

### Toy Game 2 (IP 18 RP e OOP 3)

O IP agora tem 18% de RP, o que é um valor de risco absurdo, e continua shovando o MESMO range levemente inclinado aos bluffs.

E o OOP, com baixíssimo RP e risco, SEGUE A FOLDAR CADA VEZ MAIS vs o mesmo range levemente inclinado a bluff.

### Toy Game 3 (IP RP21 OOP RP3)

Exatamente o mesmo range de shove do IP, levemente inclinado ao bluff.

E o OOP, com baixíssimo RP e risco, já está alcançando quase 80% de fold!!!

Raphael Vitoi nos apresenta algumas simulações para entender o porquê disso:

**Conclusões:**

Os 20bb são idênticos, seja contribuindo para o líder de fichas (CL) ou para um jogador com 20bbs. No entanto, a avaliação do valor entre as stacks difere significativamente. Isto significa que temos pouco incentivo para jogar como "bluffcatcher" contra stacks médias e curtas, já que perder fichas têm um impacto mais significativo do que ganhá-las.

Reiterando, este é apenas um dos fatores que causam essa distorção. Para o CL, numa situação em que recebe um "shove" de um range polarizado e possui um range de "bluffcatchers", mesmo que o range polarizado esteja levemente inclinado ao bluff, geralmente não há recompensa suficiente para justificar o uso de um "bluffcatcher". Mesmo que isso não altere drasticamente a nossa posição enquanto CL, dobrar e aumentar a valuation para o nosso oponente, consequentemente, reduz a pressão do ICM sobre TODA A MESA (na mesa final, através da distribuição das stacks, a mesa se transforma num organismo. Quanto maior a stack do CL, mais ele pode pressionar quase todos com baixo risco. Quanto maiores os outros em relação a nós, menos acentuada é essa condição).

Com mais stacks curtas e stacks menores em média, o CL pode continuar a pressionar e acumular fichas com baixo risco. Isso aproveita a perspectiva de que os stacks médios e até alguns stacks curtos têm um EV de fold positivo e são menos propensos a reagir, dado que a probabilidade de alguém ser eliminado em breve é alta e o pagamento é quase garantido.

Acumular fichas nunca é negativo. O problema é arriscar uma quantidade significativa de fichas apenas para acumular, especialmente quando se é o jogador cobrindo o agressor, principalmente se você enfrenta um "shove" e o stack prejudica você. Analisando os outputs da calculadora de ICM, onde o CL ganha 20bbs e elimina um oponente, e comparando com onde o CL perde 20bbs e duplica o stack do oponente, também é importante notar as flutuações na avaliação das stacks que NÃO ESTAVAM ENVOLVIDAS NA JOGADA.

A diferença de valor que o CL ganha ou perde nessa situação não se transfere totalmente para o seu oponente ou para ele mesmo. Parte disso é distribuída pela mesa, com cada um baseado em um critério relacionado à sua perspectiva. Afinal, quanto menos competidores, mais perto cada um está das posições superiores e maior é o pagamento extra. A perspectiva e a esperança matemática de todos aumentam, EXCETO a do CL (quando perde).

Quando o CL elimina um stack curto, apesar de adicionar valor à sua stack, ele também distribui pagamento para toda a mesa (incluindo a si próprio). No entanto, o pagamento que ele recebeu já estava bem encaminhado em termos de probabilidade. Portanto, quando o CL elimina um stack curto, o resto da mesa se beneficia mais desse evento do que o próprio CL que ganhou as fichas. E novamente, quanto menos jogadores na mesa final e menos stacks curtos houver, menor é o ICM médio, menor é o RP médio e menor é a capacidade do CL de pressionar os outros jogadores livremente e com baixo risco no futuro.

Dependendo da quantidade de fichas que o CL ganha, pouco muda em seu jogo. No entanto, dependendo da quantidade de fichas que ele perde (especialmente contra stacks que o afetam significativamente), seu jogo futuro fica seriamente comprometido, podendo manter ou perder posições na tabela de liderança, se não imediatamente, então possivelmente em um futuro próximo.

Voltando ao princípio: é como se cada um tivesse a responsabilidade de realizar o EV monetário daquela stack que possui. Pense sobre "Qual é a sua perspectiva nesta mesa final?", "Qual é a sua esperança matemática?", "Colocar-se nesta situação de alto risco realmente vale a pena?"
