# Hybrid Edge/Cloud LLM Router SOTA (v2.0)

> Microserviço inteligente de alto desempenho para roteamento dinâmico entre **llama.cpp (Vulkan Edge)** e **Google Gemini 3.7 Flash (Cloud)** sob o Protocolo Chico SOTA v8.0 GOLD.

---

## 1. Visão Geral da Arquitetura

O sistema implementa uma camada de triagem semântica estática e de tokenometria que analisa prompts em tempo de submilisegundo e decide o destino de execução:

1. **Local Llama.cpp (Vulkan):** Requisições de baixa/média densidade sintática dentro do teto de tokens local (< 2048 tokens), sem dependência de schemas JSON estritos ou ferramentas externas.
2. **Gemini 3.7 Flash (Standard):** Requisições com Tool Calling, decodificação gramatical de JSON Schema estrito (`response_schema`), ou volume de tokens superior à capacidade local.
3. **Gemini 3.7 Flash (Extended Thinking):** Requisições de alta complexidade analítica (Teoria dos Jogos PMev, matrizes de payoff, equações diferenciais, otimização combinatória, refatorações profundas). Aloca de 4.096 a 16.384 tokens de pensamento em tempo de inferência.

---

## 2. Estrutura do Pacote

```
C:\Users\rapha\.gemini\tools\hybrid_router\
├── __init__.py               # Metadados do pacote
├── app.py                    # Microserviço FastAPI com Google GenAI aio
├── benchmark.py              # Runner assíncrono de concorrência e carga
├── plot_benchmark.py         # Motor gráfico estatístico (CDF + KDE/PDF)
├── test_hybrid_router.py     # Suite de testes unitários determinísticos
├── run_pipeline.ps1          # Orquestrador unificado para PowerShell 7+
├── run_pipeline.sh           # Orquestrador unificado para Linux/macOS/WSL
├── Dockerfile.llama-vulkan   # Build multi-stage do llama.cpp com Vulkan
├── Dockerfile.api            # Imagem de produção do FastAPI + Matplotlib
├── compose.yaml              # Orquestração de serviços com healthchecks
├── requirements.txt          # Dependências Python estritas
├── .env                      # Configuração persistente do ambiente
├── .env.example              # Template de configuração de ambiente
└── README.md                 # Documentação técnica e guia operacional
```

---

## 3. Guia Rápido de Execução

### Opção A: Execução Nativa no Windows (PowerShell 7+)

Graças ao arquivo de configuração persistente [`.env`](file:///C:/Users/rapha/.gemini/tools/hybrid_router/.env), não é necessário passar flags manuais:

```powershell
# Execução direta do pipeline (Servidor + Benchmark + Abertura Automática na Tela)
& "$HOME\.gemini\tools\hybrid_router\run_pipeline.ps1"
```

### Opção B: Replotar o Dashboard Imediatamente

```powershell
& "C:\Users\rapha\.gemini\.venv\Scripts\python.exe" "C:\Users\rapha\.gemini\tools\hybrid_router\plot_benchmark.py"
```

---

## 4. Endpoints REST da API

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/health` | Diagnóstico de prontidão do daemon local e da API Gemini. |
| `POST` | `/v1/router/analyze` | *Dry-run* sem custo de inferência, retornando métricas e rota recomendada. |
| `POST` | `/v1/chat/generate` | Execução completa com failover automático local $\to$ nuvem. |
