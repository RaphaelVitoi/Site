"""Transpila o literal RECONFERENCIA_AULA_1_2 do fixture TS para JSON.

ESTE NAO E O GERADOR DO ESPELHO INTEIRO. Ele cobre um bloco so -- a
reconferencia -- e nao toca nos sete pares. O gerador completo que
`frontend/src/tests/simulator/aula12PairsJson.test.ts` menciona continua sem
existir no repositorio; quem o escrever absorve este.

Existe porque `data/aula12_pairs.json` nao pode ser editado a mao (o proprio
arquivo o diz) e porque os hosts de agente nao tem Node. Cobre o subconjunto de
TS que este literal usa: chave nao citada, string em aspas simples concatenada
com `+`, virgula final, comentario e referencia a constante exportada no mesmo
arquivo. Fora desse subconjunto ele falha alto, nunca em silencio.

Consumidor: `tests/test_reconferencia_aula12.py`, que reprova se o espelho JSON
divergir do fixture curado.
"""

import json
from pathlib import Path
import re
import sys

FIXTURE = Path("frontend/src/components/simulator/solver/evidencia/aula12Pairs.ts")


def bloco_do_literal(fonte: str, nome: str) -> str:
    i = fonte.index("{", fonte.index(f"export const {nome}"))
    abre, profundidade = i, 0
    while i < len(fonte):
        c = fonte[i]
        if c == "'":
            i += 1
            while fonte[i] != "'":
                i += 2 if fonte[i] == "\\" else 1
        elif c == "{":
            profundidade += 1
        elif c == "}":
            profundidade -= 1
            if profundidade == 0:
                return fonte[abre : i + 1]
        i += 1
    raise ValueError(f"literal {nome} nao fecha")


def tokens(ts: str):
    """Emite ('str', valor) para literal de texto e ('raw', texto) para o resto."""
    i, buf = 0, []
    while i < len(ts):
        c = ts[i]
        if c == "'":
            if buf:
                yield "raw", "".join(buf)
                buf = []
            j, partes = i + 1, []
            while ts[j] != "'":
                if ts[j] == "\\":
                    partes.append(ts[j + 1])
                    j += 2
                else:
                    partes.append(ts[j])
                    j += 1
            yield "str", "".join(partes)
            i = j + 1
        elif ts.startswith("//", i):
            i = ts.index("\n", i)
        elif ts.startswith("/*", i):
            i = ts.index("*/", i) + 2
        else:
            buf.append(c)
            i += 1
    if buf:
        yield "raw", "".join(buf)


def para_json(ts: str, constantes: dict[str, str]) -> object:
    saida, pendente = [], None
    for tipo, valor in tokens(ts):
        if tipo == "str":
            pendente = valor if pendente is None else pendente + valor
            continue
        if pendente is not None:
            if re.fullmatch(r"\s*\+\s*", valor):
                continue  # concatenacao: o proximo literal soma ao pendente
            saida.append(json.dumps(pendente))
            pendente = None
        for nome, literal in constantes.items():
            valor = re.sub(rf"\b{nome}\b", json.dumps(literal), valor)
        saida.append(valor)
    if pendente is not None:
        saida.append(json.dumps(pendente))
    bruto = "".join(saida)
    bruto = re.sub(r"(^|[{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:", lambda m: f'{m.group(1)}"{m.group(2)}":', bruto)
    bruto = re.sub(r",(\s*[}\]])", r"\1", bruto)
    return json.loads(bruto)


def reconferencia() -> dict:
    fonte = FIXTURE.read_text(encoding="utf-8")
    constantes = {
        nome: re.search(rf"{nome} =\s*'([0-9a-f]{{64}})'", fonte).group(1)
        for nome in ("AULA_1_2_SHA256_VIGENTE", "AULA_1_2_SHA256")
    }
    return para_json(bloco_do_literal(fonte, "RECONFERENCIA_AULA_1_2"), constantes)


if __name__ == "__main__":
    json.dump(reconferencia(), sys.stdout, ensure_ascii=False, indent=2)
    print()
