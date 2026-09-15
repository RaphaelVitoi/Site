"""
SOTA Observability Configuration -- OpenTelemetry (OTEL) Setup.
Role: Configura o rastreio distribuído, a exportação de spans e a instrumentação do aiohttp.
"""

import logging
import os

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter

try:
    from opentelemetry.instrumentation.aiohttp_server import AioHttpServerInstrumentor  # type: ignore
except ImportError:
    AioHttpServerInstrumentor = None

logger = logging.getLogger(__name__)


def setup_otel():
    """
    Inicializa o SDK do OpenTelemetry.
    SOTA Pattern: Fail-safe initialization. Se o coletor OTLP falhar,
    faz fallback para ConsoleExporter para evitar que o servidor trave.
    """
    try:
        # 1. Definição do Recurso (Identidade do Serviço)
        resource = Resource(
            attributes={
                SERVICE_NAME: os.environ.get("SERVICE_NAME", "nexus-backend-sota"),
                "environment": os.environ.get("ENVIRONMENT", "production"),
                "version": "1.0.0-SOTA",
            }
        )

        # 2. Provedor de Traces
        provider = TracerProvider(resource=resource)
        trace.set_tracer_provider(provider)

        # 3. Exportação: Prioridade para OTLP (Grafana/Tempo), Fallback para Console
        otlp_endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")

        try:
            # Tentativa de conectar ao coletor real
            exporter = OTLPSpanExporter(endpoint=otlp_endpoint, insecure=True)
            logger.info("OTEL: Exportador OTLP configurado para %s", otlp_endpoint)
        except Exception as e:
            logger.warning("OTEL: Falha ao configurar OTLP (%s). Fallback para ConsoleExporter.", e)
            exporter = ConsoleSpanExporter()

        # BatchSpanProcessor é essencial para performance (não bloqueia a request)
        processor = BatchSpanProcessor(exporter)
        provider.add_span_processor(processor)

        # 4. Instrumentação Automática do aiohttp
        # Isso captura automaticamente todos os requests que chegam no server.py
        if AioHttpServerInstrumentor is not None:
            AioHttpServerInstrumentor().instrument()
        else:
            logger.warning("OTEL: aiohttp_server instrumentation não disponível - pulando auto-instrumentação")

        logger.info("OTEL: Observabilidade SOTA inicializada com sucesso.")
        return True

    except Exception as e:
        logger.exception("OTEL: Erro crítico na inicialização da observabilidade: %s", e)
        return False


def get_tracer():
    """Retorna o tracer global para a criação de spans customizados em handlers específicos."""
    return trace.get_tracer("nexus-backend-sota")
