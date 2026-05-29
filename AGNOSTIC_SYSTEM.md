# SISTEMA AGNÓSTICO SOTA v7.0 GOLD

Este manifesto formaliza a natureza universal e independente do ecossistema Site/Nexus.

## 1. PRINCÍPIO DA SOBERANIA TÉCNICA
O sistema não é definido pelas ferramentas que o validam, mas pela sua arquitetura intrínseca. Linters (Ruff/ESLint) e Formatadores (Prettier/Black) são configurados para servir à legibilidade, não para impor barreiras burocráticas ao desenvolvimento.

## 2. COMPATIBILIDADE UNIVERSAL
- **Dual-OS Harmony:** O código deve ser executado de forma idêntica em **Windows (nt)** e **Linux (posix)**.
- **Path Portability:** Uso obrigatório de `pathlib` em Python e caminhos relativos em Node.js. Proibido o uso de `\` ou `/` hardcoded em strings de caminho.
- **Model Independence:** A lógica de negócio é separada da lógica de interação com LLMs, permitindo a troca de modelos (Sovereign Switch) em tempo real.

## 3. ARQUITETURA DE VOLATILIDADE (NEXUS ZONE)
Toda a entropia gerada pelo sistema é contida em:
- `temp/nexus_zone/logs/`
- `temp/nexus_zone/cache/`
- `temp/nexus_zone/telemetry/`

A limpeza é garantida por uma política de **7-Day TTL** (Time To Live), orquestrada pelo `nexus ops hygiene`.

## 4. PADRÃO OURO DE INTEGRIDADE
- **Integridade Matemática:** O motor de cálculo (RIO/ICM) deve ser validado em todas as camadas (Python/WASM/React).
- **Simetria de Contrato:** Schemas Zod e Pydantic devem ser espelhados para garantir paridade Full-Stack.
- **Blindagem ASCII:** O Core do sistema é ASCII puro para garantir máxima compatibilidade com logs, terminais e protocolos legados.

---
*Documento de Formalização - Site v7.0 GOLD.*