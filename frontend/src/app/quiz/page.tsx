'use client';

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { QuizEngine } from '@/components/quiz/QuizEngine';
import IcmQuizVisceral from '@/components/simulator/IcmQuizVisceral';
import { type QuizQuestion } from '@/components/quiz/types';
import { useState } from 'react';
import { motion } from 'framer-motion';

const MOCK_QUESTIONS: QuizQuestion[] = [
	{
		id: 'q1',
		text: 'Qual é o princípio fundamental do estado de respostas com complexidade O(1) no nosso ecossistema?',
		options: [
			{ id: 'opt1', label: 'Iterar sobre um array usando map() repetidas vezes.' },
			{ id: 'opt2', label: 'Buscar um item no array usando a função find().' },
			{
				id: 'opt3',
				label: 'Acessar a resposta diretamente via chave num Dicionário (Record).',
			},
			{ id: 'opt4', label: 'Usar múltiplos loops aninhados para calcular o placar.' },
		],
		correctOptionId: 'opt3',
		explanation:
			'Ao usar um dicionário (Record), a busca pela resposta é feita instantaneamente pela chave (ID), sem precisar varrer um array. Isso garante performance máxima (O(1)) sem re-renderizações desnecessárias.',
	},
	{
		id: 'q2',
		text: 'Por que a tipografia tabular-nums é essencial na Economia Generalizada?',
		options: [
			{ id: 'opt1', label: 'Para deixar as fontes com cores dinâmicas.' },
			{
				id: 'opt2',
				label: 'Evita que os números "pulem" ou tremam durante mudanças de estado.',
			},
			{ id: 'opt3', label: 'Para aumentar o tamanho da fonte automaticamente.' },
			{ id: 'opt4', label: 'É um requisito obrigatório do TypeScript.' },
		],
		correctOptionId: 'opt2',
		explanation:
			'Fontes com tabular-nums garantem que todos os números tenham a exata mesma largura (monoespaçados). Isso cria uma interface sólida que não "treme" quando o timer ou placar são atualizados.',
	},
];

type QuizTab = 'visceral' | 'teorico';

export default function QuizPage() {
	const [activeTab, setActiveTab] = useState<QuizTab>('visceral');

	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
			<ContentPageHeader
				title="Templo de Aprendizado"
				subtitle="Teste seus reflexos neurais e assimile as Leis Invariáveis da Perspectiva."
				category="Laboratório"
				icon="fa-brain"
			/>
			
			<div className="sota-container mt-8 max-w-4xl mx-auto px-4">
				{/* Tabs Premium Glassmorphic */}
				<div className="flex justify-center mb-10">
					<div className="flex p-1.5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl relative">
						<button
							onClick={() => setActiveTab('visceral')}
							className={`relative px-6 py-3 rounded-xl text-[0.75rem] sm:text-[0.8rem] font-bold uppercase tracking-wider transition-all duration-300 z-10 ${activeTab === 'visceral' ? 'text-white' : 'text-text-dim hover:text-white'}`}
						>
							{activeTab === 'visceral' && (
								<motion.div
									layoutId="active-quiz-tab"
									className="absolute inset-0 bg-accent-indigo rounded-xl -z-10 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
									transition={{ type: 'spring', stiffness: 300, damping: 30 }}
								/>
							)}
							<i className="fa-solid fa-fire-flame-curved mr-2" />
							Calibragem Visceral
						</button>
						
						<button
							onClick={() => setActiveTab('teorico')}
							className={`relative px-6 py-3 rounded-xl text-[0.75rem] sm:text-[0.8rem] font-bold uppercase tracking-wider transition-all duration-300 z-10 ${activeTab === 'teorico' ? 'text-white' : 'text-text-dim hover:text-white'}`}
						>
							{activeTab === 'teorico' && (
								<motion.div
									layoutId="active-quiz-tab"
									className="absolute inset-0 bg-accent-indigo rounded-xl -z-10 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
									transition={{ type: 'spring', stiffness: 300, damping: 30 }}
								/>
							)}
							<i className="fa-solid fa-graduation-cap mr-2" />
							Questões Teóricas
						</button>
					</div>
				</div>

				{/* Conteúdo Ativo com Animação de Entrada */}
				<motion.div
					key={activeTab}
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					{activeTab === 'visceral' ? (
						<IcmQuizVisceral />
					) : (
						<QuizEngine questions={MOCK_QUESTIONS} />
					)}
				</motion.div>
			</div>
		</div>
	);
}
