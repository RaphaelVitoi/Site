"""Coleta na suite os testes do hybrid router, que moram em tools/hybrid_router.

O arquivo nao foi movido para ca de proposito: dois registros publicados
(AUDITORIA-2026-09-10, REGISTRO-2026-09-11) citam tools/hybrid_router/test_hybrid_router.py,
e registro publicado nao se reescreve. Ate 2026-09-16 o testpaths=["tests"] deixava esses
testes fora da suite integral; a reexportacao os traz sem quebrar a referencia.
"""

from tools.hybrid_router.test_hybrid_router import (  # noqa: F401
    TestComplexityAnalyzer,
    TestSondaDoLlamaLocal,
)
