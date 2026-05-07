# PLANO DE IMPLEMENTAÇÃO: Topologic Aggression 2.0 (Fase II)

## Objetivo
Integrar o conceito de **Gravidade do Pote** e **Compressão Topológica 2.0** no motor WASM (Rust) e Hooks, simulando a inércia estratégica que o tamanho do pote impõe sobre as streets (Flop, Turn, River).

## Arquivos Afetados
- `wasm-equity/lib.rs`: Implementação do núcleo matemático v2.0.
- `frontend/src/components/simulator/workers/insolvency.worker.ts`: Atualização da esteira de dados.
- `frontend/src/components/simulator/hooks/useQuantumEngine.ts`: Injeção de dados de gravidade.
- `frontend/src/tests/simulator/mathematical-integrity.test.ts`: Novos testes de regressão para agressão.

## Etapas de Implementação

### 1. Núcleo Rust (WASM)
- Criar `solve_icm_distortion_v2` em `lib.rs`.
- Parâmetros: `ip_rp`, `oop_rp`, `topologic_aggression` (base), `active_players`, `pot_size`, `street_idx`.
- Lógica de **Gravidade**: `gravity = (pot_size / 7.5).ln().max(0.0)`.
- Lógica de **Damping**: Reduzir a sensibilidade da agressão conforme a gravidade aumenta (o pote "ancora" o range).
- **Downward Drift**: Aplicar um shift negativo automático no `raise` conforme o RP cresce e a gravidade aumenta.

### 2. Web Worker
- Atualizar a interface `DistortionJobPayload` para incluir `pots: [number, number, number]`.
- Mapear os chamados individuais de street para a nova função Rust.

### 3. Quantum Engine Hook
- Extrair o `potSize` dinâmico para cada street.
- Passar os tamanhos de pote para a esteira do Worker.
- Sincronizar o fator de agressão topológica com a "Inércia do Pote".

### 4. Validação
- Testar se, no River com pote grande, o `raise_shift` é menor do que no Flop (mantendo RP e Aggression constantes).
- Validar se o "Teto do RP" atua como limitador de fold mesmo sob agressividade extrema.

## Cronograma Sugerido
- **Passo 1**: Refatoração do `lib.rs` (Blindagem Matemática).
- **Passo 2**: Atualização do Worker e Hook (Integração de Dados).
- **Passo 3**: Verificação e Ajuste fino de constantes (Calibração SOTA).
