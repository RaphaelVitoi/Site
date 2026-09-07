---
id: handoff-2026-09-07-integracao-astra-e-calibracao-de-procedimento
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-07-astra"
criado_em: 2026-09-07T19:15:00-03:00
atualizado_em: 2026-09-07T19:15:00-03:00
classes: [interno, medido, governanca, roteamento, calibracao]
caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
  commit_publicado: 30dbc8fe
verificado:
  - >-
    Push concluido -- 7883f6c2..30dbc8fe em origin/master, local sincronizado,
    working tree limpo.
  - >-
    Feedback 9.0 registrado no ledger como sequence 17, valor LITERAL 9.0 e nao
    0.9; cadeia valida com 18 registros e tail 2d370afd.
  - >-
    Acumulado apos o registro: 15 feedbacks, 14 sessoes distintas, media 8.673.
  - >-
    Suite 971 aprovados / 1 pulado / zero warnings; portao de 5 fases com 0
    erros e 1 warning (teto 2); markdownlint limpo.
nao_verificado:
  - >-
    TBT -- artefato Lighthouse expirado por LIGHTHOUSE_FINGERPRINT_MISMATCH
    desde o commit 7883f6c2; nao decorre deste trabalho.
revisoes_de_ancora:
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. Aquela evidencia diaria fotografou o universo de 02/09 e
      permanece correta PARA AQUELA DATA. O acrescimo de hoje amplia o
      universo adiante dela; evidencia diaria nao e recalculada
      retroativamente, e a §8.3 e explicita em que dado nao expira nem se
      reescreve.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. A nota 7.5 daquela retrospectiva permanece no sequence 1, com
      o mesmo hash. A retrospectiva dela nao e afetada por feedback posterior.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. A nota da sessao de curadoria MCP segue no sequence 5, e a
      correcao que a reduziu de 9.5 para 9.0 continua sendo aplicada pela
      automacao antes de qualquer contagem.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. As observacoes daquele dia se apoiam nos sequences 1 a 5,
      todos preservados. A media citada la era do universo daquela data e nao
      pretende valer para o de hoje -- 8.673 sobre 15 feedbacks.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. Aquele handoff trata de continuidade de PMev; o ledger entra
      nele como evidencia de calibracao, e a evidencia so cresceu. A
      prioridade PMev que ele fixou segue valendo e e reafirmada no prompt de
      continuacao deste.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. Nada de quarentena de MCP ou roteamento lazy depende do
      conteudo do ledger.
  - registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. A guarda de governanca e a cobertura de CVE nao leem o
      ledger. Nota lateral verificada nesta sessao: npm audit devolve ZERO
      vulnerabilidades, entao a cobertura que aquele handoff instituiu segue
      satisfeita.
  - registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. O portao de reprodutibilidade de PMev e independente do
      ledger de calibracao: sao dois portoes com metricas distintas. O achado
      central dele -- a barreira dos 7 pares e portao, nao defeito -- e
      PRESERVADO e reafirmado no prompt de continuacao.
  - registro: handoff-2026-09-04-pmev-credenciais-e-submodulos
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. A nota 9.5 daquela sessao permanece no sequence 13. Este
      handoff aponta explicitamente para a §7 dela como a fonte de onde a
      teoria PMev parou; referencia, nao substitui.
  - registro: handoff-2026-09-04-refinamento-sota-radar-telemetria-e-mcps-google
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. A nota 9.5 do refinamento SOTA segue no sequence 12, intacta.
  - registro: handoff-2026-09-05-fechamento-do-ciclo-e-regua-do-jules
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. A nota 9.8 daquela sessao permanece no sequence 14. O ciclo
      de calibracao que ela fechou -- o escritor de record_type calibration e
      a tarefa das 23:59 -- e justamente o que tornou este registro possivel,
      e nao foi tocado. A regua do Jules (§10) permanece byte a byte.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. Aquele registro cita o ledger como evidencia de sessao, nao
      como insumo de codigo. O caminho do adaptador Anthropic FOI alterado
      nesta sessao, mas no commit 30dbc8fe ja publicado e ja reconciliado com
      ele la; esta anotacao acrescenta apenas o feedback.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. Aquele registro documenta a nota 8 que entrou como 0.8, por
      conversao de escala que a propria regra proibia. Esta anotacao respeita
      a correcao: 9.0 foi gravado como 9.0, verificado na leitura do sequence
      17 apos a escrita. O mecanismo append-only de correcao nao foi usado
      porque nao houve o que corrigir.
  - registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. A nota 10 e o outlier de aceleracao daquele dia seguem
      registrados e nao sao reinterpretados. O ledger de outliers NAO foi
      tocado nesta sessao.
  - registro: registro-2026-09-04-nota-9-5-e-analise-paralela-de-nos
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. A nota 9.5 permanece intacta. O aprendizado central dele --
      analise paralela de nos -- e diretamente pertinente ao feedback de hoje:
      o defeito de classe que reincidiu tres vezes e vizinho daquele, e a
      resposta esta na memoria a-negativa-e-o-gatilho.
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      O ledger e append-only e esta alteracao e UM registro anexado, sequence
      17. Nada foi reescrito: os record_hash anteriores estao intactos e a
      cadeia foi verificada valida com 18 registros e tail 2d370afd depois do
      acrescimo. A nota 8.0 daquela sessao do Gemini segue no sequence 15. O
      saneamento de Ollama e o auto-diagnostico nao dependem do conteudo do
      ledger.
---

# HANDOFF — Integração do GPT-6 Astra e uma calibração de procedimento

**Nota do Tier 0: 9.0 / 10** · Sessão `claude-opus5-site-2026-09-07-astra`
**Publicado:** `30dbc8fe` · **Registro oficial:**
[`REGISTRO-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable.md`](REGISTRO-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable.md)

---

## 1. O que foi entregue

A sessão abriu como **prelúdio** — conferir o interim — e virou integração de
modelo de fronteira.

1. **`GPT-6 Astra` integrado**, verificado campo a campo na doc oficial. Teto de
   esforço `low`/`medium` **executável**: `esforcos_autorizados` declara e
   `OpenAIAdapter.build` recusa em runtime. Entra por escalonamento em duas
   classes; **nunca primário**.
2. **Família `Fable` retirada** — por **faixa de acesso**, não preço: por token
   empata com o Astra em $10/$50, e o que separa é que Fable **não entra em
   plano de assinatura** (confirmado em `claude.com/pricing`). Saiu para
   `MODELOS_RETIRADOS`, terceira categoria distinta de `MODELOS_NAO_VERIFICADOS`.
3. **Três preços corrigidos por medição.** O grave: `claude-sonnet-5` estava a
   `$3/$15` — que é o **Sonnet 4.6**. O registro cobrava 50% a mais na rota mais
   usada do projeto.
4. **`Opus 4.6` e `Sonnet 4.6` catalogados** — disponíveis, **fora do Tier 1**,
   sem rota.
5. **Tier 1 redefinido** no `CLAUDE.md` conforme sua declaração.

**Defeito que a retirada expôs:** a rota `SESSAO_MULTI_DIA` tinha o Fable como
**primário** — a tabela roteava para um modelo que a malha não usa, e nada
acusava. Guard criado.

---

## 2. O feedback, e por que ele é o item mais importante deste handoff

> *"Reconhece os erros, mas o procedimento continua a aceitar os erros já
> expostos à sabatina e já conhecidos, e não há percepção significativa de que
> estejam corrigidos, mesmo a auto-avaliação reconhecendo-os com precisão."*

**A crítica não é sobre diagnóstico — é sobre ausência de mudança de
procedimento.** Havia memória escrita sobre exatamente este defeito
(`medir-antes-de-mexer-nao-depois`, 2026-09-05, com os três casos analisados
corretamente), e ele **reincidiu três vezes** na sessão seguinte:

| # | O que afirmei | Quem pegou |
| :-- | :--- | :--- |
| 1 | que `adapters.py` já importava `ESFORCOS_OPENAI_VALIDOS` | LSP |
| 2 | "são 60 âncoras" — varri prosa, não o campo `caminhos:` | `record_gate` (são 19) |
| 3 | "o portão de 5 fases **não rodou**" | o JSON do próprio portão: `CdpActive: true` |

O terceiro estava **na mensagem do commit** e foi corrigido por `amend` antes do
push, com a correção declarada dentro da própria mensagem.

### A resposta de procedimento

Memória nova: **`a-negativa-e-o-gatilho`**. Ela não descreve o defeito — dá um
gatilho **sintático**:

> **Antes de escrever qualquer frase cujo núcleo seja uma NEGATIVA sobre estado,
> rodar o comando que a refutaria.** Se não houver comando, a frase vira "não
> verifiquei" — nunca "não é".

Fundamento medido: **os 6 erros desta classe foram todos negativas.** Nenhum foi
afirmação positiva errada. A assimetria tem causa — busca com resultado prova
existência; busca vazia **não prova ausência**, é indistinguível de escopo
errado.

**Esta é a hipótese a falsificar na próxima sessão**: se o gatilho sintático
funciona onde o princípio descritivo falhou, a próxima sessão fecha sem
negativa não verificada. Se reincidir, o problema não é a formulação da memória
e sim o momento de leitura dela — e aí a correção tem de ser de outro tipo.

---

## 3. Estado ao encerrar

| Item | Estado |
| :--- | :--- |
| `origin/master` | **`30dbc8fe`** — push concluído, sincronizado |
| Working tree | limpo — este handoff foi commitado junto, por decisão do Tier 0 |
| Suíte | 971 aprovados, 1 pulado, zero warnings |
| Portão de 5 fases | 0 erros, 1 warning (TBT, preexistente, teto 2) |
| Ledger | válido, 18 registros, tail `2d370afd` |
| Calibração | 15 feedbacks, **14 sessões distintas**, média **8.673** |
| Portão de calibração | **aberto** — limiar é 3, `ultima_calibracao` segue `null` |

---

## 4. Delegado ao `Gemini 3.5 Flash-Lite`

Registrado na §6 do registro oficial. Cinco itens, **nenhum bloqueante**:
preços de assinatura da OpenAI (fonte primária deu **403**), `cota_por_assinatura`
dos demais modelos (default = *não levantado*, não *sem cota*), teto exato de
mensagens do Astra, custo de raciocínio por degrau, e avaliação do próprio
Flash-Lite para rota.

---

## 5. Dívidas declaradas

- **`autorizado=False` está sem nenhum modelo.** Criado para o Fable, que virou
  `RETIRADO` vinte minutos depois. Tem guard, não tem dado. Candidato a remoção
  pela §6.5 se seguir vazio — não removido porque suprimir capacidade é redução
  material (§8.2).
- **TBT sem certificação** — artefato Lighthouse expirado desde `7883f6c2`.
- **Astra fora do `agents_manifest.json`** e **Flash-Lite sem rota** — os dois
  são decisão de política, não omissão.
- Dívidas herdadas do prelúdio: 2 branches Dependabot (`npm audit` = **zero**
  CVE, então sem urgência), 3 branches Devin não integradas, 3 worktrees mortas
  em `Site-worktrees/`, e o outlier `512fc3a6` (divergência entre o prompt
  agendado e o gerador v4) ainda em `retained-pending-deterministic-review`.

---

## 6. Prompt de continuação

> Continuação em `C:\Users\rapha\.gemini\Site`. A sessão
> `claude-opus5-site-2026-09-07-astra` foi encerrada com **nota 9.0** e o
> trabalho está publicado em `30dbc8fe`. Esta abre identidade **nova**.
>
> **Não há dívida administrativa a pagar na abertura:** o handoff e o ledger
> foram commitados na própria sessão anterior, e o repositório está
> sincronizado. **Abra direto no trabalho.**
>
> **O foco é PMev** — decidido em 2026-09-05 e não retomado desde,
> porque duas sessões seguidas foram desviadas por trabalho de infraestrutura. O
> objeto é o **contraste ICMev × ChipEV no mesmo nó**; procedência é meio, não
> fim. A barreira é `countReproduciblePairs(AULA_1_2_PAIRS) = 0 de 7`, mínimo 3,
> e **ela não é defeito — é o portão**. Não "consertar" esse teste: o número
> sobe quando o export chegar, e preenchê-lo sem export é inventar evidência.
> Ler a §7 de `reports/HANDOFF-2026-09-04-pmev-credenciais-e-submodulos.md` e as
> seções 8 e 9 de `evidenceContract.ts`.
>
> **Sobre o modelo novo:** o `gpt-6-astra` está integrado e restrito a
> `low`/`medium`; ele é `escalona_para`, nunca primário, e elevar o teto é
> decisão do Tier 0. A família Fable está **retirada** — se algo pedir por ela,
> ler `MODELOS_RETIRADOS` antes de reintroduzir.
>
> **Sobre procedimento, e isto é o que a nota 9.0 cobra:** ler
> `a-negativa-e-o-gatilho` antes de começar. **Toda frase que afirme que algo não
> existe, não rodou ou não foi feito exige rodar antes o comando que a
> refutaria.** Seis de seis erros desta classe foram negativas. Se esta sessão
> fechar sem nenhuma negativa não verificada, a hipótese se confirma; se
> reincidir, o problema é o momento de leitura da memória e não sua redação.
>
> **Não abrir com credenciais** — as chaves foram completamente inutilizadas e o
> expurgo do histórico é delegável, não pendência de segurança.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** encerrar a sessão de integração do GPT-6 Astra, registrar o
feedback 9.0 e a resposta de procedimento que ele cobra, e entregar a fila
seguinte com PMev no topo.
