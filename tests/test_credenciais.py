"""Guarda de credencial sobre a ARVORE INTEIRA -- nao so sobre o diff.

O portao de ancora confere as linhas ADICIONADAS de cada commit. E o recorte
certo para um portao: reprovar por divida preexistente e o jeito mais rapido de
ser desligado. Mas ele nao responde "ha credencial rastreada NESTE repositorio
hoje?" -- e essa pergunta nao tem portao nenhum.

Este teste responde. E os padroes vem do MESMO arquivo que o portao le: os dois
viviam com copias separadas da lista, e duplicata de regra de seguranca diverge
por construcao -- quem acrescenta um padrao de um lado nao sabe do outro, e o
lado esquecido continua APROVANDO.

Medido em 2026-08-28, auditando o risco P0 declarado por outra sessao: zero
credencial em arquivo rastreado. As unicas materializadas em disco estao em
`Site/.env`, que NAO e rastreado e esta coberto pelo .gitignore.
"""

from __future__ import annotations

import json
from pathlib import Path
import re
import subprocess

RAIZ = Path(__file__).resolve().parent.parent
FONTE = RAIZ / "data" / "PADROES_DE_CREDENCIAL.json"

TEXTO = {
    ".py",
    ".ps1",
    ".psm1",
    ".md",
    ".json",
    ".yml",
    ".yaml",
    ".toml",
    ".txt",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".cmd",
    ".sh",
    ".cfg",
    ".ini",
    ".env",
    ".example",
    # MEDIDO em 2026-09-30: `.lock` nao era lido, e `.semgrep/guardian.yml.lock`
    # guardava um `refresh_token` de 25 chars em texto claro -- que nao expira por
    # conta propria. A varredura era cega exatamente no arquivo de cache de
    # sessao, que e onde token opaco costuma aparecer. A lista e por SUFIXO e
    # nao por diretorio: o padrao que decide e o do conteudo.
    ".lock",
}


def _fonte() -> dict:
    return json.loads(FONTE.read_text(encoding="utf-8"))


def _rastreados() -> list[str]:
    r = subprocess.run(["git", "ls-files"], cwd=RAIZ, capture_output=True, text=True, check=False)
    return [linha for linha in r.stdout.splitlines() if linha.strip()]


def test_a_fonte_de_padroes_existe_e_tem_conteudo():
    """Sem ela o portao PowerShell falha DURO, de proposito. Aqui, idem: uma
    varredura com zero padroes aprovaria tudo e pareceria verde."""
    assert FONTE.is_file(), f"fonte de padroes ausente: {FONTE}"
    fonte = _fonte()
    assert len(fonte["padroes"]) >= 6, "a lista de padroes encolheu"
    assert fonte["placeholders_conhecidos"], "sem placeholders, todo exemplo vira achado"


def test_o_portao_powershell_le_a_mesma_fonte():
    """Modulo que ninguem consome nao e integracao -- e aqui vale dobrado: se o
    portao voltar a ter a lista embutida, os dois lados divergem em silencio."""
    portao = (RAIZ / "scripts" / "ops" / "record_anchor_gate.ps1").read_text(encoding="utf-8-sig")
    assert "PADROES_DE_CREDENCIAL.json" in portao, "o portao nao le a fonte compartilhada"
    assert "$padroesCredencial = @{}" in portao, "o portao voltou a embutir a lista de padroes"


def test_o_portao_compara_com_sensibilidade_a_caixa():
    """Ler a mesma fonte nao basta: os dois lados tem de INTERPRETA-LA igual.

    O `-match` do PowerShell ignora caixa; o `re.compile` do Python nao. Durante
    2026-09-10 essa divergencia bloqueou um commit legitimo: um trecho base64 do
    relatorio Lighthouse (`...ccoYy8AiZaHQ3B...`) casou com o padrao de chave
    Google so por insensibilidade a caixa. Chave Google real comeca sempre por
    `AIza` literal.

    A duplicata de TEXTO ja tinha sido eliminada pela fonte compartilhada; esta
    era a duplicata de SEMANTICA, que nenhum teste via.
    """
    portao = (RAIZ / "scripts" / "ops" / "record_anchor_gate.ps1").read_text(encoding="utf-8-sig")
    assert "-cmatch $padroesCredencial" in portao, (
        "o portao compara credencial com -match (insensivel a caixa); use -cmatch para casar a semantica do lado Python"
    )
    assert "-match $padroesCredencial" not in portao.replace("-cmatch $padroesCredencial", ""), (
        "restou uma comparacao insensivel a caixa contra os padroes de credencial"
    )


# Mesma convencao de tests/test_sync_jules_redacao.py: o formato e real, o valor
# e SINTETICO. Nenhuma credencial real entra num arquivo de teste.
_CHAVE_SINTETICA_AQ = "AQ.Zz0QQ0" + "Q" * 44


def test_o_padrao_google_cobre_o_formato_aq():
    """A chave `AIza...` nao e o unico formato do Google, e o portao era cego.

    Medido em 2026-09-10: uma chave `AQ.Ab8...` real vivia em texto claro em 11
    manifestos deste ambiente e nenhum padrao a detectava. O mesmo portao havia
    bloqueado um commit legitimo por falso positivo em base64 -- ruido alto e
    cegueira no caso verdadeiro sao o mesmo defeito visto dos dois lados.
    """
    fonte = _fonte()
    padroes = {nome: re.compile(rx) for nome, rx in fonte["padroes"].items()}
    assert any("AQ" in nome for nome in padroes), "nenhum padrao cobre o formato AQ do Google"
    aq = padroes["Chave Google (formato AQ)"]
    assert aq.search(_CHAVE_SINTETICA_AQ)
    # precisao: nao pode casar base64, hash, url nem placeholder
    for inocente in (
        "ccoYy8AiZaHQ3BTkbk7trF04S7ecJ63W6oQ6pO0J3ZUt4p1KV",
        "a3b9de2f96fc95a8c31d1182697e41908358a7a318b1246ab",
        "https://stitch.googleapis.com/mcp",
        "YOUR_API_KEY",
        _CHAVE_SINTETICA_AQ[:19],
    ):
        assert not aq.search(inocente), f"falso positivo em {inocente[:24]}"


def test_o_padrao_google_nao_casa_variacao_de_caixa():
    """O falso positivo concreto de 2026-09-10, fixado como regressao."""
    fonte = _fonte()
    google = re.compile(fonte["padroes"]["Chave Google"])
    base64_do_lighthouse = "ccoYy8AiZaHQ3BTkbk7trF04S7ecJ63W6oQ6pO0J3ZUt4p1KV"
    assert not google.search(base64_do_lighthouse), (
        "o padrao passou a casar variacao de caixa e voltou a produzir falso positivo"
    )


def test_o_padrao_jwt_existe_e_casa_com_token_real():
    """SEC-01 (auditoria 2026-09-30): a fonte de padroes nao cobria `eyJ`.

    Medido antes da correcao: `grep -c 'eyJ' data/PADROES_DE_CREDENCIAL.json`
    contava ZERO. Um par de tokens Semgrep (`access_token` JWT de 911 chars +
    `refresh_token` de 25) vivia rastreado em `.semgrep/guardian.yml`, e este
    arquivo inteiro passava em VERDE.

    A forma do JWT e a mesma em qualquer emissor: tres segmentos base64url
    separados por ponto, o primeiro decodificando para um cabecalho JSON que
    comeca por `{"`. O que segue abaixo e a MESMA estrutura do token que estava
    no disco -- com o valor trocado, porque relatorio de credencial que repete
    a credencial e o proprio vazamento.
    """
    fonte = _fonte()
    padroes = {nome: re.compile(rx) for nome, rx in fonte["padroes"].items()}

    jwt = (
        "eyJhbGciOiJSUzI1NiIsImtpZCI6InNzb19vaWRjX2tleV9wYWlyXzExSldYWFpYNUhGRkZBQjFLQXBZWDhNUkEifQ"
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5fQ"
        ".c2lnbmF0dXJlLXBsYWNlaG9sZGVy"
    )
    jwt_rx = re.compile(padroes["JWT (token de sessao ou acesso)"].pattern)

    achados = [nome for nome, rx in padroes.items() if rx.search(jwt)]
    assert "JWT (token de sessao ou acesso)" in achados, (
        f"o padrao JWT deixou de casar com token de tres segmentos; casou so com: {achados}"
    )
    assert jwt_rx.search(jwt), "o padrao declarado na fonte nao casa com o token que ele descreve"


def test_o_padrao_de_refresh_token_existe_e_nao_casa_com_placeholder():
    """A segunda metade da lacuna: o token opaco de OAuth, e nao o JWT.

    `refresh_token` e o que mantem o par vivo: `access_token` expirou em
    2026-09-05, e o `refresh_token` nao expira por conta propria -- chamado, ele
    emite um `access_token` novo. Um padrao que so enxerga JWT nao ve esse.

    O valor aqui e SINTETICO e por isso mesmo esta em `placeholders_conhecidos`:
    um literal alfanumerico puro de 25 chars -- a forma exata do token real --
    seria reprovado por `test_nenhum_arquivo_rastreado_carrega_credencial`, que
    o classifica como segredo. Isso foi medido: a primeira versao deste teste
    plantou o valor em claro e o portao acusou o proprio teste. O portao estava
    certo; o teste e que devia carregar o marcador.
    """
    fonte = _fonte()
    rx = re.compile(fonte["padroes"]["Refresh token (par OAuth)"])
    placeholders = tuple(fonte["placeholders_conhecidos"])

    # O marcador tem que CASAR com o padrao -- e o que permite que um token de
    # teste em claro nao seja reprovado pela varredura de arvore inteira. Por
    # isso o criterio e "casa nos DOIS formatos", e nao "e alfanumerico": metade
    # dos placeholders historicos (your_key_here, CHANGEME) tem underscore e nao
    # casa. E `next()` sobre so um dos formatos pegaria `COLOQUE_A_NOVA_CHAVE_AQUI`
    # (que casa no formato `chave: valor` mas nao no JSON entre aspas) -- medido,
    # foi a primeira falha deste teste.
    def _casa_nos_dois(p: str) -> bool:
        return bool(rx.search(f"refresh_token: {p}")) and bool(rx.search(f'"access_token": "{p}"'))

    sintetico = next((p for p in placeholders if len(p) >= 20 and _casa_nos_dois(p)), None)
    assert sintetico is not None, (
        "nenhum marcador casa com token opaco nos dois formatos (YAML e JSON); "
        "um teste de padrao sem marcador reativa a reprovacao da varredura de arvore"
    )

    assert rx.search(f"refresh_token: {sintetico}"), "padrao nao casa com refresh_token opaco"
    assert rx.search(f'"access_token": "{sintetico}"'), "padrao nao casa com access_token em JSON"
    # O proprio arquivo de padroes contem o nome da chave: o que casar e PADRAO.
    metacaracteres = tuple(fonte["metacaracteres_que_denunciam_um_padrao"])
    achado = rx.search(fonte["padroes"]["Refresh token (par OAuth)"])
    assert achado is None or any(c in achado.group(0) for c in metacaracteres), (
        "o padrao de refresh_token casou com o proprio texto do padrao"
    )
    # O marcador precisa ser reconhecido pela varredura de arvore inteira, ou o
    # teste acima voltaria a reprovar a si mesmo.
    assert any(p in " ".join(placeholders) for p in placeholders), "placeholders vazio"


def test_a_varredura_le_lock_e_nao_so_yml():
    """A outra metade: o arquivo onde o refresh_token estava nao era lido.

    Acrescentar o padrao sem acrescentar a extensao deixaria o `.lock` passar
    em silencio -- que e como a lacuna sobreviveu a dois portoes. Este teste
    fixa a extensao, e a mutacao dele (remover `.lock` de TEXTO) reprova.
    """
    assert ".lock" in TEXTO, ".lock saiu da lista de extensoes lidas: o cache de sessao volta a ser cego"
    assert ".yml" in TEXTO, "a extensao .yml saiu da lista -- saneamento sem causa"


def test_nenhum_arquivo_rastreado_carrega_credencial():
    """A pergunta que nenhum portao fazia: ha credencial NESTE repositorio hoje?"""
    fonte = _fonte()
    padroes = {nome: re.compile(rx) for nome, rx in fonte["padroes"].items()}
    placeholders = tuple(fonte["placeholders_conhecidos"])
    # Credencial de verdade nao contem metacaractere de regex. E assim que o
    # proprio arquivo de padroes deixa de se denunciar -- sem isenta-lo, o que
    # criaria ponto cego no unico lugar que descreve os segredos.
    metacaracteres = tuple(fonte["metacaracteres_que_denunciam_um_padrao"])

    achados: list[str] = []
    lidos = 0
    for rel in _rastreados():
        caminho = RAIZ / rel
        if caminho.suffix.lower() not in TEXTO or not caminho.is_file():
            continue
        try:
            conteudo = caminho.read_text(encoding="utf-8-sig", errors="ignore")
        except OSError:
            continue
        lidos += 1
        for n, linha in enumerate(conteudo.splitlines(), 1):
            for nome, rx in padroes.items():
                m = rx.search(linha)
                if not m:
                    continue
                achado = m.group(0)
                if any(c in achado for c in metacaracteres):
                    continue  # e o padrao, nao o segredo
                if achado.startswith(placeholders) or any(p in linha for p in placeholders):
                    continue
                # O VALOR nunca entra no relatorio: relatorio de vazamento que
                # repete o segredo e o proprio vazamento.
                achados.append(f"{rel}:{n} tipo={nome} <{len(achado)} chars>")

    assert lidos > 100, f"a varredura leu so {lidos} arquivos -- recorte quebrado, resultado vazio"
    assert not achados, "credencial em arquivo RASTREADO:\n  " + "\n  ".join(achados)


def test_o_env_com_credencial_nao_e_rastreado():
    """`Site/.env` tem chave materializada em texto claro. O que impede que ela
    vaze para o historico e o .gitignore -- entao o .gitignore e que se testa."""
    env = RAIZ / ".env"
    if not env.is_file():
        return  # nao ha .env nesta arvore (clone limpo, worktree): nada a proteger
    ignorado = subprocess.run(["git", "check-ignore", "-q", ".env"], cwd=RAIZ, capture_output=True, check=False)
    assert ignorado.returncode == 0, ".env deixou de ser ignorado pelo git"
    rastreado = subprocess.run(
        ["git", "ls-files", "--error-unmatch", ".env"], cwd=RAIZ, capture_output=True, check=False
    )
    assert rastreado.returncode != 0, ".env foi RASTREADO -- credencial entrou no historico"
