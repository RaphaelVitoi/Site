"""Contrato entre run_inference.py (cliente) e engine/gemma_server.py (proxy).

ORIGEM: em 2026-08-27 registrei como pendencia que o modo conversacional
enviava `system_prompt` E `messages[0]` com o mesmo conteudo, chamando isso de
"persona duplicada". **Estava errado, e a leitura do servidor desmente.**

O que o proxy faz de fato:

  gemma_server._build_multiturn (linha ~1028)
      if not msgs or msgs[0].get("role") != "system":
          msgs.insert(0, {"role": "system", "content": _resolve_system_prompt(req)})

  Como o cliente ja poe o system em messages[0], a condicao e FALSA e nada e
  inserido. `req.system_prompt` NAO entra no conteudo em nenhum ponto do
  caminho multi-turn. Nao ha duplicacao da persona.

O QUE HA, e o motivo destes testes existirem:

  gemma_server._build_inference_options (linha ~862)
      if req.temperature is not None:
          params["temperature"] = req.temperature
      elif not req.system_prompt:
          params["temperature"] = 0.0

  No caminho multi-turn, `system_prompt` e um CANAL LATERAL: sua unica funcao e
  distinguir o modo conversacional (temperatura do modelo, 0.4-0.5) do modo
  agentico (temperatura forcada a 0.0). O campo parece redundante e nao e.

  Quem "limpar" a redundancia removendo `system_prompt` do payload troca a
  temperatura de 0.5 para 0.0 em silencio, e o chat conversacional fica
  deterministico sem que nada acuse. Estes testes travam isso.
"""

from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

from scripts.llm_inference import run_inference as ri


def _capturar_payload(**kwargs) -> dict:
    """Executa query_gemma_proxy sem rede e devolve o payload que teria ido."""
    resposta = MagicMock()
    resposta.__enter__ = lambda s: s
    resposta.__exit__ = lambda *a: False
    resposta.__iter__ = lambda s: iter([b"ok"])

    capturado: dict = {}

    def _fake_urlopen(req, timeout=None):
        _ = timeout
        capturado.update(json.loads(req.data.decode("utf-8")))
        return resposta

    with (
        patch.dict("os.environ", {"API_SECRET_TOKEN": "token-de-teste"}),
        patch.object(ri.urllib.request, "urlopen", _fake_urlopen),
    ):
        ri.query_gemma_proxy("12b", "pergunta", **kwargs)
    return capturado


def test_modo_conversacional_envia_system_prompt_alem_das_mensagens():
    """A redundancia e LOAD-BEARING: e ela que mantem a temperatura do modelo.

    Sem `system_prompt` no payload, gemma_server forca temperature=0.0 e o chat
    conversacional vira deterministico. Ver o docstring do modulo.
    """
    conversa = [{"role": "system", "content": "persona"}, {"role": "user", "content": "oi"}]
    payload = _capturar_payload(system_prompt="persona", messages=conversa)

    assert payload["system_prompt"] == "persona", (
        "system_prompt sumiu do payload: o proxy vai forcar temperature=0.0 e o "
        "modo conversacional perde a temperatura do modelo, em silencio"
    )
    assert payload["messages"][0]["role"] == "system", (
        "o system deixou de ser messages[0]: o proxy passaria a INSERIR o prompt "
        "padrao VITOI na posicao 0, e ai sim haveria persona duplicada"
    )


def test_modo_agentico_nao_envia_system_prompt():
    """Ausencia do campo e o que sinaliza o modo agentico (temperature 0.0)."""
    payload = _capturar_payload(messages=[{"role": "user", "content": "oi"}])
    assert "system_prompt" not in payload
    assert payload["messages"][0]["role"] == "user"


def test_max_tokens_viaja_como_teto_de_saida():
    """max_tokens vira num_predict no proxy, nunca num_ctx. Ver instancia 11."""
    payload = _capturar_payload(max_tokens=8192)
    assert payload["max_tokens"] == 8192


def test_compact_conversation_preserva_persona_e_reduz_a_dez_porcento():
    """Garante que a compactacao de contexto retem ~10% das mensagens mais recentes e preserva o system prompt."""
    conversa = [{"role": "system", "content": "Persona SOTA Chico"}]
    for i in range(20):
        role = "user" if i % 2 == 0 else "assistant"
        conversa.append({"role": role, "content": f"Mensagem {i}"})

    compactada = ri._compact_conversation(conversa, keep_ratio=0.10)

    assert compactada[0]["role"] == "system"
    assert compactada[0]["content"] == "Persona SOTA Chico"
    # Compact marker inserido
    assert "[COMPACT SOTA]" in compactada[1]["content"]
    # Retém ~10% de 20 msgs (2 mensagens mais recentes)
    dialogos = [m for m in compactada if m["role"] in ("user", "assistant")]
    assert len(dialogos) == 2
    assert dialogos[0]["content"] == "Mensagem 18"
    assert dialogos[1]["content"] == "Mensagem 19"


def test_compact_conversation_atualiza_tag_de_modelo_quando_fornecida():
    """Garante que a persona tem sua referencia de modelo atualizada no hot-swap."""
    conversa = [
        {"role": "system", "content": "Voce e o modelo open-source gemma4:12b, rodando localmente."},
        {"role": "user", "content": "pergunta"},
        {"role": "assistant", "content": "resposta"},
    ]
    compactada = ri._compact_conversation(conversa, keep_ratio=0.10, new_model_tag="qwen2.5-coder:7b")
    assert "open-source qwen2.5-coder:7b," in compactada[0]["content"]


def test_compact_conversation_curta_permanece_inalterada():
    """Conversas com 2 ou menos mensagens de dialogo nao devem ser descartadas."""
    conversa = [
        {"role": "system", "content": "Persona"},
        {"role": "user", "content": "ola"},
        {"role": "assistant", "content": "tudo bem"},
    ]
    compactada = ri._compact_conversation(conversa, keep_ratio=0.10)
    assert len(compactada) == 3
    assert compactada == conversa


def test_select_model_interactively_por_numero_e_alias():
    """Valida selecao interativa por numero de indice e por alias/tag."""
    mock_models = [
        {"tag": "gemma4:12b", "tier": "local", "size_str": "7.3 GB"},
        {"tag": "qwen2.5-coder:7b", "tier": "local", "size_str": "4.7 GB"},
    ]
    with patch("builtins.input", return_value="2"):
        tag_selecionada = ri._select_model_interactively(mock_models)
        assert tag_selecionada == "qwen2.5-coder:7b"

    with patch("builtins.input", return_value="1"):
        tag_selecionada = ri._select_model_interactively(mock_models)
        assert tag_selecionada == "gemma4:12b"


def test_run_chat_loop_comandos_in_chat():
    """Valida o processamento dos comandos /status, /compact e /exit no loop de chat."""
    conversa = [{"role": "system", "content": "Persona"}]
    for i in range(10):
        conversa.append({"role": "user" if i % 2 == 0 else "assistant", "content": f"msg {i}"})

    inputs = ["/status", "/compact", "/exit"]
    with (
        patch("builtins.input", side_effect=inputs),
        patch.object(ri.console, "print") as mock_print,
    ):
        ri._run_chat_loop("gemma4:12b", "Persona", conversa, max_tokens=2048)
        assert mock_print.called


def test_run_chat_loop_hot_swap_troca_de_modelo():
    """Valida a troca de modelo a quente via /model retendo 10% do contexto."""
    conversa = [{"role": "system", "content": "Persona SOTA open-source gemma4:12b,"}]
    for i in range(20):
        conversa.append({"role": "user" if i % 2 == 0 else "assistant", "content": f"msg {i}"})

    mock_installed = [
        {"tag": "gemma4:12b", "tier": "local", "size_str": "7.3 GB"},
        {"tag": "qwen2.5-coder:7b", "tier": "local", "size_str": "4.7 GB"},
    ]

    # Fluxo do usuario:
    # 1. Digita /model 2 (troca para qwen2.5-coder:7b)
    # 2. Escolhe opcao 1 (Hot-swap: manter 10% do contexto)
    # 3. Digita /exit
    inputs = ["/model 2", "1", "/exit"]

    with (
        patch("builtins.input", side_effect=inputs),
        patch.object(ri, "discover_ollama_models", return_value=mock_installed),
        patch.object(ri.console, "print") as mock_print,
    ):
        ri._run_chat_loop("gemma4:12b", "Persona SOTA open-source gemma4:12b,", conversa, max_tokens=2048)
        assert mock_print.called


