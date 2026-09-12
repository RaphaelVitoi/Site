---
id: auditoria-2026-09-12-a-tarefa-que-ficou-em-aberto-e-a-memoria-de-curto-prazo
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-12T08:19:19-03:00'
atualizado_em: '2026-09-12T08:19:19-03:00'
classes: [interno, medido, calibracao, handoff]
verificado:
  - nota 9.0 gravada literal na sequencia 55, sem conversao de escala -- cadeia valida, 56 registros
  - taxa de erro de ferramenta da sessao medida por dois metodos independentes que concordam -- 271/11/4.1
  - intervalo entre recomendacao e execucao do fork medido por git log -- 14 dias
  - os oito submodulos estao limpos, zero item em cada, medido com git status --porcelain
  - guarda test_todo_submodulo_modificado_tem_patch passa VACUAMENTE hoje -- lido no codigo
nao_verificado:
  - as tres correcoes de seguranca dos submodulos seguem sem PR upstream
  - os cinco outliers abertos seguem sem arbitragem
  - a eficacia da recomendacao de memoria de curto-medio prazo -- nao ha ciclo posterior para comparar
  - o prompt do heartbeat segue por corrigir na plataforma do Codex
caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  - reports/REGISTRO-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar.md
  - patches/skills/README.md
  - tests/test_patches_skills.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  head_na_abertura: 5fbf50c7
  sessao: claude-opus5-site-2026-09-12-preludio
  inicio_da_sessao: '2026-09-12T05:56:54-03:00'
revisoes_de_ancora:
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
      - patches/skills/README.md
    parecer: >-
      REVISADO E MANTIDO VALIDO, e esta auditoria o COMPLETA em vez de o
      substituir. O preludio e o corte intermediario da mesma sessao e declara o
      mesmo session_id; a nota que faltava nele chega aqui, porque a nota mora no
      handoff. Nada do preludio e reescrito: a sequencia 55 do ledger e append, e
      a reclassificacao do patch do supermemory ja constava dele.
supersede: null
---

# Auditoria de encerramento — a tarefa que ficou em aberto, e a memória de curto prazo

**Sessão** `claude-opus5-site-2026-09-12-preludio`, de `05:56:54` a este
registro. **Nota 9.0**, sequência 55 do ledger, cadeia válida em 56 registros,
cauda `ff294027`. Condutor `claude-code@claude-opus-5`, regime assistido.

Esta auditoria não repete o prelúdio. Ela registra **o processo** e **o que a
sessão ensinou** — e a maior parte disso veio do comentário qualitativo do
Tier 0 no handoff, não da minha própria medição.

---

## 1. O que a sessão fez

Três pendências fechadas, uma delas descoberta no caminho e uma quarta aberta
como outlier grave.

| Frente | Estado ao abrir | Estado ao fechar |
| :--- | :--- | :--- |
| PowerShell 5.1 nos quatro `.ps1` | não verificado | verificado em `5.1.26100.9444`, real |
| causa do outlier `512fc3a6` | sem dono | origem localizada **fora do índice**, declarada na §8.3 |
| taxonomia — precedente vira regra? | sem cláusula | §9.1, por arbitragem aditiva |
| `MetricsJson = '{}'` | default que nunca passava | `Mandatory`, sem default |
| relação do `Site` com o `supermemory` | gitlink servindo o hook | outlier grave `7e5ca052`, sintoma fechado |

**A revalidação em 5.1 mudou de asserção no meio.** Meu primeiro teste perguntou
*"roda na 5.1?"* e contou três recusas como falha. A asserção correta é a
oposta: os três scripts que tocam o ledger **devem** recusar, porque o
`ConvertTo-Json` da 5.1 emite texto diferente e uma cadeia íntegra apareceria
como `Hash mismatch`. Um teste que afirma a coisa errada não é um teste fraco —
ele reprova o acerto e aprova o erro.

---

## 2. O apontamento do Tier 0 — catorze dias de tarefa esquecida

O comentário do handoff mandou olhar **o intervalo** entre a recomendação do
fork e a sua execução. Medido:

| Marco | Quando | Por quem |
| :--- | :--- | :--- |
| recomendação escrita em `patches/skills/README.md` | **2026-08-28 02:41** (`9670b8a0`) | eu |
| forks criados, commitados e publicados | **2026-09-11 ≈ 11:17–12:07** | **intervenção do Tier 0** |
| gitlink apontado, ciclo fechado | **2026-09-12 08:06** (`91ad2351`) | **intervenção do Tier 0** |

**Catorze dias entre recomendar e fazer, e as duas metades só andaram por
intervenção dele.** Eu escrevi a saída — *"fork próprio por submódulo, **com o
gitlink apontando para ele**"* — e não a executei; nas quinze sessões
intermediárias a tarefa não apareceu em nenhuma lista, em nenhum relatório, em
nenhum portão.

**O Tier 0 chamou de erro de nós dois, e essa divisão é precisa.** Do meu lado:
escrevi a recomendação num README de diretório, que é documentação de artefato e
não uma lista de trabalho — nenhum mecanismo desta malha lê `patches/skills/README.md`
procurando pendência. Do lado da malha: **não existe registro de tarefa em
aberto que atravesse sessões.** O portão de âncora cobra revisão do que muda; ele
não cobra o que deveria ter mudado e não mudou. O ledger de calibração é
append-only sobre feedback e outlier, não sobre pendência. Uma tarefa declarada
em prosa, sem dono e sem prazo, é indistinguível de uma observação — e foi
tratada como observação por catorze dias.

É a mesma forma da §2.1 da raiz: *sem prazo não há como distinguir "guardado" de
"esquecido"*. Ali a regra foi criada para áreas de espera em disco. Aqui o
mesmo defeito apareceu em prosa de governança, que é onde ninguém procurou.

---

## 3. A correção factual — as skills não estão mais *dirty*, e eu sabia

O Tier 0 corrigiu: as oito **não estão mais** modificadas. Na limpeza de lint, o
Gemini acabou envolvendo-as, e elas estão limpas tanto quanto possível — e eu
**tinha ciência memorizada disso**.

Medido agora, e ele está certo:

```
Stitch 0 · exa-mcp-server 0 · gemini-cli-jules 0 · gemini-cli-security 0
gemini-deep-research 0 · gemini-supermemory 0 · superpowers 0 · token-efficiency 0
```

Zero item em cada, superprojeto limpo. O que aparecia no `git status` deste turno
não era árvore suja — era **gitlink avançado**, que é outra coisa e tem outra
causa. Eu li o sintoma certo e contei a história errada.

**Consequência que ninguém tinha medido:** com os oito limpos,
`tests/test_patches_skills.py::test_todo_submodulo_modificado_tem_patch` passa
**vacuamente**. Ele itera os submódulos e faz `continue` quando o diff é vazio;
com todos vazios, o corpo nunca executa. O guarda não morreu — ele voltaria a
morder se algo retornasse ao limbo —, mas hoje **não testa nada**, e um teste
verde que não exerceu nenhuma asserção é indistinguível de um teste verde que
exerceu. A §5 vale para teste como vale para verificação: *não executado não é
aprovado*.

Os oito `.patch` também mudaram de natureza sem que o documento acompanhasse:
eram **seguro contra perda** de trabalho não commitado; com o trabalho agora
commitado e publicado em fork, viraram **instantâneo histórico**. Aposentá-los
ou mantê-los é decisão do Tier 0 — e pela §9.1 escrita hoje, o fato de eu ter
mexido num deles não cria regra sobre os outros.

---

## 4. A recomendação do Tier 0 — memória de curto-médio prazo

Ela é dirigida **aos dois**, e a sessão produziu três instâncias do mesmo
defeito, o que é evidência de que não é acaso:

| # | O que eu já sabia | O que fiz | Custo |
| :-- | :--- | :--- | :--- |
| 1 | as skills tinham sido limpas pelo Gemini | descrevi o estado antigo | narrativa errada num relatório |
| 2 | o fork era trabalho meu de 11/09 | chamei de "deriva não minha" | outlier grave `7e5ca052` |
| 3 | heredoc está aposentado, e está **em memória** | usei heredoc | um comando travado, neste turno |

Os três têm a mesma assinatura: **a informação estava disponível e não foi
consultada no instante da decisão.** Não é falta de registro — o caso 3 tem
arquivo de memória escrito com o motivo. É falta de **consulta**, e consulta é
barata exatamente nos momentos em que parece desnecessária.

O caso 2 é o mais caro e o mais instrutivo, e por isso virou memória própria: a
§4 da raiz manda *medir antes de agir*, e a atribuição de autoria escapa da
letra dela por ser usada para **não** agir. "Não é meu" tem de ser hipótese com
um comando de custo trivial atrás — `git log`, `git reflog`,
`git diff --submodule=log` —, nunca conclusão.

---

## 5. Medição da sessão

| Métrica | Valor | Método |
| :--- | ---: | :--- |
| chamadas de ferramenta | 271 | `is_error` no transcript |
| erros | 11 | idem |
| taxa | 4,1 % | idem |

Dois caminhos independentes chegaram ao mesmo par — `agent_tool_error_index.py`
e contagem direta no `jsonl`. A mediana medida do veículo `claude-code` é 4,5 %
sobre cinco sessões; esta fica **abaixo** dela. O par entra junto, como a §8.3
exige: taxa sem denominador não é medição.

Ledgers ao fim: feedback **56** registros, cauda `ff294027`; outliers **8**,
cauda `b69d6ec1`. As duas cadeias válidas.

---

## 6. O que aprendi, em três frases que cabem numa regra

1. **Recomendação escrita não é tarefa aberta.** Prosa num README não é lida por
   portão nenhum; o que não tem dono e prazo é observação, não pendência.
2. **Atribuição de autoria é medição, não impressão** — e ela é perigosa
   justamente quando serve para não agir, porque aí nenhuma regra sobre agir a
   alcança.
3. **Saber não é consultar.** Três vezes nesta sessão a informação existia e não
   foi buscada no instante da decisão; uma delas estava num arquivo de memória
   escrito por mim.

---

## 7. Em aberto para o Tier 0

- **Cinco outliers** sem arbitragem, incluindo o `7e5ca052` de hoje.
- **PR upstream** para as três correções de segurança dos submódulos — é a saída
  de maior valor, porque encerra a divergência em vez de administrá-la; é
  publicação externa e depende dele.
- **O prompt do heartbeat**, na plataforma do Codex, que ele já foi resolver.
- **O destino dos oito `.patch`** e do guarda que hoje passa vazio.
- **Registro de tarefa aberta entre sessões** — a lacuna que os catorze dias
  expuseram. Não proponho mecanismo aqui: pela §9.1, isso é regra, e regra vem
  por arbitragem dele.
