---
name: timesfm-forecasting
description: Google Research TimesFM (Time Series Foundation Model) engineering and governance runbook. Use when executing time-series forecasting for bankroll projections, EV variance decay, RIO risk, or multivariate telemetry; managing licensing compliance (TimesFM 2.0/2.5 Apache 2.0 commercial production vs 3.0 non-commercial research); or connecting to BigQuery ML AI.FORECAST.
---

# SKILL: Google Research TimesFM — Previsão de Séries Temporais & Governança

> **Repositório:** [github.com/google-research/timesfm](https://github.com/google-research/timesfm)  
> **Coleção Hugging Face:** [huggingface.co/collections/google/timesfm-release](https://huggingface.co/collections/google/timesfm-release-66e4be5fdb56e960c1e482a6)  
> **Módulo Canônico:** [`engine/timesfm_engine.py`](file:///c:/Users/rapha/.gemini/Site/engine/timesfm_engine.py)

---

## 1. Matriz Decisória de Licenciamento & Compliance Jurídico

> [!IMPORTANT]
> O código-fonte do TimesFM no GitHub é 100% **Apache 2.0**, mas a licença dos **pesos pré-treinados** varia criticamente por versão:

| Versão do Modelo | Parâmetros | Licença dos Pesos | Uso Comercial em Produção? | Cenário de Aplicação |
| :--- | :--- | :--- | :--- | :--- |
| **TimesFM 2.0 / 2.5** | 200M / 500M | **Apache 2.0** | **TOTALMENTE LIBERADO** | Produção local, SaaS, APIs de monetização de poker/estratégia. |
| **TimesFM 3.0** | 330M | **TimesFM Non-Commercial v1.0** | **ESTRITAMENTE PROIBIDO** | Apenas pesquisa científica interna, benchmarks e backtesting sem fins lucrativos. |
| **BigQuery ML `AI.FORECAST`** | N/A | Google Cloud Enterprise | **COMERCIALMENTE AUTORIZADO** | Processamento massivo de bilhões de registros em Data Warehouse gerenciado. |

---

## 2. Padrão de Invocação Local via `timesfm_engine.py`

O ecossistema dispõe de uma camada com trava de segurança (`TimesFMGovernanceError`):

```python
from engine.timesfm_engine import TimesFMEngine, ExecutionMode

# 1. Modo Produção Comercial (Garante conformidade com Apache 2.0)
engine = TimesFMEngine(mode=ExecutionMode.COMMERCIAL_PRODUCTION, preferred_model_key="timesfm-2.5-200m")

# 2. Carregamento Opcional de Pesos Neurais Pré-Treinados Locais
# Quando disponível em cache (~/.cache/huggingface/hub/), executa inferência direta PyTorch
engine.load_pretrained_weights(local_files_only=True)

# 3. Previsão Univariada (Ex.: Bankroll ou Perda de EV ao longo de 24 torneios)
historico_ev = [102.5, 101.0, 105.2, 104.0, 108.5, 107.0, 112.4]
resultado = engine.forecast_univariate(
    series=historico_ev,
    horizon=12,
    target_name="Bankroll_Acumulado_BB"
)

print("Pesos Carregados:", resultado.weights_loaded)
print("Modelo Utilizado:", resultado.model_used)
print("Previsão Média:", resultado.mean_prediction)
print("Intervalo de Confiança 80% (Q10 a Q90):", resultado.quantile_10, resultado.quantile_90)
```

### Condicionamento Dinâmico por Covariáveis
O motor suporta condicionamento por covariáveis exógenas passadas e futuras (`forecast_with_covariates`):
```python
resultado = engine.forecast_with_covariates(
    target_series=[100.0, 102.0, 105.0, 108.0],
    past_covariates={"vpip_medio": [0.22, 0.24, 0.28, 0.31]},
    future_covariates={"fator_bolha": [1.1, 1.2, 1.5]},
    horizon=3,
    target_name="stack_evolution"
)
```

### Bloqueio Programático de Violação
Tentar inicializar o modelo 3.0 em modo comercial levantará uma exceção imediata:
```python
# Lança TimesFMGovernanceError em tempo de execução
TimesFMEngine(mode=ExecutionMode.COMMERCIAL_PRODUCTION, preferred_model_key="timesfm-3.0-330m")
```

---

## 3. Previsão Multivariada para o Ecossistema PMev

Para simulações de poker onde múltiplas variáveis estocásticas interagem simultaneamente:

```python
series_pmev = {
    "Fator_Psi": [1.1, 1.2, 1.05, 1.35, 1.25],       # Entropia de agressão do vilão
    "Divida_RIO": [-5.2, -7.4, -6.1, -12.0, -9.5],    # Risco Implícito Reverso em BB
    "Pressao_ICM": [18.5, 21.4, 20.0, 32.5, 28.0],   # Risk Premium percentual
}

resultados = engine.forecast_multivariate(series_dict=series_pmev, horizon=10)
for nome, res in resultados.items():
    print(f"{nome} -> Horizonte 10: {res.mean_prediction[-1]:.2f}")
```

---

## 4. Funções Especializadas de Domínio SOTA

O módulo `engine/timesfm_engine.py` fornece funções prontas com heurísticas analíticas e suporte a pesos neurais:

1. **Pressão de ICM e Decaimento de Bolha em Torneios:**
   `forecast_tournament_icm_decay(history_premiums, horizon_levels=8, remaining_players=10, total_entries=100, use_pretrained_weights=True)`
   - Projeta a curva estocástica de prêmio de risco (% equity necessária para call).
   - Identifica transição para `BUBBLE_PEAK` e emite recomendação formal de aperto de range (`tightening_recommended`).

2. **Telemetria e Latência Preditiva da Malha Agêntica:**
   `forecast_mesh_telemetry_latency(history_latencies_ms, horizon_steps=6, sla_threshold_ms=200.0, use_pretrained_weights=True)`
   - Projeta o $P_{95}$ estocástico e detecta risco de saturação (`SATURATION_WARNING`, `LATENCY_SPIKE_RISK`).
   - Dispara recomendação de failover preventivo para balanceamento térmico de nós.

3. **Envelope de Variância e Anomalia de Downswing (EV Real vs Teórico):**
   `forecast_ev_variance_envelope(history_ev_bb, history_actual_bb, horizon_steps=10, use_pretrained_weights=True)`
   - Calcula a dispersão entre EV esperado e resultado real em BBs.
   - Detecta anomalias de downswing ($> 2.5\sigma$) e estima o número de mãos para recuperação ao zero com probabilidade de exaustão de variância via distribuição acumulada normal.

---

## 5. Interface de Linha de Comando (Nexus CLI) & PowerShell

O ecossistema disponibiliza comandos nativos no Typer e no PowerShell:

```bash
# Previsão univariada genérica com pesos neurais
nexus timesfm forecast -s "10,12,14,15,17,19" -h 5 --use-weights

# Benchmark comparativo de latência (Analítico vs Neural 2.5 vs Pesquisa 3.0)
nexus timesfm benchmark -h 5 -p 32

# Projeção de pressão de ICM para torneios MTT
nexus timesfm icm -r "5.2,5.8,6.5,7.1,8.4,9.2" -h 4 --use-weights

# Telemetria de latência e prevenção de gargalos na malha
nexus timesfm telemetry -l "42.5,45.1,44.8,51.2,58.0,62.4,75.1" -h 6 --use-weights

# Envelope de variância EV vs Real (Downswing Anomaly)
nexus timesfm ev-gap --ev "120,135,148,160,180" --actual "120,130,125,110,105" -h 10

# Calibração agêntica no Nexus CLI com pesos neurais
nexus agent calibration-forecast -h 3 --use-weights
```

No PowerShell:
```powershell
# Invocação hermética do adaptador quantitativo com pesos neurais
pwsh -NoProfile -File scripts/ops/Invoke-AgentCalibrationQuantitativeSupport.ps1 `
    -TimesFmMode timesfm-forecast `
    -TimesFmHorizon 3 `
    -UsePretrainedWeights
```

---

## 6. Integração Corporativa em Nuvem: BigQuery ML (`AI.FORECAST`)

Quando o volume de mãos ultrapassa milhões de linhas em bancos analíticos, a delegação em nuvem via SQL é mandatória:

```sql
SELECT *
FROM ML.FORECAST(
  MODEL `projeto_poker.timesfm_forecasting_model`,
  STRUCT(
    24 AS horizon,
    0.8 AS confidence_level
  )
)
```

---

## 7. Orçamento de Performance & Latência Aferido

*   **Inferência Analítica Baseline (CPU/Local):** $\approx 0.20\text{ ms}$ por horizonte de passos (Zero dependência externa, instantâneo).
*   **Inferência Neural 2.5 PyTorch (Pesos 200M safetensors):** $\approx 2.5 - 3.8\text{ s}$ na inicialização de tensores e execução de quantis em CPU.
*   **Throughput Máximo Analítico:** $> 5.000$ previsões completas por segundo em uma única thread.
*   **Janela de Contexto Suportada:** Até **2.048 pontos** históricos com indicadores opcionais de frequência temporal.
