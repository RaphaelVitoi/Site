"""
SEC-02 (auditoria de backend 2026-09-30): o endpoint que le o disco do projeto
nao bloqueava o diretorio de segredo que o proprio `docker-compose.yml` escolhe.

IDENTITY: O fecho do servico de arquivo, medido contra a configuracao real
PATH: tests/test_servico_de_arquivo_2026_09_30.py
ROLE: Provar que a lista de bloqueio cobre os MONTANTES do compose, e nao apenas
os literais que alguem lembrou de escrever.

O que aconteceu, medido: `docker-compose.yml:2-3` declara o segredo do gateway
como `.claude/secrets/auth_secret.txt`, e `docker-compose.yml:16` monta
`./.claude:/app/.claude`. A lista de bloqueio continha `.secrets` COM PONTO; o
diretorio do compose e `secrets`, SEM ponto. Nao casava. Executando a cadeia
exata de `handlers._is_sensitive_path` com o caminho do container, o arquivo
voltava servivel=SIM -- e o arquivo e o `AUTH_SECRET`, o mesmo que assina a
sessao NextAuth do produto.

A correcao declara o que o compose monta, e este teste deriva a lista do YAML.
Um volume novo no compose reprova aqui em vez de nascer coberto por acidente --
que e a razao pela qual A-01 (2026-09-29) existe, aplicada uma camada acima.
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

RAIZ = Path(__file__).resolve().parent.parent
COMPOSE = RAIZ / "docker-compose.yml"

#: Os mesmos literais que `api/v1/handlers.py` declara, copiados aqui DE
#: PROPITO: este teste mede o ARQUIVO, e nao o modulo. Se importasse a
#: constante, um `rm` dela reprovaria este teste e nao o de seguranca -- o
#: teste viraria tautologia, que e o modo de falha que a §13 da auditoria
#: proibe (achado confirmado por controle em outra camada).
_DIRETORIOS = {".git", ".secrets", ".ssh", ".gnupg", ".aws", "secrets", "queue"}
_SUFIXOS = {".pem", ".key", ".p12", ".pfx", ".keystore", ".jks", ".db", ".sqlite", ".sqlite3", ".lance"}
_NOMES = {"id_rsa", "id_ed25519", "id_ecdsa", "id_dsa", ".netrc", ".npmrc", ".pypirc"}


def _e_sensivel(caminho: Path) -> bool:
    """Replica a cadeia de `handlers._is_sensitive_path`, sem importar o modulo.

    A parte delicate e a normalizacao: o codigo faz `rstrip(". ")` em TODAS as
    partes, mas decide sobre o `name` ja normalizado e sobre o `suffix` do
    `Path` ORIGINAL. Reimplementar isso com o `Path` normalizado em ambos os
    lados daria outro verdicto em `.env.` -- que e o arquivo que o Windows
    abre como `.env`. A medicao abaixo fixa a mesma fronteira.

    `existe_como_diretorio` substitui o `file_path.is_dir()` do codigo: aqui o
    caminho e uma string de container (`/app/...`), que nao existe nesta
    maquina. `is_dir()` so decide a REGRA DO PROPRIO NOME, e o que o teste
    afirma sobre `/app/queue` e que o volume e um diretorio -- o que o compose
    declara ao montar. Para arquivo, a regra do proprio nome nao se aplica e o
    `is_dir()` real seria `False`, o mesmo veredito.
    """
    partes = [p.rstrip(". ").lower() for p in caminho.parts]
    nome = partes[-1] if partes else ""
    existe_como_diretorio = not caminho.suffix
    if any(p in _DIRETORIOS for p in partes[:-1]):
        return True
    if nome in _NOMES or caminho.suffix.lower() in _SUFIXOS:
        return True
    if nome in _DIRETORIOS and existe_como_diretorio:
        return True
    stem, _, ext = nome.partition(".")
    if ext.startswith("env") or stem in {"env", "_env"} or stem.endswith(("_env", "-env")):
        return not any(m in nome for m in (".example", ".sample", ".template", ".dist", ".tpl"))
    return False


def _montagens_do_compose() -> list[str]:
    """Caminhos montados no container, lidos do YAML -- nao hardcoded.

    O `lstrip("./")` e um caso de prova: ele come o PONTO do `.claude` e produz
    `claude`, que nao casa com a lista nem com o `.gitignore`. Foi a medicao
    (`.claude` e `.chroma_db` bloqueados) que denunciou o parser, e nao a
    regra. Prefixo de caminho remove-se pelo OPERADOR, nao por caractere.
    """
    dados = yaml.safe_load(COMPOSE.read_text(encoding="utf-8"))
    montados: list[str] = []
    for servico in (dados.get("services") or {}).values():
        for volume in servico.get("volumes") or []:
            origem = str(volume).split(":")[0]
            if origem.startswith("./"):
                origem = origem[2:]
            montados.append(origem)
    return montados


# ── SEC-02: o caminho que estava exposto ──────────────────────────────────────


def test_o_segredo_do_gateway_esta_bloqueado():
    """O achado. Este e o caminho que `/api/files/view` servia dentro do container."""
    caminho = Path("/app/.claude/secrets/auth_secret.txt")
    assert _e_sensivel(caminho), (
        ".claude/secrets/auth_secret.txt voltou a ser servivel: e o AUTH_SECRET "
        "montado por docker-compose.yml:2-3 e lido por /api/files/view"
    )


def test_o_estado_da_fila_esta_bloqueado():
    """`queue/tasks.db` tem prompts, respostas e metadata de cada tarefa."""
    assert _e_sensivel(Path("/app/queue/tasks.db")), "queue/tasks.db voltou a ser servivel"
    assert _e_sensivel(Path("/app/tasks.db")), "tasks.db na raiz voltou a ser servivel"


# ── A lista e derivada do compose, nao de memoria ─────────────────────────────


def test_todo_volume_de_segredo_do_compose_esta_bloqueado():
    """Fecha a classe inteira, e nao o caso medido.

    Um `volumes:` novo apontando para um diretorio de credencial precisa cair
    em lista de bloqueio pelo mesmo caminho. A excecao deliberada e o que
    NAO guarda segredo -- e ela precisa estar escrita aqui, para que growing
    de lista nao virereeze silencioso de protecao.
    """
    declarados: set[str] = set()
    for origem in _montagens_do_compose():
        caminho = Path("/app") / origem
        if not _e_sensivel(caminho):
            declarados.add(origem)

    # `.claude` e `.chroma_db` sao estado, nao credencial: seguem legiveis, que
    # e o que o operador espera ao abrir o visualizador de arquivos. `queue` e
    # estado da fila e `tasks.db` e o proprio banco -- os DOIS sao bloqueados
    # agora (SEC-02), e e por isso que `queue` e `tasks.db` NAO aparecem aqui.
    esperados_nao_bloqueados = {".claude", "data/chroma_db"}
    assert declarados <= esperados_nao_bloqueados, (
        f"volume do compose recem-criado e servido sem decisao registrada: {sorted(declarados)}"
    )


def test_o_segredo_do_compose_aponta_para_um_caminho_bloqueado():
    """O `secrets:` de topo do compose precisa cair em `secrets` da lista.

    Este teste amarra os dois lados: se o compose mudar o diretorio e a lista
    nao acompanhar, reprova aqui em vez de expor em producao.
    """
    declarados = (yaml.safe_load(COMPOSE.read_text(encoding="utf-8")) or {}).get("secrets") or {}
    caminhos = {str(v.get("file", "")).replace("./", "") for v in declarados.values() if isinstance(v, dict)}
    assert caminhos, "o compose nao declara mais nenhum secret de arquivo -- revisar a lista de bloqueio"
    for caminho in caminhos:
        assert _e_sensivel(Path("/app") / caminho), (
            f"o compose monta o segredo em {caminho}, e a lista de bloqueio nao o alcanca"
        )


# ── O que NAO pode regredir ──────────────────────────────────────────────────


@pytest.mark.parametrize(
    "caminho",
    [
        "/app/CLAUDE.md",
        "/app/pyproject.toml",
        "/app/.env.example",
        "/app/frontend/.env.example",
        "/app/.semgrep/guardian.yml.example",
        "/app/data/system_config.json",
    ],
)
def test_arquivo_legitimo_continua_servivel(caminho: str):
    """Fechar a lista sem fechar o arquivo e o modo de falha que renderia o
    visualizador inutil -- e foi assim que o operador perdeu acesso a dados
    legitimos em auditorias anteriores."""
    assert not _e_sensivel(Path(caminho)), f"{caminho} passou a ser bloqueado e o operador perde leitura"


def test_o_ponto_de_da_dot_e_descartado_antes_de_comparar():
    """O Windows descarta ponto e espaco finais ao abrir o arquivo.

    Medido no codigo real: `/app/.env.` e `/app/.env. ` caem na regra de
    ambiente pelo `name` normalizado. O `suffix` vem do `Path` original, mas a
    regra de ambiente decide pelo nome, entao a normalizacao basta -- e e por
    isso que `.env. ` nao escapa.
    """
    assert _e_sensivel(Path("/app/.env.")), "ponto final no nome escapa do bloqueio de ambiente"
    assert _e_sensivel(Path("/app/.env. ")), "espaco final no nome escapa do bloqueio de ambiente"
    assert _e_sensivel(Path("/app/.env.local.")), "variante real com ponto final passou a ser servivel"


def test_a_regra_de_ambiente_aceita_o_ponto_de_como_marcador():
    """`.env.example` continua legivel: e o contrato de quem precisa saber os
    NOMES das variaveis semler os valores."""
    assert not _e_sensivel(Path("/app/.env.example"))
    assert not _e_sensivel(Path("/app/.env.sample"))
    assert _e_sensivel(Path("/app/.env.local")), "variante real de ambiente passou a ser servivel"
