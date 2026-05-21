import logging
import os
from typing import Optional

import aiohttp

from utils.text import enforce_pure_ascii


async def call_perplexity_search(session: aiohttp.ClientSession, api_key: str, query: str) -> Optional[str]:
    """Executa uma busca na web usando a API da Perplexity e formata os resultados.
    Usa o modelo sonar (tier gratuito) por padrao. Configuravel via PERPLEXITY_MODEL."""
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": f"Bearer {api_key}"
    }
    perplexity_model = os.environ.get("PERPLEXITY_MODEL", "sonar")
    payload = {
        "model": perplexity_model,
        "messages": [
            {"role": "system", "content": "Voce e um assistente de pesquisa preciso e conciso que responde em Pure ASCII."},
            {"role": "user", "content": query}
        ]
    }
    try:
        async with session.post(url, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=45)) as response:
            response.raise_for_status()
            result = await response.json()
            if not result or not result.get("choices"):
                return None
            answer = result["choices"][0]["message"]["content"]
            answer = enforce_pure_ascii(answer)
            return f"== CONTEXTO DA WEB (PERPLEXITY API) ==\n{answer}"
    except Exception as e:
        logging.warning(f"Falha na busca web (Perplexity): {e}")
        return None


async def call_tavily_search(session: aiohttp.ClientSession, api_key: str, query: str, max_results: int = 3) -> Optional[str]:
    """Executa uma busca na web usando a API da Tavily e formata os resultados para o prompt."""
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "advanced",
        "max_results": max_results,
        "include_answer": True,
        "include_raw_content": False,
        "include_images": False,
    }
    try:
        async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=30)) as response:
            response.raise_for_status()
            result = await response.json()

            if not result or (not result.get("results") and not result.get("answer")):
                return None

            answer = result.get("answer", "")
            # SOTA: Purificacao ASCII para evitar corrupcao de prompt
            answer = enforce_pure_ascii(answer)

            formatted_results = []
            if result.get("results"):
                for res in result["results"]:
                    title = enforce_pure_ascii(res.get('title', ''))
                    content = enforce_pure_ascii(res.get('content', ''))
                    formatted_results.append(f"Fonte: {res['url']} (Titulo: {title})\nConteudo: {content}")

            return f"== CONTEXTO DA WEB (TAVILY API) ==\n{'Resposta Direta: ' + answer + chr(10) + chr(10) if answer else ''}" + "\n\n---\n\n".join(formatted_results)
    except Exception as e:
        logging.warning(f"Falha na busca web (Tavily): {e}")
        return None
