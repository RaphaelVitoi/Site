---
id: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-14T20:40:00-03:00'
atualizado_em: '2026-09-14T20:40:00-03:00'
classes: [interno, medido, governanca, dependencias]
session_id: 2e4e2bd0-7571-49e4-bd33-1a04752a1609
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  node: '24.16.0'
  next: '16.3.5'
  congelada_em: '2026-09-14'
caminhos:
  - utils/text.py
  - scripts/cli/nexus.py
  - engine/clippy_clipboard.py
  - tests/test_utils_sota.py
  - tests/test_clippy_and_handoff.py
  - tests/test_hook_commit_msg.py
  - .husky/commit-msg
  - data/agent_identities.json
  - CLAUDE.md
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  - frontend/package.json
  - package.json
  - package-lock.json
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos: [CLAUDE.md]
    parecer: >-
      A unica mudanca no CLAUDE.md e uma linha na tabela de verificacoes do commit-msg
      (SS7, aviso de Tier divergente). A SS9 e a separacao reports/docs/agent-memory/data
      que este registro espelha nao foram tocadas; este proprio registro mora em reports/
      com o prefixo REGISTRO-, conforme ela.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos: [CLAUDE.md]
    parecer: >-
      A auditoria trata dos campos conductor_model/conductor_vehicle/supervision_mode da
      SS8.3. A linha nova confere o Tier da Assinatura de commit contra
      data/agent_identities.json, outro eixo, e so avisa; o escritor e o gerador do
      ledger nao mudam.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos: [CLAUDE.md]
    parecer: >-
      Checkpoint historico da v7.0. A linha acrescentada na SS7 nao altera nenhuma das
      regras de hardening que ele registra e nao reverte nada que ele declare.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos: [CLAUDE.md]
    parecer: >-
      As pendencias e a reconciliacao do handoff sao da SS8.3 (calibracao). A mudanca e
      na SS7 (verificacao de autoria) e so acrescenta aviso. O limiar de sessoes, as
      correcoes append-only e o portao de suficiencia seguem intactos.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos: [CLAUDE.md]
    parecer: >-
      Relatorio historico de harmonizacao v8. A linha nova completa a tabela executavel da
      SS7 sem mudar hierarquia de Tiers, roteamento de modelo nem taxonomia.
verificado:
  - contraprova -- os testes novos de handoff e de Tier FALHAM sobre o codigo anterior e passam sobre o novo
  - pytest dos tres arquivos afetados, 95 passed, zero warning
  - ruff check e ruff format --check nos seis arquivos Python alterados
  - npm ls sem ELSPROBLEMS; npm audit --audit-level=low com zero vulnerabilidades
  - diff do lock medido entrada a entrada -- so arvore do react-player 3.4.0, Prisma no mesmo nivel e remocao do client 7.10.0 aninhado
  - npm --workspace frontend exec prisma generate (o postinstall do CI) gera o client 7.9.1
  - npm run typecheck e npm run build na raiz, a mesma sequencia do CI, com exit 0; eslint no SotaMarkdown.tsx limpo
nao_verificado:
  - CI do PR 46 do Dependabot depois do rebase sobre este commit
  - reproducao do player em navegador com URL real de YouTube/Vimeo sob react-player 3
---

# Correções pós-auditoria: handoff, Tier da Assinatura e dependências

Auditoria dos commits de 12 a 14/09 feita na mesma sessão, com oito achados.
Este registro trata os que se corrigem por medição e declara os que dependem do
Tier 0.

## 1. O handoff apagava símbolos sem avisar

`08b2601f` passou a gravar `HANDOFF_LATEST.md` depois de `enforce_pure_ascii` e
com `errors="ignore"`. A Blindagem ASCII do backend é regra canônica
(`GLOBAL_INSTRUCTIONS.md`, `ARCHITECTURAL_INVARIANTS.md`) e **fica**. O defeito
era outro: todo caractere sem transliteração sumia sem registro, e `§`, `→`,
`≠` e `×` estão entre eles. "regra ≠ fato" chegava ao próximo agente como
"regra  fato", com o sentido invertido.

**Correção:**

- `utils/text.py` ganhou equivalentes ASCII para símbolos semânticos: `§`→`SS`,
  que é a convenção já usada nos arquivos ASCII desta base, `→`→`->`, `≠`→`!=`,
  `≤`/`≥`, `×`, marcadores e box-drawing.
- Ganhou também `caracteres_sem_transliteracao`, que conta o que ainda se perde.
- O handoff lê as fontes cruas, mede a perda, purifica uma única vez e grava em
  ASCII **estrito**. A perda aparece no console por código de ponto.
- O Clippy perdeu um `try/except` que registrava falha de sanitização em `debug`.

## 2. O Tier da Assinatura não era conferido

Dois commits de hoje (`9b09d572`, `a3c1e401`) assinaram `Gemini 3.8 Flash [Tier 2]`.
A §7 põe o Gemini 3.8 Flash no Tier 1; o Tier 2 é de Jules, Exa, Stitch e Devin.
O `commit-msg` comparava o nome e ignorava o Tier.

**Correção:** o catálogo passou a ter o campo `tier`, com o número em que a §7
lista cada modelo. O hook **avisa** quando o número declarado diverge. Não
bloqueia: a promoção a bloqueio é redução material e decisão do Tier 0. A
subdivisão (1.A, 1.B, 1.C) não tem definição canônica, então só o número é
conferido. O comentário do catálogo apontava como consumidor um arquivo de teste
que não existe; passou a apontar o real, `tests/test_hook_commit_msg.py`.

Histórico publicado não se reescreve: os dois commits ficam como estão, e a
divergência consta aqui.

## 3. O PR do Dependabot reprovava no CI, e o lock do Prisma estava incoerente

- **react-player 3** trocou a prop `url` por `src`. O bump e o ajuste em
  `SotaMarkdown.tsx` entram juntos neste commit. O PR 46 rebaseia sem o
  react-player e deixa de carregar o `TS2769`.
- **Prisma:** o lock servia `@prisma/client` **7.10.0** aninhado no workspace,
  enquanto o `frontend/package.json` declarava 7.9.1 e o CLI era 7.9.1. O CI
  gerava o client 7.9.1 sobre o pacote 7.10.0, sem que nada acusasse.
- Fixar `7.9.1` exato nos dois manifestos expôs a segunda metade do problema. O
  resolvedor do Prisma exige CLI e client no mesmo nível de `node_modules`, e só
  o aninhamento divergente mantinha o CLI ao lado do client.
- As entradas aninhadas saíram do lock e o npm reinstalou os dois na raiz, o
  mesmo layout que o PR 46 produz. `npm dedupe` foi testado e **descartado**:
  mudava 22 pacotes fora do escopo.

## 4. Fora deste registro, por dependerem do Tier 0

| Achado | Por que não foi alterado |
| :--- | :--- |
| `Bash(antigravity:*)`, `Bash(agy:*)`, `RunCommand(antigravity, **)` em auto-aprovação | remover é redução material (§8.2); a ampliação conflita com a Lei de Concorrência e precisa de decisão explícita |
| "preferência mandatória" do Gemini ao lado de "não existem feudos" (§7) | texto de governança escrito em sessão assistida pelo Tier 0 |
| `next-env.d.ts` versionado alterna entre `.next/dev/types` e `.next/types` | tirar do índice exige `next typegen` antes do `typecheck` no CI e verificação em checkout limpo; mudança própria |
| `conductor_vehicle: antigravity-ide` no registro de settings de hoje | a §8.3 diz que a IDE não é veículo; registro publicado não se reescreve, e a correção é append |

O commit `08b2601f`, rotulado `docs(governanca)`, alterou código de runtime
(`nexus.py`, `do.ps1`, `clippy_clipboard.py`). Quem filtra o histórico por tipo
não vê a mudança do item 1. Fica registrado aqui.
