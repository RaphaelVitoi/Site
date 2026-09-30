# ==============================================================================
# AMBIENTE SOTA (TEMPLATE) - NÃO COMMITAR CHAVES REAIS
# ==============================================================================

# Córtices Primários
$env:GEMINI_API_KEY = 'AIzaSy...'
$env:ANTHROPIC_API_KEY = 'sk-ant-...'
$env:OPENROUTER_API_KEY = 'sk-or-v1-...'

# Motores de Busca e Pesquisa
$env:TAVILY_API_KEY = 'tvly-...'
$env:PERPLEXITY_API_KEY = 'pplx-...'

# Segurança da API Local SOTA
#
# FONTE DE VERDADE DAS CREDENCIAIS — medida em 2026-09-30, e ela é DUPLA.
# Documentar isso importa porque cada tipo de chave mora num lugar, e o
# lugar errado é o que produz "configurei e não pegou" ou "está no disco e
# não deveria":
#
# 1. Chaves de LLM (Gemini, OpenRouter por tier) — no REGISTRO, e o código as
#    lê de lá. `Set-EcosystemCredential.ps1` grava em `HKCU:\Environment`;
#    `llm/gemini_pool.py` e `llm/openrouter_pool.py` complementam `os.environ`
#    com `winreg`. Medido nesta máquina: 45 chaves LLM no Registro.
#    Para gravar: pwsh -NoProfile -File scripts/ops/Set-EcosystemCredential.ps1
#
# 2. `API_SECRET_TOKEN` — NÃO está no Registro. Medido: a varredura de
#    HKCU:\Environment e de HKLM\...\Session Manager\Environment não devolveu
#    nenhum `SUPABASE_*` nem `API_SECRET_TOKEN`. O valor que o gateway usa vem
#    de `load_env()` (utils/env_loader.py), que lê `.env` e `_env.ps1` do disco
#    na raiz. Isto é, o arquivo IGNORADO pelo git é a fonte da credencial de
#    MAIOR alcance do backend.
#    Para gravar: edite `.env` na raiz (ignorado; nunca versionado).
#
# Este arquivo é MODELO. Executá-lo não popula nada — quem precisa popular
# escolhe o destino acima conforme a chave.
$env:API_SECRET_TOKEN = 'VITOI_SOTA_TOKEN_GERADO_AQUI'

# Autenticação de produto (JWT do Supabase)
#
# MEDIDO em 2026-09-30, na auditoria de backend (SEC-05): `iss` e `aud` são
# conferidos pelo middleware APENAS quando estas duas variáveis existem no
# ambiente. Sem elas, um JWT HS256 válido de qualquer contexto do mesmo
# segredo passa — a verificação `role == "authenticated"` + `sub` presente
# (BK-03) já bloqueia `anon` e `service_role`, e é o que fecha a maior parte;
# `iss`/`aud` é o que fecha a lacuna residual entre aplicações.
#
# DIVERGÊNCIA DE NOMES — medida em 2026-09-30, e é a razão de `SUPABASE_JWT_SECRET`
# não aparecer em lugar nenhum. Três sistemas, três nomes, nenhum ponto de encontro:
#
#   scripts/ops/Set-SupabaseKey.ps1 grava  SUPABASE_ACCESS_TOKEN
#                                         SUPABASE_TOKEN
#                                         SUPABASE_KEY
#     └─ nenhum deles tem consumidor: `git grep` em *.py, *.ts, *.mjs devolve ZERO.
#        São os nomes da CLI/Management API do Supabase, não os do backend.
#
#   api/v1/middleware.py:57,69 exige     SUPABASE_JWT_SECRET
#     └─ nenhum script o grava. É o JWT secret do PROJETO, que é outra coisa
#        que o access token da Management API.
#
#   frontend/src/utils/supabase/server.ts:9 usa  NEXT_PUBLIC_SUPABASE_ANON_KEY
#     └─ a anon key é pública por desenho e NÃO é o JWT secret do backend.
#        Usar a anon key como segredo de verificação é justamente o que BK-03
#        mediu e bloqueou no lado do verificador.
#
# ESTADO: com `SUPABASE_JWT_SECRET` ausente, `_handle_jwt_token_auth` responde
# 500 e as 22 rotas de identidade de produto ficam inacessíveis — fail-closed,
# que é o comportamento correto, mas inerte. As 17 rotas de credencial de
# serviço funcionam normalmente.
#
# O que resolve não é escrever uma variável: é reconciliar os nomes. Isso é
# decisão do Tier 0 (é segredo e é contrato entre três sistemas). A CI é
# deixar o contrato escrito, e ela está nas três linhas abaixo.
#
# Para gravar o JWT secret do projeto (nome que o backend exige):
#   [Environment]::SetEnvironmentVariable('SUPABASE_JWT_SECRET', '<valor>', 'User')
#   [Environment]::SetEnvironmentVariable('SUPABASE_JWT_ISSUER', 'supabase', 'User')
#   [Environment]::SetEnvironmentVariable('SUPABASE_JWT_AUDIENCE', 'authenticated', 'User')
#
# Aviso ao declarar `SUPABASE_JWT_ISSUER`: um valor divergente do emissor real
# derruba as 22 rotas de produto, porque `_optional_claims_match` confere o
# `iss` estritamente. Para Supabase, o valor é `supabase`.
$env:SUPABASE_JWT_SECRET = 'JWT_SECRET_DO_PROJETO_SUPABASE'   # nome que o backend exige
$env:SUPABASE_JWT_ISSUER = 'supabase'
$env:SUPABASE_JWT_AUDIENCE = 'authenticated'

# Armazenamento Externo (Sincronização Nativa)
$env:GOOGLE_DRIVE_REPORT_PATH = 'G:\Meu Drive\Nexus_Reports' # Substitua pelo caminho absoluto real do seu Drive
