# engine/solver_importers/hrc_evidence.py
"""Adaptador de export do HRC para par de evidencia PMev.

A PONTE QUE FALTAVA. `evidenceContract.ts` define `EvidencePair` e o portao
`countReproduciblePairs`, que o `AULA_1_2_EVIDENCE_LEDGER.md` exige em tres antes
de qualquer calibracao de `solveIcmDistortion`. Ate aqui todo par existente era
literal escrito a mao em `aula12Pairs.ts`: nao havia caminho nenhum de um arquivo
de export ate o portao, e um export que chegasse teria de ser transcrito de novo.

SO O HRC, E ISSO NAO E ESCOPO REDUZIDO -- E O UNICO ESCOPO POSSIVEL.

    O GTO Wizard NAO EXPORTA (Tier 0, 2026-09-04), e seu motor proprio e rede
    neural, como o DeepSolver. Um ramo de GTO Wizard aqui seria codigo morto por
    construcao, e nenhuma quantidade de parser o traria a vida.

    Disso decorre a forma do par: se um dos regimes nao pode vir de export, o
    unico par reproduzivel possivel e `ChipEV(HRC) x ICMev(HRC)` -- dois exports
    do MESMO solver, no MESMO no, com o REGIME como unica variavel. Isso e
    controle experimental, nao acomodacao: motores diferentes misturariam o
    efeito do regime com o efeito do motor, e nenhuma analise separa os dois
    depois.

O QUE ESTE MODULO NAO FAZ, E POR QUE:

    NAO INFERE REGIME. Um export do HRC nao registra se o solve foi rodado em
    ChipEV ou ICMev -- quem escolheu foi o operador na configuracao. Deduzir a
    partir do arquivo seria deduzir do nada, e o regime e justamente a variavel
    que o par existe para isolar.

    NAO REIMPLEMENTA A EXTRACAO DE PROCEDENCIA. `HRCProImporter.extrair_procedencia`
    ja le build, e-Nash, unidade e rotulo nativo, com 17 testes cobrindo os casos
    dificeis -- separador obrigatorio, booleano que nao e e-Nash, `%` que vira
    `pct` e nunca `pctOfPot`. Duplicar aquilo aqui criaria a segunda fonte que a
    secao 3 do CLAUDE.md do projeto proibe, e as duas divergiriam por padrao.

    NAO CONVERTE AUSENCIA EM ZERO. `None` do extrator vira `unreadable`, nunca
    `read(0.0)`. e-Nash zero e convergencia perfeita, a afirmacao mais forte
    possivel sobre um solve; ausencia e ignorancia.
"""

from __future__ import annotations

from typing import Any

from engine.solver_importers.hrc_pro import HRCProImporter

#: Nome do solver nos dois lados do par. Constante porque o adaptador e do HRC:
#: nao ha caso em que este modulo produza cenario de outro solver.
SOLVER = "HRC"


def _lido(valor: Any) -> dict[str, Any]:
    """Espelho de `read()` do contrato TS."""
    return {"kind": "read", "value": valor}


def _ilegivel(motivo: str | None = None) -> dict[str, Any]:
    """Espelho de `unreadable()` do contrato TS.

    Omite `reason` quando nao ha motivo, exatamente como o construtor TS faz --
    um `reason: undefined` serializado seria ruido no JSON.
    """
    return {"kind": "unreadable"} if motivo is None else {"kind": "unreadable", "reason": motivo}


def _medido(valor: Any, motivo_se_ausente: str) -> dict[str, Any]:
    """`None` do extrator vira ilegivel COM MOTIVO; qualquer outro valor e lido."""
    return _ilegivel(motivo_se_ausente) if valor is None else _lido(valor)


def _cenario(raw: str, regime: str) -> dict[str, Any]:
    """Monta um lado do par a partir de um export e do regime declarado."""
    proc = HRCProImporter.extrair_procedencia(raw)

    provenance: dict[str, Any] = {
        "build": _medido(proc.build, "export nao declara versao do HRC"),
        "eNash": _medido(proc.e_nash, "export nao declara e-Nash"),
    }

    # A unidade so e exigivel quando ha e-Nash lido: sem numero ela nao descreve
    # nada. Mas o campo existe nos dois casos, porque `camposDeProcedenciaFaltando`
    # distingue ausente de ilegivel e ambos reprovam -- o que muda e a mensagem.
    provenance["eNashUnit"] = _medido(
        proc.e_nash_unit,
        "e-Nash ausente: unidade nao descreve nada"
        if proc.e_nash is None
        else "export declara e-Nash sem unidade",
    )

    if proc.e_nash_label is not None:
        provenance["eNashLabel"] = _lido(proc.e_nash_label)

    return {
        "regime": regime,
        "solver": SOLVER,
        "provenance": provenance,
        "actions": [],
    }


def _contexto(context: dict[str, Any]) -> dict[str, Any]:
    """Converte o contexto declarado para a forma `Measured` do contrato."""
    return {
        "street": context["street"],
        "board": _lido(context["board"]),
        "potBb": _lido(context["potBb"]),
        "players": [
            {
                "id": p["id"],
                "position": p["position"],
                "stackBb": _lido(p["stackBb"]),
            }
            for p in context["players"]
        ],
    }


def construir_par_de_evidencia(
    *,
    chip_ev_raw: str,
    icm_ev_raw: str,
    source: dict[str, Any],
    context: dict[str, Any],
) -> dict[str, Any]:
    """Produz um `EvidencePair` serializavel a partir de dois exports do HRC.

    Os dois exports devem ser do MESMO no, diferindo apenas no regime -- e o
    regime e declarado por posicao de argumento, nao lido do arquivo.

    Recusa conteudo que `detect_format` do HRC nao reconheca. A recusa importa:
    sem ela, texto arbitrario entraria no conjunto medido pelo portao carregando
    procedencia vazia, e um par assim seria indistinguivel de um export cujo
    cabecalho simplesmente nao trouxe os campos.

    Args:
        chip_ev_raw: conteudo do export rodado em ChipEV.
        icm_ev_raw: conteudo do export rodado em ICMev.
        source: identidade documental (`documentSha256`, `figureIndex`, `nodeLabel`).
        context: `street`, `board`, `potBb` e `players` do no.

    Returns:
        Dicionario no shape de `EvidencePair` do `evidenceContract.ts`.

    Raises:
        ValueError: quando um dos conteudos nao e um export do HRC.
    """
    importador = HRCProImporter()

    for rotulo, raw in (("chipEv", chip_ev_raw), ("icmEv", icm_ev_raw)):
        if not importador.detect_format(raw):
            raise ValueError(
                f"conteudo de {rotulo} nao e um export do HRC: "
                "o adaptador nao produz evidencia a partir de arquivo nao reconhecido"
            )

    return {
        "source": dict(source),
        "context": _contexto(context),
        "chipEv": _cenario(chip_ev_raw, "chipEV"),
        "icmEv": _cenario(icm_ev_raw, "icmEV"),
    }
