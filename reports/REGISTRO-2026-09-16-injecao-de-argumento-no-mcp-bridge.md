---
id: registro-2026-09-16-injecao-de-argumento-no-mcp-bridge
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-16T20:10:00-03:00'
atualizado_em: '2026-09-16T20:10:00-03:00'
classes: [interno, medido, seguranca]
session_id: 5b136c4c-9182-4227-9bfc-d883a25c2a77
session_started_at: '2026-09-16T13:28:11-03:00'
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  powershell_do_bridge: Windows PowerShell 5.1 (powershell -File)
  congelada_em: '2026-09-16'
verificado:
  - mcp-bridge e jules_mcp_server usam transporte stdio pelo .mcp.json; nenhum abre porta nem pipe nomeado
  - execute_sota_task validava so agent e repassava description como argumento de powershell -File do.ps1
  - sonda com os parametros do do.ps1 -- description -Obliterate:C:/x virou Obliterate=C:/x
  - meia-risca e travessao tambem funcionam como prefixo de parametro; espaco inicial neutraliza
  - o separador -- quebra a chamada com -File e nao serve de defesa
  - guard recusa os quatro prefixos antes do subprocess; 12 testes, 8 falham sem o guard
  - teste de contraprova contra o parser real do PowerShell confirma que o guard recusa exatamente o que vira parametro
  - Ollama escuta em todas as interfaces (IPv6 any) na 11434 sem autenticacao; Next dev idem na 3000; CDP 9223/9224 e gemma_server 17043 so em loopback
  - pmev-site.tc.json declarava RLS estrito em PostgreSQL, Realtime com JWT e testes de RLS; nada disso existe no repositorio
  - Supabase usado so para OAuth (exchangeCodeForSession e getUser); nenhum .from, .rpc ou canal Realtime no codigo
  - rotas publicas sota/pmev-heatmap e sota/timesfm-forecast repassam o corpo ao backend com API_SECRET_TOKEN e fallback literal de credencial
  - modelo reescrito com 7 ameacas, 7 mitigacoes e 5 premissas; validado no schema do threat-composer
  - 6 guards de sincronia do modelo; o arquivo antigo reprova em 3 deles
  - decisao delegada pelo Tier 0 -- sota/pmev-heatmap e sota/timesfm-forecast exigem sessao, sem credencial literal, 503 sem backend; pmev-heatmap nao tinha consumidor no frontend
  - log do Next com centenas de POST 500 em sota/timesfm-forecast -- o painel CFR pedia previsao a cada amostra do worker; cliente passou a limitar 1 chamada por 2 s e esperar 30 s apos falha; 200 amostras geram 1 chamada
  - decisao delegada pelo Tier 0 -- Ollama restrito a loopback desligando expose no banco do app, com copia em quarantine/ollama-db-antes-loopback-20260916; medido Listening on 127.0.0.1:11434 e 25 modelos respondendo
nao_verificado:
  - exploracao ponta a ponta por um cliente MCP real -- provado so por sonda e testes
  - demais tools do bridge alem de execute_sota_task quanto a outros vetores de injecao
  - alcance do Ollama a partir de outro host da rede local
  - se as rotas sota publicas devem ser publicas por desenho de produto
  - varredura completa das rotas de telemetria quanto a aceitar calculo do cliente como verdade
---

# Injeção de argumento no mcp-bridge e sincronia do modelo de ameaças

A ameaça 4 do modelo de ameaças descreve um processo local hostil falando com um
pipe ou porta MCP exposto. O transporte medido é stdio, que não expõe nenhum dos
dois: o vetor descrito não existe. A investigação dele, porém, encontrou a falha
real no mesmo lugar e com o mesmo impacto.

## A falha

`execute_sota_task` montava `powershell -File do.ps1 <description> <agent>`. O
`do.ps1` tem parâmetros destrutivos: `-Execute` roda comando, `-Obliterate` apaga
caminho, `-FixEPERM` mata processos. Com `-File`, o PowerShell lê como nome de
parâmetro qualquer argumento que comece com um dos quatro traços que ele aceita,
mesmo que o argumento tenha chegado como uma string única.

O chamador da tool é um modelo de linguagem. O vetor é prompt injection: um texto
lido pelo agente pode fazê-lo enviar a descrição que apaga um caminho.

## A correção

O bridge recusa a descrição antes do subprocess e devolve o motivo. Descrições
legítimas, inclusive as que contêm traço no meio ou começam com espaço, seguem
iguais. A contraprova roda o parser real do PowerShell, para que o predicado não
divirja do comportamento que ele protege.

## O que fica com o Tier 0

O Ollama escuta em todas as interfaces, sem autenticação. Restringir é redução de
acesso e depende de saber se outro aparelho da rede o usa.

## O modelo de ameaças voltou a descrever o sistema

`reports/threat-modeling/pmev-site.tc.json` tinha forma de auditoria e conteúdo de
suposição: RLS estrito num PostgreSQL que o repositório não tem, canais Realtime
que nenhum código abre, backend chamado de FastAPI quando é aiohttp, e quatro de
cinco mitigações marcadas como resolvidas sem um único teste.

A reescrita parte do que foi medido. Cada premissa e mitigação cita os caminhos
que a sustentam em `custom:evidencia`, e toda ameaça declara `custom:medido_em`.
Duas ameaças são novas e reais: o repasse das rotas públicas `sota/*` com a
credencial de serviço, e o Ollama aberto na rede local. A ameaça de RLS virou a
da faixa de produto do JWT, que é o que o backend de fato controla.

`tests/test_threat_model_sincronia.py` impede a volta do mesmo defeito sem travar
o uso do threat-composer: caminho citado precisa existir, mitigação resolvida
precisa apontar teste, ameaça resolvida precisa de mitigação resolvida ligada.
