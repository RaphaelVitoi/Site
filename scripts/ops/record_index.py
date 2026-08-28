"""Indice ancorado dos registros -- M.O. SOTA v8.0 GOLD, secao 13.C.

O manual declara `data/RECORD_INDEX.json` como manifesto canonico desde a v8.0.
Ele nunca existiu. Consequencia MEDIDA em 2026-08-28, encenando uma violacao de
cada criterio da secao 13.F em stage e observando o portao:

    C1 frontmatter invalido ............ BLOQUEIA
    C2 ancora interna incoerente ....... passa      <- inativo
    C3 TTL externo vencido ............. passa      <- inativo
    C4 config_medida divergente ........ passa      <- inativo
    C5a credencial em texto claro ...... BLOQUEIA
    C5b ampliacao de ACL/CORS .......... passa      <- inativo
    C6 supressor sem Record-Id ......... BLOQUEIA

Tres de sete. O portao passava, e sempre passou, porque quatro criterios nao
tinham o que ler -- nao porque o repositorio estivesse limpo.

TRES DECISOES DE DESENHO, e o motivo de cada uma
------------------------------------------------

1. O indice NAO e versionado (`.gitignore`). A secao 13.C avisa que "indice
   mantido em paralelo diverge". Um cache commitado diverge do disco no primeiro
   registro editado sem rebuild. Nao versionando, a divergencia deixa de ser
   politica a policiar e passa a ser impossivel por construcao.

2. O portao NAO le o arquivo: importa este modulo e recalcula. Portao que confia
   em cache herda a idade do cache.

3. O caminho da ancora interna e DECLARADO, nunca inferido da prosa. A secao
   13.F pede marcar SUSPEITO todo registro VIGENTE cujo caminho o commit toque.
   Inferindo caminho de prosa, o plano 2-B e os handoffs citam `nexus.py`, e
   qualquer commit em `nexus.py` exigiria superseder o plano: o portao travaria
   o repositorio na primeira semana e seria desligado -- o modo de falha que a
   propria docstring do portao de ancora descreve. Por isso a ancora vive no
   campo `caminhos:` do frontmatter, que o autor preenche quando quer a
   protecao. Zero registros o declaram hoje, entao C2 entra com raio de
   explosao zero e cresce por adocao, igual ao frontmatter.

   A prosa continua sendo varrida -- mas so como `caminhos_citados_na_prosa`,
   informativo, para ajudar o autor a preencher o campo. Sugestao nao e ancora.
"""

from __future__ import annotations

import argparse
import json
import os
import platform
import re
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any

import yaml

RAIZ = Path(__file__).resolve().parents[2]          # .../Site
DESTINO = RAIZ / "data" / "RECORD_INDEX.json"
DIRETORIOS_DE_REGISTRO = ("docs", "reports")

VIGENTE, SUSPEITO, OBSOLETO = "VIGENTE", "SUSPEITO", "OBSOLETO"

# Extensoes que um caminho citado na prosa pode ter para valer como pista. O
# filtro real e a existencia do arquivo: nome inventado nao entra.
_RE_CAMINHO = re.compile(r"[`\(\[]([A-Za-z0-9_./-]+\.(?:py|ps1|psm1|json|md|ts|tsx|js|toml|yml|yaml))")


# ---------------------------------------------------------------------------
# leitura
# ---------------------------------------------------------------------------


def _git(*args: str, cwd: Path = RAIZ) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, check=False)


def arquivos_de_registro(raiz: Path = RAIZ) -> list[Path]:
    """Os `.md` rastreados sob docs/ e reports/ -- o mesmo recorte do portao."""
    saida = _git("ls-files", "docs/*.md", "reports/*.md", cwd=raiz)
    if saida.returncode != 0:
        return []
    return [raiz / linha for linha in saida.stdout.splitlines() if linha.strip()]


def ler_frontmatter(caminho: Path) -> tuple[dict[str, Any] | None, str]:
    """Devolve (frontmatter, corpo). frontmatter None quando nao ha bloco YAML."""
    try:
        texto = caminho.read_text(encoding="utf-8-sig")
    except OSError:
        return None, ""
    if not texto.startswith("---"):
        return None, texto
    partes = texto.split("\n---", 2)
    if len(partes) < 2:
        return None, texto
    bruto = partes[0][3:]
    corpo = partes[1] if len(partes) == 2 else partes[1] + partes[2]
    try:
        dados = yaml.safe_load(bruto)
    except yaml.YAMLError:
        return None, corpo
    return (dados if isinstance(dados, dict) else None), corpo


# ---------------------------------------------------------------------------
# ambiente -- o que da para conferir de verdade
# ---------------------------------------------------------------------------


def resolvedores_de_ambiente(raiz: Path = RAIZ) -> dict[str, Any]:
    """Chaves de `config_medida` que esta maquina sabe responder.

    O que nao esta aqui NAO e dado por conferido: vai para `nao_conferiveis`.
    Tratar chave desconhecida como "bate" seria inventar um sinal verde.
    """
    branch = _git("rev-parse", "--abbrev-ref", "HEAD", cwd=raiz).stdout.strip()
    return {
        # `raiz` aceita DUAS respostas, e isso e correcao de um falso positivo
        # medido: a primeira versao resolvia so a raiz multiprojeto e acusou o
        # INTERLUDIO, que mediu o projeto. As duas leituras sao legitimas -- o
        # registro declara qual arvore mediu. Chave cujo significado varia entre
        # registros nao pode ter resolvedor de valor unico.
        "raiz": {str(raiz.parent).replace("\\", "/"), str(raiz).replace("\\", "/")},
        "branch": branch,
        "python": platform.python_version(),
        "so": platform.system(),
    }


def conferir_config_medida(config: Any, ambiente: dict[str, Any]) -> tuple[list[str], list[str]]:
    """Devolve (divergencias, nao_conferiveis)."""
    if not isinstance(config, dict):
        return [], []
    divergencias, nao_conferiveis = [], []
    for chave, declarado in config.items():
        if chave not in ambiente:
            nao_conferiveis.append(chave)
            continue
        atual = ambiente[chave]
        aceitos = atual if isinstance(atual, set) else {atual}
        normal = {str(a).strip().rstrip("/") for a in aceitos}
        if str(declarado).strip().rstrip("/") not in normal:
            divergencias.append(f"{chave}: registro diz {declarado!r}, ambiente diz {sorted(normal)}")
    return divergencias, nao_conferiveis


# ---------------------------------------------------------------------------
# estado derivado
# ---------------------------------------------------------------------------


def _como_data(valor: Any) -> date | None:
    if isinstance(valor, datetime):
        return valor.date()
    if isinstance(valor, date):
        return valor
    if isinstance(valor, str):
        try:
            return date.fromisoformat(valor.strip()[:10])
        except ValueError:
            return None
    return None


def ttl_vencido(fm: dict[str, Any], hoje: date) -> str | None:
    """Motivo do vencimento, ou None. Sem `ttl_dias` nao ha o que vencer."""
    ttl = fm.get("ttl_dias")
    if not isinstance(ttl, int):
        return None
    consultas = [
        _como_data(f.get("consultado_em"))
        for f in (fm.get("fontes") or [])
        if isinstance(f, dict)
    ]
    consultas = [c for c in consultas if c]
    if not consultas:
        return "classe externa com ttl_dias e sem consultado_em: o TTL nao tem de onde contar"
    idade = (hoje - max(consultas)).days
    if idade > ttl:
        return f"TTL externo vencido: consultado ha {idade} dias, ttl_dias={ttl}"
    return None


def _ancestral(sha: str, raiz: Path) -> bool | None:
    """True/False, ou None quando o SHA nao existe neste repositorio."""
    if _git("cat-file", "-e", f"{sha}^{{commit}}", cwd=raiz).returncode != 0:
        return None
    return _git("merge-base", "--is-ancestor", sha, "HEAD", cwd=raiz).returncode == 0


def caminhos_citados(corpo: str, raiz: Path) -> list[str]:
    """Pistas para o autor, nunca ancora. So entra caminho que EXISTE."""
    achados = {m.group(1) for m in _RE_CAMINHO.finditer(corpo)}
    return sorted(c for c in achados if (raiz / c).is_file())


# ---------------------------------------------------------------------------
# construcao
# ---------------------------------------------------------------------------


def construir(raiz: Path = RAIZ, hoje: date | None = None) -> dict[str, Any]:
    hoje = hoje or date.today()
    ambiente = resolvedores_de_ambiente(raiz)
    head = _git("rev-parse", "--short", "HEAD", cwd=raiz).stdout.strip()

    brutos: list[dict[str, Any]] = []
    sem_frontmatter: list[str] = []

    for caminho in arquivos_de_registro(raiz):
        rel = caminho.relative_to(raiz).as_posix()
        fm, corpo = ler_frontmatter(caminho)
        if fm is None:
            sem_frontmatter.append(rel)
            continue

        motivos: list[str] = []
        classes = fm.get("classes") or []
        if isinstance(classes, str):
            classes = [classes]

        sha = str(fm.get("commit") or "").strip()
        ancestral: bool | None = None
        if sha and sha.lower() not in {"null", "none"}:
            ancestral = _ancestral(sha, raiz)
            if ancestral is None:
                motivos.append(f"commit declarado ({sha}) nao existe neste repositorio")
            elif ancestral is False:
                motivos.append(f"commit declarado ({sha}) nao e ancestral do HEAD")
        elif "interno" in classes:
            motivos.append("classe interna sem ancora de commit")

        motivo_ttl = ttl_vencido(fm, hoje)
        if motivo_ttl:
            motivos.append(motivo_ttl)

        divergencias, nao_conferiveis = conferir_config_medida(fm.get("config_medida"), ambiente)
        motivos.extend(f"config_medida divergente -- {d}" for d in divergencias)

        declarados = fm.get("caminhos") or []
        if isinstance(declarados, str):
            declarados = [declarados]

        brutos.append(
            {
                "id": fm.get("id") or rel,
                "arquivo": rel,
                "tipo": fm.get("tipo"),
                "escopo": fm.get("escopo"),
                "autor": fm.get("autor"),
                "classes": classes,
                "commit": sha or None,
                "commit_e_ancestral_do_head": ancestral,
                "supersede": fm.get("supersede"),
                "caminhos_declarados": sorted(declarados),
                "caminhos_citados_na_prosa": caminhos_citados(corpo, raiz),
                "config_nao_conferivel": sorted(nao_conferiveis),
                "motivos": motivos,
            }
        )

    # OBSOLETO por supersede: quem foi aposentado por outro registro.
    aposentados = {
        str(r["supersede"]).strip()
        for r in brutos
        if r.get("supersede") and str(r["supersede"]).lower() not in {"null", "none"}
    }

    for r in brutos:
        if r["id"] in aposentados:
            r["motivos"].append("superseded por registro mais novo")
        obsoleto = (r["commit_e_ancestral_do_head"] is False) or (r["id"] in aposentados)
        r["estado"] = OBSOLETO if obsoleto else (SUSPEITO if r["motivos"] else VIGENTE)

    registros = sorted(brutos, key=lambda r: (r["estado"], r["arquivo"]))
    totais = {
        "vigente": sum(1 for r in registros if r["estado"] == VIGENTE),
        "suspeito": sum(1 for r in registros if r["estado"] == SUSPEITO),
        "obsoleto": sum(1 for r in registros if r["estado"] == OBSOLETO),
        "sem_frontmatter": len(sem_frontmatter),
    }
    # Cardinalidade derivada: se a soma nao fechar com a varredura, houve
    # colisao de id ou perda silenciosa. Colisao nao aparece como ausencia.
    varridos = len(registros) + len(sem_frontmatter)

    return {
        "_aviso": "DERIVADO. Gerado por scripts/ops/record_index.py; nunca editar a mao. Nao e versionado, e o portao nao le este arquivo -- recalcula.",
        "gerado_em": datetime.now().astimezone().isoformat(timespec="seconds"),
        "gerado_por": "scripts/ops/record_index.py",
        "commit_do_head": head,
        "recorte": [f"{d}/**/*.md rastreados pelo git" for d in DIRETORIOS_DE_REGISTRO],
        "ambiente_conferivel": {
            k: (sorted(v) if isinstance(v, set) else v) for k, v in ambiente.items()
        },
        "totais": totais,
        "arquivos_varridos": varridos,
        "sem_frontmatter": sorted(sem_frontmatter),
        "registros": registros,
    }


def escrever(indice: dict[str, Any], destino: Path = DESTINO) -> Path:
    """Escrita ATOMICA: arquivo temporario no mesmo diretorio, depois `replace`.

    Duas sessoes rodando `nexus index --rebuild` ao mesmo tempo -- coisa que
    aconteceu neste repositorio em 2026-08-28 -- podiam intercalar escritas e
    deixar JSON pela metade no disco. Quem lesse no meio veria um arquivo
    sintaticamente invalido e nao teria como saber que a causa foi concorrencia.
    `os.replace` e atomico no mesmo volume: ou o arquivo antigo, ou o novo
    inteiro, nunca a mistura.
    """
    destino.parent.mkdir(parents=True, exist_ok=True)
    temporario = destino.with_name(f".{destino.name}.{os.getpid()}.tmp")
    temporario.write_text(json.dumps(indice, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(temporario, destino)
    return destino


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Indice ancorado dos registros (M.O. 13.C)")
    ap.add_argument("--rebuild", action="store_true", help="regenera data/RECORD_INDEX.json")
    ap.add_argument("--suspeitos", action="store_true", help="lista SUSPEITO e OBSOLETO")
    ap.add_argument("--json", action="store_true", help="emite o indice em stdout")
    args = ap.parse_args(argv)

    indice = construir()

    if args.json:
        print(json.dumps(indice, ensure_ascii=False, indent=2))
        return 0

    if args.rebuild:
        destino = escrever(indice)
        rel = destino.relative_to(RAIZ).as_posix()
        print(f"[INDICE] {rel} regenerado.")

    t = indice["totais"]
    print(
        f"[INDICE] {indice['arquivos_varridos']} registros varridos: "
        f"{t['vigente']} VIGENTE, {t['suspeito']} SUSPEITO, {t['obsoleto']} OBSOLETO, "
        f"{t['sem_frontmatter']} sem frontmatter."
    )

    if args.suspeitos:
        problematicos = [r for r in indice["registros"] if r["estado"] != VIGENTE]
        if not problematicos:
            print("[INDICE] Nenhum registro suspeito ou obsoleto.")
            return 0
        for r in problematicos:
            print(f"\n  [{r['estado']}] {r['arquivo']}")
            for motivo in r["motivos"]:
                print(f"      - {motivo}")
        # Listar suspeito nao e reprovar: quem reprova e o portao, no commit.
        return 0

    if not args.rebuild:
        ap.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
