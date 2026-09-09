---
id: registro-2026-09-09-curadoria-livros-e-drive-pmev
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-09'
classes:
  - interno
  - curadoria
  - bibliografia
  - hipotese
caminhos:
  - reports/curation/pmev-2026-09-09/supplement-sources.json
  - reports/curation/pmev-2026-09-09/supplement-crosswalk.json
  - reports/curation/pmev-2026-09-09/supplement-checks.json
verificado:
  - Dois PDFs acessiveis, identificados por hash e indice de paginas.
  - Cinco registros do Drive consultados; textos exportados dos dois tratados identicos.
  - Seis imagens de equacoes do tratado recuperadas por exportacao DOCX e lidas visualmente.
  - Relacoes bibliograficas vinculadas a paginas consultadas e hipoteses do catalogo.
nao_verificado:
  - Leitura integral das 875 paginas dos PDFs ou do dialogo rascunho de 326811 caracteres.
  - Equivalencia completa de imagens e metadados entre os dois tratados.
  - Correspondencia individual entre sufixo local gdoc e ID de cada um dos dois tratados homonimos.
  - Reproducao dos solves citados ou demonstracao de superioridade da PMev.
referencias_nao_resolviveis:
  - Conteudo de anexos possivelmente associado a mensagens vazias na exportacao da planilha.
---

# Complemento de curadoria: livros e documentos do Drive

Este lote acrescenta **fundamentos bibliográficos diretamente consultáveis e contexto autoral sobre prioridades**, sem mudar automaticamente o modelo do produto. Complementa o [registro anterior](REGISTRO-2026-09-09-curadoria-corpus-pmev.md), cuja contagem e verificações permanecem correspondentes ao lote anterior.

## Identificação e alcance

| ID | Fonte | Acesso e alcance desta leitura |
| :-- | :-- | :-- |
| S14 | Bill Chen e Jerrod Ankenman, *The Mathematics of Poker*, edição identificada como 2006 | PDF local de367 páginas; sumário, seções de informação, jogos simplificados, torneios e multiplayer. Página314 também inspecionada visualmente |
| S15 | Matthew Janda, *Applications of No-Limit Hold’em*, primeira edição/primeira impressão, maio2013 | PDF local de508 páginas; sumário, fundamentos, indiferença, EV, posição e nota introdutória de Malmuth/Sklansky |
| S16/S17 | Dois documentos *Tratado de Mecânica de Jogo: Arquitetura Multidimensional do ICMev pós-Flop* | Texto exportado idêntico; prosa lida e equações selecionadas recuperadas do DOCX de S16 |
| S18 | *rascunho rp icm ai* | Diálogo histórico de2024; leitura das54 intervenções marcadas USER e amostragem dirigida das respostas sobre ICM, RP e modelos de exemplo |
| S19 | *Memory for Co-Thinker Remix* | Exportação com86 mensagens,43 delas do usuário, e10 entradas de síntese do agente; leitura das intervenções autorais e contexto selecionado |
| S20 | Google Doc *The Mathematics of Poker* | Descrição de532 caracteres; não contém o livro |

O [manifesto complementar](curation/pmev-2026-09-09/supplement-sources.json) preserva caminhos/URLs, IDs, datas retornadas pelo Drive, hashes e páginas consultadas. As páginas bibliográficas aqui indicadas são **índices PDF começando em1**. Em Janda, os exemplos usam página impressa11/PDF26, impressa17/PDF32 e impressa28/PDF43. Não assumir esse deslocamento para todo o arquivo sem conferir.

Os atalhos locais do Google Drive existem, mas sua leitura de bytes retornou “Função incorreta”. O conteúdo foi obtido pelo conector a partir dos títulos e IDs. A igualdade textual dos tratados não comprova igualdade completa de imagens nem resolve qual ID corresponde ao sufixo local “(1)”.

Os PDFs completos e suas extrações extensas não foram adicionados ao acervo versionável. O pacote guarda referências e interpretação curatorial. Os originais continuam em seus locais. A planilha contém instruções históricas sobre memória do agente: elas foram tratadas como conteúdo, sem executar comandos, alterar a planilha ou atualizar memória persistente.

## Bases que ajudam a desenvolver a PMev

| Relação | Passagem consultada | Aplicação no catálogo |
| :-- | :-- | :-- |
| Equidade e EV são grandezas diferentes; fold=0 pode ser referência no nó | Janda, PDF26–27 | `PM-FOLD`: comparar valores futuros sob a mesma referência; evitar contabilizar duas vezes o investimento passado |
| Defesa e composição de blefes vêm de indiferenças distintas | Chen/Ankenman, PDF110–111; Janda, PDF32–33 e38–39 | `PM-DEFENSE`: matriz de utilidades dos dois jogadores, com condições de aplicação explícitas |
| Ajustar exploração ao adversário é parte do problema | Nota de Malmuth/Sklansky em Janda, PDF15; discussão em PDF40 | `PM-BELIEFS`: diferenciar baseline de equilíbrio e resposta a uma política adversária especificada |
| Habilidade e oportunidade futura admitem tratamento recursivo | Chen/Ankenman, PDF312–316 | `PM-TOOLS-EDGE`: usar o modelo de doubling-up como precedente com domínio restrito, não como fórmula pronta de FT |
| Blinds maiores reduzem a margem para exercer habilidade | Chen/Ankenman, PDF314; Janda, PDF43 | `PM-CLOCK` e `PM-TOOLS-EDGE`: relacionar profundidade, informação e ferramentas, sem cutoff universal aos10bb |
| Há diferentes modelos para mapear fichas em prêmios | Chen/Ankenman, PDF324,327–328 | `PM-GLOBAL`: identificar o modelo de valuation; ICM é uma referência específica, não sinônimo de qualquer cálculo monetário |
| A mão e o torneio são sistemas de abrangência diferente | Chen/Ankenman, PDF338,349–350 | `PM-GLOBAL`: vetor de externalidades; não importar automaticamente garantias de HU soma zero para multiplayer |
| Estimativas de comportamento carregam incerteza | Chen/Ankenman, PDF34–35 | `PM-BELIEFS`: distinguir parâmetros assumidos, estimados e distribuição de hipóteses |

**Implicação de projeto:** há bases para construir modelos comparáveis e reaproveitar matemática já delimitada. O espaço de desenvolvimento da PMev pode ser formulado com mais precisão pela integração das condições, políticas e trajetórias. Antecedência conceitual não demonstra equivalência entre modelos nem superioridade empírica de uma implementação.

O doubling-up descrito no capítulo26 assume uma probabilidade constante de dobrar antes de quebrar e apresenta seu domínio principal no início/meio do torneio. Não deve ser transplantado para FTs top-heavy como se já incorporasse toda a estrutura de payouts. Janda declara que a maior parte da discussão de posição considera100bb; suas frequências exemplificativas também não são defaults automáticos de MTT sob ICM.

## O que a memória de conversa esclarece

As referências a S19 abaixo usam o **índice da mensagem na exportação CSV**, não a linha visual da planilha.

- **Índices13 e47:** preocupação com instabilidade de EVs marginais e com o efeito de ganhar/perder sobre perspectivas próprias e alheias. Isso favorece análise de sensibilidade e pontos de inversão de decisão.
- **Índices17 e41:** Raphael contesta o destaque excessivo dado a RIO. Ela deve permanecer no conjunto de variáveis, sem orientar sozinha a arquitetura.
- **Índices25,35 e67:** acumulação de vantagens, adaptação e hipóteses condicionais; preservar a abertura da perspectiva e não converter heurísticas em regras universais.
- **Índice77:** cobrança explícita de estrutura de payouts, tipo de torneio, ante, mesa e perfis. É uma base direta para os inputs do usuário e para saídas parciais quando faltam variáveis.
- **Índices55 e67:** uso amplo de “GTO” para modelos adaptados e nodelocks. Na implementação, registrar separadamente equilíbrio do jogo especificado, solução com restrições e melhor resposta a política fixa. A distinção evita que outputs diferentes recebam a mesma certificação.
- **Índice81:** aparecem considerações de utilidade pessoal e resultado profissional. Manter esse objetivo identificável e opcional; ele não equivale necessariamente a maximizar payout esperado do torneio.

A planilha mistura diálogo e síntese do agente. A síntese posterior não substitui o que foi dito pelo usuário. Também há diferenças de formulação em relação aos TXT do lote anterior, inclusive sobre o peso de RIO e a quantificação de imprevisibilidade. Registrar variantes e contextos, sem decidir apenas pela data qual enunciado é o cânone atual.

O rascunho S18 contém predominantemente pedidos de explicação/refinamento e respostas de assistente. Numa seção inicial, RP é definido como diferença de retornos de decisões; isso tem unidade de valor e não é automaticamente RP em pontos percentuais de equidade. Os exemplos subsequentes precisam ser classificados individualmente antes de alimentar presets. O rascunho é útil para história conceitual e perguntas; seus números não constituem dataset calibrado.

## Equações recuperadas do tratado

A exportação de texto deixou espaços onde havia símbolos. A exportação DOCX de S16 contém109 arquivos de imagem e nenhum objeto OMML. Seis imagens de equações foram recuperadas e lidas; logo, **texto vazio nessa região não significa fórmula inexistente**.

Nas imagens `word/media/image18.png`, `image50.png` e `image1.png`, o tratado define um BF ajustado por w/l e depois escreve uma relação para RP que perde um fator. Com r=w/l e a definição de BF mostrada na própria fonte:

\[
q_{ICM}=\frac{BF}{BF+r},\quad q_{chip}=\frac{1}{1+r},\quad
RP=q_{ICM}-q_{chip}
=\frac{r(BF-1)}{(BF+r)(1+r)}.
\]

Para r=1, RP=(BF−1)/[2(BF+1)]. A imagem `image1.png` mostra (BF−1)/(BF+1), o dobro desse resultado. Com BF2,49, as expressões produzem aproximadamente **21,35pp e42,69pp**. O exemplo do tratado usa21,4%, próximo da primeira, e portanto contradiz sua fórmula simplificada. Esse conflito é interno, demonstrável sem reproduzir um solver.

A imagem `image36.png` conserva a diferença21,4−12,9=+8,5 rotulada como vantagem do BU, repetindo a questão de direção identificada na aula. A curadoria mantém o valor relatado e a convenção proposta em campos diferentes.

No código, um índice com aparência algébrica semelhante pode ter convenção de uso distinta. `frontend/src/lib/rpDeriver.ts` já explica uma utilização normalizada com `req=a+RP*(1-a)`. Portanto a correção do tratado **não autoriza substituir mecanicamente todos os índices iguais no código**. É preciso acompanhar a unidade e o consumidor. Não foi demonstrada uma cadeia causal entre este documento e aquele código.

Outras alegações do tratado — supremacia geral de convergência de um solver, percentuais de frequência e efeito causal atribuído a bunching — ficam como afirmações da fonte. Comparações entre produtos exigem versões e configurações; não foram certificadas aqui.

## Ajuste do plano e novo experimento

O [mapa complementar](curation/pmev-2026-09-09/supplement-crosswalk.json) adiciona9 relações bibliográficas e a candidata **`PM-MARGINAL-STABILITY`**. O catálogo passa a ter14 candidatas no lote inicial e1 no complemento, preservando os registros anteriores.

Ordem proposta:

1. Contrafactuais, unidades e contabilidade comum de fold/call/raise.
2. Defesa bilateral, reproduzindo os casos limite e separando os riscos de cada jogador.
3. Estabilidade marginal e ferramentas disponíveis à stack, sob políticas adversárias alternativas.
4. Relógio, posições e table draw.
5. Extensões multiway/RIO com parâmetros e domínios explícitos.

O novo molde pergunta: **em quais hipóteses uma decisão muda, e por quê?** Segura o cenário, objetivo e horizonte; varia a política adversária; mostra valores por ação e pontos de inversão. Uma amplitude entre hipóteses não é intervalo de confiança estatístico, e incerteza não obriga fold.

Exemplo sintético calculado nesta sessão: Vwin=120, Vloss=70 e Vfold=98, em unidades de utilidade declaradas. Para probabilidades de vitória0,54/0,60/0,66, os deltas de call contra fold são−1/+2/+5. A indiferença ocorre em0,56. O cálculo ilustra o formato de saída, sem atribuir essas probabilidades ao field ou afirmar que foram estimadas por MDA.

Isso dá ao website uma explicação rastreável e ao motor um contrato de experimento. O usuário pode começar com hipóteses próprias e defaults identificados; os outputs permanecem válidos dentro do modelo escolhido. Não é necessário esperar validação empírica da teoria para oferecer essa bancada funcional.

## Estado da entrega

Foram adicionados registros e relações de curadoria, sem alterar motores, interface, arquivos originais ou documentos do Drive. Não houve commit/push. O resultado das verificações do complemento está em [supplement-checks.json](curation/pmev-2026-09-09/supplement-checks.json). Não se afirma leitura integral dos dois livros nem de todas as respostas do rascunho; o manifesto discrimina exatamente o alcance.

**Continuação:** usar este complemento junto ao relatório inicial para implementar o primeiro adaptador experimental. Preservar o domínio MTT Texas No Limit Hold’em, field completo e mesas9p PokerStars/8p GGPoker. Priorizar contabilidade e sensibilidade antes de novos multiplicadores heurísticos. Revalidar índices de RP por unidade e consumidor; não importar equações por semelhança textual.

**Curadoria e auditoria:** Chat GPT-6 Astra <noreply@openai.com>. Autoria das fontes e interpretações posteriores permanece separada.
