---
id: pmev-aula-1-2-evidence-ledger-2026-09-01
tipo: registro_de_evidencia
escopo: Site
autor: "Raphael Vitoi; Codex [Tier 1.B]"
criado_em: 2026-09-01T04:25-03:00
classes: [interno, fonte_primaria]
caminhos:
  - frontend/src/components/simulator/solver/nashSolver.ts
  - frontend/src/components/simulator/solver/__tests__/nashSolver.test.ts
verificado:
  - arquivo DOCX lido diretamente -- 311 paragrafos, 97 figuras incorporadas e nenhuma tabela Word
  - integridade da fonte registrada por SHA-256
  - metadados do cenario e mapeamento textual de 97 nos de solver extraidos sem alterar o documento
nao_verificado:
  - OCR numerico completo de todas as capturas de solver
  - reproducao independente das arvores HRC/GTO Wizard
  - calibracao ou validade empirica global dos parametros do motor
---

# Aula 1.2 - Livro-razão de Evidência para Calibração PMev

## Identidade da fonte

| Campo | Valor |
| --- | --- |
| Autor e fonte primária | Raphael Vitoi, `C:\Users\rapha\Downloads\Aula 1.2.docx` |
| SHA-256 **da versão lida** | `7CA7C89F52C1A4173EE404F1BC4059CABD564FDDFB62129A6CD34789B86E4769` |
| SHA-256 **da versão vigente** | `B3FC15BA0B22AE2E15E38B5EA1AA59E1356B168D866BBA2A1516958A5C23F930` |
| Estrutura lida | 311 parágrafos, 97 figuras incorporadas, 0 tabelas Word |
| Estrutura vigente | 329 parágrafos, 97 inserções de figura sobre 84 arquivos |
| Natureza | Estudo próprio comparando pós-flop ChipEV (GTO Wizard) e ICMev (HRC Pós-Flop) |

O DOCX original permanece fora do repositório. Este registro conserva apenas
proveniência, metadados de cenário e limites de inferência; não replica as
capturas de solver nem declara uma reprodução independente.

### As duas linhas de SHA são duas perguntas, e não se fundem

**A de cima responde de qual documento os números foram lidos; a de baixo, qual
documento está em disco hoje.** O arquivo foi editado em 2026-09-02/03, depois
da transcrição, e por isso o SHA da versão lida não resolve mais contra nenhum
arquivo. Isso não invalida a transcrição: invalida a suposição de que um campo
só bastava.

Trocar a primeira linha pela segunda — a saída óbvia — declararia que as
catorze capturas foram relidas na versão vigente. Elas não foram. A verificação
deixou de ser prosa em 2026-09-18: `EvidenceReconference` e
`validateReconference`, em
`frontend/src/components/simulator/solver/evidenceContract.ts`, reprovam com
`RECONFERENCE_ANCHOR_UNSUPPORTED` qualquer âncora apontada para uma versão cujas
figuras a reconferência não alcançou. O lado Python falha fechado pelo mesmo
critério em `Reconference.ancora_sustentada`.

### Reconferência de 2026-09-18 — camadas `metadados` e `texto`

Substrato: `reports/curation/pmev-2026-09-09/text/S08.txt`, extração de texto do
DOCX vigente declarada na entrada `S08` de
`reports/curation/pmev-2026-09-09/sources.json`. O `text_sha256` declarado ali
bate dígito a dígito quando o arquivo é lido com CRLF; a divergência que aparece
com LF é normalização de fim de linha do checkout, não corrupção.

| Resultado | Medição |
| --- | --- |
| Rótulos de nó | **14 de 14** presentes literalmente, mesma redação e mesmo número |
| Grandezas de contexto declaradas em texto | **11 de 11** idênticas |
| Inserções de figura | 97 nas duas versões |
| Divergências | **2**, ambas de vizinhança de rótulo e nenhuma de valor |
| Figuras relidas | **nenhuma** |

As duas divergências, registradas em
`RECONFERENCIA_AULA_1_2.divergencias` e espelhadas em `data/aula12_pairs.json`:

1. **PAR_6** — a nota de ambiguidade nomeia só o nó 21 como legenda concorrente
   de `image45.png`; a versão vigente traz a mesma redação também no nó 17.
2. **PAR_7** — o número de nó `13` aparece duas vezes: na âncora ChipEV do par e
   de novo entre o nó 92 e as conclusões do ICMev, onde quase certamente é `93`
   com o dígito perdido.

**Nenhum valor transcrito foi reconferido.** Frequência, combo e sizing vivem nas
84 imagens, e a extração de texto tem `media: 0`. Também seguem fora de alcance a
ordem real de inserção das figuras, os parâmetros de árvore das figuras 01 a 04 e
o e-Nash — este último por propriedade da fonte, não por falta de busca.

Reancorar exige ler as capturas: quem tiver o DOCX em disco relê as catorze,
acrescenta `'figuras'` a `camadasAlcancadas`, e só então a reancoragem passa nos
dois validadores.

## Cenário-âncora identificado

| Dimensão | Evidência extraída literalmente |
| --- | --- |
| Formato | MTT Vanilla, buy-in US$11, field de 126 entradas, final table de 9 jogadores |
| Payouts da FT | 237,34; 170,96; 135,17; 109,99; 90,28; 73,95; 59,92; 47,56; 36,47 |
| Confronto | BTN abre min-raise, SB fold, BB call |
| Pressão | RP BTN 21,4%; RP BB 12,9%; diferença BTN menos BB = +8,5 p.p. |
| Estado pós-flop descrito | BTN 38 BB; BB 53 BB; pote 5,63 BB; board K-diamond, J-club, T-spade |
| Árvore | sizings declarados, leads de 25% em todas as streets, raise geométrico em SPR 2,5 e all-in habilitado a partir de SPR 5 |
| Comparação | mesmas ranges, linhas e sizings declarados para HRC e GTO Wizard, com nodelocks adicionais onde indicados |

Os payouts acima somam US$961,64, o que é consistente com a estrutura exibida,
mas não deve ser reinterpretado como prize pool global sem a confirmação do
arquivo-fonte ou da lobby structure.

## Cobertura observável

O documento encadeia 97 figuras de nós de solver. Há pares ChipEV/ICMev para,
entre outros: lead do BB, ação IP após check, XR contra c-bet, defesa IP contra
XR, barrels turn e river, sequências de check-call, leads, shoves e nodelocks.
Isso confirma que a fonte é material de comparação pós-flop multi-nó, e não
apenas uma tabela de RPs pré-flop.

As conclusões autorais registradas no documento são qualitativas: no cenário
observado, ICMev amplia checks e desloca parte das apostas grandes para sizings
menores. A fonte também marca ao menos um lead de 7% como potencial ruído que
requer solve mais profundo. Esse cuidado é preservado aqui.

## Uso permitido no motor atual

1. A âncora BTN 21,4% versus BB 12,9% pode sustentar testes de invariantes,
   direção de resposta e conservação de frequências em
   `nashSolver.ts`.
2. As frequências ChipEV e ICMev de cada nó só podem tornar-se alvos numéricos
   após transcrição verificável de cada captura, com identificador da figura,
   ação, sizing, street, range e configuração da árvore.
3. A diferença de RP de 8,5 p.p. é contexto causal do spot, não uma regra
   linear universal que determine sozinho frequência de bet, fold ou raise.
4. Este ledger não transforma resultados de HRC/GTO Wizard em validação de
   PMev, nem permite publicar coeficientes heurísticos como output de solver.

## Próxima unidade mínima de validação

Para cada par ChipEV/ICMev, criar um registro estruturado com:

- `source_sha256`, `figure_index`, `node_label`, `street`, `board`, `pot_bb`;
- stacks, payouts e RP de cada jogador relevante;
- frequência-base e frequência ICMev para cada ação/sizing;
- versão do solver, parâmetros da árvore e e-Nash quando disponível;
- tolerância declarada antes da comparação e regra de falsificação.

Somente depois de ao menos três pares independentes e reproduzíveis será
aceitável ajustar uma constante global do `solveIcmDistortion`. Antes disso,
as constantes existentes são uma heurística controlada com testes de
propriedade, não uma calibração empírica concluída.
