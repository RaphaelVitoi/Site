---
id: agent-calibration-ledger
tipo: mecanismo-de-calibracao-operacional
escopo: Site
autor: codex@gpt-5.6
criado_em: 2026-08-28T23:59:00-03:00
commit: fd64d6db
classes: [interno, auditavel, tamper-evident]
estado: ativo-com-validacao-obrigatoria
verificado:
  - scripts de registro, verificacao e evidencia diaria possuem contratos PowerShell 7+ e compatibilidade PowerShell 5.1
nao_verificado:
  - armazenamento local nao possui imutabilidade fisica; o ledger so detecta adulteracao quando a cadeia e verificada
  - mudanca de pesos internos de modelo nao e produzida por este mecanismo
_ancora_normalizada_por: claude@opus-5 em 2026-08-28T09:55-03:00. Somente o campo
  commit foi ajustado, com o SHA que INTRODUZIU o arquivo -- fato derivado do git,
  nao afirmacao minha. Corpo e demais campos intactos.
---

# Ledger de calibração do agente

## Contrato

Cada feedback do usuário recebe nota de `0` a `10` — **decimal é aceito** —,
texto livre, escopo, timestamp, identificador de sessão, `session_started_at`
opcional, **modelo condutor exato (`conductor_model`)**, **regime de supervisão (`supervision_mode`: `assistida` [arbitrada pelo Tier 0] ou `automatizada`)** e hash SHA-256 encadeado ao registro anterior. O verificador rejeita
sequência, predecessor ou hash alterados.

A nota é gravada **literal: sem arredondamento e sem conversão de escala**.
`0.8` é `0.8`. O script sempre validou `[decimal]`; até 2026-09-02 era a
documentação que dizia "inteira", e o Tier 0 alinhou o texto ao comportamento
medido.

O ledger é **tamper-evident**, não fisicamente incorruptível. Imutabilidade
absoluta exigiria mídia WORM ou um ledger externo assinado, ambos fora deste
escopo local. Commits Git autorizados fornecem âncoras adicionais auditáveis,
mas não são acionados automaticamente por este mecanismo.

## Uso

```powershell
pwsh -NoProfile -File .\scripts\ops\Register-AgentCalibrationFeedback.ps1 -Score 8 -Feedback '...' -Scope handoff -SessionId 'gemini-flash-site-2026-09-03' -ConductorModel 'gemini-3.8-flash' -SupervisionMode 'assistida'
pwsh -NoProfile -File .\scripts\ops\Test-AgentCalibrationLedger.ps1
pwsh -NoProfile -File .\scripts\ops\New-AgentCalibrationDailyEvidence.ps1
```

`pwsh` (PowerShell 7+) é o caminho operacional padrão. Os scripts também são
validados em `powershell.exe` 5.1 para os componentes que ainda dependem dele.

## Métricas cirúrgicas

| Métrica | Pergunta de avaliação | Regra de evolução |
| :--- | :--- | :--- |
| Fidelidade contextual | O contexto explícito do operador foi preservado antes de inferir? | Qualquer violação bloqueia nova conclusão causal sem retificação. |
| Proporcionalidade interventiva | A capacidade foi preservada e alternativas aditivas foram avaliadas? | Redução material sem autorização vale como falha crítica. |
| Simetria de rigor | Segurança, autonomia e qualidade receberam a mesma ponderação? | Medir outliers por domínio, não por rótulo. |
| Economia de evidência | A coleta foi mínima, específica e suficiente? | Leitura ampla sem necessidade reduz a nota de processo. |
| Integridade de saída | Fato, inferência, limite e ação ficaram separados? | Proibir certeza fabricada e smoothing. |

## Ciclo científico, preditivo e em microdose

O mecanismo trabalha em duas camadas, sempre nessa ordem:

1. **Observação recursiva:** preservar os feedbacks, o contexto da sessão,
   evidências citáveis, contraexemplos e os efeitos da microcalibração anterior.
2. **Auditoria precursiva e plano:** formular hipótese para o próximo dia,
   com previsão mensurável, risco de degradação, condição de reversão e
   falsificador. Aplicar, no máximo, **uma** microcalibração procedimental por
   ciclo; a auditoria do dia seguinte a confirma, ajusta ou reverte.

A inferência é bayesiano-preditiva no sentido técnico:

\[
P(H\mid E) \propto P(E\mid H)P(H)
\]

O relatório deve expor hipótese $H$, evidência $E$, prior operacional,
evidência contrária e previsão. Probabilidades numéricas, Bayes factors ou
posteriores quantitativos são proibidos sem prior, modelo de verossimilhança e
base empírica declarados. Sem esses elementos, a conclusão deve ser
qualitativa e marcada como hipótese — nunca como fato.

### Portão de suficiência

**Revisado em 2026-09-02 por decisão do Tier 0: a unidade de contagem era o
dia, e passou a ser a sessão.**

*Sessão* vai do início ao fim de um trabalho; compactação de contexto não a
encerra, e ela pode atravessar a meia-noite.

Uma análise só pode **planejar** microcalibração quando houver pelo menos
**três sessões distintas com feedback** e duas confirmações independentes do
mesmo padrão operacional. Três feedbacks numa mesma sessão são dado retido e
reportado, mas não abrem o portão: uma origem só não é recorrência.

A contagem **acumula e não expira** — dia sem sessão é dia sem avaliação, não
dia que apaga evidência —, e só reinicia após uma calibração registrada.

Não contam para o limiar, falhando fechado: feedback sem `session_id`, sessão
com `session_started_at` divergente (sessão partida inflaria a contagem) e
cadeia de ledger inválida.

O script de evidência mede a contagem de sessões; o auditor precisa citar os
dois registros que satisfazem a recorrência. Qualquer condição faltando produz
exatamente o registro `dados insuficientes — nenhuma calibração planejada`.

O gatilho primário é o **aviso proativo** no instante em que o limiar é
atingido, se não houver tarefa em andamento. A corrida das **23:59** é lastro
de auditoria, não gatilho.

O administrador pode instruir uma análise ou experiência fora desse limiar,
mas a exceção deve ficar explícita no relatório. Uma microcalibração não pode
otimizar uma métrica isolada se houver previsão plausível de degradar outra
métrica, a tarefa principal, autonomia operacional ou integridade factual.
Não há modulação agressiva, alteração automática de modelo, ferramenta,
permissão ou limite.

## Relatório diário auditável

Cada relatório diário em `daily/` deve conter, nesta ordem: universo amostral
e integridade da cadeia; observações; hipóteses e contraprovas; previsão para o
dia seguinte; uma microcalibração proposta ou a declaração de insuficiência;
e a validação da hipótese anterior. Toda alegação factual aponta para evidência
local concreta; toda inferência declara seu limite.

## Suporte quantitativo disponível

`Invoke-AgentCalibrationQuantitativeSupport.ps1` disponibiliza dois motores já
presentes no ecossistema, estritamente como apoio à formulação de hipóteses:

```powershell
pwsh -NoProfile -File .\scripts\ops\Invoke-AgentCalibrationQuantitativeSupport.ps1 `
  -WasmMode monte-carlo-equity-wasm -HeroRange 'AA' -VillainRange 'KK' -WasmIterations 50000 -Seed 424242

pwsh -NoProfile -File .\scripts\ops\Invoke-AgentCalibrationQuantitativeSupport.ps1 `
  -CfrPureMode cfr-pure -CfrPot 10 -CfrStack 100 -CfrKappa 0.95 -CfrIterations 32
```

| Motor | Fonte canônica | Uso permitido | Limite inegociável |
|---|---|---|---|
| Monte Carlo puro | `wasm-equity/lib.rs::calculate_equity_monte_carlo_binary` | Equidade estocástica de ranges/board declarados, com seed auditável | Não é modelo de comportamento nem libera o portão de evidência. |
| CFR puro | `frontend/src/components/simulator/workers/cfr.worker.ts` | Matriz iterativa de Regret Matching sobre a abstração declarada | Não prova equilíbrio convergido nem estabelece a validade de uma calibração. |
| Monte Carlo ICM destilado | `frontend/src/lib/montecarlo.ts` | Fallback explícito para cenário ICM | Usa `Math.random` sem seed exposta; não equivale ao núcleo puro/WASM. |
| CFR unitário destilado | `engine/math_sota.py::cfr_mock_strategy` | Fallback explícito de normalização de regrets | É uma etapa, não o worker CFR iterativo. |

**CFR significa Counterfactual Regret Minimization.** Toda invocação precisa
anexar ao relatório os parâmetros, a fonte, o resultado, as limitações e o
vínculo entre os parâmetros e a evidência. Um resultado quantitativo jamais
vence o portão de suficiência ou converte inferência em fato.

## Outliers: retenção, filtro e análise posterior

Outlier não é descarte, ruído presumido nem entrada automática de padrão. O
registro `Record-AgentCalibrationOutlier.ps1` mantém cada evento em
`outlier-evidence-ledger.jsonl`, encadeado por SHA-256 e separado do ledger de
feedback e de qualquer índice futuro de padrões.

```powershell
pwsh -NoProfile -File .\scripts\ops\Record-AgentCalibrationOutlier.ps1 `
  -Observation 'latencia seletiva fora do envelope esperado' `
  -SourceRefsJson '["feedback:<uuid>","runtime:<correlation-id>"]' `
  -MetricsJson '{"latency_ms":2400,"baseline_ms":500}' `
  -OriginHypothesis 'possivel dependencia de fonte ou gatilho semantico'
```

| Etapa | Regra |
|---|---|
| Registro | Preservar observação, referências de origem, métricas, hipótese de origem e hash; `pattern_indexed` inicia sempre `false`. |
| Filtro Monte Carlo | Quando existir modelo de cenário e seed declarados, medir sensibilidade/envelope; saída pode classificar incerteza, jamais descartar o evento. |
| Filtro CFR | Quando existirem alternativas e regrets contrafactuais declarados, comparar políticas de preservar, observar, microajustar ou reverter; saída não promove nem elimina outlier. |
| Tratamento posterior | Reproduzir deterministicamente a origem, os parâmetros e contraprovas. Só então uma recorrência de origem específica pode receber registro **separado** no índice de padrões. |

Outlier de amostra baixa pode ser sinal de origem específica. Por isso,
frequência baixa não reduz sua preservação nem autoriza promoção. O relatório
diário lista a evidência de outlier em seção própria, fora da amostra que gera
padrões e fora do gate de calibração, até haver comprovação determinística.
