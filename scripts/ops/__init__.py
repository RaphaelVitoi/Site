"""Operacoes de manutencao e portoes do NEXUS-CORE-SOTA.

Este `__init__.py` existe por um motivo medido, nao por convencao.

Ate 2026-08-28 o mesmo arquivo era importado de duas formas -- `record_index`
(com `sys.path` apontando para este diretorio) e `scripts.ops.record_index`
(caminho estatico do pacote). Medido no mesmo processo:

    import record_index as a
    import scripts.ops.record_index as b
    a is b  ->  False

**Dois objetos de modulo para um arquivo so.** Estado de modulo, cache e
`monkeypatch` de teste valem para um e nao para o outro, e nada acusa: os dois
importam, os dois funcionam, e a divergencia so aparece quando alguem patcheia
um e testa o outro. E a mesma familia da copia divergente que este repositorio
vem catalogando -- so que em memoria, e sem arquivo para comparar.

Com o pacote declarado aqui, `scripts.ops.<modulo>` passa a ser a UNICA forma
canonica. O portao `tests/test_record_index.py` reprova a volta do import solto.
"""
