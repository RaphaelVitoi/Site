import { QuizQuestion } from '@/components/quiz/types';

export interface SimulatorState {
    stacks: number[];
    prizes: number[];
}

export function generateDynamicICMQuiz(state: SimulatorState): QuizQuestion[] {
    const { stacks, prizes } = state;
    const totalChips = stacks.reduce((a, b) => a + b, 0);

    // Heurística de Bolha: se há 1 jogador a mais que a zona de premiação
    const isBubble = prizes.length > 0 && stacks.length === prizes.length + 1;

    const questions: QuizQuestion[] = [];

    // Pergunta 1: Dinâmica Matemática Atual (Sempre gerada)
    questions.push({
        id: `q-dyn-1-${Date.now()}`,
        text: `Com stacks de [${stacks.join(', ')}] e um total de ${totalChips} fichas em jogo, qual é a heurística SOTA sobre o valor dessas fichas?`,
        options: [
            { id: 'opt1', label: 'Fichas ganhas valem exatamente o mesmo que fichas perdidas (Modelo ChipEV).' },
            { id: 'opt2', label: 'A utilidade marginal é decrescente: perder fichas dói desproporcionalmente mais no $EV do que ganhar compensa.' },
            { id: 'opt3', label: 'Fichas ganhas valem mais, pois o único objetivo válido é cravar o torneio.' },
            { id: 'opt4', label: 'O valor da ficha depende exclusivamente do nível atual do Big Blind.' }
        ],
        correctOptionId: 'opt2',
        explanation: 'Sob a ótica do ICM, a função de utilidade de um torneio é côncava. O custo do risco (Risk Premium) existe justamente porque a equidade que você perde num all-in é quase sempre maior do que a equidade que você ganha se vencer.'
    });

    // Pergunta 2: Pressão de Bolha (Condicional)
    if (isBubble) {
        questions.push({
            id: `q-dyn-2-${Date.now()}`,
            text: `Atenção: A configuração atual reflete exatamente a Bolha (Payouts: [${prizes.join(', ')}]). Como o Risk Premium se comporta nesta fase extrema?`,
            options: [
                { id: 'opt1', label: 'Atinge seu pico máximo, forçando stacks medianos a entrarem em um "Pacto Silencioso".' },
                { id: 'opt2', label: 'É ignorável se você tiver o chip lead absoluto.' },
                { id: 'opt3', label: 'Cai drasticamente, pois todos já garantiram o ITM virtualmente.' },
                { id: 'opt4', label: 'Apenas o short stack sofre pressão de fold.' }
            ],
            correctOptionId: 'opt1',
            explanation: 'O salto matemático de $0 para o "min-cash" cria o maior teto de Risk Premium do torneio. Stacks medianos sofrem um fenômeno de "Downward Drift" e não podem arriscar a sobrevivência, tornando-se alvos perfeitos para a pressão do Chip Leader.'
        });
    }

    return questions;
}