---
id: patches-skills-readme
tipo: registro
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-28T02:40-03:00
commit: dc231c69
classes: [interno, medido]
config_medida:
  raiz: ~/.gemini/Site
  data_da_extracao: 2026-08-28
  exclusoes_do_patch: [dist/**, build/**, package-lock.json]
verificado:
  - cada patch gerado por `git diff` dentro do proprio submodulo
  - HEAD de cada submodulo conferido contra o gitlink antes da extracao
  - tamanho e contagem de arquivos de cada patch medidos apos a exclusao
nao_verificado:
  - os patches NAO foram reaplicados sobre uma copia limpa. Nao ha prova de
    que aplicam sem conflito; ha prova de que capturam o diff atual.
  - o conteudo dos 30 arquivos do patch do exa-mcp-server nao foi lido linha
    a linha; foi classificado por amostragem.
  - nenhuma skill foi executada antes ou depois da extracao.
supersede: null
---

# Patches dos submódulos de `skills/`

## O que é isto

Trabalho local feito **sobre** os submódulos de `skills/`, extraído para cá em
2026-08-28 porque estava num limbo: modificado na árvore de trabalho, **não
commitado em lugar nenhum**, e invisível ao `git status`.

A invisibilidade é por configuração — os 8 submódulos declaram `ignore = dirty`
no `.gitmodules`, o que instrui o git a não reportar alteração dentro deles.
Árvore limpa por instrução, não por fato.

**Um `git submodule update` apaga tudo isso sem aviso.** Estes arquivos são o
seguro.

## O que há dentro

| Patch | Arquivos | Natureza |
| :--- | ---: | :--- |
| `gemini-cli-security.patch` | 17 | **Segurança.** Corrige *argument injection* do git (`resolveCommitRevision` rejeita revisão iniciada por `-`, usa `--end-of-options`), adiciona `shell: false` no `spawnSync`, e traz **teste de regressão** provando que `--output=…` como revisão não escreve arquivo |
| `gemini-cli-jules.patch` | 2 | **Segurança.** Actions pinadas por SHA (supply-chain); `${{ }}` movido de `run:` para `env:` (*script injection*); import de `exec` removido |
| `exa-mcp-server.patch` | 30 | **Refatoração.** Schemas e formatadores extraídos, tipos fortalecidos, `randomUUID` de `node:crypto` |
| `superpowers.patch` | 24 | Ajustes e remoções em `skills/*/SKILL.md` |
| `gemini-deep-research.patch` | 12 | Ajustes de fonte |
| `gemini-supermemory.patch` | 12 | Ajustes em `src/lib/*` |
| `Stitch.patch` | 2 | Menor |
| `token-efficiency.patch` | 1 | `fs` → `node:fs` (anti-shadowing) |

Padrão recorrente em três submódulos: prefixo `node:` nos imports embutidos,
que impede shadowing por pacote homônimo em `node_modules`.

## O que foi excluído, e por quê

`dist/**`, `build/**` e `package-lock.json`. São **regeneráveis** (`npm run
build`, `npm install`) e dominavam o volume: o patch do `gemini-supermemory`
caiu de 1,5 MB para 18 KB só ao tirar o `dist/` bundlado, e o do
`exa-mcp-server` carregava 5.799 linhas de lockfile.

Preservar trabalho significa preservar **fonte**. Artefato de build que entra no
patch não é preservação, é ruído que torna a revisão impossível.

**Consequência declarada:** reaplicar exige `npm install` e `npm run build` no
submódulo. O `package.json` está incluído; só o lock ficou de fora.

## Como reaplicar

```bash
cd skills/<nome>
git apply --check ../../patches/skills/<nome>.patch   # confere antes
git apply ../../patches/skills/<nome>.patch
```

`--check` primeiro: se o submódulo avançou de versão, o patch pode conflitar, e
é melhor descobrir antes de sujar a árvore.

## Isto é seguro, não é solução

Patch versionado protege contra perda. **Não** resolve a divergência: cada
`git submodule update` continuará exigindo reaplicação manual, e o conflito
tende a crescer.

As duas saídas definitivas, em ordem de valor:

1. **PR upstream** para as correções de segurança. Elas valem para os projetos
   de origem, e upstream aceito **encerra** a divergência em vez de administrá-la.
2. **Fork próprio** por submódulo, com o gitlink apontando para ele.

Enquanto nenhuma das duas acontecer, `tests/test_patches_skills.py` reprova se
um submódulo ganhar modificação de fonte sem patch correspondente.
