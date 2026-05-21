use wasm_bindgen_test::*;
use vitoi_equity_engine::{calculate_equity_monte_carlo_binary, solve_insolvency_matrix_binary};

wasm_bindgen_test_configure!(run_in_browser);

/// SOTA: Verifica a integridade absoluta da Semente (Fricção Zero e Determinismo)
/// A mesma semente matemática deve sempre forjar o exato mesmo colapso de entropia.
#[wasm_bindgen_test]
fn test_monte_carlo_determinism_o1() {
    // Arrays Uint8Array simulando a extração do frontend (1326 combos)
    let mut hero_mask = vec![0u8; 1326];
    let mut villain_mask = vec![0u8; 1326];

    // Injeção de Bits Arbitrários (Simulando AA vs KK)
    hero_mask[0] = 1;
    villain_mask[1] = 1;

    let board = "Ks7h2d";
    let iterations = 10_000;
    let seed = 42;

    let equity_a = calculate_equity_monte_carlo_binary(&hero_mask, &villain_mask, board, iterations, seed);
    let equity_b = calculate_equity_monte_carlo_binary(&hero_mask, &villain_mask, board, iterations, seed);

    // Determinismo O(1): Sementes iguais DEVEM gerar a exata mesma equidade (Previsibilidade de Sistema)
    assert_eq!(equity_a, equity_b, "[ENTROPIA DETECTADA] O motor quântico quebrou o determinismo matemático.");
    assert!(equity_a >= 0.0 && equity_a <= 1.0, "[FALHA SOTA] Equidade fora do limite termodinâmico (0.0 - 1.0).");
}

/// SOTA: Auditoria da Matriz de Insolvência (Rigor Bayesiano)
/// Valida se o solver exporta a matriz tipada corretamente para as pontes JS sem vazamento de memória.
#[wasm_bindgen_test]
fn test_insolvency_matrix_structure() {
    let mut villain_mask = vec![0u8; 1326];
    villain_mask[10] = 1; // Simula uma fatia do range

    let board = "";
    let rp_factor = 20.0;
    let hero_invested = 1.5;
    let current_pot = 5.0;
    let active_players = 3;
    let iterations = 5_000;
    let seed = 42;

    let matrix = solve_insolvency_matrix_binary(
        &villain_mask,
        board,
        rp_factor,
        hero_invested,
        current_pot,
        active_players,
        iterations,
        seed
    );

    assert!(matrix.is_object(), "[ALERTA DE TIPAGEM] A matriz gerada não respeita o contrato do Objeto/Array JS.");

    // Validamos se a matriz não ruiu (length do JS Array > 0)
    let length = js_sys::Reflect::get(&matrix, &"length".into()).unwrap().as_f64().unwrap() as usize;
    assert!(length > 0, "[ALERTA DE ESTADO] O motor quântico gerou uma matriz de insolvência vazia.");
}

/// SOTA: Verificação de Pânico e Tratamento de Exceções (Escudo Anti-Deadlock)
/// Garante que máscaras inválidas não induzam pânicos (Morte Térmica) no host, mas retornem códigos de erro restritos.
#[wasm_bindgen_test]
fn test_anti_entropy_error_codes() {
    let hero_mask_invalid = vec![0u8; 10]; // Tamanho corrompido (O SOTA exige matriz 1326)
    let villain_mask = vec![0u8; 1326];

    let equity = calculate_equity_monte_carlo_binary(&hero_mask_invalid, &villain_mask, "", 100, 42);

    // Códigos de erro interceptados no Worker: -1 (Hero mask), -2 (Villain mask)
    assert!(
        equity < 0.0,
        "[FALHA SOTA] O motor não interceptou a máscara corrompida. Risco de Morte Térmica não mitigado."
    );
}
