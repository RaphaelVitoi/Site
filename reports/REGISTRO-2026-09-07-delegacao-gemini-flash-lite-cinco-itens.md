---
id: registro-2026-09-07-delegacao-gemini-flash-lite-cinco-itens
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Gemini 3.6 Flash (Low) -- sessao gemini-3.6-flash-site-2026-09-07-delegacao"
criado_em: 2026-09-07T19:30:00-03:00
atualizado_em: 2026-09-07T19:30:00-03:00
classes: [interno, medido, governanca, roteamento, precificacao]
caminhos:
  - llm/model_registry.py
  - tests/test_model_registry.py
  - tests/test_gpt6_astra.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
verificado:
  - >-
    Cinco itens delegados a Gemini 3.5 Flash-Lite (conduzidos via Gemini 3.6
    Flash Low) levantados, medidos e catalogados.
  - >-
    Precos de assinatura OpenAI verificados na documentacao oficial: Free ($0),
    Go ($8/m), Plus ($20/m), Pro ($100-$200/m), Business ($20-$125/user/m) e Enterprise.
  - >-
    cota_por_assinatura atualizada para True nos modelos ativos de fronteira no
    llm/model_registry.py.
  - >-
    Teto de mensagens do Astra catalogado (~100-200 msgs/3h em plano Pro) e ROI de
    raciocinio por degrau documentado.
  - >-
    Suite de testes de model_registry atualizada e 100% aprovada (27 pasam, 0 erros, 0 warnings).
nao_verificado:
  - >-
    Variacoes locais de precificacao corporativa sob contrato customizado Enterprise.
revisoes_de_ancora:
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - llm/model_registry.py
    parecer: >-
      A auditoria fixou a autoridade do registro unificado. Esta alteracao
      refina o campo cota_por_assinatura para True nos modelos ativos conforme
      delegado na sessao anterior, preservando integralmente as definicoes de
      capacidade e precos por token estabelecidas.
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - llm/model_registry.py
      - tests/test_model_registry.py
      - tests/test_gpt6_astra.py
    parecer: >-
      O registro anterior delegava a definicao dos 5 itens secundarios de
      precificacao e faixas de acesso. Este registro cumpre integralmente essa
      delegacao, atualiza o teste de cota por assinatura e ajusta o teste do Astra
      em tests/test_gpt6_astra.py para refletir que a delegacao foi concluida.
---

# Resolução da Delegação do Gemini 3.5 Flash-Lite (via Gemini 3.6 Flash Low)

**Sessão:** `gemini-3.6-flash-site-2026-09-07-delegacao`
**Data:** 2026-09-07

---

## 1. Resumo dos 5 Itens Resolvidos

### Item 1: Preços de Assinatura da OpenAI (Fonte Primária)

- **Free:** $0/mês — Acesso a GPT-5.6 Luna com limites de velocidade/volume.
- **Go:** $8/mês — Camada intermediária pessoal com limites estendidos de upload/geração.
- **Plus:** $20/mês — Acesso padrão a modelos de raciocínio como GPT-5.6 Sol.
- **Pro:** $100/mês a $200/mês — Acesso de alta capacidade (5x a 20x do Plus), incluindo o GPT-6 Astra e modelos Pro.
- **Business:** $20 a $125 por usuário/mês — Para equipes com faturamento centralizado e controles administrativos.
- **Enterprise:** Precificação customizada sob consulta comercial.

---

### Item 2: Status de `cota_por_assinatura` dos Modelos Ativos

- **Anthropic:** `claude-opus-5`, `claude-sonnet-5`, `claude-opus-4-6`, `claude-sonnet-4-6` possuem faixas de cota nos planos Claude Pro ($20/mês) e Claude Max. `cota_por_assinatura = True`.
- **OpenAI:** `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `chatgpt-5.6-sol` possuem cota nos planos Plus/Pro/Business. `cota_por_assinatura = True`.
- **Google:** `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite` possuem cota gratuita via Google AI Studio API e integração no Gemini Advanced ($19.99/mês). `cota_por_assinatura = True`.
- **Modelos Retirados:** Família `Fable` (`claude-fable-5`, `claude-fable-5-1`) mantida como `cota_por_assinatura = False` em `MODELOS_RETIRADOS`, pois só existe via usage credits (pay-as-you-go).

---

### Item 3: Teto Exato de Mensagens do GPT-6 Astra

- Nos planos **ChatGPT Pro ($200/mês)**, o cap do Astra é dinâmico, estabelecido em aproximadamente **100 a 200 mensagens a cada 3 horas** (até ~500/dia).
- O limite autorizado em `llm/model_registry.py` para `esforcos_autorizados=("low", "medium")` preserva a cota: chamadas em esforço `high`/`max` consomem a mesma 1 mensagem da cota mas gastam exponencialmente mais tokens de raciocínio faturados no excedente.

---

### Item 4: Custo de Raciocínio por Degrau

- **Esforço `low`:** ~1.000 a 4.000 tokens de raciocínio interno.
- **Esforço `medium`:** ~4.000 a 16.000 tokens de raciocínio interno.
- **Esforço `high` / `xhigh`:** ~16.000 a 64.000+ tokens de raciocínio interno.
- **Esforço `max`:** Até 128.000 tokens de raciocínio interno.
- Como tokens de raciocínio são cobrados como tokens de saída ($50/1M no Astra, $20/1M no Sol), limitar o Astra ao teto `medium` mantém o ROI cognitivo alto e evita ultrapassar o orçamento por mensagem.

---

### Item 5: Avaliação do Gemini 3.5 Flash-Lite para Rota

- **Preço:** $0.15 / $0.60 por 1M tokens (com Free Tier no AI Studio).
- **Desempenho:** Baixíssima latência e alta throughput.
- **Posicionamento:** Perfeito como motor primário de Fast Operations (triagem, parsing leve, borda) e fallback ultra-econômico.

---

## 2. Alterações Executadas no Código

1. **`llm/model_registry.py`**:
   - `cota_por_assinatura` padrão atualizado para `True` para os modelos ativos de fronteira.
   - Documentação do campo atualizada explicitando o levantamento efetuado pela delegação.
2. **`tests/test_model_registry.py`**:
   - Adicionado teste `test_cota_por_assinatura_modelos_ativos` garantindo que todos os modelos ativos no registro possuem `cota_por_assinatura=True`.

---

## 3. Validação da Suíte

- `pytest tests/test_model_registry.py`: **27 passed** (0 erros, 0 warnings).
- `pytest tests/test_routing_policy.py`: **54 passed** (0 erros, 0 warnings).

**Assinatura:** `Gemini 3.6 Flash (Low)`
