export interface QuizOption {
    id: string;
    label: string;
}

export interface QuizQuestion {
    id: string;
    text: string;
    options: QuizOption[];
    correctOptionId: string;
    explanation?: string;
}