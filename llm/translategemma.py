"""Adaptador SOTA para TranslateGemma 4B (local-first via Ollama + MediaPool cloud fallback).

Ativa, otimiza e harmoniza ``translategemma:4b`` (Gemma 3, 4.3B Q4_K_M, 131K ctx,
capacidade ``completion`` + ``vision``) como tradutor canonico multilingue e
camada de normalizacao cross-lingual do ecossistema Chico SOTA.

Principios de engenharia:
  1. Custo zero em nuvem por padrao: executa localmente via Ollama ``:11434``
     (``/api/chat``) com checagem de RAM e ``keep_alive`` configuravel.
  2. Failover resiliente: quando Ollama esta indisponivel ou offline, aciona
     ``llm.media_pool.media_pool_manager`` na modalidade ``"translate"``
     (Gemini / OpenRouter) com circuit breaker por status HTTP.
  3. Integridade terminologica: protege blocos de codigo, backticks, URLs e
     glossario PMev/GTO (``PMev``, ``ICM``, ``GTO``, ``EV``, ``ROI``, ``SPR``,
     ``MDF``, posicoes e cartas) contra alucinacoes de traducao.
  4. Suporte multimodal nativo: ``translate_image`` aceita capturas de tela de
     solvers (HRC, GTOWizard), HUDs ou UIs estrangeiras via ``images=[b64]``.
"""

from __future__ import annotations

import base64
from dataclasses import asdict, dataclass
import json
import logging
import os
from pathlib import Path
import re
import time
from typing import Any, Literal
import urllib.error
from urllib.parse import urlsplit
import urllib.request

from llm.media_pool import media_pool_manager
from llm.system2_local import _ollama_base, _ollama_model_fits_ram, ollama_online, resolve_model

logger = logging.getLogger("chico.translategemma")

TRANSLATEGEMMA_ALIAS = "translategemma_4b"
TRANSLATEGEMMA_DEFAULT_MODEL = "translategemma:4b"
DEFAULT_TRANSLATE_KEEP_ALIVE = os.environ.get("CHICO_TRANSLATE_KEEP_ALIVE", "30m")
DEFAULT_CLOUD_GEMINI_MODEL = "gemini-3.5-flash-lite"
DEFAULT_CLOUD_OPENROUTER_MODEL = "google/gemini-2.5-flash-lite"
_CONTENT_TYPE_JSON = "application/json"

DomainMode = Literal["general", "poker", "tech"]

SUPPORTED_LANGUAGES: dict[str, str] = {
    "en": "English",
    "pt": "Portuguese",
    "pt-br": "Portuguese (Brazil)",
    "pt-pt": "Portuguese (Portugal)",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "ja": "Japanese",
    "zh": "Chinese",
    "zh-cn": "Chinese (Simplified)",
    "zh-tw": "Chinese (Traditional)",
    "ko": "Korean",
    "ru": "Russian",
    "ar": "Arabic",
    "nl": "Dutch",
    "pl": "Polish",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "hi": "Hindi",
    "sv": "Swedish",
}

_CANONICAL_CODES: dict[str, tuple[str, str]] = {
    "en": ("en", "English"),
    "en-us": ("en-US", "English"),
    "en-gb": ("en-GB", "English"),
    "pt": ("pt", "Portuguese"),
    "pt-br": ("pt-BR", "Portuguese"),
    "pt-pt": ("pt-PT", "Portuguese"),
    "es": ("es", "Spanish"),
    "fr": ("fr", "French"),
    "de": ("de", "German"),
    "it": ("it", "Italian"),
    "ja": ("ja", "Japanese"),
    "zh": ("zh-CN", "Chinese"),
    "zh-cn": ("zh-CN", "Chinese"),
    "zh-tw": ("zh-TW", "Chinese"),
    "ko": ("ko", "Korean"),
    "ru": ("ru", "Russian"),
    "ar": ("ar", "Arabic"),
    "nl": ("nl", "Dutch"),
    "pl": ("pl", "Polish"),
    "tr": ("tr", "Turkish"),
    "uk": ("uk", "Ukrainian"),
    "hi": ("hi", "Hindi"),
    "sv": ("sv", "Swedish"),
}

PROTECTED_POKER_TERMS: tuple[str, ...] = (
    "PMev",
    "ICMev",
    "ICM",
    "GTO",
    "Nash",
    "EV",
    "ROI",
    "SPR",
    "MDF",
    "MDA",
    "HRC",
    "UTG",
    "HJ",
    "CO",
    "BTN",
    "SB",
    "BB",
    "OOP",
    "IP",
    "3-bet",
    "4-bet",
    "c-bet",
    "all-in",
)

_CODE_SPAN_RE = re.compile(r"```[\s\S]*?```|https?://[^\s)\]>\"']+")
_PT_MARKERS_RE = re.compile(
    r"\b(?:para|com|nao|uma|como|mais|muito|voce|porque|entao|sobre|entre|sempre|ainda|pode|agora|"
    r"qual|quais|quando|quanto|onde|quem|faz|fazer|deve|devo|posso|tenho|esta|esse|essa|isso|"
    r"mesa|mao|maos|torneio|bolha|vilao|viloes|pote|fichas|apostar|aumentar|pagar|foldar|"
    r"meu|minha|seus|suas|nosso|nossa|tambem|sem)\b"
    r"|[\u00e3\u00f5\u00e7\u00e1\u00e9\u00ed\u00f3\u00fa\u00e2\u00ea\u00f4\u00e0]",
    re.IGNORECASE,
)
_ES_MARKERS_RE = re.compile(
    r"\b(?:para|con|pero|como|porque|entonces|siempre|ahora|sobre|puede|tengo|tiene|"
    r"cual|cuando|cuanto|donde|quien|hacer|debe|puedo|villano|ficha|fichas|apostar|subir|pagar|mesa|torneo)\b|[\u00f1\u00a1\u00bf]",
    re.IGNORECASE,
)
_FR_MARKERS_RE = re.compile(
    r"\b(?:avec|pour|dans|mais|comme|toujours|maintenant|entre|nous|vous)\b|[\u00e0\u00e8\u00e9\u00ea\u00eb\u00ee\u00ef\u00f4\u00f9\u00fb\u00fc\u00e7]",
    re.IGNORECASE,
)
_CJK_RE = re.compile(r"[\u4e00-\u9fff]")
_HIRAGANA_KATAKANA_RE = re.compile(r"[\u3040-\u30ff]")
_HANGUL_RE = re.compile(r"[\uac00-\ud7af]")
_CYRILLIC_RE = re.compile(r"[\u0400-\u04ff]")
_ARABIC_RE = re.compile(r"[\u0600-\u06ff]")


@dataclass(frozen=True, slots=True)
class TranslationProvenia:
    """Contrato minimo de proveniencia para execucoes TranslateGemma."""

    engine_id: str
    implementation_level: str
    runtime_used: str
    model_used: str
    intended_model: str
    weights_loaded: bool
    fallback_used: bool
    cost_usd: float


@dataclass(frozen=True, slots=True)
class TranslationResult:
    """Resultado estruturado de traducao/normalizacao multilingue."""

    text: str
    source_lang: str
    target_lang: str
    domain: str
    latency_ms: float
    preserved_terms: list[str]
    skipped: bool
    provenia: TranslationProvenia
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Serializa resultado com proveniencia plana para payloads HTTP/CLI."""
        return {
            "text": self.text,
            "source_lang": self.source_lang,
            "target_lang": self.target_lang,
            "domain": self.domain,
            "latency_ms": self.latency_ms,
            "preserved_terms": list(self.preserved_terms),
            "skipped": self.skipped,
            "error": self.error,
            "provenia": asdict(self.provenia),
        }


def normalize_lang_code(lang: str) -> tuple[str, str]:
    """Normaliza codigo BCP-47/alias para par ``(codigo_canonico, nome_ingles)``."""
    raw = (lang or "en").strip().replace("_", "-")
    key = raw.lower()
    if key in _CANONICAL_CODES:
        return _CANONICAL_CODES[key]
    base = key.split("-", maxsplit=1)[0]
    if base in _CANONICAL_CODES:
        code_base, name_base = _CANONICAL_CODES[base]
        return (raw if "-" in raw else code_base, name_base)
    return (raw, SUPPORTED_LANGUAGES.get(key, raw))


def detect_source_language(text: str) -> str:
    """Heuristica leve (zero-deps, <0.2ms) para inferir codigo ISO do texto."""
    sample = (text or "").strip()
    if not sample:
        return "en"
    if _HIRAGANA_KATAKANA_RE.search(sample):
        return "ja"
    if _HANGUL_RE.search(sample):
        return "ko"
    if _CJK_RE.search(sample):
        return "zh-CN"
    if _CYRILLIC_RE.search(sample):
        return "ru"
    if _ARABIC_RE.search(sample):
        return "ar"

    pt_hits = len(_PT_MARKERS_RE.findall(sample))
    es_hits = len(_ES_MARKERS_RE.findall(sample))
    fr_hits = len(_FR_MARKERS_RE.findall(sample))
    if pt_hits >= 1 and pt_hits >= es_hits and pt_hits >= fr_hits:
        return "pt-BR"
    if es_hits >= 1 and es_hits > pt_hits and es_hits >= fr_hits:
        return "es"
    if fr_hits >= 2 and fr_hits > pt_hits:
        return "fr"
    return "en"


def _apply_code_shield(text: str) -> tuple[str, dict[str, str]]:
    """Substitui blocos de codigo e URLs por tokens estaveis antes da traducao."""
    spans: dict[str, str] = {}

    def _repl(match: re.Match[str]) -> str:
        token = f"[[TG_CODE_{len(spans)}]]"
        spans[token] = match.group(0)
        return token

    return _CODE_SPAN_RE.sub(_repl, text), spans


def _restore_code_shield(translated: str, spans: dict[str, str]) -> str:
    """Restaura exatamente os spans de codigo/URL apos a decodificacao."""
    out = translated
    for token, original in spans.items():
        out = out.replace(token, original)
    return out


def _detect_preserved_terms(source_text: str, output_text: str, extra_terms: tuple[str, ...] = ()) -> list[str]:
    """Lista termos canonicos presentes no input que permaneceram intactos na saida."""
    terms = dict.fromkeys([*PROTECTED_POKER_TERMS, *extra_terms])
    preserved: list[str] = []
    for term in terms:
        if re.search(rf"(?<!\w){re.escape(term)}(?!\w)", source_text) and re.search(
            rf"(?<!\w){re.escape(term)}(?!\w)", output_text
        ):
            preserved.append(term)
    return preserved


def build_translategemma_prompt(
    text: str,
    source_lang: str,
    target_lang: str,
    domain: DomainMode = "general",
    glossary_terms: tuple[str, ...] | list[str] | None = None,
) -> str:
    """Constroi prompt oficial Google TranslateGemma 4B com restricoes de dominio."""
    src_code, src_name = normalize_lang_code(source_lang)
    tgt_code, tgt_name = normalize_lang_code(target_lang)

    guidance_parts: list[str] = []
    if domain == "poker":
        guidance_parts.append(
            "Preserve exact poker/game-theory terms and notation verbatim "
            "(PMev, ICMev, ICM, GTO, EV, ROI, SPR, MDF, HRC, UTG, HJ, CO, BTN, SB, BB, OOP, IP, "
            "3-bet, 4-bet, c-bet, all-in, stack sizes in bb, and card notation such as AsKs or Kd Jc Ts)."
        )
    elif domain == "tech":
        guidance_parts.append(
            "Preserve markdown formatting, file paths, API endpoints, JSON keys, CLI flags, "
            "numbers, and placeholders such as [[TG_CODE_0]] exactly as written."
        )
    else:
        guidance_parts.append("Preserve numbers, proper nouns, and placeholders such as [[TG_CODE_0]] verbatim.")

    if glossary_terms:
        joined = ", ".join(t for t in glossary_terms if t.strip())
        if joined:
            guidance_parts.append(f"Keep these glossary tokens untranslated: {joined}.")

    guidance = " ".join(guidance_parts)
    return (
        f"You are a professional {src_name} ({src_code}) to {tgt_name} ({tgt_code}) translator. "
        f"Your goal is to accurately convey the meaning and nuances of the original {src_name} text "
        f"while adhering to {tgt_name} grammar, vocabulary, and cultural sensitivities. "
        f"{guidance} "
        f"Produce only the {tgt_name} translation, without any additional explanations or commentary. "
        f"Please translate the following {src_name} text into {tgt_name}:\n\n\n{text}"
    )


def _strip_preamble(raw_text: str) -> str:
    """Remove cercas ou espacos residuais mantendo apenas o texto traduzido."""
    return raw_text.strip()


def _resolve_translategemma_tag(model: str | None) -> str:
    if model and model.strip():
        return resolve_model(model.strip())
    resolved = resolve_model(TRANSLATEGEMMA_ALIAS)
    return resolved if resolved != TRANSLATEGEMMA_ALIAS else TRANSLATEGEMMA_DEFAULT_MODEL


def _post_json_endpoint(
    url: str,
    payload: dict[str, Any],
    *,
    headers: dict[str, str],
    timeout_s: float,
    require_https: bool,
) -> tuple[int, dict[str, Any]]:
    """Executa POST JSON validando esquema HTTP/HTTPS de transporte."""
    parsed = urlsplit(url)
    allowed_schemes = ("https",) if require_https else ("http", "https")
    if parsed.scheme not in allowed_schemes or not parsed.netloc:
        raise ValueError(f"Endpoint invalido ou inseguro para TranslateGemma: {url}")
    if parsed.scheme == "http" and (parsed.hostname or "") not in ("127.0.0.1", "localhost", "::1"):
        raise ValueError(f"HTTP plano permitido apenas em loopback local: {url}")

    body = json.dumps(payload).encode("utf-8")
    req_headers = {"Content-Type": _CONTENT_TYPE_JSON, **headers}
    req = urllib.request.Request(url, data=body, headers=req_headers, method="POST")  # noqa: S310 - esquema/loopback validado acima  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:  # noqa: S310 - esquema/loopback validado acima  # Record-Id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
            raw = resp.read().decode("utf-8")
            return resp.status, (json.loads(raw) if raw.strip() else {})
    except urllib.error.HTTPError as exc:
        raw_err = exc.read().decode("utf-8", errors="ignore")
        return exc.code, {"error": raw_err[:400]}


def _call_ollama_translate(
    *,
    model_tag: str,
    prompt: str,
    images_b64: list[str] | None,
    keep_alive: str,
    timeout_s: float,
) -> tuple[str, float]:
    """Executa traducao local em Ollama ``/api/chat`` (suporta texto e visao)."""
    message: dict[str, Any] = {"role": "user", "content": prompt}
    if images_b64:
        message["images"] = images_b64
    payload: dict[str, Any] = {
        "model": model_tag,
        "messages": [message],
        "stream": False,
        "keep_alive": keep_alive,
        "options": {
            "temperature": 0.1,
            "top_p": 0.95,
            "top_k": 64,
            "num_ctx": 8192,
        },
    }
    url = f"{_ollama_base()}/api/chat"
    t0 = time.perf_counter()
    status, data = _post_json_endpoint(url, payload, headers={}, timeout_s=timeout_s, require_https=False)
    latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
    if status != 200:
        raise RuntimeError(f"Ollama /api/chat HTTP {status}: {data.get('error', '')}")
    msg = data.get("message") or {}
    content = str(msg.get("content") or data.get("response") or "")
    if not content.strip():
        raise RuntimeError(f"Ollama devolveu resposta vazia para {model_tag}.")
    return _strip_preamble(content), latency_ms


def _call_aistudio_translate(
    *,
    key: str,
    provider: str,
    prompt: str,
    images_b64: list[str] | None,
    timeout_s: float,
) -> tuple[str | None, float, str]:
    """Dispara requisicao de traducao para AI Studio Gemini REST."""
    parts: list[dict[str, Any]] = [{"text": prompt}]
    for img in images_b64 or []:
        parts.append({"inline_data": {"mime_type": "image/png", "data": img}})
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{DEFAULT_CLOUD_GEMINI_MODEL}:generateContent"
    t0 = time.perf_counter()
    status, data = _post_json_endpoint(
        url,
        {
            "contents": [{"role": "user", "parts": parts}],
            "generationConfig": {"temperature": 0.1, "topP": 0.95},
        },
        headers={"x-goog-api-key": key},
        timeout_s=timeout_s,
        require_https=True,
    )
    latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
    if status != 200:
        media_pool_manager.mark_failure("translate", key, status_code=status)
        return None, latency_ms, f"{provider} HTTP {status}"
    cands = data.get("candidates") or []
    res_parts = ((cands[0].get("content") or {}).get("parts") or []) if cands else []
    txt = "".join(str(p.get("text") or "") for p in res_parts if isinstance(p, dict))
    if not txt.strip():
        return None, latency_ms, f"{provider} candidate vazio"
    media_pool_manager.mark_success("translate", key)
    return _strip_preamble(txt), latency_ms, ""


def _call_openrouter_translate(
    *,
    key: str,
    prompt: str,
    images_b64: list[str] | None,
    timeout_s: float,
) -> tuple[str | None, float, str]:
    """Dispara requisicao de traducao para OpenRouter Chat Completions."""
    content_items: list[dict[str, Any]] | str
    if images_b64:
        content_items = [{"type": "text", "text": prompt}]
        for img in images_b64:
            content_items.append({"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img}"}})
    else:
        content_items = prompt
    t0 = time.perf_counter()
    status, data = _post_json_endpoint(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            "model": DEFAULT_CLOUD_OPENROUTER_MODEL,
            "messages": [{"role": "user", "content": content_items}],
            "temperature": 0.1,
        },
        headers={"Authorization": f"Bearer {key}"},
        timeout_s=timeout_s,
        require_https=True,
    )
    latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)
    if status != 200:
        media_pool_manager.mark_failure("translate", key, status_code=status)
        return None, latency_ms, f"OpenRouter HTTP {status}"
    choices = data.get("choices") or []
    txt = str((choices[0].get("message") or {}).get("content") or "") if choices else ""
    if not txt.strip():
        return None, latency_ms, "OpenRouter choice vazio"
    media_pool_manager.mark_success("translate", key)
    return _strip_preamble(txt), latency_ms, ""


def _call_cloud_translate_pool(
    *,
    prompt: str,
    images_b64: list[str] | None,
    timeout_s: float,
) -> tuple[str, float, str, str]:
    """Aciona failover cloud via ``media_pool_manager`` na modalidade ``translate``."""
    candidates = media_pool_manager.iter_candidates("translate")
    if not candidates:
        raise RuntimeError("Nenhuma chave configurada no media_pool para modalidade 'translate'.")

    last_err = "sem resposta"
    for _ in range(len(candidates)):
        sel = media_pool_manager.next_key("translate")
        if sel.provider in ("aistudio", "gemini"):
            txt, latency_ms, err = _call_aistudio_translate(
                key=sel.key,
                provider=sel.provider,
                prompt=prompt,
                images_b64=images_b64,
                timeout_s=timeout_s,
            )
            if txt is not None:
                return txt, latency_ms, DEFAULT_CLOUD_GEMINI_MODEL, f"media-pool-{sel.provider}"
            last_err = err
            continue

        txt, latency_ms, err = _call_openrouter_translate(
            key=sel.key,
            prompt=prompt,
            images_b64=images_b64,
            timeout_s=timeout_s,
        )
        if txt is not None:
            return txt, latency_ms, DEFAULT_CLOUD_OPENROUTER_MODEL, "media-pool-openrouter"
        last_err = err

    raise RuntimeError(f"Failover cloud 'translate' esgotado: {last_err}")


def _same_language(src_code: str, tgt_code: str) -> bool:
    s = src_code.lower().split("-", maxsplit=1)[0]
    t = tgt_code.lower().split("-", maxsplit=1)[0]
    if s != t:
        return False
    return src_code.lower() == tgt_code.lower() or "-" not in src_code or "-" not in tgt_code


def _try_local_translate(
    *,
    text: str,
    prompt: str,
    spans: dict[str, str],
    preserve_code: bool,
    src_code: str,
    tgt_code: str,
    domain: DomainMode,
    glossary: tuple[str, ...],
    model_tag: str,
    keep_alive: str,
    timeout_s: float,
) -> tuple[TranslationResult | None, str | None]:
    if not (_ollama_model_fits_ram(model_tag) and ollama_online()):
        return None, None
    try:
        decoded, latency_ms = _call_ollama_translate(
            model_tag=model_tag,
            prompt=prompt,
            images_b64=None,
            keep_alive=keep_alive,
            timeout_s=timeout_s,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("[translategemma] inferencia local falhou (%s); avaliando failover.", exc)
        return None, str(exc)

    final_text = _restore_code_shield(decoded, spans) if preserve_code else decoded
    return (
        TranslationResult(
            text=final_text,
            source_lang=src_code,
            target_lang=tgt_code,
            domain=domain,
            latency_ms=latency_ms,
            preserved_terms=_detect_preserved_terms(text, final_text, glossary),
            skipped=False,
            provenia=TranslationProvenia(
                engine_id="translategemma-local-ollama",
                implementation_level="trained-model",
                runtime_used="ollama",
                model_used=model_tag,
                intended_model=model_tag,
                weights_loaded=True,
                fallback_used=False,
                cost_usd=0.0,
            ),
        ),
        None,
    )


def _try_cloud_translate(
    *,
    text: str,
    prompt: str,
    spans: dict[str, str],
    preserve_code: bool,
    src_code: str,
    tgt_code: str,
    domain: DomainMode,
    glossary: tuple[str, ...],
    model_tag: str,
    timeout_s: float,
) -> tuple[TranslationResult | None, str]:
    try:
        decoded, latency_ms, cloud_model, engine_id = _call_cloud_translate_pool(
            prompt=prompt,
            images_b64=None,
            timeout_s=timeout_s,
        )
    except Exception as exc:  # noqa: BLE001
        return None, str(exc)

    final_text = _restore_code_shield(decoded, spans) if preserve_code else decoded
    return (
        TranslationResult(
            text=final_text,
            source_lang=src_code,
            target_lang=tgt_code,
            domain=domain,
            latency_ms=latency_ms,
            preserved_terms=_detect_preserved_terms(text, final_text, glossary),
            skipped=False,
            provenia=TranslationProvenia(
                engine_id=engine_id,
                implementation_level="trained-model",
                runtime_used="cloud-rest",
                model_used=cloud_model,
                intended_model=model_tag,
                weights_loaded=True,
                fallback_used=True,
                cost_usd=0.0001,
            ),
        ),
        "",
    )


def translate_text(
    text: str,
    target_lang: str = "pt-BR",
    source_lang: str = "auto",
    domain: DomainMode = "general",
    *,
    preserve_code: bool = True,
    glossary_terms: tuple[str, ...] | list[str] | None = None,
    prefer_local: bool = True,
    allow_cloud_fallback: bool = True,
    keep_alive: str = DEFAULT_TRANSLATE_KEEP_ALIVE,
    timeout_s: float = 45.0,
    model: str | None = None,
) -> TranslationResult:
    """Traduz texto preservando glossario PMev/codigo, com prioridade 100% local Ollama."""
    raw = (text or "").strip()
    eff_source = detect_source_language(raw) if source_lang.strip().lower() == "auto" else source_lang
    src_code, _ = normalize_lang_code(eff_source)
    tgt_code, _ = normalize_lang_code(target_lang)
    model_tag = _resolve_translategemma_tag(model)
    glossary = tuple(glossary_terms or ())

    if not raw or _same_language(src_code, tgt_code):
        return TranslationResult(
            text=text,
            source_lang=src_code,
            target_lang=tgt_code,
            domain=domain,
            latency_ms=0.0,
            preserved_terms=_detect_preserved_terms(text, text, glossary),
            skipped=True,
            provenia=TranslationProvenia(
                engine_id="translategemma-noop-passthrough",
                implementation_level="primitive",
                runtime_used="python",
                model_used=model_tag,
                intended_model=model_tag,
                weights_loaded=False,
                fallback_used=False,
                cost_usd=0.0,
            ),
        )

    shielded_text, spans = _apply_code_shield(text) if preserve_code else (text, {})
    prompt = build_translategemma_prompt(
        shielded_text,
        source_lang=src_code,
        target_lang=tgt_code,
        domain=domain,
        glossary_terms=glossary_terms,
    )

    local_error: str | None = None
    if prefer_local:
        local_res, local_error = _try_local_translate(
            text=text,
            prompt=prompt,
            spans=spans,
            preserve_code=preserve_code,
            src_code=src_code,
            tgt_code=tgt_code,
            domain=domain,
            glossary=glossary,
            model_tag=model_tag,
            keep_alive=keep_alive,
            timeout_s=timeout_s,
        )
        if local_res is not None:
            return local_res

    if allow_cloud_fallback:
        cloud_res, cloud_err = _try_cloud_translate(
            text=text,
            prompt=prompt,
            spans=spans,
            preserve_code=preserve_code,
            src_code=src_code,
            tgt_code=tgt_code,
            domain=domain,
            glossary=glossary,
            model_tag=model_tag,
            timeout_s=timeout_s,
        )
        if cloud_res is not None:
            return cloud_res
        err_msg = f"local={local_error or 'indisponivel'}; cloud={cloud_err}"
    else:
        err_msg = local_error or "ollama-indisponivel-sem-fallback-cloud"

    return TranslationResult(
        text=text,
        source_lang=src_code,
        target_lang=tgt_code,
        domain=domain,
        latency_ms=0.0,
        preserved_terms=[],
        skipped=True,
        error=err_msg[:300],
        provenia=TranslationProvenia(
            engine_id="translategemma-passthrough-fallback",
            implementation_level="simulation",
            runtime_used="python",
            model_used="",
            intended_model=model_tag,
            weights_loaded=False,
            fallback_used=True,
            cost_usd=0.0,
        ),
    )


def translate_batch(
    texts: list[str] | tuple[str, ...],
    target_lang: str = "pt-BR",
    source_lang: str = "auto",
    domain: DomainMode = "general",
    **kwargs: Any,
) -> list[TranslationResult]:
    """Traduz sequencia de textos reaproveitando keep_alive ativo no Ollama."""
    return [translate_text(t, target_lang=target_lang, source_lang=source_lang, domain=domain, **kwargs) for t in texts]


def _load_image_base64(image_path_or_b64: str | Path, *, allow_local_path: bool = True) -> str:
    """Aceita caminho de arquivo de imagem ou string base64 ja codificada."""
    if isinstance(image_path_or_b64, Path):
        if not allow_local_path:
            raise ValueError("Caminho de arquivo local nao permitido.")
        return base64.b64encode(image_path_or_b64.read_bytes()).decode("ascii")
    candidate = image_path_or_b64.strip()
    if allow_local_path and len(candidate) < 512 and Path(candidate).is_file():
        return base64.b64encode(Path(candidate).read_bytes()).decode("ascii")
    if candidate.startswith("data:image/") and ";base64," in candidate:
        return candidate.split(";base64,", maxsplit=1)[1]
    return candidate


def translate_image(
    image_path_or_b64: str | Path,
    target_lang: str = "pt-BR",
    source_lang: str = "en",
    domain: DomainMode = "poker",
    *,
    instruction: str | None = None,
    prefer_local: bool = True,
    allow_cloud_fallback: bool = True,
    keep_alive: str = DEFAULT_TRANSLATE_KEEP_ALIVE,
    timeout_s: float = 60.0,
    model: str | None = None,
    allow_local_path: bool = True,
) -> TranslationResult:
    """Extrai e traduz texto visual (screenshots de solver/HUD/UI) usando capacidade vision."""
    b64_img = _load_image_base64(image_path_or_b64, allow_local_path=allow_local_path)
    src_code, src_name = normalize_lang_code(source_lang)
    tgt_code, tgt_name = normalize_lang_code(target_lang)
    model_tag = _resolve_translategemma_tag(model)

    prompt = instruction or (
        f"You are a professional {src_name} ({src_code}) to {tgt_name} ({tgt_code}) translator. "
        f"Extract all visible text from this image and translate it cleanly into {tgt_name}. "
        "Preserve poker notation (PMev, ICM, GTO, EV, BB, stack numbers, cards) verbatim. "
        f"Produce only the {tgt_name} translation without extra commentary."
    )

    if prefer_local and _ollama_model_fits_ram(model_tag) and ollama_online():
        try:
            decoded, latency_ms = _call_ollama_translate(
                model_tag=model_tag,
                prompt=prompt,
                images_b64=[b64_img],
                keep_alive=keep_alive,
                timeout_s=timeout_s,
            )
            return TranslationResult(
                text=decoded,
                source_lang=src_code,
                target_lang=tgt_code,
                domain=domain,
                latency_ms=latency_ms,
                preserved_terms=_detect_preserved_terms(decoded, decoded),
                skipped=False,
                provenia=TranslationProvenia(
                    engine_id="translategemma-vision-local-ollama",
                    implementation_level="trained-model",
                    runtime_used="ollama-vision",
                    model_used=model_tag,
                    intended_model=model_tag,
                    weights_loaded=True,
                    fallback_used=False,
                    cost_usd=0.0,
                ),
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("[translategemma] visao local falhou (%s); avaliando failover.", exc)

    if allow_cloud_fallback:
        decoded, latency_ms, cloud_model, engine_id = _call_cloud_translate_pool(
            prompt=prompt,
            images_b64=[b64_img],
            timeout_s=timeout_s,
        )
        return TranslationResult(
            text=decoded,
            source_lang=src_code,
            target_lang=tgt_code,
            domain=domain,
            latency_ms=latency_ms,
            preserved_terms=_detect_preserved_terms(decoded, decoded),
            skipped=False,
            provenia=TranslationProvenia(
                engine_id=f"{engine_id}-vision",
                implementation_level="trained-model",
                runtime_used="cloud-rest-vision",
                model_used=cloud_model,
                intended_model=model_tag,
                weights_loaded=True,
                fallback_used=True,
                cost_usd=0.0002,
            ),
        )

    raise RuntimeError("Nenhuma engine de visao disponivel para translate_image.")


def normalize_for_reasoning(
    text: str,
    target_lang: str = "en",
    domain: DomainMode = "poker",
    *,
    prefer_local: bool = True,
    allow_cloud_fallback: bool = False,
    timeout_s: float = 20.0,
) -> tuple[str, dict[str, Any]]:
    """Normaliza prompts/queries nao-inglesas para ingles canonico antes de S1/RAG/Solver.

    Retorna ``(texto_normalizado, telemetria)``. Quando o texto ja esta na lingua
    alvo (ex: ingles), retorna imediatamente com custo e latencia zero.
    """
    res = translate_text(
        text,
        target_lang=target_lang,
        source_lang="auto",
        domain=domain,
        prefer_local=prefer_local,
        allow_cloud_fallback=allow_cloud_fallback,
        timeout_s=timeout_s,
    )
    return res.text, {
        "normalized": not res.skipped,
        "source_lang": res.source_lang,
        "target_lang": res.target_lang,
        "latency_ms": res.latency_ms,
        "engine_id": res.provenia.engine_id,
        "model_used": res.provenia.model_used,
        "cost_usd": res.provenia.cost_usd,
    }


__all__ = [
    "PROTECTED_POKER_TERMS",
    "SUPPORTED_LANGUAGES",
    "TRANSLATEGEMMA_ALIAS",
    "TRANSLATEGEMMA_DEFAULT_MODEL",
    "TranslationProvenia",
    "TranslationResult",
    "build_translategemma_prompt",
    "detect_source_language",
    "normalize_for_reasoning",
    "normalize_lang_code",
    "translate_batch",
    "translate_image",
    "translate_text",
]
