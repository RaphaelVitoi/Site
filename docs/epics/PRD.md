# PRD: Fortaleza SOTA (Identidade e Validação Econômica)

## 1. Visão Geral

A transição para alta concorrência exige blindagem prévia. Este épico estabelece o "Tenant Isolation" (isolamento de locatários) e a validação econômica do ecossistema, garantindo que o processamento quântico e o RAG do backend sejam consumidos apenas por entidades validadas, sem sacrificar a "Fricção Zero" da experiência de onboarding.

## 2. Invariantes Arquiteturais

* **Shadow Sessions:** O usuário deve experimentar o Motor ICM e a "didática visceral" de forma anônima. A exigência de Auth/Pagamento ocorre apenas no esgotamento da cota de *free tier* ou ao tentar persistir simulações complexas (Paywall Dinâmico).
* **Supabase Soberano:** O RLS (Row Level Security) do PostgreSQL deve ser a fonte da verdade absoluta. O backend Python repassa o JWT do usuário para garantir que consultas SQL sejam restritas no nível do motor de dados, erradicando vazamentos.
* **Simetria de Webhooks:** O gateway de pagamentos enviará webhooks de confirmação. O payload DEVE ser validado na borda com paridade total entre `Zod` (Edge Next.js) e `Pydantic` (FastAPI).

## 3. Escopo de Quebra (Para o @dispatcher)

1. **Infraestrutura Supabase:** Inicialização do cliente Supabase no Next.js (SSR e Client) e configuração inicial de schemas e políticas RLS.
2. **Fluxo de Shadow Session:** Lógica de armazenamento temporário que migra perfeitamente para o banco de dados remoto quando o usuário se autentica.
3. **Paywall & Webhooks:** Rota de API blindada para escutar o provedor de pagamentos (ex: Stripe/MercadoPago), com injeção segura de segredos.

## 4. Agentes Envolvidos

* **@architect:** Blueprint da topologia RLS e integração cliente-servidor do Supabase.
* **@securitychief:** Auditoria do fluxo de tokens JWT, RBAC e blindagem de assinaturas de Webhook.
* **@implementor:** Forja dos middlewares de autenticação, telas de login e endpoints.
* **@maverick / @curator:** Desenho da UX do Paywall, garantindo que a cobrança surja como consequência inegável do valor intelectual entregue.
