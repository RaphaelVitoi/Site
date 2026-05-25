/**
 * IDENTITY: Psicologia High Stakes GOLD
 * PATH: src/app/biblioteca/psicologia-high-stakes/page.tsx
 * ROLE: Ensaio sobre a fenomenologia da incerteza e controle cognitivo.
 * VERSION: v6.2.1 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const content = `
# Psicologia High Stakes: A Fenomenologia da Incerteza

No ápice da pirâmide do poker, a diferença técnica entre os jogadores é marginal. A vantagem soberana migra do "conhecimento matemático" para a **"integridade psicológica sob pressão"**.

---

## 1. O Deserto do Real (A Paralisia do ICM)

Em uma Mesa Final de High Roller, o peso financeiro de cada decisão pode gerar um fenômeno de **entropia cognitiva**. O jogador, aterrorizado pelo payjump, abandona a lógica vetorial e regride para um estado de "sobrevivência passiva".

O Operador SOTA reconhece esse pavor no oponente e o utiliza como alavanca. Se o adversário está paralisado, seu range de fold é infinito.

---

## 2. A Hierarquia Cognitiva da Decisão

Para manter a clareza em spots de seis dígitos, dividimos o processo em três camadas:

1.  **Mecânica (Sistema 1):** O cálculo bruto de Nash. O "piso" da decisão.
2.  **Analítica (Sistema 2):** A filtragem pelas RIO e Fator Ψ.
3.  **Soberana (Meta-Cognição):** A observação de si mesmo. Você está decidindo pela matemática ou pelo medo da eliminação?

---

## 3. O Controle do Tilt como Arbitragem

O tilt não é apenas "ficar bravo". É qualquer desvio da Perspectiva Matemática causado por ruído emocional. No High Stakes, o tilt é uma **forma de insolvência**.

Se você consegue manter seu Coeficiente de Credibilidade (κ) estável enquanto o do oponente colapsa, você está extraindo EV de forma passiva através da arbitragem emocional.

---

## 4. Veredito Final

"A mente deve ser como a água: transparente o suficiente para ver o fundo (a matemática), mas profunda o suficiente para esconder suas próprias correntes (a estratégia)."
`;

export default function PsicologiaHighStakesPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24">
			<ContentPageHeader
				title="Psicologia High Stakes"
				subtitle="A Fenomenologia da Incerteza: Exegese crítica das heurísticas de ICM e controle de tilt."
				category="Psicologia"
				icon="fa-brain-circuit"
			/>

			<div className="sota-container py-12 md:py-24">
				<SectionHeader
					step="ENSAIO"
					label="Mentalidade"
					title="O Veredito Soberano"
					description="Como o cérebro processa o risco quando as cifras tornam-se reais."
				/>
				<div className="max-w-4xl mx-auto">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo">
						<SotaMarkdown content={content} />
					</GlassPanel>
				</div>
			</div>

			<ContentFooter
				shareTitle={`Psicologia High Stakes | ${SITE_CONFIG.author}`}
				shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.PSICOLOGIA_HIGH_STAKES}`}
				backLinkHref={ROUTES.BIBLIOTECA}
				backLinkText="Voltar para Biblioteca"
			/>
		</div>
	);
}
