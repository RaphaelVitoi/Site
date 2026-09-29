"""O elo entre a politica declarada e a politica aplicada.

Medido em 2026-09-29. `governance/autonomy.yaml` declara 5 modos, 4 familias
de politica e uma lista de `protected_paths`. A auditoria perguntou se o runtime
consome esse arquivo — a resposta e **nao**, e a resposta importa mais que o
defeito:

- `agents/autonomy.py` nao importa `yaml` e nao menciona `autonomy.yaml`.
- As duas listas que *sao* aplicadas — `forbidden_tokens` e
  `state_changing_commands` — existem **hardcoded** dentro de
  `_validate_command`, como literais Python.
- `protected_paths`, `approval_gates`, `write_rules` e
  `privileged_agent_classes` nao tem enforcement em nenhum `.py` do repositorio.

Ou seja: existe uma politica escrita que parece normativa, declara
`deny_state_changing_commands`, e nao é consultada por nada. E a mesma classe de
falha do `KERNEL.md` dual: arquivo com aparencia de autoridade que ninguem
executa.

Este arquivo **nao** liga o YAML ao runtime, e cada teste abaixo diz por que.
A ligacao foi avaliada e rejeitada por medicao — as tres razoes estao no
teste que correspondem. A correcao possivel e de um artefato so:

1. O YAML tinha `format ` (espaco final) para casar com o Python. **YAML
   descarta espacos finais de escalar nao-quotado** — o autor escreveu a
   intencao certa e a linguagem comeu o espaco. Corrigido com aspas.
2. A divergencia fica presa por teste, com a intencao declarada em comentario.
3. O mapa de enforcement real fica gravado, para o proximo que ler o YAML
   saber o que ele promete e o que o codigo faz.

Regra que este arquivo instancia: **medir antes de religar**. A tentacao era
"fonte unica de verdade = YAML". Medindo, a fonte unica seria um arquivo cujo
token `format` bloquearia `npm run format` — um comando oficial do `package.json`.
"""

from __future__ import annotations

import ast
from pathlib import Path

import pytest
import yaml

RAIZ = Path(__file__).resolve().parent.parent
YAML_POLICY = RAIZ / "governance" / "autonomy.yaml"
AUTONOMY_PY = RAIZ / "agents" / "autonomy.py"

# As duas listas que o runtime REALMENTE aplica. Toda lista no YAML que nao
# estiver aqui nao e aplicada por ninguem — e a lista completa do que e
# aplicado, nao uma amostra.
LISTAS_APLICADAS = ("forbidden_tokens", "state_changing_commands")


def _listas_no_codigo(nome: str) -> list[str]:
    """Extrai a lista do literal Python, sem executar o modulo.

    `ast.literal_eval` em vez de regex: o arquivo pode trocar de aspas ou de
    layout, e um guard que quebra na reformatação deixa de proteger.
    """
    arvore = ast.parse(AUTONOMY_PY.read_text(encoding="utf-8"))
    for no in ast.walk(arvore):
        if not isinstance(no, ast.Assign):
            continue
        if not any(isinstance(t, ast.Name) and t.id == nome for t in no.targets):
            continue
        if isinstance(no.value, ast.List):
            return [ast.literal_eval(e) for e in no.value.elts]
    raise AssertionError(f"{AUTONOMY_PY.name}: literal `{nome}` nao encontrado")


def _listas_no_yaml(nome: str) -> list[str]:
    dados = yaml.safe_load(YAML_POLICY.read_text(encoding="utf-8-sig"))
    return list(dados["command_policies"][nome])


# --- 1. a divergencia que a linguagem escondeu --------------------------------


@pytest.mark.unit
def test_yaml_nao_perde_espaco_final_de_token() -> None:
    """O bug real: `- format ` vira `- format` e bloqueia `npm run format`.

    O espaco final e **semantico**. Ele distingue o comando destrutivo
    `format c:` de `npm run format` e de `ruff format --check .`, que sao
    comandos legítimos do próprio repositorio. Um escalar YAML nao-quotado tem
    o espaco final aparado pelo parser, de modo que a intencao do autor — casar
    com o literal Python — se perde sem erro, sem aviso e sem diff.

    Custo real da ligacao ingênua do YAML ao runtime: um `format` sem espaco
    reprova um comando oficial do `package.json` em modo `partial`.
    """
    brutos = YAML_POLICY.read_text(encoding="utf-8-sig")
    if "- format" not in brutos:
        return  # token reformulado; a checagem de drift abaixo cobre

    assert "- 'format '" in brutos or '- "format "' in brutos, (
        "governance/autonomy.yaml tem `- format ` sem aspas. YAML apara o "
        "espaco final do escalar nao-quotado, e o token passa a casar com "
        "`npm run format` — comando oficial do repositorio. Quote: `- 'format '`."
    )
    assert "format " in _listas_no_yaml("forbidden_tokens"), (
        "o token `format` perdeu o espaco final ao ser parseado. O espaco e "
        "semantico: sem ele, `npm run format` e reprovado como destrutivo."
    )


@pytest.mark.unit
@pytest.mark.parametrize("nome", LISTAS_APLICADAS)
def test_lista_declarada_e_lista_aplicada_nao_divergem(nome: str) -> None:
    """A lista do YAML e a lista do Python precisam ser o mesmo conjunto.

    Sao duas fontes para a mesma politica, e hoje nao ha nada que as amarre —
    a unica razao de nao haver divergencia maior e que ninguem editou nenhuma
    das duas. Divergencia aqui e falha de seguranca silenciosa: mudar o YAML
    para afrouxar uma regra nao muda nada, e o leitor acredita que mudou.
    """
    declarado = _listas_no_yaml(nome)
    aplicado = _listas_no_codigo(nome)
    assert sorted(declarado) == sorted(aplicado), (
        f"divergencia em `{nome}`.\n"
        f"  governance/autonomy.yaml: {declarado}\n"
        f"  agents/autonomy.py     : {aplicado}\n"
        "A lista aplicada e a que vale. Ou corrija o YAML para casar, ou "
        "corrija o codigo — mas nao deixe as duas divergentes: o YAML nao "
        "e lido por ninguem, e quem edita o YAML edita um documento inerte."
    )


# --- 2. o que o YAML promete e o que o codigo faz -----------------------------


@pytest.mark.unit
def test_o_yaml_nao_e_consumido_e_por_iso_nao_pode_ser_tratado_como_politica() -> None:
    """Fixa o estado atual, que e a razao de o YAML nao ser autoridade.

    A verificacao e por **uso**, nao pelo nome do arquivo: a primeira versao
    deste teste procurava a literal `autonomy.yaml` no fonte, e passou
    batido com `import yaml` no modulo. Carregar YAML nao exige nomear o
    arquivo — `yaml.safe_load(open(p))` consome a politica sem nunca escrever
    o nome dela. Um guard que so le string cobre o caso obvio e deixa o
    proprio.

    Se este teste quebrar porque `autonomy.py` passou a ler o YAML, o
    elegivel passou a ser verdadeiro — e a proxima acao **nao** e
    simplesmente remover o teste: e revisar se a ligacao introduziu
    divergencia, que era o motivo de ela ter sido rejeitada.
    """
    arvore = ast.parse(AUTONOMY_PY.read_text(encoding="utf-8"))
    usa_yaml = any(
        (isinstance(no, ast.Name) and no.id == "yaml")
        or (isinstance(no, ast.Attribute) and no.attr.startswith("yaml."))
        or (isinstance(no, ast.alias) and (no.name or "").split(".")[0] == "yaml")
        for no in ast.walk(arvore)
    )
    assert not usa_yaml, (
        "agents/autonomy.py passou a usar YAML. Se a intencao e carregar "
        "autonomy.yaml, revise antes: (1) `protected_paths` inclui "
        "`governance` e `scripts` — ativa-lo bloqueia manutencao de "
        "governanca; (2) o modo `sandbox` nao chama `_validate_command`, "
        "entao `deny_state_changing_commands: true` nao se aplica nele; "
        "(3) `full_restricted` e retornado por `_resolve_effective_mode` e "
        "nao existe no YAML. Ver KERNEL.md §3."
    )


@pytest.mark.unit
def test_o_modo_sandbox_nao_passa_pela_validacao_de_comando() -> None:
    """`sandbox` promete no YAML o que o codigo nao faz.

    O YAML diz `sandbox.deny_state_changing_commands: true`. No codigo, o ramo
    de `sandbox` dentro de `_execute_commands` desvia para
    `_run_sandboxed_command()` e **continua** — `_validate_command` nunca e
    chamado nesse ramo. A lista de comandos que alteram estado e a denylist de
    tokens destrutivos nao sao avaliadas. O isolamento vem do container
    (`--network bridge`, `no-new-privileges`, `cap-drop ALL`), nao da validacao.

    A busca e pela **AST**, dentro de `_execute_commands`, e nao por regex no
    fonte: o modulo tem **dois** ramos `effective_mode == "sandbox"` — este, e
    o de `_forge_files`, que bloqueia escrita em disco. A primeira versao deste
    teste casou no primeiro e deu verde com o desvio de comando intacto.
    Passar com o defeito presente e pior que reprovar sem defeito: o guard
    vira decoracao, e quem confia nele acredita numa coisa que nao foi medida.

    Nao e bug a corrigir aqui: sandbox e o modo mais restritivo, e trocar a
    semantica de execucao e decisao de Raphael (Tier 0). E um fato que
    precisa estar escrito, porque o YAML afirma o contrario.
    """
    fonte = AUTONOMY_PY.read_text(encoding="utf-8")
    arvore = ast.parse(fonte)
    fn = next(n for n in ast.walk(arvore) if getattr(n, "name", None) == "_execute_commands")

    def _e_o_ramo_sandbox(node: ast.AST) -> bool:
        return (
            isinstance(node, ast.If)
            and isinstance(node.test, ast.Compare)
            and isinstance(node.test.left, ast.Name)
            and node.test.left.id == "effective_mode"
            and any(isinstance(c, ast.Constant) and c.value == "sandbox" for c in node.test.comparators)
        )

    # Casa no *valor* comparado, e no texto do fonte: `ast.unparse`
    # normaliza aspas, e uma guarda que casa em `"sandbox"` deixa de casar
    # assim que alguem escrever `'sandbox'` — que e exatamente o que o
    # unparse devolve. Guard que depende de grafia e guard que some.
    ramos = [no for no in ast.walk(fn) if _e_o_ramo_sandbox(no)]
    assert len(ramos) == 1, (
        f"o ramo sandbox de _execute_commands mudou de forma: {len(ramos)} "
        "candidatos. Reveja o mapa de enforcement em KERNEL.md §3 e ajuste "
        "este teste ao fluxo real."
    )

    corpo = "\n".join(ast.unparse(s) for s in ramos[0].body)
    assert "_validate_command" not in corpo, (
        "o modo `sandbox` passou a validar comando em `_execute_commands`. "
        "Se for intencional, atualize `sandbox.deny_state_changing_commands` "
        "no YAML e o §3 do KERNEL.md, que hoje descrevem o fluxo antigo."
    )


@pytest.mark.unit
def test_full_restricted_e_retornado_mas_nao_declarado() -> None:
    """Um modo que o runtime produz e que a politica nao descreve.

    `_resolve_effective_mode` devolve `full_restricted` para `@maverick`
    quando o modo global e `full`, e `LEGACY_MODE_MAP`/`VALID_AUTONOMY_MODES`
    nao o include — ele so existe como valor intermediario, nunca como estado
    persistido. O YAML tambem nao o declara. Divergencia entre o espaco de
    estados do codigo e o do documento.

    Nao ha bug de execucao: `full_restricted` nunca passa por
    `get_autonomy_mode`, que e quem valida contra `VALID_AUTONOMY_MODES`. Ha
    um buraco de documentacao, e buraco de documentacao em politica de
    autonomia e onde nasce permissao acidental.
    """
    codigo = AUTONOMY_PY.read_text(encoding="utf-8")
    assert '"full_restricted"' in codigo, (
        "o modo intermediario `full_restricted` saiu do codigo; o YAML nunca o declarou e nao ha nada a atualizar."
    )
    dados = yaml.safe_load(YAML_POLICY.read_text(encoding="utf-8-sig"))
    modos = set(dados["modes"])
    assert "full_restricted" not in modos, (
        "o YAML passou a declarar `full_restricted`. O runtime produz esse "
        "modo para `@maverick` em modo `full`; se a declaracao for nova, "
        "confirme as capacidades antes de declarar — politica de autonomia nao "
        "se declara por simetria."
    )


# --- 3. o que o YAML declara e ninguem executa --------------------------------


@pytest.mark.unit
@pytest.mark.parametrize(
    "chave",
    ["protected_paths", "approval_gates", "write_rules", "privileged_agent_classes"],
)
def test_politica_declarada_e_nao_aplicada(chave: str) -> None:
    """Documenta o alcance real da lacuna, chave por chave.

    Estas quatro familias nao tem enforcement em nenhum `.py` do repositorio.
    O teste **nao exige que passem a ser aplicadas** — ativar `protected_paths`
    bloquearia a propria manutencao de `governance/`, e mudar o que pode ser
    executado e decisao de Raphael (Tier 0), nao conclusao de auditoria.

    O que o teste faz e impedir que a lacuna vire esquecimento: se um dia
    `protected_paths` passar a ter enforcement, este teste avisa que o resto
    da politica declarada precisa de revisao junto, porque ativar uma chave
    isolada sem as outras produz exatamente a politica que ninguem escreveu.

    A busca e pelo **nome da chave** em qualquer modulo, e nao por um simbolo
    derivado: enforcement real significa carregar a chave do YAML, e quem
    carrega precisa escrever o nome dela em algum ponto. A primeira versao
    procurava um termo mais especifico e nao via um `PROTECTED = [...]`
    hardcoded — que e enforcement sem estar ligado a politica, e por isso
    segue sem reprovar: o defeito que este teste caça e a chave virando
    fonte de verdade, nao uma lista nova no codigo.
    """
    # Escopo: `agents/`, `core/`, `cli/`, `database/`, `llm/`, `engine/`,
    # `scripts/`. Um `rglob("*.py")` no repositorio inteiro varre tambem
    # `.venv`, `node_modules` e os nucleos de backup — segundos por teste, e
    # foi o que estourou o timeout da matriz de defeitos. O que procura
    # enforcement e o codigo de producao, nao arvores de dependencia.
    AMBITOS = ("agents", "core", "cli", "database", "llm", "engine", "scripts")
    codigos = [
        p.relative_to(RAIZ).as_posix()
        for pasta in AMBITOS
        for p in (RAIZ / pasta).rglob("*.py")
        if chave in p.read_text(encoding="utf-8", errors="replace")
    ]
    dados = yaml.safe_load(YAML_POLICY.read_text(encoding="utf-8-sig"))
    declarado = chave in dados

    assert declarado, f"{chave} saiu do YAML; reavalie se ainda e politica."
    assert not codigos, (
        f"`{chave}` passou a ser lido por {codigos}. Agora e uma politica "
        "aplicada, e o YAML virou fonte de verdade de facto. Antes de tratar "
        "assim: (1) `protected_paths` contem `governance` e `scripts`, o que "
        "bloqueia manutencao de governanca; (2) a lista precisa de owner e de "
        "teste que fixe o comportamento; (3) `environment.md` promete fallback "
        "estrito na ausencia do arquivo — confirme que vale."
    )
