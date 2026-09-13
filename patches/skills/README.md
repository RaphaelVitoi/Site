# `patches/skills/` — o seguro que cumpriu o papel e foi retirado

**Estado em 2026-09-12: não há mais `.patch` aqui, e isso é o desfecho correto.**

## Por que existiram

Os oito submódulos de `skills/` declaram `ignore = dirty` no `.gitmodules`.
Modificação dentro deles **não aparece** no `git status` do superprojeto — árvore
limpa por instrução, não por fato.

Em **2026-08-28** havia 62 arquivos-fonte modificados nesse limbo, incluindo uma
correção de *argument injection* do git com teste de regressão. Um
`git submodule update` de rotina apagaria tudo sem aviso. A resposta foi extrair
um `.patch` por submódulo: **seguro contra perda de trabalho não commitado**.

## Por que foram retirados

Medido em **2026-09-12**: os oito estão limpos, e todo o trabalho está commitado
em fork próprio, de 1 a 2 commits além do upstream.

**Não há mais trabalho não commitado a segurar.** Um `.patch` que duplica
história já publicada é o que a §3 chama de fonte paralela — e fonte paralela
não diverge se alguém descuidar: ela diverge **por padrão**, porque a cópia não
tem como saber que o original mudou.

Retirados por arbitragem do Tier 0 em 2026-09-12.

## Onde o trabalho está agora

Todo fork é de `RaphaelVitoi`. O `.gitmodules` aponta para ele, que é o que um
clone resolve.

| Submódulo | Fork | Gitlink | Branch |
| :--- | :--- | :--- | :--- |
| `Stitch` | `stitch` | `7abb7b2f395c` | `fix/escopo-oauth-cloud-platform` |
| `exa-mcp-server` | `exa-mcp-server` | `f3b1349c9b65` | `chore/sonarlint-campaign-20260911` |
| `gemini-cli-jules` | `jules` | `09bef22d4af9` | `fix/injecao-no-workflow-e-registro-da-tool` |
| `gemini-cli-security` | `security` | `1d2eef7c19f4` | `refactor-runners-de-poc-e-fronteira-do-vitest` |
| `gemini-deep-research` | `gemini-cli-deep-research` | `69d39b447a4b` | `chore/lint-e-tipagem-de-mock` |
| `gemini-supermemory` | `gemini-supermemory` | `6094ae21ebd8` | `refactor/remove-egress-automatico-de-sessao` |
| `superpowers` | `superpowers` | `7e880359648e` | `chore/lint-e-sonda-de-dot-no-windows` |
| `token-efficiency` | `token-efficiency` | `0212f0241683` | `chore/prefixo-node-nos-imports` |

Os SHAs são os gravados no `HEAD` do superprojeto em 2026-09-12; o guard confirma
que cada um resolve.

## A lição, que custou quinze dias

Entre 2026-08-28 e 2026-09-12 o `.gitmodules` apontava para o **upstream**
enquanto a correção de segurança do `gemini-supermemory` vivia só no disco local.
Quem clonasse o repositório público recebia o gitlink `035c843d`, que ainda
carregava o hook de egress. **A máquina estava protegida; o clone, nunca.**

Este README já prescrevia, desde o primeiro dia, *"fork próprio por submódulo,
com o gitlink apontando para ele"*. A recomendação ficou catorze dias parada — não
por discordância, por invisibilidade: prosa em README de diretório não é lida por
portão nenhum.

Duas coisas mudaram por causa disso:

- **`tests/test_patches_skills.py`** deixou de perguntar *"existe patch?"* e passou
  a perguntar *"o endereço publicado resolve?"*. O guard anterior passava
  vacuamente desde que os submódulos ficaram limpos, e nunca teria pego a
  exposição — ele olhava para o lugar errado.
- **Pendência agora se declara em `pendencias:` no frontmatter**, que o portão de
  registro lê e exibe em todo commit. Recomendação escrita não é tarefa aberta.

## Se o limbo voltar

A saída **não** é extrair patch. É commitar no fork e avançar o gitlink — patch
guarda o trabalho e não o publica, e foi exatamente essa confusão que custou os
quinze dias. Um `.patch` só é legítimo enquanto houver trabalho não commitado
correspondente, e o guard cobra isso.
