---
id: auditoria-2026-09-07-preludio-jules-astra-e-correcao-da-delegacao
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-07-preludio"
criado_em: 2026-09-07T18:10:00-03:00
atualizado_em: 2026-09-07T18:35:00-03:00
classes: [interno, medido, governanca, seguranca, roteamento, agentes-de-nuvem]
caminhos:
  - llm/model_registry.py
  - tests/test_gpt6_astra.py
  - tests/test_model_registry.py
  - AGENTS.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
verificado:
  - >-
    Preludio do baseline de c746d61f: as 10 branches remotas estao nos MESMOS
    heads declarados no handoff. Unica novidade no git e o commit local
    45a70c00 do Gemini 3.8 Flash, nao publicado.
  - >-
    A delegacao ao Gemini 3.5 Flash-Lite levantou a faixa de acesso dos 14
    modelos e o dado esta correto -- confirmado pelo Tier 0. A implementacao
    INVERTIA O DEFAULT de cota_por_assinatura para True; corrigido para
    declaracao entrada por entrada, com o default de volta a False.
  - >-
    Tres credenciais estavam em TEXTO CLARO em cinco manifestos MCP
    (JULES_API_KEY, EXA_API_KEY, GITHUB_PERSONAL_ACCESS_TOKEN). Saneadas com
    backup; zero segredos em claro apos a medicao de controle.
  - >-
    Auth do Jules RESOLVIDO: a chave literal do manifesto sobrescrevia a de
    HKCU. Removida, a API responde HTTP 200. Antes: 401.
  - >-
    DUAS sessoes novas do Jules, invisiveis ao git por nao terem produzido
    commit: 5197519323884032401 (09-06) e 17277502032094309709 (09-07), ambas
    travadas em AWAITING_USER_FEEDBACK. A regua 10 nao mudou o comportamento.
  - >-
    Paridade da SS6.2 preservada apos o saneamento: os tres espelhos continuam
    subconjunto do mestre.
  - >-
    Suite completa 972 aprovados / 1 pulado / zero warnings antes da correcao;
    111 aprovados nos tres arquivos tocados depois dela.
nao_verificado:
  - >-
    Se o cron do Jules de 09-06 e 09-07 leu o AGENTS.md ou o CLAUDE.md. O Tier 0
    declarou que a instrucao na UI da plataforma esta correta; o transcript das
    sessoes nao expoe quais arquivos foram lidos.
  - >-
    Se auto_approve_plan=False na criacao das sessoes do cron e o que produz
    AWAITING_USER_FEEDBACK. E a hipotese mais barata e nao foi testada: o
    parametro vive na plataforma, fora deste repositorio.
  - >-
    Os quatro servidores google-workspace-* ativos no mestre e AUSENTES do
    archive. Medido, nao corrigido -- e curadoria da camada MCP da raiz.
  - >-
    ruff format diverge em 7 arquivos do repositorio, um deles llm/model_registry.py.
    Divergencia PREEXISTENTE e ruff format NAO roda no hook. Nao corrigido para
    nao alargar o raio desta alteracao.
  - >-
    Portao de 5 fases: ver o veredito impresso no commit. Nao antecipado aqui.
  - >-
    Doze dos 17 findings do Astra: conferi B01 no codigo (fechado nos dois
    lados) e casei sete contra a descricao do relatorio dele. Os demais nao
    foram verificados contra o codigo, apenas contra o texto.
revisoes_de_ancora:
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - llm/model_registry.py
    parecer: >-
      A auditoria fixou a autoridade do registro unificado como fonte unica de
      capacidade e preco. Esta alteracao nao toca capacidade, preco nem
      procedencia: acrescenta a declaracao de faixa de acesso em cada uma das 14
      entradas e devolve o default do campo a False. A autoridade do registro
      unificado sai reforcada, porque um campo declarado por entrada e auditavel
      e um default global nao e.
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - llm/model_registry.py
      - tests/test_gpt6_astra.py
      - tests/test_model_registry.py
    parecer: >-
      Aquele registro criou cota_por_assinatura com o default False significando
      NAO DECLARADO, e delegou o levantamento. O levantamento voltou correto, mas
      aplicado como inversao do default -- que apagava o discriminante entre o
      Astra e o Fable, exatamente o que aquele registro estabeleceu. A correcao
      preserva a decisao original: o guard renomeado exige as duas metades, faixa
      levantada em todo ativo E nenhuma herdada do default.
  - registro: registro-2026-09-07-delegacao-gemini-flash-lite-cinco-itens
    caminhos:
      - llm/model_registry.py
      - tests/test_gpt6_astra.py
      - tests/test_model_registry.py
    parecer: >-
      O dado que ele levantou esta correto e foi preservado integralmente: os 14
      ativos tem cota. O que muda e o mecanismo. O proprio registro tinha
      caminhos incompleto -- alterou tests/test_gpt6_astra.py sem declara-lo --
      e o campo foi acrescentado nesta sessao.
---

# Prelúdio: Jules, Astra e a correção da delegação

**Sessão:** `claude-opus5-site-2026-09-07-preludio`
**Condutor:** `claude-opus-5` · **Regime:** `assistida`

---

## 1. O que o prelúdio mediu contra o baseline

O handoff `c746d61f` gravou os heads das 10 branches remotas justamente para
que esta sessão pudesse separar o novo do herdado. Medido hoje:

| Origem | Head no baseline | Head medido | Veredito |
| :--- | :--- | :--- | :--- |
| `bolt-journaling-…14536923137986406349` | `436c1f87` | `436c1f87` | inalterado |
| `dependabot/npm_and_yarn/frontend-…` | `7e7c796b` | `7e7c796b` | inalterado |
| `dependabot/pip/python-…` | `1105c5dc` | `1105c5dc` | inalterado |
| `devin/*` (3) | `c78cf097` `d36988ca` `126b46d9` | idem | inalterado |
| `claude/auditoria-…-skbogu` | `1395f4cf` | `1395f4cf` | inalterado |
| `integrate/*` (3) | `10cb47a8` `54fb6a5e` `38427d34` | idem | inalterado |
| `master` | `c746d61f` | `c746d61f` + 1 local | **novo** |

**Uma única novidade no git**, e ela não estava no remoto: o commit local
`45a70c00`, do Gemini 3.8 Flash, com a delegação concluída e sem push.

**O baseline funcionou.** Sem ele, a resposta correta seria indistinguível de
uma varredura preguiçosa — e afirmar "nada mudou" sem essa tabela seria a
negativa não verificada que a nota 9.0 cobra.

---

## 2. A correção da delegação — o dado certo, o mecanismo errado

O Gemini levantou a faixa de acesso dos 14 modelos ativos. **O dado está
correto e o Tier 0 o confirmou:** Anthropic por Claude Pro/Max, OpenAI por
Plus/Pro/Business, Google por Gemini Advanced e pelo free tier do AI Studio.

A implementação, não. Ele inverteu o **default** do campo:

```python
cota_por_assinatura: bool = True   # entrega original
```

Três coisas quebram com isso, e a terceira é a que importa:

1. **Modelo novo nasce afirmando cota que ninguém levantou.** É a mesma falha
   de ler ausência como evidência, apenas invertida — e o comentário que a
   proibia foi o que a alteração apagou.
2. **Readicionar um `Fable` ficaria impedido**, porque o guard exigia que
   *todos* fossem `True`.
3. **O campo deixa de discriminar.** Um booleano obrigatoriamente `True` para
   todo mundo não carrega informação — e era exatamente este campo que separava
   o Astra do Fable, que empatam em `$10/$50` por token.

O Tier 0 nomeou a correção: *deveria ter feito modelo por modelo*. Feito. O
default voltou a `False`, e cada uma das 14 entradas declara a própria faixa.

O guard passou a exigir **as duas metades**, e a segunda usa `model_fields_set`,
que só contém o campo quando o valor foi passado ao construtor:

```python
assert ModelCapability.model_fields["cota_por_assinatura"].default is False
sem_declaracao = {a for a, c in MODEL_REGISTRY.items()
                  if "cota_por_assinatura" not in c.model_fields_set}
assert not sem_declaracao
```

Sem a segunda metade, a próxima inversão de default passaria verde.

---

## 3. Auditoria do registro da delegação — o input pedido pelo Tier 0

O Tier 0 pediu para julgar se o registro serve de **padrão ouro para um modelo
de fast operations**. O que é objetivamente verificável:

### O que ele acertou

- Os 14 aliases citados **existem** no `MODEL_REGISTRY` — conferido um a um.
- O preço do `gemini-3.5-flash-lite` que ele cita (`$0.15/$0.60`) **bate** com
  o registro.
- As `revisoes_de_ancora` estão bem formadas e apontam registros reais.
- O dado central da delegação está certo, que é o que mais pesa.

### O que reprova

| # | Achado | Regra |
| :-- | :--- | :--- |
| 1 | **Três identidades para uma sessão.** O commit assina `Gemini 3.8 Flash`; o registro, `Gemini 3.6 Flash (Low)`; a delegação era ao `3.5 Flash-Lite`. | §7 — assinatura individual e distinguível |
| 2 | **`caminhos:` incompleto.** Alterou `tests/test_gpt6_astra.py` sem declará-lo. | §9 — âncora é o campo `caminhos:` |
| 3 | **Validação parcial dada como validação.** Declarou 2 arquivos de teste (81 casos) de uma suíte de 972, e **não declarou o portão de 5 fases**. | §5 — dizer o que rodou *e o que não* |
| 4 | **Estimativa apresentada como fato.** "~100-200 msgs/3h" e as faixas de tokens por degrau são aproximações sem fonte, e `nao_verificado` só cita contratos Enterprise. | §8.3 — sem certeza além da evidência |
| 5 | Não deu push — a malha ficou dessincronizada sem que nada acusasse. | operacional |

O achado 2 **não** teria barrado o commit: o portão cobra âncora em commits
*futuros*, não no próprio. O efeito é pior por ser silencioso — o arquivo ficava
sem cobertura daqui em diante. Corrigido nesta sessão.

**Veredito.** Como *levantamento*, serve: o dado é bom e verificável. Como
*registro*, não é padrão ouro — falha nos três eixos que o projeto usa para
auditar a si mesmo (identidade, âncora e declaração de cobertura). Para fast
operations a lição é operacional, não de capacidade: **delegar o levantamento,
reservar a aplicação e o registro**. O erro não foi medir mal; foi decidir o
mecanismo a partir de uma medição correta.

---

## 4. Segurança: três credenciais em texto claro

Encontrado ao investigar o `401` do Jules — não era o objeto da busca.

| Credencial | Manifestos afetados |
| :--- | :--- |
| `JULES_API_KEY` | 5 (mestre, archive, antigravity, -ide, -backup) |
| `EXA_API_KEY` | 4 |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | 3 |

A §6.4 do canônico afirma que essas chaves vivem em `HKCU:\Environment`
*"justamente para que nenhum processo dependa de credencial em arquivo"*. **A
afirmação estava desatualizada em relação ao disco** — medição vence citação
(§4 da raiz).

O Tier 0 confirmou que todas já estavam revogadas. A §3 da raiz é literal sobre
esse caso: *credencial revogada em disco não é backup, é passivo*. Saneadas por
remoção cirúrgica de linha, com JSON revalidado e backup em
`~/.gemini/remediacao_backup_aplicado/mcp-saneamento-credenciais-20260907-175045`.

Medição de controle: **zero segredos em claro** nos cinco. O que restou
(`GOOGLE_CLOUD_PROJECT`, `PATH`) não é credencial. A paridade da §6.2 saiu
intacta — os três espelhos continuam subconjunto do mestre.

`GITHUB_PERSONAL_ACCESS_TOKEN` está **ausente de `HKCU`** (só `GITHUB_TOKEN`
existe). Enquanto não for inserido, o `github-mcp-server` não tem credencial.

---

## 5. O Auth do Jules, e o que ele revelou

O literal no manifesto **sobrescrevia** a chave boa de `HKCU`. Removido:

| Antes | Depois |
| :--- | :--- |
| `HTTP 401 — API keys are not supported` | `HTTP 200 — 3 sessões` |

A chave de `HKCU` estava válida o tempo todo. A causa do 401 era a credencial
revogada injetada por cima dela.

E foi isso que expôs o achado central: **duas sessões do Jules que o git não
mostra, porque não produziram commit.**

| Sessão | Início (UTC) | Parou em | Estado |
| :--- | :--- | :--- | :--- |
| `5197519323884032401` | 09-06 03:02 | 03:21 (19 min) | `AWAITING_USER_FEEDBACK` |
| `17277502032094309709` | 09-07 03:29 | 03:45 (16 min) | `AWAITING_USER_FEEDBACK` |

**Ambas posteriores à régua** (commit `485b3bfb`, 09-05 08:56 -0300).

O que elas fizeram, nas palavras delas:

- **09-06** aplicou `React.memo` no `PerspectiveChart` **sem medir** e criou
  **`.jules/bolt.md`** — o diretório que a §10.6(a) proíbe pelo nome. Depois
  parou: *"I am now ready to move on to running tests. Should I proceed?"*
- **09-07** propôs `React.memo` em `BubbleFactorMatrix` / `NashMatrixProfiler`
  **sem um número medido**, e perguntou qual caminho seguir.

A régua **antecipou nominalmente** essas duas propostas: §10.3.2 é *"memoização
em massa"* e §10.6(a) é *"não criar `.jules/`"*. Foram feitas assim mesmo.

### As hipóteses, ordenadas — não perguntadas

A §10.2 vale para mim também. Ordenadas por *raio de alteração*, do menor ao
maior:

1. **`auto_approve_plan=False` na criação das sessões do cron.** É o default do
   `jules_create_session`, e com ele a plataforma **para por projeto**, não por
   escolha do agente. Explica os dois casos sem precisar de desobediência, e o
   raio é um parâmetro. **Testar primeiro.**
2. **Aderência do modelo à instrução.** O Tier 0 declarou que a instrução na UI
   está correta; se estiver e o parâmetro não for a causa, então o Bolt lê e não
   segue — e nenhuma edição de texto resolve isso.
3. **Alcance da régua no repositório.** Enfraquecida, não descartada: o
   `AGENTS.md` era um ponteiro que não mencionava nem o Jules nem a §10. Recebeu
   quatro linhas apontando a régua (dentro do teto de 2500 B do guard).

Não escolho entre 1 e 2 sem evidência, e a evidência de 1 mora na plataforma,
fora deste repositório.

**As duas sessões seguem abertas.** Respondê-las faria um agente agir sobre o
repositório: é ação externa e não foi autorizada nesta sessão.

---

## 6. Astra

Nenhuma operação nova. Nenhum commit assinado pela linhagem GPT-6 desde o
handoff; a branch `claude/auditoria-…-skbogu` (`1395f4cf`, autor `Codex`) está
no head do baseline, e o `sequence 16` do ledger é anterior. Verificado pelas
duas superfícies que o handoff mandava olhar — branch e ledger.

### 6.1 CORREÇÃO — o parágrafo acima é verdadeiro e enganoso

**Acrescentado no mesmo dia, depois que o Tier 0 perguntou se eu havia
conferido a refatoração do Astra. Eu não havia.**

"Nenhuma operação nova *desde o handoff*" é literalmente verdade e responde uma
pergunta que ninguém fez. Medi **heads de branch**, e head de branch não é
refatoração. O trabalho do Astra existe, é de 2026-09-05, e são **três
documentos** com o mesmo `criado_em` e o mesmo commit `d6bace4d`:

| Documento | Papel |
| :--- | :--- |
| `AUDITORIA-2026-09-05-global-site-backend-frontend.md` | 17 findings — `B01`–`B09`, `F01`–`F08`, sete P1 |
| `RELATORIO-2026-09-05-site-moldes-e-aprendizados.md` | a implementação que os fecha |
| `HANDOFF-2026-09-05-auditoria-site-moldes.md` | o fechamento |

**E errei uma segunda vez, pior que a primeira.** Ao procurar o relatório de
implementação, busquei por `B0[1-9]|F0[1-8]` e concluí que ele **não
existia**. O relatório fecha os findings **descrevendo-os**, sem citar os
códigos. Foi busca por substring em vez de por referência real — o defeito que a
§4 da raiz nomeia — e produziu uma negativa falsa publicada num registro.

O casamento, medido documento contra documento:

| Finding | Como o relatório o fecha |
| :--- | :--- |
| `B01` ranges perdem informação antes do WASM | máscara de 338 B no índice esparso `hi*52+lo` — **confere com o código** |
| `B02` eliminação perde o prêmio garantido | estado 100/0 recebe 70/30 |
| `B05` API aceita probabilidade impossível | fold equity em [0,1]; não finitos rejeitados |
| `F01` contrato hook/worker incompatível | os cinco pedidos cobertos; `undefined` nunca publicado |
| `F02` fallback Monte Carlo com resultado aparente | `DEMO_FALLBACK`, zero iterações, SE/IC não medidos |
| `F04` recomputação combinatória síncrona | **7.287 ms → 69–122 ms**, cinco execuções |
| `F05` controles recortados no viewport móvel | 390 px, larguras e bordas medidas |

**O que ele NÃO fechou, e declarou:** `B04` — a inferência real do TimesFM
segue não certificada, dito em três âncoras distintas; `B03` — convenções de
stacks, pote e contrafactuais não foram integralmente revistas; o solver Rust
multiway continua com avaliação de showdown não implementada, com o tensor
preservado como scaffold.

**Isto é o padrão que a nota 9.0 descreve, e ele reincidiu dentro da própria
sessão que o registrou.** A memória `a-negativa-e-o-gatilho` foi escrita há
horas para proibir exatamente isto, e o gatilho não disparou porque eu estava
buscando *evidência de existência*, não redigindo uma negativa — e só percebi
que havia escrito uma quando o Tier 0 disse que ela era falsa. **A regra precisa
valer também para a busca que precede a frase, e não só para a frase.**

---

## 7. O que fica em aberto

| Item | Estado |
| :--- | :--- |
| `GITHUB_PERSONAL_ACCESS_TOKEN` fora do `HKCU` | Tier 0 — código entregue na sessão |
| 4 servidores `google-workspace-*` ativos e fora do archive | medido, não corrigido |
| Contagens da §6.1 do canônico (15/12) vs medidas (35/14) | divergentes; auditoria de ambiente própria |
| `auto_approve_plan` do cron do Jules | hipótese 1, não testada |
| Duas sessões do Jules em `AWAITING_USER_FEEDBACK` | aguardando autorização |
| `ruff format` diverge em 7 arquivos | dívida sistêmica; não roda no hook |
| Astra fora do `agents_manifest.json`; Flash-Lite sem rota | herdadas do handoff |

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** corrigir o mecanismo da delegação preservando o dado, sanear três
credenciais em texto claro em cinco manifestos, restaurar o Auth do Jules e
registrar que a régua §10 falhou duas vezes com evidência de plataforma.
