---
id: registro-2026-09-09-validacao-nativa-hrc
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-09T19:17:16-03:00'
classes:
  - interno
  - medido
  - contrato
  - hrc
caminhos:
  - scripts/validation/HrcNativeReadProbe.java
  - scripts/validation/hrc-native-read.mjs
  - reports/HRC-NATIVE-READ-2026-09-09.json
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  baseline_head: 8f73c75b5c3ac3e1706f752aae499ae17a386335
  hrc: 4.1.0.202603231401
  jdk: 26.0.1
  jar_sha256: 25cf800b46085af762325aefcf0a24184e1b44a53c36a57037b8bb00883fca43
verificado:
  - Classes nativas oH.GSON/kJ e oL.parseStructures/saveStructures executadas em processo Java separado.
    Nenhuma instalacao ou workspace HRC foi alterado.
  - 'Quatro Hand Configs exportados pelo codigo atual: stacks, blinds, ante e campos suportados preservados
    no roundtrip nativo. Estruturas completas comparadas premio a premio.'
  - 'Colecao PKO do usuario: 239 premios, 3360 de pool por colocacao, 7000000 fichas, PKO e progressiveFactor
    0.5. O HRC saneia dolar no nome para USD.'
  - 'Controle negativo: anteType invalido causa divergencia no roundtrip e exit 1. Casos positivos e comparacoes
    terminam com exit 0.'
  - node --check aprovado; javac compilou contra os JARs locais. Harness final executado integralmente
    em aproximadamente nove segundos.
nao_verificado:
  - Wizard desktop, validacao da arvore, execucao de solve, equidades e convergencia nao foram medidos.
    Controle da interface desktop nao esta disponivel nesta sessao.
  - Otherstacks foi desserializado como double[] pelo Gson do HRC; nao instanciei o modelo nativo de equidade
    MTT. Sua presenca e cardinalidade nao certificam valuation.
  - Probe vinculado a classes internas da versao local; nao representa API publica estavel nem compatibilidade
    universal.
  - Codigo de produto nao foi alterado. Nao repeti suites completas, gates de publicacao, commit ou push
    nesta etapa.
referencias_nao_resolviveis: []
---

# Validacao de leitura com o HRC instalado

A proxima etapa do handoff era testar interoperabilidade no cliente HRC.
A interface desktop nao esta disponivel ao agente. Em vez de repetir apenas o
nosso parser, o probe executa as classes de dados do produto instalado. Isso
avanca a evidencia de interoperabilidade, sem substituir o aceite pelo wizard.

## Resultados

| Cenario | Mesa | Externos | Fichas | Posicoes pagas |
| :--- | ---: | ---: | ---: | ---: |
| Configuracao nativa reexportada | 6 | 7 | 378000 | 23 |
| Cenario sintetico de escala | 8 | 115 | 9123000 | 23 |
| FT derivada consistente | 9 | 0 | 375013 | 23 |
| HH GGPoker sintetica | 3 | 0 | 70000 | 3 |

A fixture FT original declara 378000 fichas para stacks somando 375013. Ela
permaneceu intacta. Somente a copia de teste em memoria usa 375013, e o arquivo
exportado identifica o caso como derivado. Nenhum resultado sintetico foi
promovido a dado de jogador real ou evidencia teorica.

A colecao do usuario tambem foi lida pelo proprio HRC: 239 premios, 3360 de
premiacao por colocacao, PKO e fator 0.5. A normalizacao do nome para USD pertence
ao HRC; nosso arquivo original continua preservado, sem essa substituicao.

## Reproducao e pacote

Execute `node scripts/validation/hrc-native-read.mjs` com tres argumentos:
diretorio da instalacao HRC, diretorio do JDK e um diretorio de saida novo.
O script recusa sobrescrever evidencia e recusa gravar dentro da instalacao HRC.
A versao do JAR e vinculada e seu hash integra o resumo. Nenhum JAR proprietario
foi copiado para o repositorio; apenas o codigo de verificacao e o resumo medido.

O pacote local de JSONs esta em
`.git/hrc-native-read-validation-final/hrc-validation-kit.zip`.
Inclui quatro configs de mao, a colecao original, instrucoes e hashes.
Os resultados nativos detalhados estao no mesmo diretorio local. O resumo
versionavel e `reports/HRC-NATIVE-READ-2026-09-09.json`.

## Proxima fronteira

1. Conferencia visual dos quatro configs no wizard e da colecao no importador
   de estruturas. Abrir configuracao nao equivale a calcular nem certificar EVs.
2. Ampliar o corpus com HHs reais e selecao explicita de uma mao em arquivos
   multiplos, sem somar stacks de instantes distintos.
3. Integrar o contrato aos demais consumidores somente depois de rastrea-los.

Auditor e implementador: Chat GPT-6 Astra <noreply@openai.com>.
