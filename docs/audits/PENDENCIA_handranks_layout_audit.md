# PENDENCIA — Auditoria de layout do `HandRanks.dat`

**Status:** ABERTA — ultima da fila, por decisao explicita do usuario.
**Prioridade:** BAIXA (nao bloqueia o portao de commit).
**Registrado em:** 2026-09-17, durante a reintegracao dos orfaos.

---

## O que se sabe (medido, nao suposto)

Probe sobre `frontend/public/wasm/HandRanks.dat`:

```
bytes no arquivo      = 129.951.336
entradas se uint32    = 32.487.834
entradas se uint16    = 64.975.668
valor mais comum      = 53, em ~3,8% dos slots (primeiros 2M)
segundo mais comum    = 0,  em ~1,9%
valores <= 65535      = ~98,1% dos slots
indice candidato A    = 8.107.374.140  -> OUT OF RANGE
indice candidato B    = 8.279.247.605  -> OUT OF RANGE
```

## Por que isso importa

`engine/hand_evaluator.py::perfect_hash_key` devolve chaves na casa das
centenas de milhoes. Nenhum layout de tabela 7-cartas standard endereca
aquilo. O Kenny/Shanahan de 7 cartas usa ~**130.653.412** slots de uint16;
o blob aqui tem 64.975.668. **Nao e a mesma tabela.**

## Hipoteses em aberto (nenhuma confirmada)

1. **Tabela de 5 ou 6 cartas** com empacotamento diferente do que
   `perfect_hash_key` assume.
2. **Arquivo truncado ou corrompido.** O valor dominante `53` nao tem
   leitura obvia em nenhum layout de forca de mao conhecido; `53` seria o
   codigo de "categoria 53", que nao existe (sao 9).
3. **Cabecalho / offsetShift.** Talvez os primeiros N bytes sejam cabecalho e
   o payload comece depois — o probe leu do byte 0.

## Como fechar

- [ ] Procurar no repo o produtor do `.dat`: script de build, `generate`, ou
      referencia em `wasm-pack`/`Makefile`/`package.json`. Sem produtor
      localizado, o arquivo e orfao por definicao.
- [ ] Se houver produtor: rodar e comparar hash do output novo contra o
      commitado. Divergencia = arquivo obsoleto ou build nao reproduzivel.
- [ ] Se nao houver produtor: comparar `sha256` contra o upstream publico
      do Kenny. Divergencia = arquivo local modificado ou truncado.
- [ ] Confirmar a endianness assumida no probe antes de concluir qualquer
      coisa — tudo acima foi lido como little-endian sem validar.

## Decisao de design (independente da auditoria)

Mesmo que a tabela seja **valida**, ela nao e **necessaria**:
`engine/hand_evaluator.py` calcula a mesma resposta em runtime, sem tabela
pre-computada e sem build step. O blob e, no maximo, aceleracao opcional.

Nao criar consumidor novo para o `.dat` antes de fechar esta auditoria.

---

## Relacionado

- `engine/hand_evaluator.py` — o docstring de `perfect_hash_key` foi
  corrigido para **nao** afirmar que o layout do blob e indexado por essa
  funcao. A afirmacao anterior nao tinha lastro medido.
- `frontend/public/wasm/nexus_core_rust_bg.wasm` — orfao reintegrado por
  outro caminho (ver `core/arbitrator.py`); sem relacao com este blob.