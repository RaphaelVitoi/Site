use wasm_bindgen::prelude::*;
use rs_poker::core::{Card, Deck};
use rand::seq::SliceRandom;
use rand::rngs::StdRng;
use rand::SeedableRng;
use rand::distributions::{Distribution, WeightedIndex};
use serde::{Serialize, Deserialize};

// SOTA: Hand definition with weight for GTO frequency simulations
struct WeightedHand {
    cards: Vec<Card>,
    weight: f64,
}

// SOTA: Parser de Fricção Zero (Substitui Hand::new_from_str que causa panics no rs_poker 0.2.0)
fn parse_cards(s: &str) -> Result<Vec<Card>, ()> {
    let clean: String = s.chars().filter(|c| !c.is_whitespace()).collect();
    if clean.len() % 2 != 0 {
        return Err(());
    }
    let mut cards = Vec::new();
    let chars: Vec<char> = clean.chars().collect();
    for i in (0..chars.len()).step_by(2) {
        let value = rs_poker::core::Value::from_char(chars[i]).ok_or(())?;
        let suit = rs_poker::core::Suit::from_char(chars[i+1]).ok_or(())?;
        cards.push(Card { value, suit });
    }
    Ok(cards)
}

// SOTA: Expansor de Vetores Ponderados. Lê "AhKh:0.5, AcAd:1.0" e gera a Matriz de Colisão GTO.
fn parse_weighted_hands(s: &str) -> Result<Vec<WeightedHand>, ()> {
    let mut hands = Vec::new();
    for part in s.split(',') {
        let part = part.trim();
        if part.is_empty() { continue; }

        let subparts: Vec<&str> = part.split(':').collect();
        let cards_str = subparts[0];
        let weight = if subparts.len() > 1 {
            subparts[1].parse::<f64>().unwrap_or(1.0)
        } else {
            1.0
        };

        if let Ok(cards) = parse_cards(cards_str) {
            if cards.len() == 2 {
                hands.push(WeightedHand { cards, weight });
            }
        }
    }
    if hands.is_empty() { return Err(()); }
    Ok(hands)
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
    match parse_cards(cards_str) {
        Ok(cards) => {
            best_rank(&cards)
        },
        Err(_) => {
            // Diagnóstico Bayesiano: Rejeição silênciosa de sintaxe corrompida.
            // O Web Worker do JS deve tratar -1 como input inválido e não explodir a Main Thread.
            -1
        }
    }
}

/// ANTEVISÃO: Motor SOTA de Força Bruta e Monte Carlo com suporte a Frequências GTO (Weights).
/// Aloca uma simulação intensiva consumindo a CPU limpa do Worker (Thread Separada do React).
#[wasm_bindgen]
pub fn calculate_equity_monte_carlo(hero_hands_str: &str, villain_hands_str: &str, board_str: &str, iterations: u32, seed: u32) -> f64 {
    let hero_weighted = match parse_weighted_hands(hero_hands_str) {
        Ok(c) => c,
        Err(_) => return -1.0,
    };
    let villain_weighted = match parse_weighted_hands(villain_hands_str) {
        Ok(c) => c,
        Err(_) => return -2.0,
    };

    let mut board_cards: Vec<Card> = Vec::new();
    if !board_str.trim().is_empty() {
        if let Ok(b) = parse_cards(board_str) {
            board_cards.extend(b);
        } else {
            return -3.0; // Board string corrompida
        }
    }

    if board_cards.len() > 5 { return -3.0; }

    let needed_board_cards = 5 - board_cards.len();
    if needed_board_cards > 48 || iterations == 0 { return 0.5; }

    let mut wins = 0;
    let mut ties = 0;
    let mut valid_iterations = 0;

    // SOTA: Injeção de semente pelo Host (Erradica o pânico FFI de getrandom no Web Worker isolado)
    let mut rng = StdRng::seed_from_u64(seed as u64);
    let full_deck: Vec<Card> = Deck::default().into_iter().collect();

    // SOTA: Distribuição Ponderada para amostragem de Frequências GTO
    let hero_dist = WeightedIndex::new(hero_weighted.iter().map(|h| h.weight)).unwrap();
    let villain_dist = WeightedIndex::new(villain_weighted.iter().map(|h| h.weight)).unwrap();

    for _ in 0..iterations {
        let hero_cards = &hero_weighted[hero_dist.sample(&mut rng)].cards;
        let villain_cards = &villain_weighted[villain_dist.sample(&mut rng)].cards;

        // Erradica a Entropia de Colisão (Se as mãos sorteadas colidem entre si ou com o board, descarta o universo)
        if hero_cards[0] == villain_cards[0] || hero_cards[0] == villain_cards[1] ||
           hero_cards[1] == villain_cards[0] || hero_cards[1] == villain_cards[1] {
            continue;
        }
        if board_cards.contains(&hero_cards[0]) || board_cards.contains(&hero_cards[1]) ||
           board_cards.contains(&villain_cards[0]) || board_cards.contains(&villain_cards[1]) {
            continue;
        }

        let mut available_cards = full_deck.clone();
        available_cards.retain(|c| !hero_cards.contains(c) && !villain_cards.contains(c) && !board_cards.contains(c));
        available_cards.shuffle(&mut rng);

        let mut current_board = board_cards.clone();
        current_board.extend_from_slice(&available_cards[0..needed_board_cards]);

        // SOTA: Isola a fusão das 7 cartas em variaveis fisicas para blindar a memoria
        let hero_7_cards = [hero_cards.clone(), current_board.clone()].concat();
        let villain_7_cards = [villain_cards.clone(), current_board.clone()].concat();

        let hero_rank = best_rank(&hero_7_cards);
        let villain_rank = best_rank(&villain_7_cards);

        if hero_rank > villain_rank { wins += 1; } else if hero_rank == villain_rank { ties += 1; }
        valid_iterations += 1;
    }

    if valid_iterations == 0 { return -4.0; }
    (wins as f64 + (ties as f64 / 2.0)) / (valid_iterations as f64)
}

#[derive(Serialize, Deserialize)]
pub struct NashCell {
    pub combo: String,
    pub pure_ev: f64,
    pub insolvency_delta: f64,
    pub is_suited: bool,
    pub is_pair: bool,
}

#[wasm_bindgen]
pub fn solve_insolvency_matrix(
    villain_range: &str,
    board: &str,
    rp_factor: f64,
    hero_invested: f64,
    current_pot: f64,
    active_players: u8,
    iterations: u32,
    seed: u32
) -> JsValue {
    let mut matrix_data: Vec<NashCell> = Vec::with_capacity(169);
    let ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

    // Varredura da Matriz 13x13 (Simulação Estrita)
    for (i, &rank1) in ranks.iter().enumerate() {
        for (j, &rank2) in ranks.iter().enumerate() {
            let is_pair = i == j;
            let is_suited = !is_pair && i < j;
            let _is_offsuit = !is_pair && i > j;

            let combo = if is_pair {
                format!("{}{}", rank1, rank2)
            } else if is_suited {
                format!("{}{}", rank1, rank2) + "s"
            } else {
                format!("{}{}", rank2, rank1) + "o"
            };

            let equity = calculate_equity_monte_carlo(&combo, villain_range, board, iterations, seed + (i * 13 + j) as u32);
            let eq_val = if equity >= 0.0 { equity } else { 0.0 };

            let pure_ev = (eq_val * current_pot) - ((1.0 - eq_val) * hero_invested);

            let opponents = if active_players > 1 { (active_players - 1) as f64 } else { 1.0 };
            let insolvency_delta = -(hero_invested * 0.15) * opponents.powi(2) * (rp_factor / 100.0);

            matrix_data.push(NashCell { combo, pure_ev, insolvency_delta, is_suited, is_pair });
        }
    }

    serde_wasm_bindgen::to_value(&matrix_data).unwrap()
}
