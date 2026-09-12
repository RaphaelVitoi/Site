"""Indexa taxa de erro de ferramenta por sessao nos TRES veiculos da malha.

Pedido do Tier 0 em 2026-09-12: indexar Codex e Antigravity no mesmo padrao de
registro do Claude Code. Os tres registram -- e nenhum registra igual. O indice
normaliza a forma e declara a procedencia de cada numero, porque empilhar tres
grandezas sem rotulo e a fonte paralela que a SS3 do CLAUDE.md proibe.

  claude-code   ~/.claude/projects/<projeto>/*.jsonl
                `is_error` booleano por tool_result.            metodo: is_error

  antigravity   ~/.gemini/antigravity/conversations/*.db
                Um SQLite por conversa. Tabela `steps`: step_type 132 e o passo
                acionavel, `status` 7 e o estado de falha, e `error_details` so
                e nao-vazio nessa combinacao -- medido em 2026-09-12 sobre os 21
                bancos de setembro: 87 de 87, sem excecao.  metodo: status_erro

  codex         ~/.codex/sessions/<ano>/<mes>/<dia>/rollout-*.jsonl
                custom_tool_call_output e function_call_output NAO tem campo de
                erro. A primeira linha da saida e sentinela do harness --
                'Script completed' ou 'Script failed', 770 contra 26 em setembro,
                sem terceira forma.                            metodo: sentinela

ATENCAO ao que este modulo NAO le. `AppData\\Roaming\\Antigravity IDE` e o IDE
compartilhado por todos os modelos igualmente, e nao o veiculo Antigravity 2.0.
Medir o IDE para falar do veiculo foi o erro cometido e corrigido no mesmo dia:
o `trajectorySummaries` de la e protobuf de sumario, sem evento de ferramenta, e
levou a concluir que o Antigravity nao instrumentava nada -- quando instrumenta
melhor que os outros dois. Superficie compartilhada nao identifica condutor.

A quarta fonte cobre o resto: o proprio ledger de feedback, onde `tool_calls`,
`tool_errors` e `tool_error_method` passaram a ser gravados no handoff. E a
unica superficie onde um veiculo sem registro proprio pode reportar a MESMA
grandeza.

O indice nao decide nada. Ele produz o denominador que faltava ao falsificador
do outlier da7ef222 -- que exige tres sessoes distintas com taxa medida e
encontrava 5 das 21.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import glob
import json
import os
import shutil
import sqlite3
import tempfile

# step_type do passo acionavel e status de falha, medidos, nao presumidos.
ANTIGRAVITY_STEP_ACIONAVEL = 132
ANTIGRAVITY_STATUS_ERRO = 7

# Sentinela do harness do Codex. A saida concluida comeca por 'Script completed'
# ou 'Script failed'; so a segunda conta. Se o harness mudar a frase, a cobertura
# cai -- o que aparece como menos linhas, nunca como taxa de erro zero.
CODEX_SENTINELA_FALHA = "Script failed"


def _iso(ts):
    return _dt.datetime.fromtimestamp(ts).isoformat(timespec="seconds")


def _linha(veiculo, origem, inicio, chamadas, erros, metodo):
    return {
        "veiculo": veiculo,
        "origem": origem,
        "inicio": inicio[:16],
        "chamadas": chamadas,
        "erros": erros,
        "taxa_pct": round(100.0 * erros / chamadas, 1),
        "metodo": metodo,
    }


def de_claude_code(diretorio, corte):
    for caminho in sorted(glob.glob(os.path.join(diretorio, "*.jsonl"))):
        total = erros = 0
        inicio = None
        with open(caminho, encoding="utf-8", errors="replace") as fh:
            for linha in fh:
                try:
                    registro = json.loads(linha)
                except ValueError:
                    continue
                marca = registro.get("timestamp")
                if marca and (inicio is None or marca < inicio):
                    inicio = marca
                conteudo = (registro.get("message") or {}).get("content")
                if not isinstance(conteudo, list):
                    continue
                for bloco in conteudo:
                    if not isinstance(bloco, dict) or bloco.get("type") != "tool_result":
                        continue
                    total += 1
                    if bloco.get("is_error") is True:
                        erros += 1
        if total and inicio and inicio[:10] >= corte:
            yield _linha("claude-code", os.path.basename(caminho)[:8], inicio, total, erros, "is_error")


def de_antigravity(diretorio, corte):
    limite = _dt.datetime.fromisoformat(corte).timestamp()
    for caminho in sorted(glob.glob(os.path.join(diretorio, "*.db"))):
        if os.path.getmtime(caminho) < limite:
            continue
        # Copia antes de abrir: o banco pode estar em uso pelo veiculo, e leitura
        # concorrente de SQLite com WAL de outro processo devolve erro ou dado
        # parcial. Medir estado vivo pediria coordenacao que nao existe aqui.
        with tempfile.TemporaryDirectory() as tmp:
            copia = os.path.join(tmp, "conv.db")
            try:
                shutil.copy2(caminho, copia)
                conexao = sqlite3.connect(copia)
                try:
                    total, erros = conexao.execute(
                        "SELECT COUNT(*), SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) FROM steps WHERE step_type = ?",
                        (ANTIGRAVITY_STATUS_ERRO, ANTIGRAVITY_STEP_ACIONAVEL),
                    ).fetchone()
                finally:
                    conexao.close()
            except (OSError, sqlite3.Error):
                continue
        if not total:
            continue
        yield _linha(
            "antigravity",
            os.path.basename(caminho)[:8],
            _iso(os.path.getmtime(caminho)),
            int(total),
            int(erros or 0),
            "status_erro",
        )


def de_codex(diretorio, corte):
    limite = _dt.datetime.fromisoformat(corte).timestamp()
    padrao = os.path.join(diretorio, "**", "rollout-*.jsonl")
    for caminho in sorted(glob.glob(padrao, recursive=True)):
        if os.path.getmtime(caminho) < limite:
            continue
        total = erros = 0
        with open(caminho, encoding="utf-8", errors="replace") as fh:
            for linha in fh:
                try:
                    registro = json.loads(linha)
                except ValueError:
                    continue
                carga = registro.get("payload")
                if not isinstance(carga, dict):
                    continue
                if carga.get("type") not in ("custom_tool_call_output", "function_call_output"):
                    continue
                total += 1
                saida = carga.get("output")
                if isinstance(saida, list) and saida and isinstance(saida[0], dict):
                    texto = saida[0].get("text") or ""
                elif isinstance(saida, str):
                    texto = saida
                else:
                    texto = ""
                if texto.lstrip().startswith(CODEX_SENTINELA_FALHA):
                    erros += 1
        if total:
            yield _linha(
                "codex", os.path.basename(caminho)[8:24], _iso(os.path.getmtime(caminho)), total, erros, "sentinela"
            )


def do_ledger(caminho):
    if not os.path.exists(caminho):
        return
    with open(caminho, encoding="utf-8") as fh:
        for linha in fh:
            if not linha.strip():
                continue
            try:
                registro = json.loads(linha)
            except ValueError:
                continue
            if registro.get("record_type") != "feedback":
                continue
            if "tool_calls" not in registro or "tool_errors" not in registro:
                continue
            if not registro["tool_calls"]:
                continue
            yield _linha(
                registro.get("conductor_vehicle") or "desconhecido",
                registro.get("session_id") or "sem-sessao",
                registro.get("recorded_at", ""),
                int(registro["tool_calls"]),
                int(registro["tool_errors"]),
                registro.get("tool_error_method") or "declarado",
            )


def main():
    perfil = os.path.expanduser("~")
    aqui = os.path.dirname(os.path.abspath(__file__))
    p = argparse.ArgumentParser(description="Indice de taxa de erro de ferramenta por sessao, tres veiculos.")
    p.add_argument("--claude-dir", default=os.path.join(perfil, ".claude", "projects", "c--Users-rapha--gemini-Site"))
    p.add_argument("--antigravity-dir", default=os.path.join(perfil, ".gemini", "antigravity", "conversations"))
    p.add_argument("--codex-dir", default=os.path.join(perfil, ".codex", "sessions"))
    p.add_argument(
        "--ledger", default=os.path.join(aqui, "..", "..", "reports", "agent-calibration", "feedback-ledger.jsonl")
    )
    p.add_argument("--desde", default="2026-09-01")
    p.add_argument("--minimo-chamadas", type=int, default=30)
    args = p.parse_args()

    linhas = []
    for fonte in (
        de_claude_code(args.claude_dir, args.desde),
        de_antigravity(args.antigravity_dir, args.desde),
        de_codex(args.codex_dir, args.desde),
        do_ledger(os.path.abspath(args.ledger)),
    ):
        linhas.extend(x for x in fonte if x["chamadas"] >= args.minimo_chamadas)

    linhas.sort(key=lambda x: (x["veiculo"], x["inicio"]))

    cobertura = {}
    for x in linhas:
        alvo = cobertura.setdefault(x["veiculo"], {"sessoes": 0, "metodos": set(), "taxas": []})
        alvo["sessoes"] += 1
        alvo["metodos"].add(x["metodo"])
        alvo["taxas"].append(x["taxa_pct"])

    resumo = []
    for veiculo, alvo in cobertura.items():
        taxas = sorted(alvo["taxas"])
        resumo.append(
            {
                "veiculo": veiculo,
                "sessoes": alvo["sessoes"],
                "metodos": sorted(alvo["metodos"]),
                "mediana_pct": taxas[len(taxas) // 2],
                "minima_pct": taxas[0],
                "maxima_pct": taxas[-1],
            }
        )
    resumo.sort(key=lambda x: x["veiculo"])

    print(
        json.dumps(
            {
                "schema_version": "agent-tool-error-index/v1",
                "gerado_em": _dt.datetime.now().astimezone().isoformat(timespec="seconds"),
                "desde": args.desde,
                "minimo_de_chamadas": args.minimo_chamadas,
                "sessoes": linhas,
                "cobertura_por_veiculo": resumo,
                "limite": (
                    "Cada metodo mede uma coisa diferente e a comparacao entre veiculos "
                    "carrega essa diferenca: is_error e status_erro sao campos tipados, "
                    "sentinela e string do harness. Ausencia de linha e ausencia de "
                    "medicao, nunca taxa zero."
                ),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
