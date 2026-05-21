# CONCEPT: Ingestão de Dados Massivos (Hand2Note Parser para ICM)
> **Origem:** Visão Sentinela (@maverick)
> **Alvo Futuro:** `src/lib/icmEngine.ts` e `src/components/ICMCalculator.tsx`

## 1. A Tese (Antevisão e Redução de Atrito)
Atualmente, o usuário precisa digitar manualmente os stacks de 3 a 9 jogadores na Calculadora ICM. Isso gera atrito cognitivo e erro humano. Para alcançarmos o "Estado da Arte", a ferramenta deve ser capaz de engolir a entropia bruta (um texto copiado direto do tracker, como Hand2Note ou PokerTracker) e extrair os dados organizados instantaneamente.

## 2. Estrutura Proposta (O Motor de Parsing)
Devemos criar um novo arquivo `src/lib/handParser.ts` contendo expressões regulares (Regex) de alta performance.

**O Fluxo de Processamento:**
1. O usuário cola o bloco de texto bruto em um `<textarea>` expansível na interface.
2. O `handParser` identifica a plataforma (Hand2Note, PokerStars, GG Poker) pela assinatura do cabeçalho.
3. A heurística varre as linhas capturando nomes e valores:
   *Exemplo Regex (PokerStars/H2N):* `Seat \d+: (.*?) \((\d+) in chips\)`
4. O array resultante `[{ name: "Villain", stack: 15000 }, ...]` é injetado no estado do `ICMCalculator.tsx`.

## 3. Impacto na Arquitetura (HRP)
- **Isolamento:** O parser não deve poluir o `icmEngine.ts` (que é puramente matemático). Ele atuará como um "Tradutor" entre a UI e o Motor.
- **Gamificação Elegante:** Quando o texto for colado, a UI deve exibir um efeito de "decodificação" (glitch text sutil) antes de preencher os inputs de stacks, recompensando o usuário com feedback visual imersivo.

## 4. Próximos Passos Recomendados
1. Coletar amostras de Hand Histories de torneios (formato txt) das 3 principais plataformas.
2. Criar testes unitários rígidos (`handParser.test.ts`) para garantir que blinds, antes e bounties não sejam confundidos com as stacks iniciais da mão.