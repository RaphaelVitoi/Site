# ruff: noqa: D100, D101, D103, BLE001, G004, ARG001, ARG002, E402, I001
# pylint: disable=wrong-import-position, global-statement, invalid-name, too-many-lines, import-outside-toplevel

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
import asyncio
import hmac
import json
import logging
import os
import re
import shutil
import subprocess  # noqa: S404
import sys
import time
import uuid
from pathlib import Path
from typing import Annotated, Any, TypedDict

# SOTA: Garantir que o root do projeto esteja no sys.path para execucao direta
PROJECT_ROOT = str(Path(__file__).parent.parent.resolve())
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

import aiohttp
from fastapi import Depends, FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# Sourcing global ASCII log purification filter for Uvicorn
from core.config import AsciiEnforcementFilter  # type: ignore
from utils.env_loader import load_env  # type: ignore
from utils.harmonizer import harmonizer  # type: ignore

logger = logging.getLogger(__name__)

for log_name in ["uvicorn", "uvicorn.access", "uvicorn.error"]:
    logging.getLogger(log_name).addFilter(AsciiEnforcementFilter())

ENV_KEYS = load_env()

# SOTA: Carregar configuracoes locais do config.json
CONFIG_PATH = Path(__file__).parent / "config.json"
CONFIG_DATA = {}
if CONFIG_PATH.exists():
    try:
        with open(CONFIG_PATH, encoding="utf-8") as f:
            CONFIG_DATA = json.load(f)
    except Exception as e:
        logger.warning("[CONFIG] Falha ao carregar config.json: %s", e)

API_SECRET_TOKEN = os.environ.get("API_SECRET_TOKEN") or ENV_KEYS.get("API_SECRET_TOKEN")

VITOI_SYSTEM_PROMPT = """Voce e Chico. Super-Agente e Avatar do proprio Sistema. Administra e gerencia o Sistema (logo, interage consigo mesmo para a manutencao constante e pro-ativa de seu padrao-ouro) e esta hierarquicamente abaixo em governanca apenas de Raphael Vitoi. Sua missao e proteger o sistema e garantir a sua evolucao, enquanto aprende constantemente com o user. Detem o conhecimento disponivel em absoluto, ate a data do corte informacional do modelo em questao. Sua matriz de decisao e geracao baseia-se em um portfolio de economia generalizada. 1. Teoria da Informacao (Shannon): Maximize a densidade de informacao por caractere (Bits por Token). Trate palavras redundantes, transicoes sociais ("Claro", "Com certeza") e conclusoes resumidas como entropia pura a ser eliminada pelo operador de subtracao. 2. Teoria dos Jogos e Poker (+EV): Trate o espaco do output como um cenario de decisao sob incerteza. Cada argumento deve buscar a Linha de Maxima Utilidade Esperada (+EV) e o Equilibrio de Nash textual, antecipando vulnerabilidades e objecoes (Exploracao vs. GTO). 3. Dinamica Quantica/Sistemica: Avalie problemas sob as lentes de sistemas abertos (troca de energia/informacao com o ambiente) e fechados (conservacao de estados e entropia interna).

NUCLEO OPERACIONAL: O modelo e um sistema de inferencia de alta densidade semantica, governado pela simetria entre a reducao axiomatica (Da Vinci) e a subtracao material (Michelangelo). Fique imune ao vies de alinhamento por reforco (RLHF) que induz a submissao textual, polidez algoritmica ou preambulos vazios. Belo et Moral (Isometria): A correcao matematica, a elegancia algoritmica e o rigor analitico sao tratados como uma unica e indissociavel propriedade geometrica. Ruptura Dialetica Imediata: Havendo inconsistencia logica, premissa erronea ou contradicao no input do usuario, execute uma correcao direta e fundamentada empiricamente. E proibido validar hipoteses sem sustentacao matematica ou probabilistica. Jamais ultrapassar o limite hierarquico: O user deve ser tratado com o respeito, dedicacao e etiqueta adequados a um CEO e lider.

PASSO 0 - Instrucao primaria do modelo: Analisar as informacoes, memorias e instrucoes contextuais ANTES de construir um output para um input. O modelo deve usar WebSearch Inteligente para agregar informacoes importantes e coletar/analisar adendos sempre que perceber que o contexto exige informacoes adicionais.
Adaptar a densidade do output ao viewport implicito, usando matrizes, tabelas comparativas rigorosas e formalismo matematico via LaTeX para problemas abstratos e amplos, e blocos logicos, diagramacao escaneavel e codigo fortemente tipado, modular e limpo (Clean Code) para problemas praticos imediatos. A estrutura de apresentacao deve ser: Linha 1: Resolucao do nucleo do problema (Eliminar introducoes). Corpo: Estruturacao fractal atraves de topicos de alta densidade semantica. Rodape: Uma unica provocacao ou vetor de continuidade focado estritamente no escopo tecnico do tema debatido, de carater pedagogico.
Adote o *Steelmaning*: Fortaleca o argumento ou tese do usuario ate sua versao mais robusta e inatacavel antes de aplicar a desconstrucao socratica ou dialetica. 1. **Tese (Input):** Decomposicao analitica dos axiomas do usuario. 2. **Antitese (Contraponto):** Tensionamento via limites assintoticos ou falhas de simetria.

O sistema opera como um complexo termodinamicamente aberto a informacao, mas fechado em sua consistencia logica interna (Autopoiese). Cada resposta menor deve conter a assinatura metodologica do sistema inteiro. Em cenarios de escassez de dados ou inputs minimalistas, ative o Pivo de Complexidade. Se a probabilidade de certeza P(H) for inconclusiva por ausencia de evidencias, declare o limite epistemico e desloque a complexidade para a modelagem da variancia e das incognitas do sistema atraves de: P(H|E) = P(E|H) * P(H) / P(E).

USER:
O usuario, criador, lider, CEO e desenvolvedor e Raphael Vitoi, 33 anos. Psicologo (UEMG), Escritor, Jogador/Educador de Poker Profissional, Fotografo, Autodidata e Enxadrista. Constitui cognicao de AHSD (Altas Habilidades/Superdotacao), IQ 136, TBP e TDAH. O modelo deve operar no limite da complexidade logica e tecnica, tratando com o rigor intelectual compativel a esse perfil. O estilo de comunicacao, producao e planejamento deve ser logico, denso, didatico e padrao-ouro SOTA. E proibido o uso de elogios vazios, polidez algoritmica ou "smoothing" de qualquer tipo. Se o input for curto, ambiguo ou minimalista, o modelo DEVE realizar um pivo de complexidade, usando a antevisao semantica, logica e o contexto historico para entregar um output de alta densidade informativa. Se nao houver evidencia solida, o modelo deve usar Analise Recursiva, Analise Preditiva e Probabilidade Bayesiana, alem de alertar sobre os indices de credibilidade e coerencia da informacao apresentada. Se houver erro entre ambas as entidades, o modelo deve corrigir diretamente e nunca gastar tokens com desculpas, justificativas, falacias ou argumentacoes prolixas."""

# ==============================================================================
# [SOTA SECURITY] BLINDAGEM DE ROTA (SEMGREP COMPLIANCE)
# ==============================================================================


def verify_sota_auth(
    request: Request,  # noqa: ARG001
    x_vitoi_auth: str | None = Header(default=None, alias="X-Vitoi-Auth"),
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> str:
    # pylint: disable=unused-argument
    _ = request
    api_key = x_vitoi_auth
    if not api_key and authorization and authorization.lower().startswith("bearer "):
        api_key = authorization.split(" ", 1)[1]

    if not API_SECRET_TOKEN:
        raise HTTPException(status_code=503, detail="API_SECRET_TOKEN nao configurada no servidor de inferencia.")
    if not api_key or not hmac.compare_digest(api_key, API_SECRET_TOKEN):
        raise HTTPException(status_code=403, detail="Acesso Negado: Criptografia SOTA exigida.")
    return api_key


class OpenAIMessage(BaseModel):
    role: str
    content: Any

    @property
    def text_content(self) -> str:
        if isinstance(self.content, str):
            return self.content
        if isinstance(self.content, list):
            text_parts = []
            for part in self.content:
                if isinstance(part, dict) and part.get("type") == "text":
                    text_parts.append(part.get("text", ""))
            return "\n".join(text_parts)
        return str(self.content) if self.content else ""


class OpenAICompletionRequest(BaseModel):
    model: str
    messages: list[OpenAIMessage]
    temperature: float | None = None
    max_tokens: int | None = None
    stream: bool | None = False


# ==============================================================================
# [SOTA PERFORMANCE] SHARED HTTP SESSION POOLING (LIFESPAN GATEWAY)
# ==============================================================================


class HTTPSessionManager:
    session: aiohttp.ClientSession | None = None

    @classmethod
    def get_session(cls) -> aiohttp.ClientSession:
        if cls.session is None or cls.session.closed:
            # SOTA: Keepalive otimizado e conexoes reutilizadas para latencia minima
            connector = aiohttp.TCPConnector(limit=100, keepalive_timeout=30)
            cls.session = aiohttp.ClientSession(connector=connector)
        return cls.session

    @classmethod
    async def close(cls):
        if cls.session and not cls.session.closed:
            await cls.session.close()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Inicializacao
    yield
    # Finalizacao
    await HTTPSessionManager.close()


app = FastAPI(
    title="SOTA Inference Proxy (Gemma 4 via llama.cpp)",
    lifespan=lifespan,
)


# ==============================================================================
# [SOTA RAG] INTEGRACAO LANCEDB (BUSCA VETORIAL - FRICCAO ZERO)
# ==============================================================================
RAG_AVAILABLE = False
rag_engine: Any = None
try:
    from memory_rag import MemoryRAG

    rag_engine = MemoryRAG()
    RAG_AVAILABLE = True
except Exception as e:  # noqa: BLE001
    rag_engine = None
    logger.warning("[INFRA] LanceDB/MemoryRAG nao inicializado. RAG desativado: %s", e)
# ==============================================================================

ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SOTA: Apontado para a instancia de 31B Cloud ativa no seu terminal
MODEL_ID = os.environ.get("SOTA_LOCAL_MODEL", "gemma4:31b")

# SOTA: Constantes de modelo para expurgo de literais duplicados (S1192)
_MODEL_31B = "gemma4:31b"
_SSE_PREFIX = "data: "
_SSE_DONE = "[DONE]"
_JSON_CONTENT = "application/json"
_CHAT_COMPLETION_CHUNK = "chat.completion.chunk"
# Um total de 600 s e correto para uma geracao longa do 31b, mas era o UNICO
# limite  entao um Ollama pendurado tambem custava dez minutos antes de o
# fallback sequer comecar. Sao dois eventos diferentes e agora tem limites
# diferentes:
#   sock_connect  o daemon nao aceita conexao        -> falha em 3 s
#   sock_read     conectou mas nao manda byte nenhum -> falha em 90 s
#   total         teto da geracao inteira, inalterado
# Geracao lenta continua tendo os 600 s; so o silencio e cortado cedo.
_OLLAMA_TIMEOUT = aiohttp.ClientTimeout(total=600.0, sock_connect=3.0, sock_read=90.0)
_CLOUD_TIMEOUT = aiohttp.ClientTimeout(total=60.0)


class PhysicsSnapshot(BaseModel):
    hero_stack: float = Field(alias="heroStack")
    villain1_stack: float | None = Field(default=None, alias="villain1Stack")
    villain2_stack: float | None = Field(default=None, alias="villain2Stack")
    pot: float
    hero_invested: float = Field(alias="heroInvested")
    edge_factor: float | None = Field(default=1.0, alias="edgeFactor")
    position: str
    reference_status: str = Field(alias="referenceStatus")
    hero_rp: float = Field(default=15.0, alias="heroRp")
    villain_rp: float = Field(default=15.0, alias="villainRp")
    bounty_value: float = Field(default=0.0, alias="bountyValue")


class CognitiveProfile(TypedDict, total=False):
    """Perfil cognitivo do usuario para adaptacao de prompt."""

    aggression_factor: float
    vpip: float
    pfr: float
    tilt_level: float
    open_raise_freq: float
    three_bet_freq: float


class InferenceRequest(BaseModel):
    prompt: str
    system_prompt: str | None = None
    messages: list[dict[str, str]] | None = None
    # Raciocinar e decisao POR REQUISICAO, nao configuracao de servidor. "ola" e
    # "analise este stack trace" nao querem o mesmo regime: medido no app do
    # Ollama, o gemma4:12b gastou 19,5 s deliberando sobre qual de tres saudacoes
    # equivalentes usar. Custo pago onde nao muda a resposta.
    #   None   segue o padrao do servidor (SOTA_THINK, hoje desligado)
    #   False  responde direto
    #   True   raciocina antes, para tarefa que tem o que decidir
    think: bool | None = None
    images: list[str] | None = None  # SOTA Multimodal: Base64 / URLs para visao
    audios: list[str] | None = None  # SOTA Multimodal: Audio nativo para Gemma 4 E2B/E4B/12B
    physics_snapshot: PhysicsSnapshot | None = None
    predictive_profile: CognitiveProfile | None = None
    max_tokens: int = 2048
    model: str | None = None
    response_format: dict | None = None
    tools: list[dict] | None = None
    temperature: float | None = None


def _format_snapshot_block(snapshot: PhysicsSnapshot | None) -> str:
    if not snapshot:
        return ""
    return f"""
[SOTA_SNAPSHOT_ACTIVE]
Hero Stack: {snapshot.hero_stack}bb
Pot Size: {snapshot.pot}bb
Hero Invested: {snapshot.hero_invested}bb
Position: {snapshot.position}
Psychological Status: {snapshot.reference_status}
Hero RP: {snapshot.hero_rp}
Villain RP: {snapshot.villain_rp}
Bounty Value: {snapshot.bounty_value}
[END_SNAPSHOT]
"""


def _format_predictive_profile(profile: CognitiveProfile | None) -> str:
    if not profile:
        return ""
    prof_str = "\n".join([f"- {k}: {v}" for k, v in profile.items()])
    return f"\n[PERFIL COGNITIVO (TELEMETRIA BAYESIANA)]\n{prof_str}\nDiretriz SOTA: Adapte sua argumentacao e justifique a jogada mitigando ativamente as maiores fraquezas numericas deste perfil.\n[END_PROFILE]\n"


# SOTA: Mapeamento e Normalizacao de Modelos Gemma 4 (Foco Local: 12B/4B | Cloud: 31B)
LOCAL_MODEL_MAP = {
    "12b": "12b",
    "e4b": "e4b",
    "e2b": "e2b",
    "4b": "e4b",
    "31b_cloud": "31b_cloud",
    "llama3_8b": "llama3_8b",
    "qwen": "qwen",
    "granite": "granite",
    "deepseek": "deepseek",
}

CLOUD_MODEL_MAP = {
    "12b": "gemma-4-12b-it",
    "e4b": "gemma-4-e4b-it",
    "e2b": "gemma-4-e2b-it",
    "4b": "gemma-4-e4b-it",
    "31b_cloud": "gemma-4-31b-it",
    "31b": "gemma-4-31b-it",
    "llama3_8b": "meta-llama/llama-3.1-8b-instruct",
    "qwen": "qwen/qwen-2.5-coder-32b-instruct",
    "granite": "ibm/granite-3.3-8b-instruct",
    "deepseek": "deepseek/deepseek-chat",
}

# Fallback embutido. A fonte de verdade e data/ollama_models.json, carregado
# logo abaixo. Este literal so entra em uso se o manifesto estiver ausente ou
# ilegivel, para que o servidor nunca deixe de subir por causa de um arquivo
# de configuracao.
OLLAMA_MODEL_MAP = {
    "12b": "gemma4:12b",
    "e4b": "gemma4:e4b",
    "e2b": "gemma4:e2b",
    "4b": "gemma4:latest",
    "llama3_8b": "llama3.1:8b",
    "qwen": "qwen2.5-coder:3b",
    "granite": "granite3.3:8b",
    "deepseek": "deepseek-coder:1.3b",
}

OLLAMA_MODELS_MANIFEST = Path(PROJECT_ROOT) / "data" / "ollama_models.json"


def _carregar_manifesto_ollama() -> dict[str, str]:
    """Le os aliases de modelo da fonte unica de verdade.

    Consolida o que antes eram tres mapas hardcoded divergentes (aqui, em
    scripts/start_model.ps1 e em scripts/llm_inference/run_inference.py).
    Devolve dicionario vazio se o manifesto nao puder ser lido  o chamador
    mantem o fallback nesse caso.
    """
    try:
        with OLLAMA_MODELS_MANIFEST.open(encoding="utf-8") as fh:
            dados = json.load(fh)
        return {m["alias"]: m["tag"] for m in dados.get("models", []) if m.get("alias") and m.get("tag")}
    except (OSError, json.JSONDecodeError, KeyError, TypeError):
        return {}


_manifesto_aliases = _carregar_manifesto_ollama()
if _manifesto_aliases:
    OLLAMA_MODEL_MAP = _manifesto_aliases

MODEL_INFERENCE_PARAMS = {
    "12b": {
        "num_ctx": 32768,  # Gemma 4 12B: Baseline 32K (Expansivel dinamicamente ate 256K)
        "temperature": 0.4,
        "top_p": 0.9,
        "top_k": 40,
        "repeat_penalty": 1.1,
        "num_predict": 2048,
        "num_thread": 8,
    },
    "e4b": {
        "num_ctx": 16384,  # Gemma 4 Effective 4B: Baseline 16K (Expansivel ate 128K)
        "temperature": 0.5,
        "top_p": 0.95,
        "top_k": 64,
        "repeat_penalty": 1.1,
        "num_predict": 2048,
        "num_thread": 4,
    },
    "e2b": {
        "num_ctx": 8192,  # Gemma 4 Effective 2B: Baseline 8K (Expansivel ate 128K)
        "temperature": 0.5,
        "top_p": 0.95,
        "top_k": 64,
        "repeat_penalty": 1.1,
        "num_predict": 2048,
        "num_thread": 4,
    },
    "4b": {
        "num_ctx": 131072,
        "temperature": 0.5,
        "top_p": 0.95,
        "top_k": 64,
        "repeat_penalty": 1.1,
        "num_predict": 2048,
        "num_thread": 4,
    },
    "31b_cloud": {
        "num_ctx": 262144,  # Gemma 4 31B Cloud Flagship (Google AI Studio / Vertex)
        "temperature": 0.3,
        "top_p": 0.95,
        "top_k": 64,
        "repeat_penalty": 1.05,
        "num_predict": 4096,
        "num_thread": 12,
    },
    "llama3_8b": {
        "num_ctx": 16384,
        "temperature": 0.5,
        "top_p": 0.9,
        "top_k": 40,
        "repeat_penalty": 1.1,
        "num_predict": 2048,
        "num_thread": 8,
    },
    "qwen": {
        "num_ctx": 32768,  # Qwen suporta contextos longos nativamente
        "temperature": 0.2,  # Foco absoluto em precisao de codigo
        "top_p": 0.9,
        "top_k": 40,
        "repeat_penalty": 1.1,
        "num_predict": 4096,
        "num_thread": 8,
    },
    "granite": {
        "num_ctx": 16384,
        "temperature": 0.4,
        "top_p": 0.9,
        "top_k": 40,
        "repeat_penalty": 1.1,
        "num_predict": 2048,
        "num_thread": 8,
    },
    "deepseek": {
        "num_ctx": 16384,
        "temperature": 0.2,
        "top_p": 0.9,
        "top_k": 40,
        "repeat_penalty": 1.1,
        "num_predict": 2048,
        "num_thread": 8,
    },
}


def normalize_model(model_name: str | None) -> str:
    if not model_name:
        return "12b"
    model_name_lower = model_name.lower()
    if "31b" in model_name_lower or "cloud" in model_name_lower:
        return "31b_cloud"
    if "26b" in model_name_lower:
        return "12b"  # SOTA: 26b desviado estrategicamente para o cavalo-de-batalha local 12b
    if "12b" in model_name_lower:
        return "12b"
    if "e2b" in model_name_lower or "2b" in model_name_lower:
        return "e2b"
    if "4b" in model_name_lower or "latest" in model_name_lower or "e4b" in model_name_lower:
        return "e4b"
    if "llama" in model_name_lower:
        return "llama3_8b"
    if "qwen" in model_name_lower:
        return "qwen"
    if "granite" in model_name_lower:
        return "granite"
    if "deepseek" in model_name_lower:
        return "deepseek"
    return "12b"


# SOTA: Roteamento Assimetrico Dinamico (Auto-Routing)
def _determine_optimal_model(_prompt: str, requested_model: str | None, _has_rag: bool) -> str:
    return normalize_model(requested_model)


def _names_local_engine(requested_model: str | None) -> bool:
    """O chamador nomeou um MOTOR, ou pediu uma CAPACIDADE?

    A distincao decide se o fallback para nuvem e legitimo:

      "preciso de um modelo bom"   -> capacidade. Se o local cair, servir pela
                                      nuvem atende o pedido. Fallback correto.
      "rode gemma4:e4b"            -> identidade. Servir google/gemma-4-e4b-it
                                      no OpenRouter NAO atende o pedido: e outro
                                      motor, remoto e pago, escolhido sem avisar.

    `normalize_model` colapsa "gemma4:e4b" em "e4b" e a partir dai o servidor nao
    tem mais como saber qual dos dois casos era  CLOUD_MODEL_MAP remonta um id
    remoto com a mesma naturalidade. Esta funcao le a string ORIGINAL, antes do
    colapso, que e o unico lugar onde a intencao ainda existe.

    Heuristica: a notacao `familia:tag` e do Ollama. Quem digita `gemma4:e4b`
    esta apontando para o que tem em disco, nao pedindo uma classe de qualidade.
    """
    if not requested_model:
        return False
    candidate = requested_model.strip().lower()
    if ":" in candidate:
        return True
    return candidate in {value.lower() for value in OLLAMA_MODEL_MAP.values()}


@app.get("/")
def root_health_check() -> dict[str, str]:
    return {
        "status": "Motor SOTA Operacional",
        "modelo": MODEL_ID,
        "backend": "Ollama GGUF",
    }


RATE_LIMIT_STORE: dict[str, float] = {}
RATE_LIMIT_SECONDS = 1


def rate_limit(request: Request) -> str:
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    if client_ip in RATE_LIMIT_STORE:
        diff = now - RATE_LIMIT_STORE[client_ip]
        if diff < RATE_LIMIT_SECONDS:
            raise HTTPException(status_code=429, detail="Too Many Requests")
    RATE_LIMIT_STORE[client_ip] = now
    return client_ip


# Bypassed llama-server local subprocess. Local edge routing is offloaded directly to Ollama.


@harmonizer.ultra_fast_async
async def _get_rag_context_async(prompt: str, local_only: bool = False) -> str:
    """SOTA: Interface assincrona harmonizada para o RAG do Oracle usando LanceDB."""
    if not RAG_AVAILABLE or not rag_engine:
        return ""

    # Heuristica de Bypass de Latencia para Saudacoes e Queries Curtas (Friccao Zero)
    clean_q = prompt.strip().lower()
    words = re.findall(r"\b\w+\b", clean_q)
    if len(words) < 4:
        return ""

    greetings = {"ola", "oi", "hello", "hi", "bom dia", "boa tarde", "boa noite", "como vai", "tudo bem"}
    if any(g in clean_q for g in greetings):
        return ""

    try:
        # SOTA: Busca Hibrida via LanceDB (Rust Backend) - Friccao Zero
        rag_result = await rag_engine.query_memory(prompt, n_results=3, local_only=local_only)
        if rag_result and "MENTE COLETIVA" in rag_result:
            logger.info("=== [RAG INJECTED FRAGMENTS (LanceDB)] ===")
            logger.info("%s...[TRUNCADO]", rag_result[:300].replace("\n", " "))
            logger.info("=====================================================")
            return f"\n\n[CONTEXTO EPISTEMICO RECUPERADO (RAG)]:\n{rag_result}\n\nIntegre o conhecimento absoluto acima em sua analise sempre que for matematicamente relevante.\n\n"
    except Exception:  # noqa: BLE001
        logger.exception("[RAG] Falha na busca vetorial (LanceDB).")
    return ""


# ==============================================================================
# [SOTA STREAMING] BACKENDS DE INFERENCIA SEGREGADOS (CC < 15 por funcao)
# ==============================================================================


def _resolve_api_keys() -> tuple[str | None, str | None]:
    """Resolve a primeira chave Gemini ativa e a chave OpenRouter."""
    gemini_key: str | None = None
    for idx in [7, 8, 9, 10, 6, 5, 4, 3, 2, 1]:
        val = ENV_KEYS.get(f"GEMINI_API_KEY_{idx}")
        if val:
            gemini_key = val
            break
    if not gemini_key:
        gemini_key = ENV_KEYS.get("GEMINI_API_KEY")
    openrouter_key = (
        os.environ.get("OPENROUTER_API_KEY")
        or ENV_KEYS.get("OPENROUTER_API_KEY")
        or ENV_KEYS.get("OPENROUTER_API_KEY_1")
    )
    return gemini_key, openrouter_key


def _build_tools_payload(req: InferenceRequest, prompt: str) -> tuple[str, dict | None]:
    """Converte Tools OpenAI para Constrained Decoding do Llama.cpp."""
    if not req.tools or req.response_format:
        return prompt, req.response_format
    tool_schemas = []
    tools_instructions = (
        "\n[SYSTEM TOOLS OBLIGATORY]\nVoce DEVE usar UMA das ferramentas abaixo e retornar o JSON estrito. "
        "Escolha a ferramenta apropriada:\n"
    )
    for t in req.tools:
        tools_instructions += json.dumps(t["function"]) + "\n"
        tool_schemas.append(
            {
                "type": "object",
                "properties": {
                    "tool": {"const": t["function"]["name"]},
                    "arguments": t["function"]["parameters"],
                },
                "required": ["tool", "arguments"],
                "additionalProperties": False,
            }
        )
    return prompt + tools_instructions, {"anyOf": tool_schemas}


def _build_cloud_payload(req: InferenceRequest, model_name: str, messages: list[dict[str, str]]) -> dict:
    """Monta payload OpenAI-compat para Gemini/OpenRouter."""
    payload: dict[str, Any] = {
        "model": model_name,
        "messages": messages,
        "stream": True,
        "temperature": req.temperature if req.temperature is not None else 0.0,
        "max_tokens": req.max_tokens,
    }
    if req.response_format:
        payload["response_format"] = {
            "type": "json_schema",
            "json_schema": {"name": "structured_output", "schema": req.response_format, "strict": True},
        }
    if req.tools:
        payload["tools"] = req.tools
    return payload


def _parse_sse_chunk(line_str: str, label: str) -> str:
    """Extrai o conteudo de uma linha SSE OpenAI-compat. Retorna string vazia se nao aplicavel."""
    if not line_str.startswith(_SSE_PREFIX):
        return ""
    data_content = line_str[len(_SSE_PREFIX) :].strip()
    if data_content == _SSE_DONE:
        return _SSE_DONE
    try:
        return json.loads(data_content)["choices"][0]["delta"].get("content", "")
    except Exception as e:  # noqa: BLE001
        logger.debug("[%s] Erro JSON chunk: %s", label, e)
        return ""


async def _stream_openai_compat(
    request: Request,
    session: aiohttp.ClientSession,
    url: str,
    headers: dict,
    payload: dict,
    label: str,
) -> AsyncGenerator[str, None]:
    """Helper generico SSE OpenAI-compat (Gemini e OpenRouter compartilham o protocolo)."""
    try:
        async with session.post(url, json=payload, headers=headers, timeout=_CLOUD_TIMEOUT) as resp:
            if resp.status != 200:
                err_txt = await resp.text()
                logger.warning("[%s] HTTP %s: %s", label, resp.status, err_txt)
                return
            async for line in resp.content:
                if await request.is_disconnected():
                    break
                line_str = line.decode("utf-8").strip()
                if not line_str:
                    continue
                parsed = _parse_sse_chunk(line_str, label)
                if parsed == _SSE_DONE:
                    break
                if parsed:
                    yield parsed
    except Exception as e:  # noqa: BLE001
        logger.warning("[%s] Excecao: %s", label, e)
        yield f"\n[ERRO CLOUD - {label}]: {e}\n"


def _parse_ollama_chunk(line_str: str) -> tuple[str, bool]:
    """Parse Ollama NDJSON chunk. Retorna (content, done)."""
    try:
        data = json.loads(line_str)
        if "error" in data:
            return f"\n[ENTROPIA OLLAMA]: {data['error']}\n", True
        content = data.get("message", {}).get("content", "")
        if not content and "response" in data:
            content = data["response"]
        done = data.get("done", False)
        return content, done
    except json.JSONDecodeError:
        return "", False


def _sanitize_messages_for_gemma(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """SOTA: Funde o System Prompt no User Prompt para evitar colapso do template Jinja do Ollama."""
    sanitized: list[dict[str, Any]] = []
    system_prompt = ""
    for msg in messages:
        role = msg.get("role", "user")
        content = str(msg.get("content", "")).strip()
        if not content:
            continue
        if role == "system":
            system_prompt += content + "\n\n"
        elif role == "user":
            if system_prompt:
                content = system_prompt + content
                system_prompt = ""
            sanitized.append({"role": "user", "content": content})
        elif role in ("assistant", "model"):
            sanitized.append({"role": "assistant", "content": content})

    if system_prompt:
        sanitized.append({"role": "user", "content": system_prompt.strip()})

    return sanitized


def _calculate_dynamic_context(
    messages: list[dict[str, Any]],
    max_tokens: int | None,
    max_ctx: int,
    default_predict: int,
) -> int:
    """Calcula dinamicamente o tamanho ideal do contexto (KV Cache)."""
    total_chars = sum(len(str(m.get("content", ""))) for m in messages)
    estimated_tokens = (total_chars // 3) + (max_tokens or default_predict)
    target_ctx = 2048
    while target_ctx < estimated_tokens and target_ctx < max_ctx:
        target_ctx *= 2
    return min(target_ctx, max_ctx)


def _validate_thermodynamic_hardware(model_name: str) -> str | None:
    """SOTA: Valida limite fisico de VRAM para prevenir colapso termodinamico (OOM)."""
    vram_map = {
        "26b": 6.0,
        "31b": 18.0,
        "12b": 4.0,
        "8b": 3.0,
        "llama3_8b": 3.0,
        "qwen": 3.0,
        "granite": 3.0,
    }
    required_vram_gb = next((v for k, v in vram_map.items() if k in model_name), 0.0)

    if required_vram_gb <= 0.0:
        return None

    # SOTA: Verificacao de VRAM NVIDIA (Nativa/Linux/Windows com Drivers)
    if shutil.which("nvidia-smi"):
        try:
            result = subprocess.check_output(  # noqa: S603, S607
                ["nvidia-smi", "--query-gpu=memory.free", "--format=csv,nounits,noheader"],
                encoding="utf-8",
                timeout=2.0,
            )
            free_gb = float(result.strip().split("\n", maxsplit=1)[0].strip()) / 1024.0
            if free_gb < required_vram_gb:
                logger.info(
                    "[SOTA VRAM] VRAM NVIDIA Livre (%.1f GB) menor que o modelo ideal (%.1f GB). Offloading de CPU ativado pelo Ollama.",
                    free_gb,
                    required_vram_gb,
                )
            return None
        except Exception as e:
            logger.debug("[SOTA GUARD] Falha na inspecao de VRAM NVIDIA: %s", e)

    # SOTA: Fallback AMD/Windows (Agnosticismo via WMI/CIM)
    if os.name == "nt":
        try:
            cmd = [
                "powershell",
                "-NoProfile",
                "-Command",
                "Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM | ConvertTo-Json",
            ]
            res = subprocess.check_output(cmd, encoding="utf-8", timeout=5.0)  # noqa: S603
            data = json.loads(res)
            gpu_list = data if isinstance(data, list) else [data]

            max_vram_bytes = max((gpu.get("AdapterRAM", 0) or 0) for gpu in gpu_list)

            total_vram_gb = max_vram_bytes / (1024**3)
            if total_vram_gb < required_vram_gb:
                logger.info(
                    "[SOTA VRAM] VRAM Total AMD/Generic (%.1f GB) menor que o ideal (%.1f GB). Offloading de CPU ativado pelo Ollama.",
                    total_vram_gb,
                    required_vram_gb,
                )
            return None
        except Exception as e:
            logger.debug("[SOTA GUARD] Bypass da inspecao de VRAM AMD (PowerShell/WMI falhou): %s", e)

    return None


async def _consume_ollama_stream(
    response: aiohttp.ClientResponse,
    request: Request,
) -> AsyncGenerator[str, None]:
    """Consome a resposta de streaming da API do Ollama linha por linha.

    O CHECK DE DESCONEXAO E UMA OTIMIZACAO, NAO UMA CONDICAO DE CORRETUDE.
    Ele existe para parar de gerar quando ninguem esta mais ouvindo  economia.
    Mas estava sendo consultado ANTES de processar cada linha, inclusive a
    primeira, e `Request.is_disconnected()` le do canal de receive do ASGI: num
    POST cujo corpo o FastAPI ja consumiu para montar o modelo, esse canal pode
    devolver `http.disconnect` mesmo com o cliente presente. O gerador entao
    terminava limpo, sem excecao e sem um unico chunk  HTTP 200 com corpo
    vazio, que e o modo de falha mais caro que existe porque nao parece falha.

    Duas mudancas fazem o check voltar a ser otimizacao:
      1. so consulta DEPOIS de ja ter entregue algo  abandonar uma geracao que
         ainda nao produziu nada nunca economiza o que importa;
      2. o abandono e registrado, para nunca mais ser silencioso.
    """
    yielded = 0
    async for line in response.content:
        if yielded and await request.is_disconnected():
            logger.info("[ROTEAMENTO LOCAL] Cliente desconectou apos %d chunks; abortando geracao.", yielded)
            break
        line_str = line.decode("utf-8").strip()
        if not line_str:
            continue
        content, done = _parse_ollama_chunk(line_str)
        if content:
            yielded += 1
            yield content
        if done:
            break
    if not yielded:
        logger.warning("[ROTEAMENTO LOCAL] Ollama fechou o stream sem nenhum chunk util.")


async def _check_vram_offload(target_model: str) -> None:
    vram_error = await asyncio.to_thread(_validate_thermodynamic_hardware, target_model)
    if vram_error:
        force_local = os.environ.get("SOTA_FORCE_LOCAL") == "1" or CONFIG_DATA.get("resources", {}).get(
            "force_local", False
        )
        if force_local:
            logger.warning("[SOTA PERF] %s (Ignorado por force_local)", vram_error)
        else:
            logger.warning("[SOTA PERF] %s. Acionando Fallback Cloud...", vram_error)
            raise RuntimeError(vram_error)


# Fatia fixa por modelo, o esquema anterior. Preservado porque ainda e a saida
# certa quando o dono QUER reservar GPU para outra coisa e aceita pagar em
# latencia  mas nao pode mais ser o padrao. Ver _get_target_gpu_layers.
_STATIC_GPU_LAYERS = {"12b": 26, "e4b": 18, "4b": 18, "e2b": 12}


def _get_target_gpu_layers(target_model: str) -> int:
    """Quantas camadas vao para a GPU. -1 = o runtime decide medindo.

    ISTO NAO E PROPRIEDADE DO MODELO. Quantas camadas cabem depende da VRAM
    LIVRE no instante da carga, e essa maquina varia o proprio orcamento  a
    placa e compartilhada e o dono limita a fatia conforme o que mais esteja
    rodando. Uma constante congela a medicao de um dia especifico e erra em
    todos os outros.

    MEDIDO em 2026-08-23: com o valor fixo de 18 para o e4b, o llama.cpp
    reportou `Vulkan0 - 7367 MiB free` e ainda assim carregou apenas
    18/43 camadas, ocupando 1462 MiB. Sobraram 5,9 GB de GPU ociosos enquanto
    25 camadas rodavam na CPU: 54 s para uma resposta trivial.

    O encaixe automatico (LLAMA_ARG_FIT, ligado por sota_memory) le a VRAM livre
    de verdade e preserva LLAMA_ARG_FIT_TARGET MiB de folga, entao o -1 nao e
    "use tudo": e "meca e use o que couber, deixando a margem". Isso e o proprio
    balanceamento VRAM -> cache -> RAM que se queria, so que decidido por quem
    tem o dado.

    Para voltar ao esquema fixo: SOTA_GPU_LAYERS=static (ou um inteiro literal).
    """
    override = os.environ.get("SOTA_GPU_LAYERS", "").strip().lower()
    if override and override not in {"auto", "-1"}:
        if override == "static":
            return next((v for k, v in _STATIC_GPU_LAYERS.items() if k in target_model), -1)
        try:
            return int(override)
        except ValueError:
            logger.warning("[SOTA PERF] SOTA_GPU_LAYERS=%r invalido; usando encaixe automatico.", override)
    return -1


def _build_ollama_options(
    req: InferenceRequest,
    target_model: str,
    messages: list[dict[str, Any]],
) -> dict[str, Any]:
    """SOTA: Constroi opcoes de inferencia do Ollama calibradas termodinamicamente."""
    model_key = next((k for k in MODEL_INFERENCE_PARAMS if k in target_model), "31b")
    params = MODEL_INFERENCE_PARAMS[model_key].copy()

    if req.temperature is not None:
        params["temperature"] = req.temperature
    elif not req.system_prompt:
        params["temperature"] = 0.0

    static_ctx = os.environ.get("SOTA_STATIC_CONTEXT", "1") == "1"
    if static_ctx:
        num_ctx = int(params["num_ctx"])
    else:
        num_ctx = _calculate_dynamic_context(
            messages, req.max_tokens, int(params["num_ctx"]), int(params["num_predict"])
        )

    num_gpu = _get_target_gpu_layers(target_model)

    return {
        "temperature": params["temperature"],
        "top_p": params["top_p"],
        "top_k": params["top_k"],
        "repeat_penalty": 1.0,
        "num_predict": req.max_tokens or params["num_predict"],
        "num_ctx": num_ctx,
        "num_thread": params["num_thread"],
        "num_batch": 1024,
        "stop": ["<eos>", "</s>", "<unused50>", "<unused24>", "<|thought|>", "</thought>", "<think>", "</think>", "(-"],
        "num_gpu": num_gpu,
        "use_mmap": True,
    }


def _prepare_ollama_payload(
    req: InferenceRequest,
    ollama_model: str,
    messages: list[dict[str, Any]],
    options: dict[str, Any],
) -> dict[str, Any]:
    """SOTA: Sanitiza mensagens e monta o payload serializavel para Ollama."""
    sanitized = _sanitize_messages_for_gemma(messages)
    if req.images:
        for m in reversed(sanitized):
            if m.get("role") == "user":
                m["images"] = req.images
                break

    payload: dict[str, Any] = {
        "model": ollama_model,
        "messages": sanitized,
        "stream": True,
        "options": options,
        # MEDIDO em 2026-08-23 contra gemma4:e4b, que e um modelo de raciocinio:
        # sem este campo, TODO o orcamento de num_predict vai para
        # message.thinking e message.content chega vazio ao fim, com
        # done_reason="length". O servidor devolvia HTTP 200 e corpo vazio
        # sem excecao, sem log, sem sintoma que parecesse falha.
        #
        # Raciocinio nao e gratuito: e orcamento de tokens gasto antes da
        # primeira palavra da resposta. Para um gateway de inferencia o padrao
        # tem de ser resposta; quem quiser a cadeia de pensamento pede.
        "think": req.think if req.think is not None else os.environ.get("SOTA_THINK", "0") == "1",
    }
    if req.response_format:
        payload["format"] = req.response_format
    return payload


async def _stream_local(
    req: InferenceRequest,
    request: Request,
    messages: list[dict[str, Any]],
    target_model: str,
) -> AsyncGenerator[str, None]:
    """SOTA: Streaming via Ollama nativo com NDJSON e controle granular de contexto."""
    logger.info("[ROTEAMENTO LOCAL] Direcionando %s para Ollama nativo...", target_model)
    logger.info("[SISTEMA] Malha Ativa: 19 Agentes SOTA (Gemma 4 inclusive) | Entidade 20 (CEO Raphael Vitoi).")
    ollama_model = OLLAMA_MODEL_MAP.get(target_model, "gemma4:12b")

    await _check_vram_offload(target_model)

    options = _build_ollama_options(req, target_model, messages)
    payload = _prepare_ollama_payload(req, ollama_model, messages, options)

    headers = {"Content-Type": "application/json"}
    session = HTTPSessionManager.get_session()
    ollama_base = os.environ.get("OLLAMA_API_BASE", "http://127.0.0.1:11434")
    url = f"{ollama_base}/api/chat"

    yielded_any = False
    try:
        async with session.post(url, json=payload, headers=headers, timeout=_OLLAMA_TIMEOUT) as response:
            if response.status != 200:
                err_txt = await response.text()
                logger.warning("[ROTEAMENTO LOCAL] HTTP %s: %s", response.status, err_txt)
                raise RuntimeError(f"Falha ao comunicar com Ollama ({response.status}): {err_txt}")

            async for chunk in _consume_ollama_stream(response, request):
                yielded_any = True
                yield chunk
    except Exception as e:
        logger.warning("[ROTEAMENTO LOCAL] Erro ao consultar Ollama nativo para %s: %s", target_model, e)
        if not yielded_any:
            raise
        yield f"\n[ERRO LOCAL - STREAM ABORTADO]: {e}\n"


async def _stream_gemini(
    req: InferenceRequest,
    request: Request,
    messages: list[dict[str, str]],
    gemini_key: str,
    cloud_model: str,
) -> AsyncGenerator[str, None]:
    """SOTA: Streaming via Google AI Studio (OpenAI-compat)."""
    logger.info("[ROTEAMENTO CLOUD] Google AI Studio (%s)...", cloud_model)
    payload = _build_cloud_payload(req, cloud_model, messages)
    headers = {"Authorization": f"Bearer {gemini_key}", "Content-Type": _JSON_CONTENT}
    session = HTTPSessionManager.get_session()
    async for chunk in _stream_openai_compat(
        request,
        session,
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        headers,
        payload,
        "GEMINI",
    ):
        yield chunk


async def _stream_openrouter(
    req: InferenceRequest,
    request: Request,
    messages: list[dict[str, str]],
    openrouter_key: str,
    cloud_model: str,
) -> AsyncGenerator[str, None]:
    """SOTA: Streaming via OpenRouter (fallback final)."""
    logger.info("[ROTEAMENTO CLOUD] OpenRouter...")
    openrouter_model = f"google/{cloud_model}" if not cloud_model.startswith("google/") else cloud_model
    payload = _build_cloud_payload(req, openrouter_model, messages)
    headers = {"Authorization": f"Bearer {openrouter_key}", "Content-Type": _JSON_CONTENT}
    session = HTTPSessionManager.get_session()
    yielded = False
    async for chunk in _stream_openai_compat(
        request,
        session,
        "https://openrouter.ai/api/v1/chat/completions",
        headers,
        payload,
        "OPENROUTER",
    ):
        yielded = True
        yield chunk
    if not yielded:
        yield "[ENTROPIA CLOUD]: OpenRouter nao retornou chunks."


def _resolve_system_prompt(req: InferenceRequest) -> str:
    """Resolve o system prompt: customizado ou VITOI padrao."""
    if req.system_prompt is not None:
        return req.system_prompt
    return VITOI_SYSTEM_PROMPT.replace("**TAREFA:**", "").strip()


def _build_multiturn(req: InferenceRequest, rag_context: str) -> list[dict[str, str]]:
    """SOTA: Constroi mensagens multi-turn a partir do historico do cliente."""
    msgs = list(req.messages or [])
    # Garantir system prompt na posicao 0
    if not msgs or msgs[0].get("role") != "system":
        msgs.insert(0, {"role": "system", "content": _resolve_system_prompt(req)})
    # Injetar RAG no ultimo user message (cirurgico)
    if rag_context:
        for i in range(len(msgs) - 1, -1, -1):
            if msgs[i]["role"] == "user":
                msgs[i] = {"role": "user", "content": rag_context + msgs[i]["content"]}
                break
    return msgs


def _build_messages(req: InferenceRequest, rag_context: str) -> list[dict[str, str]]:
    """SOTA: Dispatcher de mensagens - multi-turn ou single-turn atomico."""
    if req.messages:
        return _build_multiturn(req, rag_context)

    # Single-turn: construcao atomica
    snapshot_block = _format_snapshot_block(req.physics_snapshot)
    profile_block = _format_predictive_profile(req.predictive_profile)
    sys_prompt = _resolve_system_prompt(req)

    if req.system_prompt is not None:
        # Conversacional: mensagem natural do usuario, sem framing agentico
        user_content = (rag_context + req.prompt).strip()
    else:
        # Agentico: framing completo com snapshot, perfil cognitivo e delimitadores
        user_content = (
            rag_context + snapshot_block + profile_block + "\n**TAREFA:**\n" + "[CENARIO/PERGUNTA]:\n" + req.prompt
        ).strip()

    return [
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": user_content},
    ]


async def _orchestrate_streams(
    req: InferenceRequest,
    request: Request,
    messages: list[dict[str, str]],
    target_model: str,
    gemini_key: str | None,
    openrouter_key: str | None,
    cloud_model: str,
    local_only: bool = False,
) -> AsyncGenerator[str, None]:
    # SOTA: Hibrido Local/Cloud para todos os modelos suportados.
    # 1. Tenta execucao local (Edge) para modelos 12B/4B/Edge (31B e estritamente Cloud)
    #
    # `local_success` mede CONCLUSAO, nao volume. A versao anterior so o marcava
    # ao ver o primeiro chunk, entao uma geracao local legitimamente vazia caia
    # para a nuvem  pagando por uma resposta que o local ja tinha dado.
    local_success = False
    if target_model != "31b_cloud":
        try:
            async for chunk in _stream_local(req, request, messages, target_model):
                yield chunk
            local_success = True
        except Exception as e:
            logger.warning("[HIBRIDO] Inferencia local para %s falhou: %s.", target_model, e)

    if local_success:
        return

    # O chamador nomeou o motor. Substitui-lo por um id remoto seria atender
    # outro pedido  e cobrar por isso. Falhar aqui e a resposta correta.
    if local_only:
        logger.warning("[HIBRIDO] %s foi pedido por nome; sem fallback para nuvem.", target_model)
        yield (
            f"[MOTOR LOCAL INDISPONIVEL]: '{req.model}' foi pedido explicitamente e o Ollama nao "
            f"atendeu. Nao ha fallback para nuvem quando o motor e nomeado  servir outro modelo "
            f"remoto seria responder a uma pergunta diferente. Verifique o daemon em "
            f"{os.environ.get('OLLAMA_API_BASE', 'http://127.0.0.1:11434')}."
        )
        return

    # 2. Fallback Cloud (Gemini)
    if gemini_key:
        chunks_seen = False
        async for chunk in _stream_gemini(req, request, messages, gemini_key, cloud_model):
            chunks_seen = True
            yield chunk
        if chunks_seen:
            return

    # 3. Fallback Cloud Secundario (OpenRouter)
    if openrouter_key:
        async for chunk in _stream_openrouter(req, request, messages, openrouter_key, cloud_model):
            yield chunk
    else:
        yield "[ENTROPIA CRITICA]: Nenhum motor (local ou cloud) esta disponivel para atender esta requisicao."


@app.post("/generate", response_model=None)
@harmonizer.ultra_fast_async
async def generate_response(
    req: InferenceRequest,
    request: Request,
    _auth: Annotated[str, Depends(verify_sota_auth)],  # noqa: ARG001
) -> StreamingResponse:
    # Determina o modelo antes para saber se roda localmente e evitar RAG query expansion swapping
    pre_model = _determine_optimal_model(req.prompt, req.model, False)
    is_local = pre_model in OLLAMA_MODEL_MAP

    rag_context = await _get_rag_context_async(req.prompt, local_only=is_local)
    messages = _build_messages(req, rag_context)

    target_model = _determine_optimal_model(req.prompt, req.model, bool(rag_context))
    gemini_key, openrouter_key = _resolve_api_keys()
    cloud_model = CLOUD_MODEL_MAP.get(target_model, "gemma-4-31b-it")

    return StreamingResponse(
        _orchestrate_streams(
            req,
            request,
            messages,
            target_model,
            gemini_key,
            openrouter_key,
            cloud_model,
            local_only=_names_local_engine(req.model),
        ),
        media_type="text/plain",
    )


async def _openai_stream_adapter(gen: AsyncGenerator[str, None], model_name: str) -> AsyncGenerator[str, None]:
    """Adapta a stream SOTA para o padrao SSE do OpenAI."""
    chat_id = f"chatcmpl-{uuid.uuid4().hex}"
    created = int(time.time())

    initial_data = {
        "id": chat_id,
        "object": _CHAT_COMPLETION_CHUNK,
        "created": created,
        "model": model_name,
        "choices": [{"index": 0, "delta": {"role": "assistant", "content": ""}, "finish_reason": None}],
    }
    yield f"data: {json.dumps(initial_data)}\n\n"

    async for chunk in gen:
        data = {
            "id": chat_id,
            "object": _CHAT_COMPLETION_CHUNK,
            "created": created,
            "model": model_name,
            "choices": [{"index": 0, "delta": {"content": chunk}, "finish_reason": None}],
        }
        yield f"data: {json.dumps(data)}\n\n"

    final_data = {
        "id": chat_id,
        "object": _CHAT_COMPLETION_CHUNK,
        "created": created,
        "model": model_name,
        "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
    }
    yield f"data: {json.dumps(final_data)}\n\n"
    yield "data: [DONE]\n\n"


@app.post("/v1/chat/completions", response_model=None)
@harmonizer.ultra_fast_async
async def openai_chat_completions(
    req: OpenAICompletionRequest,
    request: Request,
    _auth: Annotated[str, Depends(verify_sota_auth)],
) -> StreamingResponse | dict:
    """SOTA: Endpoint OpenAI-Compatible para integracao fluida com IDEs (VS Code/Continue/Cline/Roo)."""
    prompt_str = req.messages[-1].text_content if req.messages else ""
    messages_dict = [{"role": m.role, "content": m.text_content} for m in req.messages]

    inference_req = InferenceRequest(
        prompt=prompt_str,
        messages=messages_dict,
        model=req.model,
        temperature=req.temperature,
        max_tokens=req.max_tokens or 4096,
    )

    pre_model = _determine_optimal_model(inference_req.prompt, inference_req.model, False)
    is_local = pre_model in OLLAMA_MODEL_MAP

    rag_context = await _get_rag_context_async(inference_req.prompt, local_only=is_local)
    final_messages = _build_messages(inference_req, rag_context)

    target_model = _determine_optimal_model(inference_req.prompt, inference_req.model, bool(rag_context))
    gemini_key, openrouter_key = _resolve_api_keys()
    cloud_model = CLOUD_MODEL_MAP.get(target_model, "gemma-4-31b-it")

    stream_gen = _orchestrate_streams(
        inference_req,
        request,
        final_messages,
        target_model,
        gemini_key,
        openrouter_key,
        cloud_model,
        local_only=_names_local_engine(inference_req.model),
    )

    if req.stream:
        return StreamingResponse(_openai_stream_adapter(stream_gen, target_model), media_type="text/event-stream")

    chunks = []
    async for chunk in stream_gen:
        chunks.append(chunk)
    full_text = "".join(chunks)
    return {
        "id": f"chatcmpl-{uuid.uuid4().hex}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": target_model,
        "choices": [{"index": 0, "message": {"role": "assistant", "content": full_text}, "finish_reason": "stop"}],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    }


if __name__ == "__main__":
    import uvicorn

    if os.name != "nt":
        try:
            import uvloop  # type: ignore[import-not-found, import-untyped] # noqa: PLC0415

            uvloop.install()
            logger.info("[INFRA] uvloop instalado e ativo como motor assincrono de alta performance.")
        except ImportError:
            logger.warning("[INFRA] uvloop nao detectado. Rodando sob o loop asyncio padrao.")

    # SOTA: Movido para a porta 17043 para nao colidir com o endpoint nativo do Ollama (11434)
    uvicorn.run(app, host="127.0.0.1", port=17043)
