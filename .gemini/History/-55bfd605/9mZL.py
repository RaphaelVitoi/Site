import os
import json
import time
import logging
import urllib.request
import urllib.error
import re
from pathlib import Path
from typing import List, Optional, Dict
from datetime import datetime

from core.schemas import Task
from database.queue_manager import QueueManager
from core.config import (
    _is_key_blocked, 
    _block_key, 
    _key_identifier, 
    KEY_BLOCKLIST,
    AGENT_ROUTING_MAP,
    DEEP_THINKING_MODELS,
    FAST_OPERATIONS_MODELS
)

def _load_env_keys() -> Dict[str, str]:
    keys = {}
    base_dir = Path(__file__).parent.parent.resolve()
    for file_name in ["_env.ps1", ".env"]:
        env_path = base_dir / file_name
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        match = re.search(r'(?:\$env:|\$)?([a-zA-Z0-9_]+)\s*[:=]\s*[\'"]?([^\'"\s#]+)[\'"]?', line)
                        if match: keys[match.group(1)] = match.group(2).strip()
            except Exception as e:
                logging.warning(f"Aviso ao ler {file_name}: {e}")
    return keys

def call_gemini(model: str, system_prompt: str, user_prompt: str, api_key: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data  = {"system_instruction": {"parts": [{"text": system_prompt}]}, "contents": [{"parts": [{"text": user_prompt}]}]}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            text = result['candidates'][0]['content']['parts'][0]['text']
            usage = result.get('usageMetadata', {})
            return text, usage
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.reason} - {e.read().decode('utf-8')}")

def call_anthropic(model: str, system_prompt: str, user_prompt: str, api_key: str) -> str:
    url = "https://api.anthropic.com/v1/messages"
    headers = {'Content-Type': 'application/json', 'x-api-key': api_key, 'anthropic-version': '2023-06-01'}
    data = {"model": model, "max_tokens": 4096, "system": system_prompt, "messages": [{"role": "user", "content": user_prompt}]}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            text = result['content'][0]['text']
            usage = result.get('usage', {})
            return text, usage
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.reason} - {e.read().decode('utf-8')}")

def call_openrouter(model: str, system_prompt: str, user_prompt: str, api_key: str) -> str:
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}'}
    data = {"model": model, "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}]}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            text = result['choices'][0]['message']['content']
            usage = result.get('usage', {})
            return text, usage
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.reason} - {e.read().decode('utf-8')}")

def _try_gemini(model: str, system_prompt: str, user_prompt: str, keys: List[str], task: Task, manager: QueueManager) -> Optional[str]:
    for i, key in enumerate(keys):
        provider_key = _key_identifier("gemini", key)
        if _is_key_blocked(provider_key): continue
        for attempt in range(2):
            try:
                logging.info(f"[{task.agent}] Acionando {model} (Chave {i+1})...")
                response_text, usage = call_gemini(model, system_prompt, user_prompt, key)
                manager.update_llm_cache(model, user_prompt, response_text)
                manager.record_api_usage(task.id, task.agent, model, "gemini", usage.get('promptTokenCount', 0), usage.get('candidatesTokenCount', 0))
                return response_text
            except Exception as e:
                error_msg = str(e)
                if "429" in error_msg:
                    if "quota" in error_msg.lower() or "exhausted" in error_msg.lower():
                        _block_key(provider_key)
                        break
                    elif attempt < 1:
                        time.sleep(5)
                        continue
                if "401" in error_msg or "403" in error_msg:
                    _block_key(provider_key)
                break
    return None

def _try_openrouter(model: str, system_prompt: str, user_prompt: str, keys: List[str], task: Task, manager: QueueManager) -> Optional[str]:
    for i, key in enumerate(keys):
        provider_key = _key_identifier("openrouter", key)
        if _is_key_blocked(provider_key): continue
        for attempt in range(3):
            try:
                logging.info(f"[{task.agent}] Acionando SOTA ({model} via OpenRouter - Chave {i+1})...")
                response_text, usage = call_openrouter(model, system_prompt, user_prompt, key)
                manager.update_llm_cache(model, user_prompt, response_text)
                manager.record_api_usage(task.id, task.agent, model, "openrouter", usage.get('prompt_tokens', 0), usage.get('completion_tokens', 0))
                return response_text
            except Exception as e:
                error_msg = str(e)
                if "401" in error_msg or "Unauthorized" in error_msg or "402" in error_msg:
                    _block_key(provider_key)
                    break
                if "404" in error_msg: break
                if "429" in error_msg:
                    if "limit" in error_msg.lower() or "quota" in error_msg.lower():
                        _block_key(provider_key)
                        break
                    elif attempt < 2:
                        time.sleep(5)
                        continue
                break
    return None

def _try_anthropic(model: str, system_prompt: str, user_prompt: str, keys: List[str], task: Task, manager: QueueManager) -> Optional[str]:
    for i, key in enumerate(keys):
        provider_key = _key_identifier("anthropic", key)
        if _is_key_blocked(provider_key): continue
        for attempt in range(3):
            try:
                logging.info(f"[{task.agent}] Acionando defesa PAGA ({model} - Chave {i+1})...")
                response_text, usage = call_anthropic(model, system_prompt, user_prompt, key)
                manager.update_llm_cache(model, user_prompt, response_text)
                manager.record_api_usage(task.id, task.agent, model, "anthropic", usage.get('input_tokens', 0), usage.get('output_tokens', 0))
                return response_text
            except Exception as e:
                if "401" in str(e) or "403" in str(e) or "credit" in str(e).lower() or "balance" in str(e).lower():
                    _block_key(provider_key)
                    break
                if "429" in str(e) and attempt < 2:
                    time.sleep(5)
                    continue
                break
    return None

def call_llm_api(task: Task, system_prompt: str, user_prompt: str, manager: QueueManager) -> str:
    agent_type = AGENT_ROUTING_MAP.get(task.agent, "fast_operations")
    models_to_try = list(DEEP_THINKING_MODELS) if agent_type == "deep_thinking" else list(FAST_OPERATIONS_MODELS)
    
    env_keys = _load_env_keys()
    all_env_vars = {**os.environ, **env_keys}
    gemini_keys, anthropic_keys, openrouter_keys = [], [], []
    
    for k, val in all_env_vars.items():
        if val:
            k_upper = k.upper()
            if k_upper.startswith("GEMINI_CLI"): continue
            if k_upper.startswith("GEMINI") or k_upper.startswith("GOOGLE"):
                if val not in gemini_keys: gemini_keys.append(val)
            elif k_upper.startswith("ANTHROPIC"):
                if val not in anthropic_keys: anthropic_keys.append(val)
            elif k_upper.startswith("OPENROUTER") or k_upper.startswith("OPEN_ROUTER"):
                if val not in openrouter_keys: openrouter_keys.append(val)

    if openrouter_keys:
        if agent_type == "deep_thinking":
            models_to_try.extend(["anthropic/claude-3.5-sonnet", "deepseek/deepseek-chat"])
        else:
            models_to_try.extend(["google/gemini-2.5-flash", "meta-llama/llama-3.1-8b-instruct"])

    for model in models_to_try:
        response = None
        if "/" in model: response = _try_openrouter(model, system_prompt, user_prompt, openrouter_keys, task, manager)
        elif "gemini" in model: response = _try_gemini(model, system_prompt, user_prompt, gemini_keys, task, manager)
        elif "deepseek" in model or "llama" in model: response = _try_openrouter(model, system_prompt, user_prompt, openrouter_keys, task, manager)
        elif "claude" in model: response = _try_anthropic(model, system_prompt, user_prompt, anthropic_keys, task, manager)

        if response: return response
            
    logging.warning(f"[{task.agent}] Modo Simulacao Ativado.")
    return f"### ALERTA DE CONTINGÊNCIA (FALLBACK)\nO agente `{task.agent}` falhou. Nenhuma API respondeu.\n```json\n[\n  {{\"description\": \"Troque as chaves de API\", \"agent\": \"@planner\"}}\n]\n```"