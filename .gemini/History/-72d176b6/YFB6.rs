use wasm_bindgen::prelude::*;
use rs_poker::core::{Card, Deck, Hand};
use rand::seq::SliceRandom;
use rand::rngs::StdRng;
use rand::SeedableRng;

// SOTA: Auto-healing formatador para prevenir o Pânico de Parsing. Converte "AhKh" em "Ah Kh".
fn format_cards(s: &str) -> Result<String, ()> {
    let clean: String = s.chars().filter(|c| !c.is_whitespace()).collect();
    // SOTA: Previne o colapso do parser ao receber strings ímpares (ex: "AhK")
    if clean.len() % 2 != 0 {
        return Err(());
    }
    let mut res = String::new();
    for (i, c) in clean.chars().enumerate() {
        res.push(c);
        if i % 2 == 1 {
            res.push(' ');
        }
    }
    Ok(res.trim().to_string())
}

// SOTA: Tradução Atômica para o Motor Nativo (Sem depender da biblioteca)
fn val_u8(v: &rs_poker::core::Value) -> u8 {
    match v {
        rs_poker::core::Value::Two => 0, rs_poker::core::Value::Three => 1,
        rs_poker::core::Value::Four => 2, rs_poker::core::Value::Five => 3,
        rs_poker::core::Value::Six => 4, rs_poker::core::Value::Seven => 5,
        rs_poker::core::Value::Eight => 6, rs_poker::core::Value::Nine => 7,
        rs_poker::core::Value::Ten => 8, rs_poker::core::Value::Jack => 9,
        rs_poker::core::Value::Queen => 10, rs_poker::core::Value::King => 11,
        rs_poker::core::Value::Ace => 12,
    }
}

fn suit_u8(s: &rs_poker::core::Suit) -> u8 {
    match s {
        rs_poker::core::Suit::Spade => 0, rs_poker::core::Suit::Club => 1,
        rs_poker::core::Suit::Heart => 2, rs_poker::core::Suit::Diamond => 3,
    }
}

// SOTA: Motor de Ranqueamento de Fricção Zero. Substitui a falha catastrófica (unreachable code) do rs_poker 0.2.0.
fn eval_5(c1: &Card, c2: &Card, c3: &Card, c4: &Card, c5: &Card) -> i32 {
    let mut values = [val_u8(&c1.value), val_u8(&c2.value), val_u8(&c3.value), val_u8(&c4.value), val_u8(&c5.value)];
    let suits = [suit_u8(&c1.suit), suit_u8(&c2.suit), suit_u8(&c3.suit), suit_u8(&c4.suit), suit_u8(&c5.suit)];

    values.sort_unstable_by(|a, b| b.cmp(a));
    let is_flush = suits[1] == suits[0] && suits[2] == suits[0] && suits[3] == suits[0] && suits[4] == suits[0];
    let is_straight = (values[0] == values[1] + 1 && values[1] == values[2] + 1 && values[2] == values[3] + 1 && values[3] == values[4] + 1)
        || (values[0] == 12 && values[1] == 3 && values[2] == 2 && values[3] == 1 && values[4] == 0); // Wheel A-5

    let mut counts = [0; 13];
    for &v in &values { counts[v as usize] += 1; }

    let mut pairs = 0; let mut three = 0; let mut four = 0;
    let mut pair_vals = Vec::new(); let mut three_val = 0; let mut four_val = 0;

    for v in (0..13).rev() {
        if counts[v] == 4 { four = 1; four_val = v as u8; }
        else if counts[v] == 3 { three = 1; three_val = v as u8; }
        else if counts[v] == 2 { pairs += 1; pair_vals.push(v as u8); }
    }

    if is_flush && is_straight { return (8 << 20) + (if values[0] == 12 && values[1] == 3 { 3 } else { values[0] } as i32); }
    if four == 1 { return (7 << 20) + ((four_val as i32) << 4) + (*values.iter().find(|&&v| v != four_val).unwrap() as i32); }
    if three == 1 && pairs >= 1 { return (6 << 20) + ((three_val as i32) << 4) + (pair_vals[0] as i32); }
    if is_flush { return (5 << 20) + ((values[0] as i32) << 16) + ((values[1] as i32) << 12) + ((values[2] as i32) << 8) + ((values[3] as i32) << 4) + (values[4] as i32); }
    if is_straight { return (4 << 20) + (if values[0] == 12 && values[1] == 3 { 3 } else { values[0] } as i32); }
    if three == 1 { let mut k = values.iter().filter(|&&v| v != three_val); return (3 << 20) + ((three_val as i32) << 8) + ((*k.next().unwrap() as i32) << 4) + (*k.next().unwrap() as i32); }
    if pairs == 2 { let k = values.iter().find(|&&v| v != pair_vals[0] && v != pair_vals[1]).unwrap(); return (2 << 20) + ((pair_vals[0] as i32) << 8) + ((pair_vals[1] as i32) << 4) + (*k as i32); }
    if pairs == 1 { let mut k = values.iter().filter(|&&v| v != pair_vals[0]); return (1 << 20) + ((pair_vals[0] as i32) << 12) + ((*k.next().unwrap() as i32) << 8) + ((*k.next().unwrap() as i32) << 4) + (*k.next().unwrap() as i32); }

    (values[0] as i32) << 16 | (values[1] as i32) << 12 | (values[2] as i32) << 8 | (values[3] as i32) << 4 | (values[4] as i32)
}

fn best_rank(cards: &[Card]) -> i32 {
    let mut best = -1;
    let n = cards.len();
    if n < 5 { return -1; }

    for i in 0..n {
        for j in (i+1)..n {
            for k in (j+1)..n {
                for l in (k+1)..n {
                    for m in (l+1)..n {
                        let r = eval_5(&cards[i], &cards[j], &cards[k], &cards[l], &cards[m]);
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
    let formatted = format_cards(cards_str).unwrap_or_default();
    match Hand::new_from_str(&formatted) {
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
    let hero_formatted = match format_cards(hero_hands_str) {
        Ok(f) => f,
        Err(_) => return -1.0,
    };
    let hero_hand = match Hand::new_from_str(&hero_formatted) {
        Ok(h) => h,
        Err(_) => return -1.0,
    };
    let villain_formatted = match format_cards(villain_hands_str) {
        Ok(f) => f,
        Err(_) => return -2.0,
    };
    let villain_hand = match Hand::new_from_str(&villain_formatted) {
        Ok(h) => h,
        Err(_) => return -2.0,
    };

    let mut board_cards: Vec<Card> = Vec::new();
    if !board_str.trim().is_empty() {
        if let Ok(b) = Hand::new_from_str(&format_cards(board_str).unwrap_or_default()) {
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
