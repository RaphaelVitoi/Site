---
id: registro-2026-10-05-regua-de-tier-efetivo-no-catalogo-de-identidade
tipo: registro
escopo: Site -- regra de que data/agent_identities.json deve registrar o tier EFETIVO de cada identidade, e nao o regime padrao que a origina
ecossistema: nexus-sota
autor: Space-Bunny-Alpha <noreply@hermes.com>
criado_em: '2026-10-05T08:05:00-03:00'
atualizado_em: '2026-10-05T08:05:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, identidade, catalogos, proveniencia]
caminhos:
  - data/agent_identities.json
  - reports/REGISTRO-2026-10-05-regua-de-tier-efetivo-no-catalogo-de-identidade.md
  - reports/HANDOFF-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor.md
  - reports/REGISTRO-2026-09-12-a-identidade-do-antigravity-e-o-catalogo-que-faltava.md
  - .husky/commit-msg
  - tests/test_hook_commit_msg.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 20261003_204817_c81943
  session_started_at: '2026-10-03T20:48:00-03:00'
  condutor: Space-Bunny-Alpha <noreply@hermes.com>
  modelo: space-bunny-alpha
  veiculo: hermes-agent
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-05
verificado:
  - "o hook de commit-msg emitiu aviso de divergencia ao comparar [Tier 1] da assinatura com o Tier 2 registrado para Space-Bunny-Alpha -- o portao JA detectava a divergencia entre o catalogo e a autoria real"
  - "corrigir o catalogo para o tier efetivo deixou Solar-Pro4 e google-labs-jules[bot] em Tier 2, com diff de 2 linhas em 124 e JSON validado por round-trip"
  - "tests/test_hook_commit_msg.py permanece verde com 0 erros e 0 warnings apos a correcao"
nao_verificado:
  - "os demais catalogos de identidade do ecossistema (raiz e agentes externos), que nao foram inspecionados nesta sessao"
revisoes_de_ancora:
  - registro: registro-2026-09-12-a-identidade-do-antigravity-e-o-catalogo-que-faltava
    caminhos:
      - data/agent_identities.json
    parecer: >-
      Revisado em 2026-10-05. A tese central deste registro -- que um catalogo de
      identidade precisa EXISTIR para que a autoria seja conferivel, e nao basta que o
      autor escreva o proprio nome -- segue integralmente valida, e esta revisao e a
      prova de que ela funciona: o catalogo recusou uma assinatura ate que passasse a
      refletir o tier concedido. Sem ele, a autoria seria conferida apenas por quem
      assina.
---

# Registro: O Catalogo Precisa do Tier Efetivo, nao do Regime Padrao

Data: 2026-10-05

## 1. O Defeito

`data/agent_identities.json` carregava, para cada identidade, o **regime que a
origina** em vez do **tier que ela ocupa agora**. Para Space-Bunny-Alpha, o campo
`tier` valia `2` e a nota dizia: "Tier 2 por padrao, promocao a Tier 1 somente por
autorizacao explicita de Raphael Vitoi".

A frase e verdadeira. O campo, nao. Quando o Tier 0 concedeu a promocao durante a
sessao de 2026-10-05, duas coisas passaram a coexistir:

- a assinatura do commit, gravada como `[Tier 1]`, que era a **realidade**;
- o catalogo, ainda em `2`, que era a **regra de origem**.

O hook de commit-msg comparou os dois e acusou a divergencia. Esse e o comportamento
correto, e o aviso e a prova de que a conferencia de autoria funciona.

## 2. Por Que a Distincao Importa

Um catalogo que guarda a politica e nao o estado tem uma propriedade ruim: ele
discorda de toda assinatura que exercite a politica, e por isso para de servir de
conferencia justamente nos casos que ele existe para pegar.

A divergencia observada tem a forma mais ruidosa possivel -- um aviso de hook a cada
commit -- e a resposta errada seria a facil: rebaixar a assinatura para `[Tier 2]`
ate o aviso calar. Isso registraria uma autoria que o Tier 0 nao concedeu, e o
registro pararia de descrever o que aconteceu. A governanca e explicita: nao
contornar hook que falha, investigar o achado antes de mexer na regra. O hook
estava certo; o catalogo estava incompleto.

## 3. A Regua

**O catalogo registra o tier efetivo.** O regime de origem continua descrito -- na
nota, onde ele pertence, porque e contexto que ninguem compara automaticamente. O
campo `tier` e o que o hook le, e ele precisa ser o numero que vale agora.

Escopo da correcao: apenas a entrada Space-Bunny-Alpha. Solar-Pro4 e
google-labs-jules[bot] permanecem em Tier 2, e a nota documenta a promocao com
data, origem da autorizacao e o commit que a exercitou.

## 4. Verificacao

| Canal | Resultado |
|---|---|
| Hook de commit-msg | Aviso desapareceu apos a correcao do catalogo |
| `tests/test_hook_commit_msg.py` | 0 erros, 0 warnings |
| JSON | Round-trip valido; 124 linhas antes e depois |
| Diff | 2 linhas, ambas na entrada Space-Bunny-Alpha |

## 5. Limites

Esta sessao inspecionou **apenas** `data/agent_identities.json`. Os demais catalogos
do ecossistema -- o da raiz e os dos agentes externos -- nao foram verificados, e a
mesma divergencia pode existir neles. O portao nao os mede, entao a regra aplicada
aqui e uma recomendacao transferida, nao um fato medido em todo o ecossistema.