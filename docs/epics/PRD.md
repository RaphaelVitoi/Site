# PRD: Fortaleza SOTA (Identidade e Validacao Economica)

## 1. Visao Geral

A transicao para alta concorrencia exige blindagem previa. Este epico estabelece o "Tenant Isolation" (isolamento de locatarios) e a validacao economica do ecossistema, garantindo que o processamento quantico e o RAG do backend sejam consumidos apenas por entidades validadas, sem sacrificar a "Friccao Zero" da experiencia de onboarding.

## 2. Invariantes Arquiteturais

* **Shadow Sessions:** O usuario deve experimentar o Motor ICM e a "didatica visceral" de forma anonima. A exigencia de Auth/Pagamento ocorre apenas no esgotamento da cota de *free tier* ou ao tentar persistir simulacoes complexas (Paywall Dinamico).
* **Supabase Soberano:** O RLS (Row Level Security) do PostgreSQL deve ser a fonte da verdade absoluta. O backend Python repassa o JWT do usuario para garantir que consultas SQL sejam restritas no nivel do motor de dados, erradicando vazamentos.
* **Simetria de Webhooks:** O gateway de pagamentos enviara webhooks de confirmacao. O payload DEVE ser validado na borda com paridade total entre `Zod` (Edge Next.js) e `Pydantic` (FastAPI).

## 3. Escopo de Quebra (Para o @dispatcher)

1. **Infraestrutura Supabase:** Inicializacao do cliente Supabase no Next.js (SSR e Client) e configuracao inicial de schemas e politicas RLS.
2. **Fluxo de Shadow Session:** Logica de armazenamento temporario que migra perfeitamente para o banco de dados remoto quando o usuario se autentica.
3. **Paywall & Webhooks:** Rota de API blindada para escutar o provedor de pagamentos (ex: Stripe/MercadoPago), com injecao segura de segredos.

## 4. Agentes Envolvidos

* **@architect:** Blueprint da topologia RLS e integracao cliente-servidor do Supabase.
* **@securitychief:** Auditoria do fluxo de tokens JWT, RBAC e blindagem de assinaturas de Webhook.
* **@implementor:** Forja dos middlewares de autenticacao, telas de login e endpoints.
* **@maverick / @curator:** Desenho da UX do Paywall, garantindo que a cobranca surja como consequencia inegavel do valor intelectual entregue.
