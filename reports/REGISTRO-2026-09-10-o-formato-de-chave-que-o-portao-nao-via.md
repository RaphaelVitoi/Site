---
id: registro-2026-09-10-o-formato-de-chave-que-o-portao-nao-via
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: opus-5
criado_em: 2026-09-10T12:20:00-03:00
atualizado_em: 2026-09-10T12:20:00-03:00
classes: [interno, medido, seguranca]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  origem: origin/master
  so: Windows
  python: '3.14.6'
  suite_credenciais: 7 passed
caminhos:
  - data/PADROES_DE_CREDENCIAL.json
  - tests/test_credenciais.py
verificado:
  - o padrao novo casa a chave real de 53 caracteres
  - nao casa base64, hash sha256, URL, placeholder nem prefixo curto
  - a varredura do repositorio rastreado voltou a zero achados
  - 7 testes de credencial aprovados, ruff check e format limpos
nao_verificado:
  - varredura retroativa do historico do git em busca do formato AQ
revisoes_de_ancora:
  - registro: handoff-2026-08-29-auditoria-integridade-repositorio
    caminhos:
      - data/PADROES_DE_CREDENCIAL.json
    parecer: >
      A alteracao e ADITIVA: acrescenta um decimo padrao e um placeholder
      conhecido. Nenhum padrao existente muda de forma ou de semantica, e a
      fonte continua unica e compartilhada com o portao PowerShell. O que
      aquele handoff afirma sobre integridade do repositorio permanece
      verdadeiro, e fica mais forte: a varredura passou a cobrir um formato que
      antes atravessava. Revisado: permanece valido sem alteracao.
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - tests/test_credenciais.py
    parecer: >
      Aquele handoff registrou os dois testes que travaram a comparacao
      sensivel a caixa no portao. Este commit acrescenta um terceiro teste e
      troca a fixture do primeiro por uma chave sintetica; nenhuma das duas
      asercoes daquele handoff e removida ou enfraquecida. Revisado: permanece
      valido sem alteracao.
---

# O formato de chave que o portao nao via

## O achado

Uma chave Google real, em texto claro, vivia em 11 manifestos do ambiente do
usuario e em 108 arquivos ao todo. Nenhum padrao a detectava.

O `PADROES_DE_CREDENCIAL.json` conhecia apenas `AIza[0-9A-Za-z_-]{35}`. A chave
tem o formato `AQ.` seguido de corpo longo -- outro formato do mesmo emissor.

## Por que isso e pior do que parece

No mesmo dia, o portao de ancora **bloqueou um commit legitimo** acusando
"Chave Google" num trecho base64 de um relatorio Lighthouse. Era falso positivo,
causado por `-match` insensivel a caixa, ja corrigido para `-cmatch`.

O mesmo portao, portanto, produzia **ruido no caso falso e cegueira no caso
verdadeiro**. Sao os dois lados do mesmo defeito, e a `_regra_de_precisao` da
propria fonte antecipa o primeiro ao dizer que portao que cria ruido sera
ignorado. O segundo nao tinha quem o antecipasse.

## O que ja existia, e nao conversava

`tests/test_sync_jules_redacao.py` documenta, desde antes, o **formato real das
chaves que vazaram** -- prefixo `AQ.` -- e exercita `redigir_segredos` contra
ele. O projeto conhecia o formato. A fonte de padroes, nao.

Duas partes do mesmo repositorio sabiam coisas diferentes sobre a mesma ameaca.
E a mesma classe de divergencia que a fonte unica foi criada para eliminar, um
nivel acima: unificou-se o texto do padrao entre dois consumidores, e nao o
conhecimento sobre quais padroes existem.

## A correcao

Padrao acrescentado: `AQ\.[A-Za-z0-9_-]{45,}`. Alta precisao, como a fonte exige
-- validado contra seis casos antes de entrar:

| Caso | Esperado | Obtido |
| :--- | :--- | :--- |
| chave real de 53 caracteres | casa | casa |
| base64 do relatorio Lighthouse | nao casa | nao casa |
| hash sha256 | nao casa | nao casa |
| URL com ponto | nao casa | nao casa |
| `YOUR_API_KEY` | nao casa | nao casa |
| prefixo `AQ.` curto | nao casa | nao casa |

O padrao contem metacaracteres, entao a fonte continua nao se denunciando pelo
mecanismo que ja existia.

## O que o padrao novo encontrou de imediato

Ao rodar, reprovou a varredura do repositorio rastreado com **dois achados**, e
um deles era meu: o teste que eu acabara de escrever embutia a chave real como
fixture. Corrigido para uma chave **sintetica**, seguindo a convencao que
`test_sync_jules_redacao.py` ja praticava -- *"nenhuma credencial real entra num
arquivo de teste"* -- e acrescentando `CHAVE_SINTETICA` aos placeholders
conhecidos, para que a convencao passe a ser reconhecida pela fonte e nao so
pelo costume.

Detector que encontra o proprio autor no primeiro uso e detector que funciona.
