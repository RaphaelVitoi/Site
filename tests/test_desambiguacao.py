"""Guardas contra reintroducao de ambiguidade de roteamento, nome e indice.

Cada teste corresponde a uma ambiguidade real medida em 2026-08-21. Nenhuma foi
removida por "parecer redundante"  todas tiveram consumo verificado antes.
"""

from __future__ import annotations

import ast
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
MANIFESTO = RAIZ / "data" / "agents_manifest.json"
ROUTING_MAP = RAIZ / "data" / "routing_map.json"
SYSTEM_CONFIG = RAIZ / "data" / "system_config.json"
AGENTES_MD = RAIZ / ".claude" / "agents"


def _constantes_de_modelo(caminho: Path) -> dict[str, str]:
    """Extrai CONSTANTE = "literal-de-modelo" por AST, sem importar o modulo."""
    arvore = ast.parse(caminho.read_text(encoding="utf-8"))
    achados = {}
    for no in arvore.body:
        if isinstance(no, ast.Assign) and isinstance(no.value, ast.Constant):
            valor = no.value.value
            if isinstance(valor, str) and re.match(r"^(gemini|gemma|claude|gpt)[\w.\-/:]*$", valor):
                for alvo in no.targets:
                    if isinstance(alvo, ast.Name) and alvo.id.isupper():
                        achados[alvo.id] = valor
    return achados


#  Nome de constante: um nome, um valor, um lugar


def test_nenhuma_constante_de_modelo_duplicada_entre_modulos():
    """MODEL_GEMINI_FLASH existia em core/config.py ("gemini-3.5-flash-lite") e
    em task_executor.py ("gemini-2.0-flash"). Mesmo nome, valores diferentes,
    duas geracoes de distancia: importar do modulo errado dava o modelo errado
    sem nenhum sinal."""
    por_modulo = {
        p.relative_to(RAIZ).as_posix(): _constantes_de_modelo(p)
        for p in (RAIZ / "core" / "config.py", RAIZ / "task_executor.py")
    }
    vistos: dict[str, tuple[str, str]] = {}
    for modulo, consts in por_modulo.items():
        for nome, valor in consts.items():
            if nome in vistos:
                origem, outro = vistos[nome]
                raise AssertionError(f"{nome} duplicada: {origem}={outro!r} vs {modulo}={valor!r}")
            vistos[nome] = (modulo, valor)


def test_sem_constantes_sinonimas_com_valor_identico():
    """MODEL_GEMINI_FLASH e MODEL_GEMINI_FLASH_LITE tinham o MESMO valor
    dois nomes sugerindo uma distincao inexistente."""
    consts = _constantes_de_modelo(RAIZ / "core" / "config.py")
    por_valor: dict[str, list[str]] = {}
    for nome, valor in consts.items():
        por_valor.setdefault(valor, []).append(nome)
    colisoes = {v: n for v, n in por_valor.items() if len(n) > 1}
    assert not colisoes, f"nomes diferentes para o mesmo modelo: {colisoes}"


#  Roteamento: uma fonte por decisao


def test_preferencia_por_agente_tem_fonte_unica():
    """routing_map.json trazia um agent_map com zero consumidores que
    contradizia o manifesto em 3 agentes. A fonte viva e o manifesto, lido em
    engine/llm_api.py:528 e llm/orchestrator.py:147."""
    rm = json.loads(ROUTING_MAP.read_text(encoding="utf-8"))
    assert "agent_map" not in rm, "agent_map voltou  duplica o manifesto"
    manifesto = json.loads(MANIFESTO.read_text(encoding="utf-8"))
    assert all(a.get("model_preference") for a in manifesto.values())


def test_routing_map_declara_que_e_apenas_fallback():
    """core/config.py: MODEL_ROUTING = SYSTEM_CONFIG.get('model_routing',
    ROUTING_CONFIG). system_config vence; sem rotulo, os dois arquivos parecem
    igualmente autoritativos e divergem em silencio."""
    rm = json.loads(ROUTING_MAP.read_text(encoding="utf-8"))
    assert "_uso" in rm
    assert "FALLBACK" in rm["_uso"].upper()


def test_listas_de_roteamento_nao_divergiram():
    """Enquanto a duplicacao existir, ela precisa ser identica."""
    sc = json.loads(SYSTEM_CONFIG.read_text(encoding="utf-8")).get("model_routing", {})
    rm = json.loads(ROUTING_MAP.read_text(encoding="utf-8"))
    for chave in ("deep_thinking", "fast_operations"):
        assert sc.get(chave) == rm.get(chave), f"{chave} divergiu entre os dois arquivos"


#  Referencias: documentacao nao fixa modelo


def test_agentes_md_nao_fixam_modelo_literal():
    """Os 19 .claude/agents/*.md declaravam 'Motor Base: gemini-2.5-pro/flash'
     duas geracoes atras do manifesto. Documentacao que repete um valor
    versionado em outro lugar envelhece sem avisar."""
    obsoletos = []
    for f in AGENTES_MD.glob("*.md"):
        m = re.search(r"\*\*Motor Base:\*\*\s*`([^`]+)`", f.read_text(encoding="utf-8"))
        if m:
            obsoletos.append(f"{f.name}: {m.group(1)}")
    assert not obsoletos, f"Motor Base com literal de modelo: {obsoletos}"


def test_todo_agente_md_corresponde_a_um_agente_do_manifesto():
    """Indice e realidade tem de casar nos dois sentidos."""
    manifesto = set(json.loads(MANIFESTO.read_text(encoding="utf-8")))
    arquivos = {f.stem for f in AGENTES_MD.glob("*.md")}
    assert not (arquivos - manifesto), f"md sem agente: {sorted(arquivos - manifesto)}"
    assert not (manifesto - arquivos), f"agente sem md: {sorted(manifesto - arquivos)}"


def test_agentes_md_nao_estao_vazios():
    """Em 2026-08-21 os 19 arquivos foram encontrados com 0 bytes."""
    vazios = [f.name for f in AGENTES_MD.glob("*.md") if f.stat().st_size == 0]
    assert not vazios, f"arquivos de agente vazios: {vazios}"
