# Skillmaster Config

Este arquivo documenta o formato do `skillmaster_config.json` e evita comentarios dentro do JSON.

## Tokens suportados

- `$ProjectRoot`: substitui pelo caminho da raiz do projeto.
- `{DATE_YYYYMMDD}`: substitui pela data atual no formato `yyyyMMdd`.

## Estrutura

- `executable`: caminho para o executavel ou comando no PATH.
- `arguments`: lista de argumentos; cada item pode usar os tokens acima.
- `intervalHours`: intervalo em horas entre execucoes.
- `active`: `true` ou `false`.
