---
id: registro-2026-09-12-a-autoria-dos-forks-corrigida-antes-do-primeiro-pr
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-12T23:41:52-03:00'
atualizado_em: '2026-09-12T23:41:52-03:00'
classes: [interno, medido, proveniencia, submodulos, fronteira]
caminhos:
  - patches/skills/README.md
  - skills/Stitch
  - skills/gemini-cli-jules
  - skills/gemini-supermemory
pendencias_resolvidas:
  - pend-2026-09-12-autoria-dos-commits-de-fork
verificado:
  - os quatro commits de fork foram reescritos para Claude Opus 5 <noreply@anthropic.com>
  - a data de AUTOR foi preservada nos quatro -- 11/09 12:05, 12:06 e 12:07
  - as tres arvores de conteudo sao IDENTICAS antes e depois -- c194becf, 9e831203, 25fd61c8
  - commit de terceiro em cada base ficou intacto -- jilinxia, Sherzat e Rishab Agarwal seguem como autores
  - os tres force-push usaram --force-with-lease e foram aceitos
  - a API do GitHub reporta Claude Opus 5 como autor nos quatro commits, lida depois do push
  - os tres comparam ahead e zero behind contra o upstream depois da reescrita
  - a tabela de SHA do patches/skills/README.md foi atualizada para 7abb7b2f395c, 09bef22d4af9 e 6094ae21ebd8
  - tests/test_patches_skills.py -- 5 aprovados, incluindo o guard que resolve cada gitlink
nao_verificado:
  - nenhum dos tres PRs foi aberto; segue dependendo do Tier 0 pelo formulario de comparacao
  - o conteudo das correcoes nao foi reexecutado -- a prova aqui e de arvore identica, nao de comportamento
revisoes_de_ancora:
  # A unica mudanca no README e a coluna de SHA da tabela de forks, e ela mudou
  # porque a reescrita de autoria trocou os hashes -- conteudo identico.
  - registro: auditoria-2026-09-12-a-tarefa-que-ficou-em-aberto-e-a-memoria-de-curto-prazo
    caminhos: [patches/skills/README.md]
    parecer: Aquela auditoria trata dos catorze dias em que a recomendacao ficou invisivel, e da retirada dos .patch. A tabela mudou de SHA, nao de destino, e nenhum .patch voltou.
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos: [patches/skills/README.md]
    parecer: O que ela afirma sobre o README e que ele registra fork e SHA de cada skill; continua registrando, com os SHA atualizados pela reescrita de autoria. O guard que ela ancorou passa.
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos: [patches/skills/README.md]
    parecer: O preludio cita o README como destino do trabalho commitado em fork, e isso nao mudou -- so os tres hashes, por troca de autoria com arvore identica.
config_medida:
  reescrita: git rebase --exec 'git commit --amend --author=...'
  publicacao: git push --force-with-lease
  arvores_antes_e_depois: identicas
---

# A autoria dos forks, corrigida antes do primeiro PR

## 1. Por que agora, e não depois

Os quatro commits nos três forks estavam assinados
`Raphael Vitoi <raphavitoi@gmail.com>` — o e-mail pessoal do Tier 0 em trabalho
produzido por agente, que é o que a §7 proíbe e o incidente de 2026-08-30
documentou.

A §7 também diz que **histórico publicado não retroage**, e a razão que ela dá é
concreta: força-push quebra checkout alheio e âncora de revisão. **Nenhuma das
duas existia aqui.** Os branches estavam nos forks e nunca viraram pull request —
não há revisor, não há comentário ancorado, não há terceiro com o branch em
checkout. O custo que a regra evita era zero, e ele deixaria de ser zero no
instante em que o primeiro PR abrisse.

Autorizado pelo Tier 0 em 2026-09-12, com a instrução explícita de corrigir antes
de voltar ao projeto.

## 2. O que mudou, e o que provadamente não mudou

| Submódulo | Antes | Depois | Árvore de conteúdo |
| :--- | :--- | :--- | :--- |
| `Stitch` | `454e84a5aaa5` | `7abb7b2f395c` | `c194becfde9a` — **idêntica** |
| `gemini-cli-jules` | `9c848a2a0cb3` | `09bef22d4af9` | `9e8312030c6e` — **idêntica** |
| `gemini-supermemory` | `1b0ca5a8498c` | `6094ae21ebd8` | `25fd61c80b76` — **idêntica** |

**A prova de que nada de substantivo mudou é a árvore, não a inspeção do diff.**
Comparar diffs testa a atenção de quem compara; comparar o SHA da árvore testa o
conteúdo. As três batem byte a byte antes e depois.

Preservado também: a **data de autor** dos quatro commits, e a autoria dos
commits de terceiro que servem de base — `jilinxia`, `Sherzat` e
`Rishab Agarwal` continuam como autores dos seus.

## 3. O que isso muda para os PRs

Nada, exceto o nome que aparecerá. Os três seguem `ahead` com zero `behind`, e a
API do GitHub já reporta `Claude Opus 5` como autor dos quatro commits. Os links
de comparação continuam válidos: eles apontam para o **branch**, não para o SHA.

Permanece verdadeiro o que o registro anterior diz sobre o campo que não se
escolhe: o PR sairá sob a conta do Tier 0, porque o GitHub não oferece campo de
autor separado para pull request. É por isso que o rodapé de atribuição no corpo
é obrigatório, e ele está nos três.

**Assinatura:** `Claude Opus 5 [Tier 1.B]` — sessão `claude-opus5-site-2026-09-12-preludio`
