import { QuizQuestion } from '@/components/quiz/types';

export interface SimulatorState {
    stacks: number[];
    prizes: number[];
}

export function generateDynamicICMQuiz(state: SimulatorState): QuizQuestion[] {
    const { stacks, prizes } = state;
    const totalChips = stacks.reduce((a, b) => a + b, 0);

    // Heurísticas de detecção de cenário (Context-Awareness SOTA)
    const isBubble = prizes.length > 0 && stacks.length === prizes.length + 1;
    const sortedStacks = [...stacks].sort((a, b) => b - a);
    const isMassiveChipleader = sortedStacks.length > 0 && totalChips > 0 && sortedStacks[0] > totalChips * 0.4;

    const questions: QuizQuestion[] = [];

    // Pergunta 1: Fundamento ICM (Sempre gerada)
    questions.push({
        id: `q-dyn-1-${Date.now()}`,
        text: `A topologia atual possui ${stacks.length} jogadores distribuindo ${totalChips} fichas. Sob a ótica absoluta do ICM, como a função de utilidade dessas fichas se comporta em relação à equidade em dólares ($EV)?`,
        options: [
            { id: 'opt1', label: 'Linear (ChipEV puro): 1 ficha ganha equivale a 1 ficha perdida. O ecossistema exige agressão constante para acumulação matemática.' },
            { id: 'opt2', label: 'Côncava: Fichas perdidas corroem mais equidade (risco letal) do que fichas ganhas adicionam. A utilidade marginal é estritamente decrescente.' },
            { id: 'opt3', label: 'Convexa: O acúmulo gera uma vantagem geométrica, onde o chip leader obtém equidade exponencial a cada pote que ganha.' },
            { id: 'opt4', label: 'Escalar Estática: O valor da ficha é uma constante invariável, definida pela divisão do prize pool global pelas fichas em jogo.' }
        ],
        correctOptionId: 'opt2',
        explanation: 'Estado da Arte: No ICM, a sobrevivência e os saltos de premiação criam uma curva de utilidade côncava. O "Risk Premium" existe precisamente porque o custo de ser eliminado raramente é compensado de forma simétrica pela recompensa de dobrar o stack.'
    });

    // Pergunta 2: Pressão de Bolha Extrema (Condicional)
    if (isBubble) {
        questions.push({
            id: `q-dyn-2-${Date.now()}`,
            text: `Alerta Estrutural: A configuração reflete a Bolha exata (${prizes.length} premiados para ${stacks.length} sobreviventes). Qual fenômeno de pressão o modelo matemático impõe violentamente aos stacks médios?`,
            options: [
                { id: 'opt1', label: 'A expansão reativa: Vendo o short stack em risco crítico, os stacks médios devem alargar seus ranges de agressão para forçar a ruptura.' },
                { id: 'opt2', label: 'O Paradoxo da Posição: A pressão de ICM desaparece de forma assimétrica sempre que o jogador mediano detiver a posição (IP) sobre a mesa.' },
                { id: 'opt3', label: 'O Pacto Silencioso (Downward Drift): O Risk Premium bate no teto. Médios entram em paralisia e rejeitam variância marginal para não cometerem "suicídio" financeiro antes do short.' },
                { id: 'opt4', label: 'A imunidade do Big Blind: O blind maior sofre desconto na pressão, permitindo flat calls extensos.' }
            ],
            correctOptionId: 'opt3',
            explanation: 'Na bolha, o salto de $0 para o "min-cash" gera o multiplicador (Bubble Factor) mais agressivo. O "Downward Drift" dita que stacks medianos devem foldar mãos lucrativas em ChipEV porque a preservação da stack se torna mais valiosa do que a agressão isolada.'
        });
    }

    // Pergunta 3: Liderança Predatória Absoluta (Condicional)
    if (isMassiveChipleader && stacks.length > 2) {
        questions.push({
            id: `q-dyn-3-${Date.now()}`,
            text: `Assimetria Grave Detectada: O Chip Leader monopoliza mais de 40% das fichas globais (Sua Stack: ${sortedStacks[0]}bb). Como a arquitetura SOTA define o seu protocolo de execução?`,
            options: [
                { id: 'opt1', label: 'Vantagem de Agressão Limitada: Ele deve condensar seus ranges de forma pragmática para preservar o primeiro lugar matemático, foldando bluffs caros.' },
                { id: 'opt2', label: 'Modo Predador: Seu Risk Premium afunda. Ele lucra injetando extrema frequência de blefes, faturando sobre a paralisia do Risk Premium gigantesco dos oponentes medianos.' },
                { id: 'opt3', label: 'Pacto de Não-Agressão: O ICM determina que o CL jogue de forma isenta, forçando que a mesa se elimine organicamente.' },
                { id: 'opt4', label: 'Confronto Focalizado: A teoria postula que o Líder deve enfrentar exclusivamente o Short Stack, evitando os médios a qualquer custo.' }
            ],
            correctOptionId: 'opt2',
            explanation: 'A assimetria no ICM é letal: a dor que o Chip Leader sente ao perder uma mão é minúscula em porentagem (RP baixo), mas a dor sentida pelo oponente mediano ao pagar a aposta é colossal. O Predador ataca o topo do abismo.'
        });
    }

    return questions;
}