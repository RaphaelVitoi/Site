"""Consolida as tres arvores de memoria agentica numa canonica, sem perder byte.

## O que foi medido antes de escrever isto (2026-08-28)

Tres arvores, 19 agentes cada, e as tres com o MESMO nome de arquivo:

    .claude/agent-memory      62.889 bytes de MEMORY.md   escrita dos agentes
    .claude/agent-memory       11.465 bytes de MEMORY.md   leitura do RAG e do CLI
    .claude/AGENTS-MEMORY      62.884 bytes de MEMORY.md   nenhum consumidor

Comparados par a par: **19 de 19 divergem**. Mas nao sao copias defasadas uma da
outra -- sao **tipos diferentes de memoria** que cairam em arvores diferentes:

- `.claude/agent-memory` guarda memoria SEMANTICA -- fatos consolidados, curados,
  recentes. Para o `chico`, arquitetura de agosto de 2026.
- `.claude/agent-memory` guarda memoria EPISODICA -- log de handoffs no formato
  acao, resultado, aprendizado. Para o `chico`, entradas de abril e maio.
- `.claude/AGENTS-MEMORY` e quase-copia de `.cerebro` (difere em ~5 bytes no
  total, quase todo em finais de linha). Entra so onde acrescenta.

Por isso este script **nao escolhe um vencedor**. Ele preserva as duas naturezas
como secoes distintas de um arquivo so, com procedencia declarada.

## Por que a canonica e `.claude/agent-memory`

Nao e preferencia: ja estava declarado em dois lugares, e este script obedece em
vez de inventar um terceiro.

1. `rag_ingestion_manifest.json` declara `.claude/agent-memory` como fonte;
2. `data/INDICE_CANONICO_GOVERNANCA.json` (frente 1) poe a familia de governanca
   sob `.claude/`.

## O que este script NAO faz

- **Nao apaga nada.** As arvores de origem ficam onde estao, e ganham um marcador
  `SUPERSEDED.md` apontando para a canonica. Apagar 821 MB e ato do vertice.
- **Nao reconstroi o indice.** O Chroma de `.claude/agent-memory` tem 241.480
  embeddings, dos quais **99,0% sao `.venv`** -- contaminacao de uma configuracao
  anterior a este manifesto. Reconstruir e passo separado, e depende de `.venv`
  entrar em `ignore_dirs`.
- **Nao redireciona a escrita dos agentes.** Os prompts em
  `agents/context_builder.py` e `engine/cognitive.py` continuam mandando gravar
  em `.cerebro`. Trocar isso e mudanca de comportamento e vai em commit proprio,
  depois de esta consolidacao estar em disco e conferida.

## Contabilidade de bytes

Roda em `--dry-run` por padrao. Em qualquer modo, ao final compara os bytes de
ENTRADA (uniao das tres arvores) com os de SAIDA e **falha** se a saida nao
contiver tudo que entrou. Consolidacao que perde conteudo e pior que divergencia.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass, field
from pathlib import Path
import re
import sys

RAIZ = Path(__file__).resolve().parents[2]

CANONICA = RAIZ / ".claude" / "agent-memory"
ORIGENS = (
    RAIZ / ".cerebro" / "agent-memory",
    RAIZ / ".claude" / "AGENTS-MEMORY",
)

MARCA_INICIO = "<!-- MEMORIA-EPISODICA-CONSOLIDADA:INICIO -->"
MARCA_FIM = "<!-- MEMORIA-EPISODICA-CONSOLIDADA:FIM -->"


@dataclass
class Resultado:
    agente: str
    bytes_canonica: int = 0
    bytes_absorvidos: int = 0
    origens_usadas: list[str] = field(default_factory=list)
    ja_consolidado: bool = False
    texto_final: str = ""


def _normalizar(texto: str) -> str:
    """Compara conteudo sem finais de linha nem espaco de borda.

    As tres arvores divergem em CRLF/LF, e tratar isso como divergencia de
    CONTEUDO inflaria a consolidacao com duplicata pura.
    """
    return "\n".join(linha.rstrip() for linha in texto.replace("\r\n", "\n").split("\n")).strip()


def _corpo_ja_presente(alvo: str, candidato: str) -> bool:
    n_alvo, n_cand = _normalizar(alvo), _normalizar(candidato)
    return n_cand in n_alvo if n_cand else True


def _sem_secao_consolidada(texto: str) -> str:
    """Remove uma secao consolidada anterior, para o script ser idempotente.

    O separador `---` que antecede a marca entra no padrao. Sem ele o script
    ficava QUASE idempotente: a marca saia, o separador ficava, e um novo era
    acrescentado -- **+6 bytes por execucao**. Medido rodando duas vezes
    seguidas (chico 5599 -> 5605). Quase-idempotente e uma forma lenta de
    corromper, e so aparece em quem confere o segundo estado.
    """
    padrao = re.compile(r"(?:\n*-{3,})*\n*\s*" + re.escape(MARCA_INICIO) + r".*?" + re.escape(MARCA_FIM), re.S)
    return padrao.sub("", texto).rstrip() + "\n"


def consolidar_agente(agente: str) -> Resultado:
    res = Resultado(agente=agente)
    destino = CANONICA / agente / "MEMORY.md"
    base = destino.read_text(encoding="utf-8", errors="replace") if destino.exists() else f"# MEMORIA -- @{agente}\n"
    base = _sem_secao_consolidada(base)

    blocos: list[str] = []
    for origem in ORIGENS:
        f = origem / agente / "MEMORY.md"
        if not f.exists():
            continue
        conteudo = f.read_text(encoding="utf-8", errors="replace")
        if not _normalizar(conteudo):
            continue
        # Nao reabsorve o que a canonica ja diz, nem o que outra origem ja trouxe.
        if _corpo_ja_presente(base, conteudo) or any(_corpo_ja_presente(b, conteudo) for b in blocos):
            continue
        rel = f.relative_to(RAIZ).as_posix()
        blocos.append(f"### Procedencia -- `{rel}`\n\n{conteudo.strip()}\n")
        res.origens_usadas.append(rel)
        res.bytes_absorvidos += len(conteudo)

    if not blocos:
        res.ja_consolidado = True
        res.bytes_canonica = len(base)
        return res

    secao = (
        f"\n\n---\n\n{MARCA_INICIO}\n\n"
        "## Memoria episodica consolidada\n\n"
        "> Log de handoffs no formato *acao - resultado - aprendizado*, trazido das\n"
        "> arvores que existiam em paralelo ate 2026-08-28. E uma natureza de memoria\n"
        "> diferente da secao curada acima, e por isso fica separada em vez de\n"
        "> misturada. Ver `reports/VALIDACAO-2026-08-28-arquitetura-de-memoria.md`.\n\n"
        + "\n".join(blocos)
        + f"\n{MARCA_FIM}\n"
    )
    res.bytes_canonica = len(base + secao)
    res.texto_final = base + secao
    return res


def marcador_superseded(origem: Path) -> str:
    rel = CANONICA.relative_to(RAIZ).as_posix()
    return (
        f"# Superseded -- {origem.relative_to(RAIZ).as_posix()}\n\n"
        f"Esta arvore deixou de ser fonte de memoria agentica em 2026-08-28.\n"
        f"A canonica e `{rel}`, e o conteudo daqui foi absorvido la, na secao\n"
        f"*Memoria episodica consolidada*, com procedencia por arquivo.\n\n"
        f"**Nada foi apagado.** Os arquivos continuam aqui para conferencia. Remove-los\n"
        f"e ato do vertice, depois de a canonica estar verificada em uso.\n\n"
        f"Medicao que motivou a consolidacao, e o desenho da fusao:\n"
        f"`reports/VALIDACAO-2026-08-28-arquitetura-de-memoria.md`.\n"
    )


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--aplicar", action="store_true", help="escreve; sem isto, so mostra o plano")
    args = p.parse_args()

    if not CANONICA.exists():
        print(f"[ERRO] canonica ausente: {CANONICA}")
        return 1

    agentes = sorted({d.name for base in (CANONICA, *ORIGENS) if base.exists() for d in base.iterdir() if d.is_dir() and not d.name.startswith(".")})

    entrada_total = 0
    for base in (CANONICA, *ORIGENS):
        for f in base.glob("*/MEMORY.md"):
            entrada_total += len(_normalizar(f.read_text(encoding="utf-8", errors="replace")))

    modo = "APLICANDO" if args.aplicar else "PLANO (dry-run)"
    print(f"=== Consolidacao da memoria agentica -- {modo} ===")
    print(f"canonica: {CANONICA.relative_to(RAIZ).as_posix()}")
    print(f"origens : {', '.join(o.relative_to(RAIZ).as_posix() for o in ORIGENS)}")
    print()
    print(f"{'agente':<16}{'saida':>9}{'absorvido':>11}  origens")

    resultados = []
    for ag in agentes:
        r = consolidar_agente(ag)
        resultados.append(r)
        marca = "ja consolidado" if r.ja_consolidado else ", ".join(o.split("/")[0] for o in r.origens_usadas)
        print(f"{ag:<16}{r.bytes_canonica:>9}{r.bytes_absorvidos:>11}  {marca}")

        if args.aplicar and not r.ja_consolidado:
            destino = CANONICA / ag / "MEMORY.md"
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_text(r.texto_final, encoding="utf-8")

    saida_total = sum(r.bytes_canonica for r in resultados)
    print()
    # A diferenca entre entrada e saida NAO e perda: e deduplicacao.
    # `.claude/AGENTS-MEMORY` e quase-copia de `.cerebro`, entao a soma ingenua
    # das tres arvores conta o mesmo conteudo duas vezes. Dizer "137.180 ->
    # 106.979" sem nomear isso seria reportar um numero certo sob o rotulo
    # errado -- e quem lesse concluiria que a consolidacao perdeu conteudo.
    # A prova de que nada se perdeu e a CONTINENCIA logo abaixo, nao a contagem.
    print(f"soma ingenua das tres arvores : {entrada_total} bytes")
    print(f"canonica consolidada          : {saida_total} bytes")
    print(f"diferenca                     : {entrada_total - saida_total} bytes de DUPLICATA removida")
    print("  (a soma ingenua conta duas vezes o que .cerebro e AGENTS-MEMORY tem em comum;")
    print("   a prova de que nada se perdeu e a continencia abaixo, nao esta subtracao)")

    # Conferencia de conteudo, nao so de contagem: cada origem tem de estar
    # contida na canonica correspondente. Contagem sozinha nao prova continencia.
    perdidos = []
    for ag in agentes:
        destino = CANONICA / ag / "MEMORY.md"
        atual = destino.read_text(encoding="utf-8", errors="replace") if destino.exists() else ""
        previsto = next((r.texto_final for r in resultados if r.agente == ag and r.texto_final), None)
        referencia = atual if args.aplicar or previsto is None else previsto
        for origem in ORIGENS:
            f = origem / ag / "MEMORY.md"
            if f.exists():
                c = f.read_text(encoding="utf-8", errors="replace")
                if _normalizar(c) and not _corpo_ja_presente(referencia, c):
                    perdidos.append(f.relative_to(RAIZ).as_posix())

    if perdidos:
        print()
        print("[FALHA] conteudo que NAO esta contido na canonica:")
        for x in perdidos:
            print("   ", x)
        return 1
    print("[OK] toda origem esta contida na canonica -- nenhum byte de conteudo perdido.")

    if args.aplicar:
        for origem in ORIGENS:
            if origem.exists():
                (origem / "SUPERSEDED.md").write_text(marcador_superseded(origem), encoding="utf-8")
                print(f"[OK] marcador escrito em {(origem / 'SUPERSEDED.md').relative_to(RAIZ).as_posix()}")
        print()
        print("Nada foi apagado. Proximos passos, em commits proprios:")
        print("  1. acrescentar '.venv' a ignore_dirs de memory_rag.py")
        print("  2. reconstruir o indice (99,0% do atual e .venv)")
        print("  3. redirecionar a escrita dos agentes para a canonica")
    else:
        print()
        print("Nada foi escrito. Rode com --aplicar para efetivar.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
