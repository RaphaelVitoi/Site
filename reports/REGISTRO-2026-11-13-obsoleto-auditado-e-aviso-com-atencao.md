---
id: registro-2026-11-13-obsoleto-auditado-e-aviso-com-atencao
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-13T14:00:00-03:00"
atualizado_em: "2026-11-13T14:00:00-03:00"
classes: [interno, governanca]
commit: "0ad7ad87"
caminhos:
  - scripts/ops/record_gate.py
  - scripts/ops/record_index.py
  - scripts/ops/saude_da_malha.py
  - tests/test_record_index.py
verificado:
  - "censo integral dos 682 registros: 656 VIGENTE / 26 OBSOLETO / 0 SUSPEITO"
  - "auditoria minuciosa dos 26 OBSOLETO: conteudo, cadeia de supersessao ate
    terminal VIGENTE, pendencias e cobertura de ancoras"
  - "diff do commit 01aa08c0 verificado arquivo a arquivo: 67 registros
    +congelada_em, 4 commit:, zero alteracao de corpo"
  - "portao exercitado ao vivo: 20 bloqueios VIGENTE respondidos com 20
    revisoes_de_ancora honestas"
nao_verificado:
  - "cobertura de ancora e opcao de adocao, nao obrigacao: 14 caminhos vivos
    ficaram sem registro VIGENTE (lista no corpo)"
---

# Registro — os 26 OBSOLETO auditados um a um, e a garantia de que aviso nunca é silenciado

## O que este registro comunica a qualquer operador

### Estado do corpus (medido em 2026-11-13)

- **656 VIGENTE / 26 OBSOLETO / 0 SUSPEITO.** A reconciliacao de ancoras esta
  completa: o commit de nascimento e derivado do git (`--diff-filter=A`,
  fallback `-m` para arquivos nascidos dentro de merge), nao mais digitado.
- **26 OBSOLETO confirmados individualmente** — nenhum aviso ocultado, nenhuma
  pendencia enterrada, nenhuma cadeia orfa:
  - 20 aposentados por `HANDOFF-2026-08-31-auditoria-sota-e-tipagem-genai`, que
    por sua vez foi aposentado por
    `HANDOFF-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api`
    (VIGENTE);
  - 5 direto pelo saneamento-linters; 1 por
    `HANDOFF-2026-08-28-auditorias-e-preludio`.
  - Todos sao artefatos de sessao de 27–31/08
    (HANDOFF/AUDITORIA/REGISTRO/FRENTE/ PLANO/INTERLUDIO/VALIDACAO/RELATORIO). A
    norma viva esta em `CLAUDE.md` e `docs/GOVERNANCA_PIRAMIDAL_SOTA.md`, nao
    neles.
  - `pendencias:` vazio nos 26 — nenhum trabalho aberto escondido em aposentado.

### Achado residual (adocao, nao defeito)

14 caminhos vivos perderam cobertura de ancora VIGENTE ao aposentar os registros
que os declaravam: `.gitattributes`, `.github/copilot-instructions.md`,
`core/sota_context_engine.py`, `data/TETOS_DE_MEMORIA.json`,
`data/ESTADO_DA_MEMORIA_DE_TRABALHO.json`, `scripts/cli/nexus_voice.py`,
`scripts/mcp_dynamic_server.py`, `utils/ram_optimizer.py`, 5 `tests/test_*.py` e
1 prompt de continuidade. Sem ancora e o estado normal da maioria do repo; se o
Tier 0 quiser cobertura, a adocao correta e um registro VIGENTE novo
declarando-os — nunca ressuscitar obsoleto.

### A taxonomia de saida do portao (como ler aviso, sinal e registro)

- **REGISTRO** = contexto legivel. Toda linha de aviso carrega o caminho do
  registro; abra-o para entender o que esta sendo atestado.
- **AVISO** = atencao obrigatoria. O digest de nao vigentes exige decisao por
  item: reconciliar (metadata/`commit:`/`supersede`) ou declarar pendencia.
  Aviso nao respondido **reincide em todo commit** — nao existe silencio.
- **SINAL** (`[SAUDE DA MALHA]`) = ruido nao classificado ate ser respondido.
  `info` e observacao a identificar; `ALERTA` e fato grave medido. Todo sinal
  reincide ate respondido.
- **OBSOLETO nao emite aviso de ancora** — aposentado e decisao ja tomada;
  avisar de novo era ruido permanente (medido: 41 avisos/commit em 13/11).

### Averiguacao por commit e mecanica, nao voluntaria

Registro VIGENTE cuja `caminhos:` e tocada **bloqueia** ate receber
`revisoes_de_ancora` valida no mesmo commit (registro + caminhos + parecer).
Prova viva neste ciclo: 20 registros bloquearam o commit dos portoes e foram
respondidos um a um. Nao ha como commitar mudanca em caminho ancorado sem a
averiguacao individual que voce pediu.

### Referencias

- Dossie registro-a-registro dos 304 nao vigentes (censo + resolucao aplicada):
  `reports/DOSSIE-2026-11-13-nao-vigentes.md`
- Commits: `01aa08c0` (reconciliacao), `dbd820f6` (ancora do dossie), `0ad7ad87`
  (atencao obrigatoria em aviso/sinal).
