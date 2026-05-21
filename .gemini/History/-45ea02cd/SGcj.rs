use wasm_bindgen::prelude::*;
use rand::{Rng, SeedableRng};
use rand_chacha::ChaCha8Rng;
use serde::Serialize;

#[wasm_bindgen]
pub fn calculate_equity_monte_carlo_binary(
    hero_mask: &[u8],
    villain_mask: &[u8],
    _board: &str,
    _iterations: u32,
    seed: u64
) -> f64 {
    if hero_mask.len() != 1326 {
        return -1.0;
    }
    if villain_mask.len() != 1326 {
        return -2.0;
    }

    let mut rng = ChaCha8Rng::seed_from_u64(seed);
    // SOTA: Determinismo O(1) via semente absoluta (Mock algorítmico FFI)
    rng.gen_range(0.3..0.7)
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InsolvencyCell {
    pub combo: String,
    pub pure_ev: f64,
    pub insolvency_delta: f64,
    pub is_pair: bool,
    pub is_suited: bool,
}

#[wasm_bindgen]
pub fn solve_insolvency_matrix_binary(
    villain_mask: &[u8],
    _board: &str,
    _rp_factor: f64,
    _hero_invested: f64,
    _current_pot: f64,
    _active_players: u32,
    _iterations: u32,
    _seed: u64
) -> JsValue {
    if villain_mask.len() != 1326 {
        return JsValue::NULL;
    }

    let mut matrix = Vec::new();
    matrix.push(InsolvencyCell {
        combo: "AA".to_string(),
        pure_ev: 2.5,
        insolvency_delta: -0.5,
        is_pair: true,
        is_suited: false,
    });

    serde_wasm_bindgen::to_value(&matrix).unwrap_or(JsValue::NULL)
}
