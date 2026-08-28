---
id: retrospectiva-2026-08-28-sessao
tipo: relatorio
escopo: multiprojeto
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-28T09:05-03:00
commit: 48b15e0e
classes: [interno, medido]
config_medida:
  raiz: C:/Users/rapha/.gemini
  branch: master
  suite_no_inicio: 415 passed
  suite_no_fim: 508 passed na arvore viva; 504 passed e 4 skipped na isolada
  commits_da_sessao: 21
  arquivos_tocados: 63
  linhas: 20145 insercoes e 303 remocoes
  data: 2026-08-27 a 2026-08-28
verificado:
  - contagens deste registro derivadas do git, nao citadas de memoria
  - suite completa executada nas DUAS arvores antes de cada commit da sessao
  - 24 mutacoes ao longo da sessao, as 13 ultimas com baseline explicita e
    contagem de coletados conferida
  - os dois portoes executados antes de cada commit; tres reprovaram e as tres
    causas foram corrigidas, nunca contornadas
nao_verificado:
  - nenhuma chamada real a provedor de LLM foi feita em nenhum momento
  - nenhum servidor MCP, skill ou proxy de inferencia foi levantado
  - o Gemini CLI nao foi executado
  - liveness de credencial nao foi testada; forma e o que se mede
supersede: null
---

# RETROSPECTIVA — sessão de 2026-08-27/28

## 1. O ANTES

O repositório estava **verde e errado ao mesmo tempo**, e essa é a frase mais
exata que se pode dizer sobre o ponto de partida.

| Dimensão | Estado em 27/08 |
| :--- | :--- |
| Suíte | 415 passed, verde |
| Portão de commit | existia, aprovava |
| Critérios da §13.F efetivamente ativos | **3 de 7** (medido depois) |
| `RECORD_INDEX` da §13.C | declarado no manual desde a v8.0, **nunca existiu** |
| Registros com frontmatter que um parser lê | **4 de 10** |
| Canônico de cada família de governança | não declarado em lugar nenhum |
| Motor de RAG declarado no código | LanceDB — que **não está instalado** |

Nada disso aparecia como erro. Tudo aparecia como sucesso.

## 2. O PROCESSO

### 2.1 Interlúdio de 27/08 — o que outra sessão tinha deixado

Começou como avaliação de mudanças não commitadas. Respondeu negativamente à
pergunta que importava — nenhum teste pressupunha chamada real a provedor — e
achou seis defeitos de caminho, entre eles um rótulo que dizia
*"Context Window / KV Cache Alocado"* enquanto movia o teto de **saída**.

### 2.2 Auditoria do dashboard — procurar o habilitador

O vértice apontou comandos vazios devolvendo output gracioso. Em vez de
catalogar instâncias, procurei o **habilitador**: no despacho legado do
`cli/commands.py`, o ramo final imprimia e retornava com `EXIT=0`. Enquanto ele
existisse, `check=True` era decorativo em todo o `nexus.py`.

### 2.3 Frente 1 — o canônico de cada família

70 ocorrências dos 5 basenames remedidas. A regra de nomeação **não podia** ser
a proibição simples: quebraria a convenção de runtime e as extensões.

### 2.4 Frente 2 — o índice que nunca existiu

Medi o portão antes de escrever: **3 de 7 sondas bloqueavam**. E a medição
trouxe de graça o achado maior — seis dos dez registros com frontmatter não eram
YAML válido, e o portão aprovava todos porque confere campo por regex.

### 2.5 Frente 5 — referência viva

A varredura ingênua deu 1511 referências mortas. Dois estreitamentos medidos
levaram a 46, depois a 3 — todas minhas, daquela semana.

### 2.6 Interlúdio de 28/08 — concorrência

Outra sessão trabalhava no mesmo repositório. Três defeitos, e o terceiro sem
cura por disciplina: as sondas dos portões encenam violações no índice de
verdade. A saída foi dar a cada execução o seu próprio índice.

### 2.7 Verificação do P0

Na forma enunciada — credencial como argumento de MCP — **não reproduz**. A
exposição real são quatro chaves OpenRouter em um `.env` não rastreado,
gitignored, e que não vaza para a árvore isolada.

## 3. STATUS ATUAL

```
master 48b15e0e
árvore viva     508 passed
árvore isolada  504 passed + 4 skipped   (os skips declaram o que não podem verificar)
21 commits · 63 arquivos · +20.145 / −303
```

| Entregue | Onde |
| :--- | :--- |
| Índice canônico das 5 famílias e a regra de nomeação | `data/INDICE_CANONICO_GOVERNANCA.json` |
| Índice ancorado derivado, mais `nexus index` | `scripts/ops/record_index.py` |
| Portão que lê o documento inteiro | `scripts/ops/record_gate.py` |
| Suíte em worktree isolado, multiprojeto | `scripts/ops/suite_isolada.py` |
| Fonte única de padrões de credencial | `data/PADROES_DE_CREDENCIAL.json` |
| Critérios da §13.F ativos | **3 de 7 → 7 de 8** |

## 4. OS DESAFIOS

**O primeiro foi epistêmico, não técnico.** Quase todo defeito desta sessão era
invisível por construção: o mecanismo dizia sucesso. Não havia como *procurar
bugs* — foi preciso, a cada afirmação de sucesso, perguntar **o que ela leu para
concluir isso**.

**O segundo foi o ruído.** Todo detector novo nasceu com falsos positivos em
excesso — 1511 num caso. A tentação é afrouxar o detector ou isentar arquivos; as
duas produzem portão desligado ou ponto cego. O caminho foi sempre **estreitar
por estrutura e medir o que sobra**.

**O terceiro fui eu.** Onze vezes um detector meu reprovou a prosa que o
documenta. Três vezes o arnês de verificação mentiu antes do código. Duas vezes
minha própria correção estava errada na primeira tentativa.

**O quarto foi a concorrência**, que não estava no plano de ninguém.

## 5. PADRÕES QUE SE ACUMULARAM — calibração bayesiana

> O ponto desta seção não é listar erros. É **mover priores**: depois de N
> ocorrências do mesmo padrão, a probabilidade a priori de encontrá-lo de novo
> deixa de ser baixa, e o custo de checar deixa de ser justificável como
> opcional.

### 5.1 Sinal verde desconectado — 15 instâncias, 4 variantes

O padrão dominante desta base: um mecanismo reporta sucesso sem estar ligado ao
que deveria medir.

| Variante | Como se manifesta | Custo de detectar |
| :--- | :--- | :--- |
| **Literal no lugar de medição** | valor fixo comparado a limite | baixo |
| **Nome errado para grandeza real** | o botão funciona, só não faz o que o rótulo diz | médio — exige rastrear até o campo do protocolo |
| **Habilitador estrutural** | um ponto converte falha em sucesso para toda uma camada | baixo, se procurado |
| **Limpo por instrução** | configuração silencia o reporte | baixo |
| **Dado presente e ilegível** | o campo existe e nenhum parser o lê | baixo |

**Prior novo: afirmação de sucesso nesta base é suspeita por padrão.** Não
*ocasionalmente errada* — suspeita, até que se rastreie a origem do valor.

### 5.2 Detector reprova a prosa que o documenta — 11 vezes

Sem exceção, em todo detector textual escrito nesta sessão.

**Prior novo: ao escrever um detector de texto, a documentação dele será
reprovada.** Escrever a prosa no mesmo commit e rodar deixou de ser zelo e
passou a ser parte do procedimento.

A escada de respostas, em ordem de preferência:

1. estreitar por forma — linha de comentário, bloco de matemática, docstring;
2. rastrear **estado de bloco**, quando linha não basta;
3. quando a forma **não separa** — um caminho citado para apontar e o mesmo
   caminho citado para dizer *"isto sumiu"* são idênticos — **declarar a exceção
   por item**, no frontmatter, visível na revisão;
4. **nunca** isentar o arquivo.

### 5.3 O arnês mente igual ao código — 3 vezes

O verificador é um mecanismo, e o padrão 5.1 se aplica a ele recursivamente.
`returncode != 0` incluiu *nenhum teste coletado*; depois *bloqueou por outro
motivo*; depois *renomear chave não é removê-la*.

**Prior novo: medição de detector exige baseline explícita, contagem de
coletados, e conferência da MENSAGEM** — não só do código de saída.

### 5.4 Duas cópias da mesma coisa divergem — 5 instâncias

Homônimo de manual, dois objetos de módulo para um arquivo, veredito calculado
em duas expressões, padrões de credencial em dois lugares, chave YAML duplicada
por duas sessões.

**Prior novo: onde houver duas fontes para um fato, elas já divergem ou vão
divergir.** A correção não é sincronizar — é **eliminar a segunda**.

### 5.5 Nome não é natureza — 3 instâncias

`cmp` e `mtime` chamaram submódulo de fork. O nome do diretório foi tratado como
nome do projeto. Nome de componente afirmava um motor de RAG com outro
instalado.

**Prior novo: perguntar "o que isto é?" antes de "são diferentes?"** — e nome
canônico é dado declarado, nunca acidente do sistema de arquivos.

### 5.6 Verificação local não prova portabilidade

Três testes passavam aqui e falhavam em árvore limpa. Nenhuma execução local
acharia — local está tudo montado.

**Prior novo: "a suíte está verde" só vale depois de rodar isolada.**

## 6. O QUE APRENDEMOS

**Medir antes de agir não é cautela — é o que muda a resposta.** Em cada frente
a medição contradisse o que estava escrito: *dois dos quatro critérios* eram
quatro de seis; *30 de 35 declaradas por manifesto* eram 26; 1511 referências
mortas eram 3.

**Portão bom é portão que sobrevive.** Todo portão desta sessão opera sobre o que
está em stage, nunca sobre a dívida preexistente. Portão que reprova o que já
estava lá é desligado na primeira semana — e portão desligado protege zero.

**Quando a inferência não decide, o autor declara.** Âncora interna, referência
não resolvível, nome canônico do projeto: em todos, a alternativa era heurística
invisível. Declaração cresce por adoção, entra com raio de explosão zero, e o
revisor a vê.

**Verificar o que está ao alcance, declarar o resto.** É o `nao_verificado` do
frontmatter aplicado a tudo. Verificação não executada não é reprovada nem
aprovada — é **declarada**.

**Recusar-se a afrouxar é parte do trabalho.** Duas vezes a saída fácil era
ampliar a exceção de um detector de segurança para me desbloquear. Item de plano
não é autoridade para afrouxar invariante de segurança: o item cede, e a colisão
se registra.

## 7. Declaração (governança §5)

Rodaram: as contagens deste registro derivadas do git; a suíte completa nas duas
árvores antes de cada commit; 24 mutações, as 13 últimas com baseline explícita;
os dois portões antes de cada commit, com três reprovações corrigidas na causa.

Não rodaram: nenhuma chamada real a provedor de LLM; nenhum servidor MCP, skill
ou proxy; o Gemini CLI; nenhum teste de liveness de credencial.
