use wasm_bindgen::prelude::*;
use rs_poker::core::{Card, Deck, Hand, Rankable};
use rand::seq::SliceRandom;
use rand::rngs::StdRng;
use rand::SeedableRng;

// SOTA: Auto-healing formatador para prevenir o Pânico de Parsing. Converte "AhKh" em "Ah Kh".
fn format_cards(s: &str) -> String {
    let clean: String = s.chars().filter(|c| !c.is_whitespace()).collect();
    let mut res = String::new();
    for (i, c) in clean.chars().enumerate() {
        res.push(c);
        if i % 2 == 1 {
            res.push(' ');
        }
    }
    res.trim().to_string()
}

// SOTA: Motor Combinatório Defensivo.
// O rs_poker 0.2.0 explode ao analisar 7 cartas diretas. Este motor extrai e avalia todas as sub-mãos seguras de 5 cartas.
fn best_rank(cards: &[Card]) -> i32 {
    let mut best = -1;
    let n = cards.len();
    if n < 5 { return -1; }
    for i in 0..n {
        for j in (i+1)..n {
            for k in (j+1)..n {
                for l in (k+1)..n {
                    for m in (l+1)..n {
                        let hand = Hand::new_with_cards(vec![cards[i], cards[j], cards[k], cards[l], cards[m]]);
                        let r = match hand.rank() {
                            rs_poker::core::Rank::HighCard(v) => v as i32,
                            rs_poker::core::Rank::OnePair(v) => (1 << 20) + (v as i32),
                            rs_poker::core::Rank::TwoPair(v) => (2 << 20) + (v as i32),
                            rs_poker::core::Rank::ThreeOfAKind(v) => (3 << 20) + (v as i32),
                            rs_poker::core::Rank::Straight(v) => (4 << 20) + (v as i32),
                            rs_poker::core::Rank::Flush(v) => (5 << 20) + (v as i32),
                            rs_poker::core::Rank::FullHouse(v) => (6 << 20) + (v as i32),
                            rs_poker::core::Rank::FourOfAKind(v) => (7 << 20) + (v as i32),
                            rs_poker::core::Rank::StraightFlush(v) => (8 << 20) + (v as i32),
                        };
                        if r > best { best = r; }
                    }
                }
            }
        }
    }
    best
}

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
    match Hand::new_from_str(&format_cards(cards_str)) {
        Ok(hand) => {
            let cards: Vec<Card> = hand.iter().copied().collect();
            best_rank(&cards)
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
pub fn calculate_equity_monte_carlo(hero_hands_str: &str, villain_hands_str: &str, board_str: &str, iterations: u32, seed: u32) -> f64 {
    // Fase 1: Validação de Mãos Base (Fricção Zero para inputs malformados)
    let hero_hand = match Hand::new_from_str(&format_cards(hero_hands_str)) {
        Ok(h) => h,
        Err(_) => return -1.0, // Falha de parse: Contrato explícito de entropia
    };
    let villain_hand = match Hand::new_from_str(&format_cards(villain_hands_str)) {
        Ok(h) => h,
        Err(_) => return -2.0, // Falha de parse: Contrato explícito de entropia
    };

    let mut board_cards: Vec<Card> = Vec::new();
    if !board_str.trim().is_empty() {
        if let Ok(b) = Hand::new_from_str(&format_cards(board_str)) {
            board_cards.extend(b.iter().copied());
        } else {
            return -3.0; // Board string corrompida
        }
    }

    let hero_cards: Vec<Card> = hero_hand.iter().copied().collect();
    let villain_cards: Vec<Card> = villain_hand.iter().copied().collect();

    // SOTA: Blindagem Termodinâmica contra inputs aberrantes (previne pânico do rs_poker e underflow de board)
    if hero_cards.len() != 2 { return -1.0; }
    if villain_cards.len() != 2 { return -2.0; }
    if board_cards.len() > 5 { return -3.0; }

    let all_input_cards = [hero_cards.clone(), villain_cards.clone(), board_cards.clone()].concat();
    for i in 0..all_input_cards.len() {
        for j in (i + 1)..all_input_cards.len() {
            if all_input_cards[i] == all_input_cards[j] { return -4.0; } // Colisão de Cartas (Impede colapso de bitmask)
        }
    }

    // Fase 2: Instanciação Termodinâmica do Deck Residual
    let mut available_cards: Vec<Card> = Deck::default().into_iter().collect();
    available_cards.retain(|c| !hero_cards.contains(c) && !villain_cards.contains(c) && !board_cards.contains(c));

    let needed_board_cards = 5 - board_cards.len();
    if needed_board_cards > available_cards.len() || iterations == 0 { return 0.5; }

    let mut wins = 0;
    let mut ties = 0;

    // SOTA: Injeção de semente pelo Host (Erradica o pânico FFI de getrandom no Web Worker isolado)
    let mut rng = StdRng::seed_from_u64(seed as u64);

    for _ in 0..iterations {
        available_cards.shuffle(&mut rng);

        let mut current_board = board_cards.clone();
        current_board.extend_from_slice(&available_cards[0..needed_board_cards]);

        // SOTA: Isola a fusão das 7 cartas em variaveis fisicas para blindar a memoria
        let hero_7_cards = [hero_cards.clone(), current_board.clone()].concat();
        let villain_7_cards = [villain_cards.clone(), current_board.clone()].concat();

        let hero_rank = best_rank(&hero_7_cards);
        let villain_rank = best_rank(&villain_7_cards);

        if hero_rank > villain_rank { wins += 1; } else if hero_rank == villain_rank { ties += 1; }
    }

    (wins as f64 + (ties as f64 / 2.0)) / (iterations as f64)
}
