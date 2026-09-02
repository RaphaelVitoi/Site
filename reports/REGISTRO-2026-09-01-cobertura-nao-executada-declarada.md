---
id: registro-2026-09-01-cobertura-nao-executada-declarada
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-01T23:45-03:00
atualizado_em: 2026-09-01T23:45-03:00
classes: [interno, medido]
config_medida:
  raiz: /home/user/Site
  branch: master
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  python_da_suite: '3.12.3'
  suite_antes: 768 passed, 9 skipped, 1 failed
  suite_depois: 769 passed, 10 skipped, 0 failed
caminhos:
  - tests/conftest.py
  - tests/test_ingestao_superseded.py
verificado:
  - >-
    Os dez testes pulados foram investigados um a um, e as quatro causas sao
    lacunas reais do host, nao defeito de codigo: PowerShell 5.1 ausente (4
    testes), commit charge inexistente fora do Windows (1), raiz multiprojeto
    nao montada neste container (1), modulo C++ nao compilado (3) e ausencia de
    arvore superada no repositorio (1).
  - >-
    A causa dos tres skips de tensor_engine foi medida e NAO e "esqueceram de
    compilar": core/tensor_engine/CMakeLists.txt fecha com
    `target_compile_options(... /O2 /fp:fast /arch:AVX2)`, que e sintaxe MSVC. O
    g++ e o clang nao aceitam essas flags, entao o build e Windows-only por
    configuracao. A fonte existe em core/tensor_engine/src/quantum_kernel.cpp e
    cmake, g++ e ninja estao no PATH deste host: o que falta e portabilidade das
    flags, nao ferramenta.
  - >-
    O guard do conftest passou a coletar skips em `pytest_runtest_logreport` e a
    imprimir a linha "Nao Executados" e a secao COBERTURA NAO EXECUTADA, com
    componente, origem (arquivo:linha) e motivo declarado de cada um. Conferido
    na saida da suite completa: os dez aparecem.
  - >-
    test_ingestao_superseded ganhou test_mecanismo_de_exclusao_por_marcador, que
    monta em tmp_path uma arvore marcada e uma nao marcada e verifica os tres
    fatos: o arquivo da viva entra, o da superada nao entra, e o proprio
    SUPERSEDED.md nao e indexado. Passa.
  - >-
    Suite completa: 769 aprovados, 10 pulados, zero falhas.
nao_verificado:
  - >-
    Se as flags MSVC do CMakeLists tem equivalente exato em g++/clang que
    preserve a isometria numerica que os tres testes de tensor_engine medem.
    `/fp:fast` e `-ffast-math` nao sao identicos em garantias de ponto
    flutuante, e portar sem conferir o resultado numerico contra a saida do
    MSVC seria trocar um skip declarado por um verde nao verificado.
  - >-
    O comportamento do guard de skips quando um teste e pulado em
    `pytest_collectreport` (modulo inteiro pulado na coleta). A coleta e tratada
    noutro hook e nao foi exercitada.
revisoes_de_ancora:
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - tests/conftest.py
    parecer: >-
      Este commit e a continuacao direta daquele achado, na mesma direcao e sem desfazer nada dele. La, o guard imprimia VERDE quando a coleta falhava e zero teste rodava; a correcao fez erro de coleta virar erro. Aqui, o guard imprimia veredito sem mencionar os testes que nao rodaram. Nenhuma contagem de erro ou warning muda, e o tri-state continua identico -- o que entra e uma terceira linha, "Nao Executados", que nao tem teto e explicitamente nao conta como aprovacao.
---

# Cobertura nao executada passa a ser declarada

## O que o veredito nao dizia

O guard do `conftest.py` imprimia erros e warnings e ficava calado sobre o que
nunca rodou. A suite dizia `9 skipped` numa linha do pytest, e o veredito SOTA
logo abaixo -- que e o que a §5 do `CLAUDE.md` manda o agente repassar --
nao mencionava nenhum deles.

Quem lesse so o veredito, e a §5 manda ler exatamente esse, nao ficava sabendo
que havia cobertura ausente nem por que. E a mesma classe do achado de
2026-08-30, quando o guard declarava VERDE sobre uma bateria que nao rodou: o
estrago nao esta no exit code, esta no **veredito impresso**.

Agora sai assim:

```
 Total de Erros:    0 (Teto Maximo Permitido: 0 | Peso: CRITICO)
 Total de Warnings: 0 (Teto Maximo Permitido: 2 | Tolerancia: 0 para SUCESSO)
 Nao Executados:    10 (sem teto | NAO contam como aprovacao -- CLAUDE.md SS5)
```

seguido de uma secao com componente, `arquivo:linha` e motivo de cada um. Sem
teto de propósito: skip nao e degradacao, e transforma-lo em bloqueio criaria
pressao para remover o `pytest.skip` em vez de resolver a causa -- que e o
oposto do que se quer.

## Os dez, e o que cada causa e de fato

| Causa | Testes | Natureza |
| :--- | :--- | :--- |
| PowerShell 5.1 ausente | 4 | estrutural: nao ha build fora do Windows |
| Modulo C++ nao compilado | 3 | **configuracao**, ver abaixo |
| Commit charge inexistente | 1 | metrica so existe no Windows |
| Raiz multiprojeto nao montada | 1 | os projetos irmaos nao existem neste container |
| Nenhuma arvore superada | 1 | condicao de conteudo, nao de codigo |

O terceiro grupo merecia a investigacao que recebeu, porque o motivo declarado
-- "modulo nao compilado no ambiente" -- sugere descuido. Nao e. A fonte esta em
`core/tensor_engine/src/quantum_kernel.cpp`, e `cmake`, `g++` e `ninja` estao no
PATH deste host. O que impede o build e a ultima linha do `CMakeLists.txt`:

```cmake
target_compile_options(quantum_tensor_engine PRIVATE /O2 /fp:fast /arch:AVX2)
```

Sintaxe MSVC. O g++ usaria `-O2 -ffast-math -mavx2`. **O build e Windows-only
por configuracao**, mesma classe do PowerShell 5.1 -- e nao foi corrigido aqui
de proposito: `/fp:fast` e `-ffast-math` nao dao as mesmas garantias de ponto
flutuante, e esses tres testes medem *isometria numerica* contra NumPy. Portar a
flag sem conferir o resultado contra a saida do MSVC trocaria um skip declarado
por um verde nao verificado.

## O `SUPERSEDED` que ficou sem alvo

`test_arvore_superada_do_repositorio_fica_fora` falhava desde a fusao
`.cerebro` -> `.claude`, que removeu as quatro arvores marcadas. Ele caia na
propria assercao de "ficou sem alvo" -- escrita pelo autor justamente para nao
passar em falso quando nao houvesse o que verificar.

Ele estava certo, e a correcao nao e afrouxar a assercao. E **o teste construir
o proprio alvo**: `test_mecanismo_de_exclusao_por_marcador` monta em `tmp_path`
uma arvore marcada e uma nao marcada e verifica os tres fatos do predicado -- o
arquivo da viva entra no indice, o da superada nao entra, e o proprio
`SUPERSEDED.md` nao e indexado. O mecanismo fica guardado sempre, exista ou nao
arvore superada no repositorio.

O teste original continua, agora restrito ao que so ele pode ver -- o estado
real do repositorio -- e pulando com motivo declarado quando nao ha arvore
marcada. Pular declarando e honesto; passar sem alvo seria falso verde; e
falhar sem alvo cobrava do operador uma condicao de conteudo que nao e dele.

E ele so pode pular assim porque o guard agora imprime skips. As duas metades
deste commit sao uma coisa so: o skip virou visibilidade, que era o que a falha
dura buscava.
