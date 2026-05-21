use wasm_bindgen::prelude::*;
use rs_poker::core::{Hand, Rankable};

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
            // Transmuta para i32 para tráfego seguro pelo WebAssembly boundary
            rank as i32
        },
        Err(_) => {
            // Diagnóstico Bayesiano: Rejeição silênciosa de sintaxe corrompida.
            // O Web Worker do JS deve tratar -1 como input inválido e não explodir a Main Thread.
            -1
        }
    }
}

/// ANTEVISÃO 2: Esqueleto para o processamento de equidade de ranges nativos.
/// Receberá ranges bitmaskados ou arrays de índices e calculará a equidade via Monte Carlo ou Exaustão.
#[wasm_bindgen]
pub fn calculate_range_equity(hero_range_mask: &str, villain_range_mask: &str, board: &str) -> f64 {
    // TO-DO: Implementar a iteratividade de Monte Carlo ou enumeração combinatória completa
    // utilizando as ferramentas de simulação nativas do rs-poker.
    // Retornando um placeholder para garantir a tipagem FFI.
    0.0
}
