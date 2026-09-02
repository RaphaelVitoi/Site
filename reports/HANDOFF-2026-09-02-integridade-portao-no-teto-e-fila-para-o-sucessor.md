---
id: handoff-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T02:30-03:00
atualizado_em: 2026-09-02T02:30-03:00
commit: 61bc5fcf3a5f007224b0cd7bc43dc07e5c904255
classes: [interno, continuidade, medido]
caminhos:
  - reports/AUDITORIA-2026-09-02-integridade-do-projeto-e-piso-de-transformers.md
  - reports/REGISTRO-2026-09-02-tensor-portavel-e-varredura-fora-de-python.md
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
config_medida:
  raiz: /home/user/Site
  branch: master
  commit_base: 61bc5fcf3a5f007224b0cd7bc43dc07e5c904255
  origem: origin/master (identico)
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  python_da_suite: '3.12.3'
  suite: 778 passed, 7 skipped, 0 failed
  portao_5_fases: FRAGIL -- 0 erros, 2 warnings, teto 2
  ledger_calibracao: valid, 2 registros, tail 75fdb4d4
  feedback_score: nao coletado nesta sessao
verificado:
  - >-
    Base publicada: master == origin/master == 61bc5fcf, arvore de trabalho
    limpa, zero a frente e zero atras. Dois commits entregues nesta sessao,
    e3234877 e 61bc5fcf, ambos aprovados nos tres portoes.
  - >-
    Suite em 778 aprovados, 7 pulados, zero falhas, medida em venv 3.12
    separado. Os sete pulados sao lacunas de host declaradas pelo guard de
    cobertura, nao defeito.
  - >-
    O motor tensorial voltou a compilar fora do Windows: as flags MSVC viraram
    selecao por compilador e os tres testes de isometria que pulavam agora
    executam, verificados por medicao contra as tolerancias que os proprios
    testes declaram.
  - >-
    Nenhum caminho `.cerebro/` chega mais ao system prompt. Medido com cache
    expurgado no caminho de producao: zero ocorrencias, prompt do @auditor em
    216.368 caracteres.
  - >-
    A unica advisory do uv.lock com correcao publicada foi fechada por piso em
    constraint-dependencies, com lock reconciliado no mesmo commit. O aceite de
    risco do chromadb foi reconferido no codigo e mantido intacto.
  - >-
    A cadeia do ledger de calibracao foi verificada ANTES de qualquer uso, como
    manda o CLAUDE.md SS8.3: status valid, 2 registros, tail 75fdb4d4.
  - >-
    O portao foi medido TRES vezes durante o fechamento, e as tres leituras
    diferem por CONDICAO DE AMBIENTE, nao por mudanca de codigo. E o achado
    mais util desta secao, porque mostra que o teto de dois warnings pode ser
    ocupado por causas completamente diferentes sem que o veredito mude de
    cor: (a) com o frontend e o CDP derrubados por um restart de container,
    FRAGIL com dois warnings de COBERTURA PERDIDA -- fases 1 e 2 nao mediram
    nada, que e exatamente o caso para o qual o teto de dois existe; (b) com
    o servidor de pe mas a rota fria, FALHOU (VERMELHO) com dois ERROS,
    LCP 14.672 ms e TTFB 14.172 ms, medidos em navegador real; (c) com a rota
    aquecida, FRAGIL com os dois warnings conhecidos, TBT nao certificado e
    color-contrast inconclusivo.
  - >-
    A leitura (b) foi diagnosticada, nao descartada: os 14 s sao compilacao
    sob demanda do Turbopack no primeiro acesso, e o discriminante e
    independente do portao -- tres requisicoes curl na mesma rota devolveram
    TTFB de 81,9 ms, 68,2 ms e 63,4 ms, contra os 14.172 ms da primeira. A
    medicao estava certa; a condicao e que era de servidor de desenvolvimento
    frio, e nao de producao. Quem rodar o portao logo apos subir o `next dev`
    vai ver vermelho, e nao e regressao.
nao_verificado:
  - >-
    O PORTAO ESTA NO TETO. FRAGIL com 2 warnings de 2 permitidos, sem margem:
    qualquer warning novo, de qualquer fase, reprova todo commit. Os dois
    ocupantes exigem a maquina Windows e arbitragem Tier 0 -- TBT sem artefato
    Lighthouse de producao, e color-contrast inconclusivo no axe com baseline
    TARGET_MISMATCH. Este e o item de maior risco operacional da fila.
  - >-
    transformers subiu de 5.9.0 para 5.15.1, seis minor releases, e a suite NAO
    exercita sentence-transformers com o pacote novo: o venv da medicao ficou
    com o anterior. Pede smoke de embedding antes de release.
  - >-
    Tres contagens de vulnerabilidade em circulacao e nenhuma conciliada: sete
    alertas Dependabot anotados em 2026-09-01, oito reportados pelo push de
    hoje, seis medidos por mim na OSV sobre o lock. Reconciliar e a Tarefa 1 do
    plano de fronteira de dependencias, e exige autenticacao GitHub sob a conta
    do proprietario.
  - >-
    `ruff check .` acusa E741 preexistente em
    tests/test_cwv_gate_truthfulness.py:149, herdado do merge dfbc9ba3.
    `ruff format --check .` aponta tres arquivos fora de forma; medido com ruff
    0.16.5 contra o piso >=0.16.3, e nao foi possivel separar estado do HEAD de
    diferenca entre versoes do formatador.
  - >-
    O .venv do projeto esta em Python 3.14.0rc2, onde o pydantic quebra na
    coleta. A suite nao roda nele. Achado independente, nao investigado.
  - >-
    scripts/ops/cwv_gate.ps1 NAO foi validado em Windows PowerShell 5.1 real.
    A bateria substituta cobre bytes, parse no 7 e construtos exclusivos do 7,
    mas nao alcanca cmdlet ou parametro inexistente na 5.1 nem recurso de
    classe -- esses falham em tempo de execucao e nenhum parser os pega.
  - >-
    Os PRs #30, #31 e #32 seguem abertos como draft, mas o conteudo deles ja
    esta em master sob SHAs diferentes (foi harmonizado, nao merjado);
    conferido pela presenca de test_backend_hardening.py,
    test_governanca_skills.py e test_record_index.py. Mais sete branches
    remotas de 2026-09-01 sem funcao. Fechar e decisao do Tier 0.
  - >-
    A PRIORIDADE PMev DO HANDOFF ANTERIOR NAO FOI AVANCADA. Aquele handoff
    fixou a extracao de tres pares verificaveis da Aula 1.2 como proximo
    trabalho e advertia contra desvio para trilhas perifericas, citando CWV,
    Dependabot e governanca por nome. Esta sessao trabalhou exatamente nessas
    trilhas -- por ordem explicita e repetida do Tier 0, item a item, e nao por
    deriva do agente. O registro fica para o ciclo de calibracao julgar; a
    fonte PMev continua onde estava.
  - >-
    Feedback de calibracao NAO foi coletado nesta sessao ate o momento deste
    registro. Nota e texto so entram no ledger pelo
    Register-AgentCalibrationFeedback.ps1 com a resposta literal do
    administrador; nenhum valor foi inventado nem estimado.
revisoes_de_ancora:
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Aquele handoff ancora o HANDOFF_LATEST por dois fatos: a identificacao formal de que reports/ e a pasta canonica de handoff e este arquivo a memoria central do agente, e a eliminacao dos avisos de markdownlint nele. Os dois seguem valendos. O arquivo e um PONTEIRO rotativo por construcao -- apontar para o handoff corrente e a funcao dele, nao alteracao do que aquele registro estabeleceu. A nova versao mantem a estrutura de titulos que o saneamento de markdownlint deixou e continua apontando para reports/ como canonica.
  - registro: auditoria-2026-08-30-coderabbit-resolucao-e-integridade
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Aquela auditoria ancora este arquivo pela purificacao de mojibake e UTF-8 nas memorias e pela conformidade de AST dos cabecalhos. Nenhuma das duas e desfeita: o conteudo novo e escrito em UTF-8 limpo, sem residuo de codificacao, com um unico H1 e hierarquia de titulos sequencial. O que muda e o texto do ponteiro, nao a integridade que ela mediu.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Aquele relatorio ancora este arquivo no contexto da integracao dos motores de teoria dos jogos e da trilha PMev. Nada disso e tocado, e a direcao que ele estabeleceu e REAFIRMADA: a fila deste handoff coloca a extracao dos pares verificaveis da Aula 1.2 como item 1, declarando explicitamente que segue intocada. O ponteiro muda de destino; a prioridade que ele fixou permanece no topo.
supersede: null
---

# Handoff — integridade recuperada, portao sem margem

## Estado de partida para o sucessor

- Base publicada: `master == origin/master == 61bc5fcf`, arvore limpa.
- Suite: **778 aprovados, 7 pulados, zero falhas**.
- Portao de 5 fases: **FRAGIL, 0 erros, 2 warnings no teto de 2**.
- Ledger de calibracao: `valid`, 2 registros, tail `75fdb4d4`.

## O que esta sessao fechou

| Entrega | Commit | Evidencia |
| :--- | :--- | :--- |
| Motor tensorial compila fora do Windows | `e3234877` | 3 skips viraram testes que passam |
| Ultima referencia executavel a `.cerebro` | `e3234877` | telemetria WASM escrevia em diretorio extinto |
| Governanca sem caminho morto no prompt | `61bc5fcf` | 1 ocorrencia -> 0, prompt em 216.368 chars |
| Unica advisory do lock com conserto | `61bc5fcf` | 6 -> 5, com lock reconciliado |

## Tres leituras do mesmo portao, no mesmo commit

No fechamento desta sessao o portao foi medido tres vezes sobre codigo
identico, e deu tres resultados. Nenhum e defeito do portao; os tres sao
condicao de ambiente, e vale o sucessor conhecer os tres antes de concluir
qualquer coisa a partir de uma execucao unica.

| Condicao | Veredito | O que ocupava o teto |
| :--- | :--- | :--- |
| Frontend e CDP derrubados por restart | FRAGIL | 2 warnings de **cobertura perdida** — fases 1 e 2 nao mediram |
| Servidor de pe, rota **fria** | **FALHOU** | 2 **erros**: LCP 14.672 ms, TTFB 14.172 ms |
| Servidor de pe, rota **aquecida** | FRAGIL | os 2 warnings conhecidos: TBT e `color-contrast` |

A leitura vermelha nao foi descartada como ruido: foi diagnosticada por
evidencia independente do portao. Tres requisicoes `curl` na mesma rota, logo
depois, devolveram TTFB de **81,9 / 68,2 / 63,4 ms** contra os **14.172 ms** da
primeira. Sao os 14 s de compilacao sob demanda do Turbopack no primeiro
acesso. A medicao estava correta e o navegador era real — a *condicao* e que
era servidor de desenvolvimento frio, nao producao.

**Consequencia pratica:** rodar o portao imediatamente apos subir o `next dev`
produz vermelho legitimo e enganoso. Aqueca a rota antes de medir, e nunca
trate uma unica execucao como o estado do projeto.

## Invariantes que o sucessor nao deve quebrar

1. **O portao esta sem margem.** Dois warnings, teto dois. Antes de qualquer
   mudanca que possa somar warning, saiba que ela reprova o commit inteiro.
   Os dois ocupantes nao sao resolviveis neste host.
2. **O aceite do chromadb e condicional.** Vale enquanto o uso for so
   `PersistentClient`, embarcado, sem porta em escuta. Introduzir `HttpClient`
   ou `chroma run` invalida o aceite e reabre quatro advisories sem correcao.
3. **Piso de dependencia vai como `constraint`, nunca `override`,** e sempre
   com `uv lock` no mesmo commit. Declaracao sem lock e a armadilha do §2.
4. **Ancora de registro nao se inventa.** Antes de escrever
   `revisoes_de_ancora`, confira que o registro citado realmente declara o
   caminho. Erro cometido tres vezes nesta sessao, barrado tres vezes pelo
   portao. E o sweep tem de cobrir `docs/superpowers/plans/`, nao so
   `reports/` — foi la que estava a quarta ancora que me barrou.
5. **Numero de terceiro nao vira numero proprio.** Ha tres contagens de
   Dependabot em circulacao; nenhuma foi conciliada, e nenhuma foi adotada.

## Fila, em ordem de retorno

1. **PMev.** O handoff anterior fixou a extracao de tres pares verificaveis da
   Aula 1.2, e ela continua intocada. Se nao houver ordem em contrario, e por
   onde comecar.
2. **Certificar TBT e arbitrar o `color-contrast`** na maquina Windows, para
   devolver margem ao portao.
3. **Smoke de embedding** com `transformers` 5.15.1 antes de release.
4. **Reconciliar os alertas Dependabot** — Tarefa 1 do plano de fronteira de
   dependencias, com autenticacao do proprietario.
5. **Validar `cwv_gate.ps1` em PowerShell 5.1 real** antes de release.
6. **Higiene:** fechar os tres drafts obsoletos e as sete branches mortas.
