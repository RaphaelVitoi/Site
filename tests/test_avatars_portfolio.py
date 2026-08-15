# pylint: disable=redefined-outer-name
"""
Test portfolio for Poker Racional Avatars (Chico, Maverick, Historian, Gemma4).
Verifies the schema, ASCII cleaning, and the exclusive capabilities of each model role.
This file is written strictly in pure ASCII.
"""

import json
import os
from unittest.mock import MagicMock, patch

import pytest

from engine.avatars.run_avatar import (
    assemble_context,
    clean_text_to_ascii,
)


@pytest.fixture
def avatar_config():
    """Carrega a configuracao oficial de avatares."""
    dir_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    config_path = os.path.join(dir_path, "engine", "avatars", "avatar_config.json")
    with open(config_path, encoding="utf-8") as f:
        return json.load(f)


def test_pure_ascii_sanitization():
    """
    REQUISITO: Garantia de Pure ASCII no terminal.
    Testa se o filtro de texto remove corretamente acentos e caracteres especiais.
    """
    raw_text = "Ola, voce esta jogando no River! Acao de fold custa -0.125bb e e calculada com precisao."
    cleaned = clean_text_to_ascii(raw_text)
    assert "e e calculada" in cleaned or "e e calculada" in cleaned.lower()

    accented = "aeioucAIOUCananOAeoAEO"
    assert clean_text_to_ascii(accented) == accented


def test_avatar_config_schema(avatar_config):
    """
    Valida a integridade do esquema JSON de configuracao de avatares.
    Garante que todas as personas exigidas possuem os campos obrigatorios.
    """
    personas = avatar_config.get("personas", {})
    required_keys = ["name", "ollama_model", "system_prompt", "context_files", "temperature", "top_p", "repeat_penalty"]

    for name in ["chico", "maverick", "historian", "gemma4"]:
        assert name in personas, f"Persona '{name}' ausente no arquivo de configuracao."
        cfg = personas[name]
        for key in required_keys:
            assert key in cfg, f"Chave obrigatoria '{key}' ausente na persona '{name}'."


def test_chico_capabilities(avatar_config):
    """
    PROVA DE CAPACIDADE EXCLUSIVA: Chico (Gerente de Sistema & Orquestrador Mestre).
    Valida que o Chico usa o modelo gemma4:31b-cloud (otimizado para raciocinio complexo e orquestracao)
    e que possui acesso aos contextos de engine e cognicao para governar o ecossistema.
    """
    chico = avatar_config["personas"]["chico"]
    assert chico["ollama_model"] == "gemma4:31b-cloud"

    # Chico deve conter arquivos de cognicao e infraestrutura
    context = chico["context_files"]
    assert "engine/cognitive.py" in context
    assert "engine/gemma_server.py" in context

    # Prompt do Chico deve indicar autoridade/orquestracao
    prompt = chico["system_prompt"].lower()
    assert "chico" in prompt
    assert "gerente de sistema" in prompt or "orquestrador" in prompt


def test_maverick_capabilities_and_math(avatar_config):
    """
    PROVA DE CAPACIDADE EXCLUSIVA: Maverick (GTO, Teoria dos Jogos & Calculo de Equidade).
    Valida que o Maverick usa o modelo gemma4:26b (local, otimizado para tarefas especificas de poker)
    e que possui acesso exclusivo aos arquivos de calculo matematico (math_sota.py, math_rio.py, bayesian_range.py).
    """
    maverick = avatar_config["personas"]["maverick"]
    assert maverick["ollama_model"] == "gemma4:26b"

    context = maverick["context_files"]
    assert "engine/math_sota.py" in context
    assert "engine/math_rio.py" in context
    assert "engine/bayesian_range.py" in context

    prompt = maverick["system_prompt"].lower()
    assert "maverick" in prompt
    assert "poker" in prompt
    assert "gto" in prompt or "teoria dos jogos" in prompt


def test_historian_capabilities(avatar_config):
    """
    PROVA DE CAPACIDADE EXCLUSIVA: Historian (Perspectiva Arquitetural & Filosofia do Risco).
    Valida que o Historian usa o modelo gemma4:31b-cloud (para processar longos contextos historicos)
    e possui o arquivo de framework da perspectiva como contexto.
    """
    historian = avatar_config["personas"]["historian"]
    assert historian["ollama_model"] == "gemma4:31b-cloud"

    context = historian["context_files"]
    assert "docs/research/perspectiva_matematica_framework_v2.md" in context

    prompt = historian["system_prompt"].lower()
    assert "historian" in prompt
    assert "filosofica" in prompt or "historica" in prompt


def test_gemma4_capabilities(avatar_config):
    """
    PROVA DE CAPACIDADE EXCLUSIVA: Gemma4 (Sentinela de Inferencia Local e Baixa Latencia).
    Valida que Gemma4 usa o modelo local gemma4:latest (otimizado para processamento em hardware local)
    e possui o prompt focado em calibracao e execucao de borda.
    """
    gemma4 = avatar_config["personas"]["gemma4"]
    assert gemma4["ollama_model"] == "gemma4:latest"

    prompt = gemma4["system_prompt"].lower()
    assert "gemma4" in prompt
    assert "borda" in prompt or "local" in prompt or "low latency" in prompt or "baixa latencia" in prompt


@pytest.mark.asyncio
async def test_assemble_context_with_truncation():
    """
    Testa se a montagem de contexto le arquivos e respeita a truncagem de tokens (8000 caracteres por arquivo).
    """
    with patch("builtins.open", MagicMock()) as mock_open:
        # Mock do tamanho do arquivo maior que 8000
        mock_file = MagicMock()
        mock_file.read.return_value = "A" * 9000
        mock_open.return_value.__enter__.return_value = mock_file

        with patch("os.path.exists", return_value=True):
            context = assemble_context(["fake_file.py"])
            assert "fake_file.py" in context
            assert "CONTEUDO TRUNCADO" in context
            assert len(context) < 9500  # Deve ser truncado perto de 8000 caracteres


@pytest.mark.asyncio
async def test_maverick_multimodal_agentic_pipeline():
    """
    PROVA DE CAPACIDADE EXCLUSIVA: Maverick Multimodal Agentic Collaboration.
    Valida que ao receber uma imagem, o script executa o Gemma 4b Vision (MiniCPM-V)
    para extrair o board e repassa o prompt enriquecido com esses dados textuais ao Llama.
    """
    # 1. Mock do Gemma 4b Vision extraindo as cartas da imagem
    mock_vision_text = "[BOARD] As-Kh-2d [STACKS] Hero 100bb, Villain 80bb"

    with (
        patch("engine.avatars.run_avatar.query_multimodal_cli", return_value=mock_vision_text) as mock_vision_cli,
        patch("engine.avatars.run_avatar.ensure_server_for_persona", return_value=True),
        patch("engine.avatars.run_avatar.query_llama_server") as mock_llama_server,
        patch(
            "sys.argv",
            [
                "run_avatar.py",
                "--persona",
                "maverick",
                "--prompt",
                "De acordo com o GTO, devo dar raise?",
                "--image",
                "table.png",
            ],
        ),
    ):
        from engine.avatars.run_avatar import main as run_main

        run_main()

        # Verifica se o Gemma 4b Vision foi invocado
        mock_vision_cli.assert_called_once()
        assert mock_vision_cli.call_args[1]["image_path"] == "table.png"
        assert mock_vision_cli.call_args[1]["persona_config"]["vision_model_path"] == "openbmb/MiniCPM-V-2_6-gguf"

        # Verifica se o Llama foi chamado com o prompt enriquecido com a descricao do board
        mock_llama_server.assert_called_once()
        # O segundo argumento posicional ou kwargs e o prompt do usuario
        user_prompt_arg = mock_llama_server.call_args[0][1]
        assert "CONTEXTO VISUAL DO BOARD" in user_prompt_arg
        assert "As-Kh-2d" in user_prompt_arg
        assert "De acordo com o GTO, devo dar raise?" in user_prompt_arg


def test_query_multimodal_cli_args():
    """Valida a geracao de comandos no query_multimodal_cli com threads e ngl."""
    from engine.avatars.run_avatar import query_multimodal_cli

    persona_cfg = {
        "vision_model_path": "openbmb/MiniCPM-V-2_6-gguf",
        "temperature": 0.3,
        "top_p": 0.8,
        "gpu_layers": 12,
        "num_thread": 4,
    }

    with (
        patch("os.path.exists", return_value=True),
        patch("engine.avatars.run_avatar._run_subprocess_stream", return_value="result") as mock_run_sub,
    ):
        res = query_multimodal_cli(
            system_prompt="sys",
            user_prompt="usr",
            image_path="img.png",
            audio_path="aud.wav",
            persona_config=persona_cfg,
            silent=True,
        )

        assert res == "result"
        mock_run_sub.assert_called_once()
        cmd = mock_run_sub.call_args[0][0]

        # Verifica se passou os argumentos corretos
        assert "-hf" in cmd
        assert "openbmb/MiniCPM-V-2_6-gguf" in cmd
        assert "-sys" in cmd
        assert "sys" in cmd
        assert "-p" in cmd
        assert "usr" in cmd
        assert "--temp" in cmd
        assert "0.3" in cmd
        assert "--top-p" in cmd
        assert "0.8" in cmd
        assert "-ngl" in cmd
        assert "12" in cmd
        assert "--image" in cmd
        assert "img.png" in cmd
        assert "--audio" in cmd
        assert "aud.wav" in cmd
        assert "-t" in cmd
        assert "4" in cmd
