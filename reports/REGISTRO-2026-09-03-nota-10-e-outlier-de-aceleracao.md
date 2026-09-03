---
id: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-03T16:40:00-03:00
atualizado_em: 2026-09-03T16:40:00-03:00
classes: [interno, medido, calibracao]
caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  - reports/agent-calibration/outlier-evidence-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A mudanca deste commit e APPEND puro: uma linha
      nova na sequencia 9. O ledger e append-only e encadeado por SHA-256, entao
      nenhum registro anterior foi reescrito e nenhuma leitura passada mudou de
      valor. A cadeia foi verificada em valid antes e depois.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido, pelo mesmo motivo: append de uma linha, sem
      reescrita. As contagens que aquele documento cita permanecem corretas para
      a data em que foram medidas.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Este e o registro mais afetado, porque trata de
      observacao de calibracao, e agora existe um ledger de outlier separado.
      Nao ha conflito: aquele documento observou feedbacks, este anexa evidencia
      de outlier em arquivo proprio, com pattern_indexed falso.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Append puro; o handoff daquele dia nao cita
      contagem que esta linha altere.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Append puro. A curadoria de MCP que ele
      descreve nao depende do conteudo do ledger.
  - registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Append puro, mesma sessao do dia anterior.
  - registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado, mantido valido, e COMPLEMENTADO. Ele declara 9 registros, 6
      sessoes distintas e media 8,50, e a nota 8 daquela sessao. A linha anexada
      agora e a nota 10 da MESMA sessao, com o mesmo session_id e o mesmo
      session_started_at. Portanto o numero de sessoes distintas continua 6 e o
      portao de suficiencia nao se move: e densidade intra-sessao, e a secao 8.3
      e explicita que uma origem so nao e recorrencia. A media de 8,50 daquele
      documento passa a estar defasada, e a fonte correta e a medicao do script,
      nao a prosa -- que e a secao 6.1 do CLAUDE.md aplicada.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Append puro; aquele registro trata de adapters
      e nao de calibracao.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido, e este merece atencao especifica: ele publicou a
      correcao da nota gravada como 0.8 no lugar de 8. A linha anexada agora foi
      gravada como 10 literal, sem conversao de escala, exatamente como aquela
      correcao exige. Os registros de correction anteriores continuam intactos e
      seguem sendo aplicados antes de qualquer contagem.
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. E evidencia diaria de 02/09 e nao alcanca uma
      linha anexada em 03/09. A corrida diaria das 23:59 de hoje vai medir a nova
      linha por conta propria.
verificado:
  - portao de 5 fases com CDP 9222/9224 e dev server 3000 de pe -- LCP 896 ms, CLS 0, AXE_VIOLATIONS 0
  - cadeia do ledger de feedback verificada em valid, 10 registros, tail 1c605bd1
  - ledger de outlier lido de volta campo a campo -- record_type outlier, sequencia 1, pattern_indexed falso
  - as taxas de erro por hora foram contadas a partir de tool_result is_error nos transcripts jsonl
nao_verificado:
  - a generalizacao do padrao de aceleracao para alem desta sessao -- amostra de 16 chamadas na janela critica
  - nenhum teste novo foi escrito, porque esta mudanca nao contem codigo
supersede: null
---

# A nota 10, e o outlier que a própria conversa produziu

Dois registros de calibração no mesmo commit, em ledgers separados de propósito.

## O feedback, e por que ele não move o portão

Sequência 9, cadeia `valid` com 10 registros. Gravado com o **mesmo**
`session_id` e `session_started_at` da nota 8 da manhã.

Isso é deliberado: a §8.3 conta **sessões distintas**, não feedbacks. Dois
feedbacks da mesma sessão são densidade, e densidade não abre portão — uma
origem só não é recorrência. Continuam 6 sessões.

## O outlier, e o instrumento que eu errei primeiro

O Tier 0 observou tendência de acelerar quando o contexto é **segurança** ou
**erro próprio**, com aumento de erros, desvios, verborragia e confusão.

Medido nesta sessão:

| Janela | Erros/chamadas | Taxa |
| :--- | ---: | ---: |
| 15h — segurança + correção do Tier 0 | 4/16 | **25,0%** |
| 09h — limpeza de disco | 18/159 | 11,3% |
| 13h–14h — trabalho normal | 14/242 | 5,8% |
| 20h–21h — sessão anterior | 7/216 | 3,2% |

`n=16` é pequeno. Por isso `disposition` é evidência retida e
`pattern_indexed` é falso: a §8.3 exige análise determinística posterior antes
de indexar padrão, e amostra baixa pode indicar origem específica em vez de
padrão real.

O qualitativo sustenta melhor, porque é nominal: três falhas de instrumento em
cerca de vinte minutos, todas depois de uma correção do Tier 0 — um regex com a
aspa antes do método que me fez afirmar algo falso, uma classe de caractere
inválida, e um caminho do Git Bash entregue ao Python do Windows.

**Falsificador declarado no registro:** se em três sessões distintas a taxa não
subir nessas janelas, a hipótese cai e nenhuma calibragem se aplica.

## A ocorrência dentro da própria conversa

Eu escolhi o instrumento errado: pedi nota, e outlier não tem campo de nota. O
Tier 0 corrigiu duas vezes. É a terceira ocorrência do padrão que o registro
descreve, acontecendo dentro da conversa que o registrou.
