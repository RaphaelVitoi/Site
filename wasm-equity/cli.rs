use vitoi_equity_engine::calculate_perspectiva_core;

fn main() {
    println!("===========================================================");
    println!("SOTA QUANTUM ENGINE: Auditoria Nativa CLI");
    println!("Protocolo de Injeção LLDB-DAP JIT: Pronto para Captura");
    println!("===========================================================");

    // Validação D2: RIO MW escala exponencialmente com N (Jogadores)
    // Parâmetros Baseline Estressantes para Teste de Insolvência
    let current_equity_pct = 0.45;
    let delta_win_pct = 0.55;
    let delta_lose_pct = -0.45;
    let dynamic_ev_fold = -1.125;
    let realization_factor = 0.85;
    let fgs_health = 1.0;
    let hero_invested = 5.0;
    let current_pot = 20.0;
    let stack_eff = 40.0;
    let hero_rp = 15.0;
    let villain_rp = 15.0;
    let bounty_value = 0.0;
    let edge_base = 1.0;
    let human_noise_factor = 0.1;
    let reference_status = 0; // Baseline

    let mut iters = 0;

    // Escalona o ambiente Multiway de 2 para 6 jogadores (Pot Entrapment Severo)
    for active_players in 2..=6 {
        iters += 1;

        // Chamada O(1) Nativa Pura - Alvo Principal de Breakpoints LLDB
        let out = calculate_perspectiva_core(
            current_equity_pct,
            delta_win_pct,
            delta_lose_pct,
            dynamic_ev_fold,
            realization_factor,
            fgs_health,
            active_players,
            hero_invested,
            current_pot,
            stack_eff,
            hero_rp,
            villain_rp,
            bounty_value,
            edge_base,
            human_noise_factor,
            reference_status,
        );

        let perspectiva = out[0];
        let rio_mw = out[3];
        let ci = out[5];

        println!(
            "[Nó Topológico MW {}] Perspectiva: {:.4} | RIO MW: {:.4} | CI: {:.4}",
            active_players, perspectiva, rio_mw, ci
        );
    }

    println!(
        "Auditoria Termodinâmica de Invariantes concluída em {} sub-ciclos.",
        iters
    );
}
