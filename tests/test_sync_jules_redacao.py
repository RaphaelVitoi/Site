"""O relatorio do Jules nao pode republicar segredo que veio no prompt.

O VAZAMENTO MEDIDO, E POR QUE SANEAR O .md NAO RESOLVE:

    `sync_jules_report.py` republica o PROMPT ORIGINAL de cada sessao no
    JULES_REPORT.md versionado. Em 2026-09-03 uma sessao foi criada colando o
    `settings.json` inteiro do Antigravity IDE como prompt -- e aquele arquivo
    carregava `agenticAssistant.geminiApiKey` e `qwen-code.apiKey`.

    O resultado foi commitado e empurrado: quatro ocorrencias de duas chaves
    distintas em texto claro, em `origin/master`.

    O PROMPT VIVE DO LADO DO GOOGLE JULES. Editar o .md a mao apaga a copia e
    deixa a fonte intacta -- a proxima sincronizacao traz a chave de volta. Por
    isso a correcao e no GERADOR, no ponto em que o texto de terceiro cruza a
    fronteira para dentro de um arquivo versionado.

O QUE ESTA FUNCAO NAO E: um cofre. Ela nao impede que um segredo exista, nem
substitui a revogacao -- chave que apareceu em texto claro esta comprometida e
tem de ser trocada. Ela impede a REPUBLICACAO, que e o unico ponto sob controle
deste repositorio.
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location(
    "sync_jules_report", RAIZ / "scripts" / "ops" / "sync_jules_report.py"
)
assert _spec and _spec.loader
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)

redigir_segredos = _mod.redigir_segredos

# Formato real das chaves que vazaram (prefixo AQ. + corpo longo). O valor abaixo
# e SINTETICO -- nenhuma credencial real entra num arquivo de teste.
_CHAVE_SINTETICA = "AQ.Xy9RN0ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ"


def test_a_chave_no_json_do_prompt_nao_atravessa():
    """O caso exato que vazou: settings.json colado como prompt."""
    prompt = f'  "agenticAssistant.geminiApiKey": "{_CHAVE_SINTETICA}",'

    saida = redigir_segredos(prompt)

    assert _CHAVE_SINTETICA not in saida
    assert "REDIGIDO" in saida


def test_a_chave_do_qwen_tambem_nao():
    """A segunda chave do mesmo vazamento, com nome de campo diferente."""
    prompt = f'  "qwen-code.apiKey": "{_CHAVE_SINTETICA}"'

    assert _CHAVE_SINTETICA not in redigir_segredos(prompt)


def test_o_nome_do_campo_sobrevive_a_redacao():
    """Redigir o VALOR, nao a linha.

    Saber QUE havia uma chave ali e informacao de auditoria; saber QUAL era e o
    vazamento. Apagar a linha inteira destruiria a primeira para conter a
    segunda.
    """
    saida = redigir_segredos(f'"qwen-code.apiKey": "{_CHAVE_SINTETICA}"')

    assert "qwen-code.apiKey" in saida


def test_texto_sem_segredo_atravessa_intacto():
    """Redacao que reescreve prompt comum tornaria o relatorio inutil."""
    prompt = "Bolt: otimizar ordenacao em frontend/src/lib/telemetry-client.ts"

    assert redigir_segredos(prompt) == prompt


def test_atribuicao_de_env_em_texto_claro_nao_atravessa():
    """Prompt de shell tambem carrega credencial, e nao tem aspas de JSON."""
    prompt = f"export STITCH_API_KEY={_CHAVE_SINTETICA}"

    assert _CHAVE_SINTETICA not in redigir_segredos(prompt)


def test_a_redacao_e_aplicada_em_multiplas_linhas():
    """Um settings.json inteiro traz varias chaves; nenhuma pode escapar."""
    prompt = "\n".join(
        [
            '  "editor.inlayHints.enabled": "on",',
            f'  "agenticAssistant.geminiApiKey": "{_CHAVE_SINTETICA}",',
            '  "qwen-code.provider": "api-key",',
            f'  "qwen-code.apiKey": "{_CHAVE_SINTETICA}"',
        ]
    )

    saida = redigir_segredos(prompt)

    assert _CHAVE_SINTETICA not in saida
    assert saida.count("REDIGIDO") == 2
    # o que nao e segredo continua legivel
    assert '"qwen-code.provider": "api-key"' in saida


def test_valor_curto_num_campo_de_chave_nao_e_confundido_com_segredo():
    """`"provider": "api-key"` tem 'key' no nome e NAO e credencial.

    Redigir por nome de campo sozinho transformaria configuracao legivel em
    ruido. O discriminante e o valor ter forma de segredo.
    """
    prompt = '"qwen-code.provider": "api-key"'

    assert redigir_segredos(prompt) == prompt


def test_o_relatorio_publicado_nao_contem_chave_em_texto_claro():
    """Guarda de regressao sobre o ARTEFATO, nao so sobre a funcao.

    Este teste falha se alguem reintroduzir a chave no arquivo versionado --
    por sincronizacao sem redacao, por edicao manual ou por revert.
    """
    relatorio = RAIZ / "JULES_REPORT.md"
    if not relatorio.exists():
        return

    texto = relatorio.read_text(encoding="utf-8", errors="replace")
    achados = _mod.CHAVES_SUSPEITAS.findall(texto)

    assert not achados, (
        f"{len(achados)} credencial(is) em texto claro em JULES_REPORT.md. "
        "Sanear o arquivo NAO basta: verifique se redigir_segredos roda no gerador."
    )
