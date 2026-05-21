'use client';

// Importando da pasta correta de componentes
import { QuizEngine } from '@/components/quiz/QuizEngine';
import { QuizQuestion } from '@/components/quiz/types';

const MOCK_QUESTIONS: QuizQuestion[] = [
    {
        id: 'q1',
        text: 'Qual é o princípio fundamental do estado de respostas com complexidade O(1) no nosso ecossistema?',
        options: [
            { id: 'opt1', label: 'Iterar sobre um array usando map() repetidas vezes.' },
            { id: 'opt2', label: 'Buscar um item no array usando a função find().' },
            { id: 'opt3', label: 'Acessar a resposta diretamente via chave num Dicionário (Record).' },
            { id: 'opt4', label: 'Usar múltiplos loops aninhados para calcular o placar.' }
        ],
        correctOptionId: 'opt3',
        explanation: 'Ao usar um dicionário (Record), a busca pela resposta é feita instantaneamente pela chave (ID), sem precisar varrer um array. Isso garante performance máxima (O(1)) sem re-renderizações desnecessárias.'
    },
    {
        id: 'q2',
        text: 'Por que a tipografia tabular-nums é essencial na Economia Generalizada?',
        options: [
            { id: 'opt1', label: 'Para deixar as fontes com cores dinâmicas.' },
            { id: 'opt2', label: 'Evita que os números "pulem" ou tremam durante mudanças de estado.' },
            { id: 'opt3', label: 'Para aumentar o tamanho da fonte automaticamente.' },
            { id: 'opt4', label: 'É um requisito obrigatório do TypeScript.' }
        ],
        correctOptionId: 'opt2',
        explanation: 'Fontes com tabular-nums garantem que todos os números tenham a exata mesma largura (monoespaçados). Isso cria uma interface sólida que não "treme" quando o timer ou placar são atualizados.'
    }
];

export default function QuizPage() {
    return (
        <main className="py-16 px-8 min-h-screen bg-bg-base">
            <h1 className="text-center text-text-main mb-12 text-3xl font-heading font-black">Templo de Aprendizado</h1>
            <QuizEngine questions={ MOCK_QUESTIONS } />
        </main>
    );
}
