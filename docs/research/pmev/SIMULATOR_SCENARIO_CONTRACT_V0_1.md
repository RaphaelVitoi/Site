# Contrato de Cenários do Simulador PMev v0.1

## Regra de integração

Um cenário é uma unidade de entrada, modelo, proveniência e saída. A interface
não pode transformar uma hipótese, uma fixture ou uma observação em recomendação
universal apenas por meio de nomenclatura, gráficos ou precisão numérica.

\[
\text{Cenário reproduzível} =
(I, M, P, V, S, O)
\]

| Símbolo | Campo | Requisito mínimo |
| --- | --- | --- |
| \(I\) | Inputs | stacks, payouts, pot, contribuição e posições com unidade declarada |
| \(M\) | Modelo | algoritmo, parâmetros, hipótese e domínio de validade |
| \(P\) | Proveniência | fonte, versão, data e licença quando houver corpus externo |
| \(V\) | Validação | invariante, teste, baseline ou experimento que sustenta a saída |
| \(S\) | Estado | `derived_from_inputs`, `didactic_fixture` ou `review_required` |
| \(O\) | Saída | unidade, incerteza, limitações e vínculo com o cenário de origem |

## Estados epistemológicos

| Estado | Uso permitido | Vedação |
| --- | --- | --- |
| `derived_from_inputs` | baseline calculada diretamente a partir dos inputs declarados | inferir ação pós-flop sem ranges e árvore |
| `didactic_fixture` | comparar uma hipótese com parâmetros explícitos | apresentar frequência, exploit ou veredito como universal |
| `review_required` | inventário ou protótipo ainda incompleto | alimentar decisão, dashboard ou recomendação operacional |

`evidenceLevel` complementa o estado: observação descreve uma baseline; hipótese
expõe uma proposição ainda a testar; experimento reproduzível exige artefatos e
invariantes verificáveis. Nenhum desses rótulos equivale, sozinho, a validação
empírica externa.

## Contrato mínimo de entrada

```text
scenario_id
stacks[]                 # fichas ou bb; unidade única
payouts[]                # moeda única, sem misturar bounty/rake
positions                # herói, vilão e ordem relevante
pot / net_contribution   # mesma unidade de stacks quando aplicável
ranges / board / tree    # obrigatórios para recomendação pós-flop
model_version
solver_version
seed                     # obrigatório para saídas estocásticas
source_refs[]
```

Sem `ranges`, `board` e `tree`, o simulador pode produzir exploração didática,
mas não uma frequência estratégica certificada. Sem `model_version` e `seed`,
um resultado estocástico não é reprodutível.

## Contrato mínimo de saída

```text
scenario_id
input_status / evidence_level
metric_name / unit
value / interval_or_spread
model_version / source_refs[]
limitations[]
```

O `scenario_id` deve atravessar Master Simulator, painéis especializados,
gráficos e links didáticos. Um painel externo ao Master só pode reutilizar uma
saída se declarar qual contrato recebeu; caso contrário, é um laboratório local
e deve manter parâmetros próprios visíveis.

## Invariantes de segurança metodológica

1. `stacks` e `payouts` são não negativos; suas somas são positivas.
2. `PMev-0` recupera ICMev/Malmuth-Harville sob a configuração basal definida
   em `PMEV_SPEC_V0_1.md`.
3. Bounty, rake, habilidade, transição de blinds, crenças e opcionalidade são
   operadores explícitos; não podem aparecer implicitamente em uma métrica.
4. Um gráfico normalizado informa que é normalizado e não usa rótulo de EV.
5. Uma conclusão estratégica deve expor a condição que a invalida.

## Roteiro de evolução

1. Registrar fixtures existentes no manifest com a proveniência já disponível.
2. Converter uma fixture por vez em experimento: ranges + árvore + versão +
   seed + teste de invariantes.
3. Comparar contra baseline ICM e, quando aplicável, solver externo com licença
   e artefato de reprodução.
4. Só então elevar o estado para `reproducible_experiment`; validação empírica
   exige ainda corpus/estudo independente e protocolo público.
