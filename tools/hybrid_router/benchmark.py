#!/usr/bin/env python3
"""BENCHMARK DE CONCORRENCIA E CARGA ASSINCRONO PARA O HYBRID ROUTER.

Mede latencias estatisticas (p50, p90, p95, p99), vazao efetiva (RPS),
tokens de pensamento consumidos e exporta dataset estruturado em JSON.
"""

from __future__ import annotations

import asyncio
from dataclasses import asdict, dataclass, field
import json
import os
import time
from typing import Any

import httpx

import math


@dataclass(frozen=True)
class BenchmarkConfig:
    base_url: str = "http://127.0.0.1:8000"
    endpoint: str = "/v1/chat/generate"
    total_requests: int = 60
    concurrency: int = 10
    timeout_seconds: float = 60.0
    output_json_file: str = "benchmark_results.json"


PAYLOAD_POOL: list[dict[str, Any]] = [
    {
        "description": "Baixa Densidade (Candidato a Llama Local)",
        "payload": {
            "prompt": "Explique brevemente a diferenca entre compilacao JIT e AOT em tres topicos concisos.",
            "system_instruction": "Seja estritamente direto e tecnico.",
        },
    },
    {
        "description": "Alta Densidade Teoria dos Jogos (Candidato a Gemini Thinking)",
        "payload": {
            "prompt": "Dado um jogo matricial 2x2 com payoffs $U_1(A,A)=3$, $U_1(A,B)=0$, $U_1(B,A)=5$, $U_1(B,B)=1$, derive o equilibrio de Nash misto, o valor esperado e a variancia sob restricao de ICM.",
            "system_instruction": "Atue como motor axiomatico de Teoria dos Jogos.",
        },
    },
    {
        "description": "Engenharia de Software (Candidato a Gemini Cloud Standard)",
        "payload": {
            "prompt": "Refatore o seguinte bloco em Rust garantindo zero-allocation: fn process_stream(data: &[u8]) -> Vec<u8> { data.to_vec() }",
            "system_instruction": "Mantenha rigorosa conformidade de tipagem.",
        },
    },
]


@dataclass
class RequestResult:
    status_code: int
    latency_ms: float
    target_executed: str
    thinking_tokens: int
    tokens_evaluated: int
    is_success: bool
    error_message: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class BenchmarkMetrics:
    total_requests: int
    successful_requests: int
    failed_requests: int
    total_time_seconds: float
    rps: float
    latencies: list[float] = field(default_factory=list)
    targets_count: dict[str, int] = field(default_factory=dict)
    total_thinking_tokens: int = 0
    errors: list[str] = field(default_factory=list)
    raw_results: list[RequestResult] = field(default_factory=list)

    def percentile(self, p: float) -> float:
        if not self.latencies:
            return 0.0
        sorted_lat = sorted(self.latencies)
        k = (len(sorted_lat) - 1) * (p / 100.0)
        f = math.floor(k)
        c = math.ceil(k)
        if f == c:
            return sorted_lat[int(k)]
        d0 = sorted_lat[int(f)] * (c - k)
        d1 = sorted_lat[int(c)] * (k - f)
        return d0 + d1


async def send_request(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    url: str,
    payload_data: dict[str, Any],
) -> RequestResult:
    async with semaphore:
        start_time = time.perf_counter()
        try:
            response = await client.post(url, json=payload_data["payload"])
            latency_ms = (time.perf_counter() - start_time) * 1000.0

            if response.status_code == 200:
                data = response.json()
                return RequestResult(
                    status_code=response.status_code,
                    latency_ms=latency_ms,
                    target_executed=data.get("target_executed", "UNKNOWN"),
                    thinking_tokens=data.get("thinking_tokens_used", 0),
                    tokens_evaluated=data.get("tokens_evaluated", 0),
                    is_success=True,
                )
            return RequestResult(
                status_code=response.status_code,
                latency_ms=latency_ms,
                target_executed="FAILED",
                thinking_tokens=0,
                tokens_evaluated=0,
                is_success=False,
                error_message=f"HTTP {response.status_code}: {response.text[:120]}",
            )
        except Exception as exc:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            return RequestResult(
                status_code=0,
                latency_ms=latency_ms,
                target_executed="ERROR",
                thinking_tokens=0,
                tokens_evaluated=0,
                is_success=False,
                error_message=str(exc),
            )


def export_results_to_json(results: list[RequestResult], filepath: str) -> None:
    serializable_data = [r.to_dict() for r in results]
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(serializable_data, f, indent=2, ensure_ascii=False)
    print(f"\n[EXPORTACAO] {len(serializable_data)} registros salvos em: {os.path.abspath(filepath)}")


async def run_benchmark(config: BenchmarkConfig) -> BenchmarkMetrics:
    url = f"{config.base_url.rstrip('/')}{config.endpoint}"
    semaphore = asyncio.Semaphore(config.concurrency)
    limits = httpx.Limits(max_keepalive_connections=config.concurrency, max_connections=config.concurrency * 2)
    timeout = httpx.Timeout(config.timeout_seconds, connect=5.0)

    print("\n[INICIALIZANDO BENCHMARK SOTA]")
    print(f"Target URL:        {url}")
    print(f"Total Requests:    {config.total_requests}")
    print(f"Concorrencia:      {config.concurrency}")
    print(f"Export Target:     {config.output_json_file}\n")

    async with httpx.AsyncClient(limits=limits, timeout=timeout) as client:
        try:
            health_res = await client.get(f"{config.base_url.rstrip('/')}/health")
            print(f"Health Status:     {health_res.json()}")
        except Exception as e:
            print(f"[AVISO] Falha ao verificar /health: {e}")

        tasks: list[asyncio.Task[RequestResult]] = []
        for i in range(config.total_requests):
            payload_item = PAYLOAD_POOL[i % len(PAYLOAD_POOL)]
            tasks.append(asyncio.create_task(send_request(client, semaphore, url, payload_item)))

        bench_start = time.perf_counter()
        results = await asyncio.gather(*tasks)
        total_time = time.perf_counter() - bench_start

    metrics = BenchmarkMetrics(
        total_requests=len(results),
        successful_requests=sum(1 for r in results if r.is_success),
        failed_requests=sum(1 for r in results if not r.is_success),
        total_time_seconds=total_time,
        rps=len(results) / total_time if total_time > 0 else 0.0,
        raw_results=results,
    )

    for r in results:
        metrics.latencies.append(r.latency_ms)
        if r.is_success:
            metrics.targets_count[r.target_executed] = metrics.targets_count.get(r.target_executed, 0) + 1
            metrics.total_thinking_tokens += r.thinking_tokens
        elif r.error_message:
            metrics.errors.append(r.error_message)

    export_results_to_json(results, config.output_json_file)
    return metrics


def display_report(metrics: BenchmarkMetrics) -> None:
    avg_latency = sum(metrics.latencies) / len(metrics.latencies) if metrics.latencies else 0.0
    min_latency = min(metrics.latencies) if metrics.latencies else 0.0
    max_latency = max(metrics.latencies) if metrics.latencies else 0.0

    print("=" * 75)
    print("                RELATORIO DE DESEMPENHO E CONCORRENCIA                ")
    print("=" * 75)
    print(f"Tempo Total de Execucao:    {metrics.total_time_seconds:.2f} s")
    print(f"Taxa de Throughput (RPS):   {metrics.rps:.2f} req/s")
    print(f"Requisicoes Totais:         {metrics.total_requests}")
    print(
        f"Sucesso:                    {metrics.successful_requests} ({((metrics.successful_requests / metrics.total_requests) * 100):.1f}%)"
    )
    print(
        f"Falhas / Timeouts:          {metrics.failed_requests} ({((metrics.failed_requests / metrics.total_requests) * 100):.1f}%)"
    )
    print(f"Thinking Tokens Gerados:    {metrics.total_thinking_tokens}")
    print("-" * 75)
    print("DISTRIBUICAO DE LATENCIA (ms)")
    print(f"  Min:  {min_latency:9.2f} ms | Avg:  {avg_latency:9.2f} ms | Max: {max_latency:9.2f} ms")
    print(f"  p50:  {metrics.percentile(50):9.2f} ms | p90:  {metrics.percentile(90):9.2f} ms")
    print(f"  p95:  {metrics.percentile(95):9.2f} ms | p99:  {metrics.percentile(99):9.2f} ms")
    print("-" * 75)
    print("ROTEAMENTO EXECUTADO POR TARGET")
    for target, count in metrics.targets_count.items():
        pct = (count / metrics.successful_requests) * 100 if metrics.successful_requests > 0 else 0
        print(f"  * {target:<30} : {count:>4} reqs ({pct:5.1f}%)")

    if metrics.errors:
        print("-" * 75)
        print("AMOSTRA DE ERROS (Top 3):")
        for err in metrics.errors[:3]:
            print(f"  [!] {err}")
    print("=" * 75)


def main() -> None:
    bench_config = BenchmarkConfig(
        base_url=os.getenv("ROUTER_URL", "http://127.0.0.1:8000"),
        total_requests=int(os.getenv("BENCH_REQUESTS", "30")),
        concurrency=int(os.getenv("BENCH_CONCURRENCY", "6")),
        timeout_seconds=float(os.getenv("BENCH_TIMEOUT", "60.0")),
        output_json_file=os.getenv("BENCH_OUTPUT_JSON", "benchmark_results.json"),
    )
    metrics_result = asyncio.run(run_benchmark(bench_config))
    display_report(metrics_result)


if __name__ == "__main__":
    main()
