# DECISAO — Ling-3.0-tiny no ecossistema Site

**Data:** 2026-09-17
**Status:** RECUSADO como backend de inferencia local. Decisao registrada, nao
tarefa em aberto.
**Substitui:** a pendencia "Ling via Ollama" em `PENDENCIAS_FILA.md`.

---

## Resposta em uma linha

**Nao instalar.** Nenhum caminho de execucao local para Ling-3.0-tiny funciona
nesta maquina, e o ganho sobre o que ja existe (`gemma4:latest`) nao justifica
trocar o backend de inferencia do Site.

---

## O que foi medido (nao deduzido)

### Hardware

```
GPU     Radeon RX 570 Series   4 GB VRAM   driver 31.0.21925.1001
        Intel UHD 630          1 GB VRAM   (integrada, sem uso aqui)
RAM     34,2 GB total          4,9 GB disponivel NO MOMENTO DA MEDICAO
pagefile 75 GB
```

Os relatorios do repo ja registram `Radeon RX 570, 8 GiB, backend Vulkan`
(compatibilidade do OLLAMA e do llama.cpp). A medicao do proprio backend
confirma: `ggml_vulkan: 0 = Radeon RX 570 Series | uma: 0 | fp16: 0`.

**4 GB de VRAM e o dado que decide.** O manifesto local ja repurgou modelos
grandes por exatamente esse motivo (`data/ollama_models.json`, `_comment`:
"Modelos densos pesados (Gemma 31B local e Qwen 27B local) foram expurgados").

### Stack de inferencia instalada

```
torch        2.13.0+cpu     cuda: False   hip: None   xpu: True
sglang       NAO instalado
vllm         NAO instalado
ollama       0.35.1         (unico caminho funcional)
```

`torch` e **CPU-only** e nao tem ROCm. Logo SGLang e vLLM, os dois runtimes
que o upstream do Ling recomenda, **nao tem backend de aceleracao** aqui —
instalar os dois daria inferencia em CPU, o que e mais lento que o que ja
existe.

### Catalogo do Ollama

```
ollama show ling            -> Error: model 'ling:latest' not found
ollama show ling-3.0-tiny   -> Error: model 'ling-3.0-tiny:latest' not found
ollama list                 -> 25 modelos, zero Ling
```

---

## Por que cada caminho morre

### 1. SGLang (o caminho que o upstream recomenda)

Exige GPU com compute support. `torch` aqui e CPU-only e sem ROCm, e a RX 570
(Polaris, 2016) e anterior a qualquer suporte ROCm relevante. **Morto.**

### 2. vLLM

Mesma dependencia de GPU/ROCm. O proprio card do upstream pede um branch
dedicado (`git clone -b ling_3_0 github.com/inclusionAI/vllm-ling-v3`) e
`--torch-backend=auto`, que resolveria para CPU. **Morto pelo mesmo motivo.**

### 3. llama.cpp (`engine/llama_cpp/`, build 9601)

Nao e questão de quantizacao. Ling-3.0 usa atencao **hibrida linear**
(KDA + MLA, empilhamento 3:1) com **MoE esparso de 128 experts roteados**,
ativando 8 por token. O llama.cpp nao tem kernel para essa arquitetura. Um
GGUF convertido nao correria. **Morto por arquitetura.**

### 4. Ollama (o unico caminho que sobrou)

O card do HF publica um caminho via Modelfile:

```bash
printf 'FROM /abs/path/to/bf16_weights\n' > /tmp/Modelfile.ling
./ollama create ling-tiny-bf16 --experimental -f /tmp/Modelfile.ling
```

Isso pressupoe pesos **ja baixados** (BF16/FP8/INT4) e um runtime que fale a
arquitetura. O `ollama 0.35.1` desta maquina nao tem Ling no catalogo, e o
`--experimental` do comando upstream indica que a arquitetura nao esta
suportada em producao. **Nao verificavel sem baixar ~8 GB de pesos para um
teste que, pelo item 3, ja e improvavel.**

---

## O ganho, mesmo que rodasse

Ling-3.0-tiny: **7,9B total / 1,3B ativados**, MIT, com `enable_thinking`
por request e parsers `ling3`. Artifical Analysis Intelligence Index v4.1.1:
**25** (de 100).

Contra o que ja esta instalado e funcionando:

```
gemma4:latest        9,6 GB   e o default do manifesto (alias "4b", required=true)
qwen-pmev-math       5,4 GB   matematica PMEv, required=true
```

Para as tarefas que o Site realmente delega hoje, `gemma4` + `qwen-pmev-math`
ja cobrem. Um indice de 25 nao justifica trocar o backend do ecossistema.

---

## Recomendacao

Manter o manifesto como esta. Se Ling for mesmo necessario, o caminho correto
nao e local: e o tier `cloud` que o manifesto ja suporta via
`*-cloud:cloud` (deepseek-v4-pro, kimi-k2.7-code, gpt-oss:120b-cloud, etc.),
com Zero-RAM.

**Se a decisao for por Ling mesmo assim**, o passo unico e uma prova de
viabilidade antes de qualquer mudanca de infraestrutura:

1. Baixar os pesos INT4 (~4 GB)
2. `ollama create ling-tiny-int4 --experimental -f Modelfile`
3. `ollama run ling-tiny-int4` — se nao iniciar,encerra a linha
4. So entao avaliar add no manifesto

Nao mexer em `data/ollama_models.json` antes do passo 3.

---

## Efeito colateral apurado

Nenhum arquivo do Site foi alterado por esta investigacao. O manifesto nao foi
tocado, e `engine/llama_cpp/` nao foi reconstruido.

---

## Como reverter / reavaliar

Esta decisao e do hardware, nao do modelo. Se a maquina ganhar GPU com compute
support (ROCm nativo e >= 16 GB VRAM), os itens 1 e 2 da secao "Por que cada
caminho morre" abrem, e o item 3 continua morto. Reavaliar o item 4 com
`ollama >=` a versao que por suporte nativo a KDA/MLA.