use wasm_bindgen::prelude::*;
use rs_poker::core::{Card, Deck, Hand, Rankable};
use rand::seq::SliceRandom;
use rand::rngs::StdRng;
use rand::SeedableRng;

// CORTEX SHIELD: Configuração de fallback para o panic hook (facilita o debug no browser)
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
    Ok(())
}

/// ANTEVISÃO: Função O(1) de alocação para avaliar o rank absoluto de uma mão Texas Hold'em.
/// Formato esperado em `cards_str`: "AhKh7d8c9s" (2 cartas da mão + 3 a 5 cartas do board).
/// Retorna um valor numérico representando a força da mão. Retorna -1 em caso de entropia (string inválida).
#[wasm_bindgen]
pub fn evaluate_hand_strength(cards_str: &str) -> i32 {
    match Hand::new_from_str(cards_str) {
        Ok(hand) => {
            // O trait Rankable do rs-poker calcula a categoria e o valor absoluto da combinação
            let rank = hand.rank();
            // SOTA: Extração combinatória do payload do Enum Rank (Resolve E0605)
            match rank {
                rs_poker::core::Rank::HighCard(v) => v as i32,
                rs_poker::core::Rank::OnePair(v) => (1 << 20) + (v as i32),
                rs_poker::core::Rank::TwoPair(v) => (2 << 20) + (v as i32),
                rs_poker::core::Rank::ThreeOfAKind(v) => (3 << 20) + (v as i32),
                rs_poker::core::Rank::Straight(v) => (4 << 20) + (v as i32),
                rs_poker::core::Rank::Flush(v) => (5 << 20) + (v as i32),
                rs_poker::core::Rank::FullHouse(v) => (6 << 20) + (v as i32),
                rs_poker::core::Rank::FourOfAKind(v) => (7 << 20) + (v as i32),
                rs_poker::core::Rank::StraightFlush(v) => (8 << 20) + (v as i32),
            }
        },
        Err(_) => {
            // Diagnóstico Bayesiano: Rejeição silênciosa de sintaxe corrompida.
            // O Web Worker do JS deve tratar -1 como input inválido e não explodir a Main Thread.
            -1
        }
    }
}

/// ANTEVISÃO: Motor SOTA de Força Bruta e Monte Carlo.
/// Aloca uma simulação intensiva consumindo a CPU limpa do Worker (Thread Separada do React).
#[wasm_bindgen]
pub fn calculate_equity_monte_carlo(hero_hands_str: &str, villain_hands_str: &str, board_str: &str, iterations: u32) -> f64 {
    // Fase 1: Validação de Mãos Base (Fricção Zero para inputs malformados)
    let hero_hand = match Hand::new_from_str(hero_hands_str) {
        Ok(h) => h,
        Err(_) => return -1.0, // Falha de parse: Contrato explícito de entropia
    };
    let villain_hand = match Hand::new_from_str(villain_hands_str) {
        Ok(h) => h,
        Err(_) => return -2.0, // Falha de parse: Contrato explícito de entropia
    };

    let mut board_cards: Vec<Card> = Vec::new();
    if !board_str.trim().is_empty() {
        if let Ok(b) = Hand::new_from_str(board_str) {
            board_cards.extend(b.iter().copied());
        } else {
            return -3.0; // Board string corrompida
        }
    }

    let hero_cards: Vec<Card> = hero_hand.iter().copied().collect();
    let villain_cards: Vec<Card> = villain_hand.iter().copied().collect();

    // Fase 2: Instanciação Termodinâmica do Deck Residual
    let mut available_cards: Vec<Card> = Deck::default().into_iter().collect();
    available_cards.retain(|c| !hero_cards.contains(c) && !villain_cards.contains(c) && !board_cards.contains(c));

    let needed_board_cards = 5 - board_cards.len();
    if needed_board_cards > available_cards.len() || iterations == 0 { return 0.5; }

    let mut wins = 0;
    let mut ties = 0;
    let mut rng = StdRng::from_entropy(); // SOTA: Alimentado pelo getrandom (via ponte JS-Crypto)

    for _ in 0..iterations {
        available_cards.shuffle(&mut rng);

        let mut current_board = board_cards.clone();
        current_board.extend_from_slice(&available_cards[0..needed_board_cards]);

        let hero_rank = Hand::new_with_cards([hero_cards.clone(), current_board.clone()].concat()).rank();
        let villain_rank = Hand::new_with_cards([villain_cards.clone(), current_board.clone()].concat()).rank();

        if hero_rank > villain_rank { wins += 1; } else if hero_rank == villain_rank { ties += 1; }
    }

    (wins as f64 + (ties as f64 / 2.0)) / (iterations as f64)
}
