---
id: registro-2026-09-02-etapa-b-river-e-classe-de-acao-no-cenario
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T14:15:00-03:00
atualizado_em: 2026-09-02T14:15:00-03:00
classes: [interno, medido, pmev]
caminhos:
  - frontend/src/components/simulator/solver/evidenceContract.ts
  - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
  - frontend/src/components/simulator/solver/__tests__/aula12Evidence.test.ts
  - frontend/src/components/simulator/solver/__tests__/evidenceContract.test.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
revisoes_de_ancora:
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - frontend/src/components/simulator/solver/evidenceContract.ts
      - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
    parecer: >-
      Revisado, e uma de suas afirmacoes precisa ser LIDA COM RESSALVA a partir
      daqui; as demais seguem validas. Aquele registro publicou a Etapa A:
      contrato de evidencia e tres pares ChipEV x ICMev do flop e do turn. Este
      commit acrescenta o par 4 (river) e NAO altera nenhum numero dos tres
      primeiros, que saem daqui identicos ao que aquele registro descreveu. As
      quatro afirmacoes de metodo que ele fixou continuam de pe, e uma delas foi
      REFORCADA por evidencia nova: a marca antes do campo EV e indicador de
      direcao, agora provada por mecanismo independente, porque as equidades
      complementares da captura do river somam 100.00. A RESSALVA e sobre o
      texto que descreve ACTION_SET_INCOMPARABLE. A regra continua em vigor e
      nenhum par virou bloqueante. O que mudou e que aquele texto descrevia um
      classificador que, no par 4, teria reportado divergencia de classe raise
      onde nao havia nenhuma: artefato de grafia, nao restricao de solver. A
      correcao esta na secao 2 deste registro. Quem ler aquele registro isolado
      deve saber que o motivo reportado pelo codigo mudou; o veredito, nao.
verificado:
  - suite frontend completa em 168 testes e 26 suites, com 0 erro e 0 warning
  - suite do solver isolada em 74 testes, incluindo os 6 casos novos da Etapa B
  - tsc --noEmit com exit 0, e eslint --max-warnings=0 limpo nos 4 arquivos
  - as duas capturas do par 4 tem insercao unica, conferido contra 97 insercoes sobre 84 arquivos
  - dupla leitura cega das duas capturas por leitor independente, sem contexto compartilhado, zero conflitos
  - a cadeia aritmetica turn para river fecha por quatro identidades independentes
nao_verificado:
  - suite Python, portao de 5 fases e npm audit nao foram executados nesta etapa
  - o pote do lado HRC continua fora do recorte, entao a correspondencia de ramo do par 4 segue nao verificavel
  - versao de solver, build e e-Nash seguem ausentes de todas as capturas
  - a causa da divergencia de sizing entre os dois motores permanece NAO DETERMINADA
supersede: null
---

# Etapa B: o river, e a classe de ação que o rótulo não decide

## 1. O par 4, e o que ele verifica da Etapa A

`29 OOP action river after IP calls turn (river 3h)` × `46 idem` — figuras 35
(`image80.png`) e 52 (`image43.png`), board completo `Kd Jc Ts 2d 3h`.

| | ChipEV (GTO Wizard) | ICMev (HRC) |
| --- | --- | --- |
| Check | 33.7% · 9.38 combos | 30.7% |
| Aposta menor | `Bet 7.8 (25%)` · 0.2% · 0.05 | `bets 6.30bb` · 1.1% |
| — | — | `bets 15.75bb` · 22.5% |
| Aposta maior | `Allin 27.2 (87%)` · 66.1% · 18.39 | `bets 24.94bb` · 45.8% |

Pote 31.23bb; stacks 27.2 e 27.2. Dupla leitura cega por dois leitores sem
contexto compartilhado: **zero conflitos em todos os dígitos**.

**O par 4 não é apenas mais um par: ele audita o par 3 por caminhos que não
participaram da Etapa A.** Quatro identidades, todas fechando:

```
pote do turn  23.43 + call 7.80          = 31.23  = pote do river     OK
stack do IP   35.00 - call 7.80          = 27.20  = stack no river    OK
combos do call no turn             188.36 ~ 188.3 = range do BTN      OK
equidades              51.26 + 48.74     = 100.00                     OK
```

A quarta encerra, por mecanismo interno diferente do usado na Etapa A, a dúvida
sobre o glifo que precede os campos do painel. O Leitor 2 declarou
explicitamente **não distinguir** se era traço ou triângulo — e não era preciso
distinguir: duas equidades complementares não podem ser ambas negativas, e os
27.8 combos do BB reaparecem como a soma das ações (18.39 + 0.05 + 9.38 =
27.82). É indicador de direção.

Um erro de dígito na Etapa A teria que sobreviver às quatro.

## 2. O defeito que os dados novos expuseram

`classifyAction` classificava `Allin 27.2 (87%)` como **raise** e
`bets 24.94bb` como **bet**. É o mesmo ramo — apostar toda a stack sem que haja
aposta pendente —, separado apenas pela grafia de cada solver.

Isso é **exatamente o defeito que o classificador existe para eliminar**,
reaparecendo um nível acima. O registro anterior o descreve na própria
justificativa da função: comparar rótulo literal "reprovaria 100% dos pares
reais e não discriminaria nada".

A correção é `classifyActionNoCenario`, e o discriminante é regra de pôquer, não
heurística: **não se aumenta onde se pode pedir mesa.** Se o cenário oferece
`check`, não há aposta pendente e toda ação agressiva ali é `bet`, all-in
incluído.

**Por que `check` e não `fold`:** o HRC lista `folds` a 0% mesmo sem aposta
pendente — está no par 1, com o BB liderando o flop. `fold` não discrimina;
`check` sim, porque pedir mesa e pagar são mutuamente excludentes.

**A correção não faz par algum passar.** No par 4 as contagens seguem
divergentes: duas sizings de aposta contra três. O que muda é o motivo reportado
deixar de ser artefato do classificador e passar a ser a diferença real entre as
duas árvores. Nenhum par existente teve comportamento alterado — nos pares 1, 2
e 3 a regra não se aplica.

## 3. Um teste que quebrou, e por que não foi a expectativa que se ajustou

O caso sintético `contagens diferentes de ações são SINALIZADAS` usava
`[Check, Bet, Raise]` de um lado. Com a normalização, aquele `Raise` virou `bet`
e a expectativa `classesDivergentes: ['raise']` falhou.

`[Check, Bet, Raise]` **não é nó legal de pôquer**. O caminho curto era trocar
`'raise'` por `'bet'` na expectativa; o caminho certo era reescrever a fixture
para um nó legal, porque *teste que só acompanha a implementação não verifica
nada*. Foi o que se fez, e acrescentou-se um caso irmão cobrindo `raise` num nó
onde raise é legal, com fold e call pendentes — que é a garantia de que a
normalização **não** é global.

## 4. Um resíduo do Tier 0 que ainda estava em pé

O comentário do teste do par 3 ainda afirmava que os sizings divergem "porque o
GTO Wizard modela stack efetiva 40/40 e o HRC modela as stacks reais
39.88/53.88 — potes diferentes no mesmo ramo".

Essa explicação foi **descartada pelo autor da fonte**: a stack efetiva é 40bb
nos dois cenários antes do open. A fixture já fora corrigida na Etapa A; o
comentário do teste era o resíduo, e sobreviveu à revisão porque comentário de
teste não é lido quando o teste passa. Agora declara **causa não determinada**,
com o registro de que a premissa caiu.

## 5. Terceira ocorrência da soma 100.1%

30.7 + 1.1 + 22.5 + 45.8 = 100.1. Antes: par 2 (GTO Wizard, pós-flop) e defesa
pré-flop do BB (HRC). Agora HRC pós-flop. **Três painéis, dois solvers** — é
padrão de exibição da fonte, não caso isolado, e a tolerância declarada em
`DEFAULT_FREQUENCY_SUM_TOLERANCE_PCT` segue sendo escolha justificada em vez de
folga arbitrária. Não normalizar.

## 6. O que continua não autorizado

Quatro pares transcritos não são calibração. O ledger exige pares independentes
**e reproduzíveis**; reprodutibilidade não foi obtida, e estes números seguem
sendo transcrição de captura de terceiro. O pote do lado HRC continua fora do
recorte — os sizings 6.30 e 15.75 seriam 20% e 50% de um pote de 31.50, próximo
dos 31.23 do ChipEV, mas **31.50 é aritmética reversa, não leitura**, e por isso
não entrou como valor medido nem virou explicação.

Nada aqui altera as constantes de `solveIcmDistortion`.
