use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct PmevResult {
    pub pmev: f64,
    pub dynamic_ev_fold: f64,
    pub structural_liability: f64,
    pub amortized_edge: f64,
    pub risk_advantage: f64,
    pub required_equity: f64,
    pub bubble_factor: f64,
    pub utility_win: f64,
    pub utility_lose: f64,
    pub optimal_action: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TreeResult {
    pub pm_fold: f64,
    pub pm_call: f64,
    pub pm_raise: f64,
    pub pm_best: f64,
    pub p_best_outcome: f64,
    pub best_action: String,
}

#[wasm_bindgen]
pub struct PmevEngine {
    alpha: f64,
    beta: f64,
    lambda: f64,
}

#[wasm_bindgen]
impl PmevEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            alpha: 0.88,
            beta: 0.88,
            lambda: 2.25,
        }
    }

    fn calculate_utility(&self, x: f64, loss_aversion: f64) -> f64 {
        if x >= 0.0 {
            x.powf(self.alpha)
        } else {
            -loss_aversion * x.abs().powf(self.beta)
        }
    }

    pub fn simulate_decision_tree(
        &self,
        equity: f64,
        pot_size: f64,
        stack_eff: f64,
        active_players: i32,
        street_idx: i32,
        hero_invested: f64,
        ev_fold_dynamic: f64,
        structural_liability: f64,
        valuation_stack: f64,
        amortized_edge: f64,
        aggression_factor: f64,
        realization_factor: f64,
        loss_aversion_base: f64,
        fgs_health: f64,
        rp_opp: f64,
        fold_equity: f64,
    ) -> JsValue {
        let safe_stack = stack_eff.max(2.718);
        let stack_modifier = 100.0_f64.ln() / safe_stack.ln();
        let fgs_modifier = 1.0 / fgs_health.powi(2).max(0.1);
        let loss_aversion = loss_aversion_base * stack_modifier * fgs_modifier;

        let spr = stack_eff / pot_size.max(1.0);
        let showdown_force = (-spr / 1.5).exp();
        let r_eff = realization_factor * (1.0 - showdown_force) + 1.0 * showdown_force;
        let realized_eq = (equity * r_eff).max(0.01).min(0.99);

        let pm_fold = ev_fold_dynamic;
        let p_best_fold = if ev_fold_dynamic >= 0.0 { 1.0 } else { 0.0 };

        let bet_to_call = (pot_size * 0.5).min(stack_eff);
        let raise_size = (pot_size * 0.75).min(stack_eff);

        let (pm_call, p_best_call) = if street_idx >= 2 {
            let win_delta = pot_size - hero_invested;
            let lose_delta = -(hero_invested + bet_to_call);
            let u_win = self.calculate_utility(win_delta, loss_aversion) * valuation_stack;
            let u_lose = self.calculate_utility(lose_delta, loss_aversion) * valuation_stack;
            let pm = (realized_eq * u_win) + ((1.0 - realized_eq) * u_lose) - structural_liability;
            (pm, realized_eq)
        } else {
            let next_pot = pot_size + 2.0 * bet_to_call;
            let next_stack = (stack_eff - bet_to_call).max(0.1);
            let next_res_js = self.simulate_decision_tree(
                equity, next_pot, next_stack, active_players, street_idx + 1,
                hero_invested + bet_to_call, ev_fold_dynamic, structural_liability,
                valuation_stack, amortized_edge, aggression_factor, realization_factor,
                loss_aversion_base, fgs_health, rp_opp, fold_equity
            );
            let res: TreeResult = serde_wasm_bindgen::from_value(next_res_js).unwrap();
            (res.pm_best * 0.9 - structural_liability, res.p_best_outcome * 0.9)
        };

        let p_opp_fold = fold_equity;
        let remaining = (1.0 - p_opp_fold).max(0.0);
        let (p_opp_raise, p_opp_call) = if remaining <= 0.0 {
            (0.0, 0.0)
        } else if remaining < 0.04 {
            (remaining * 0.5, remaining * 0.5)
        } else {
            let raise_prob = (remaining - 0.02).max(0.02).min(0.15 * aggression_factor * (1.0 - 0.003 * rp_opp));
            (raise_prob, remaining - raise_prob)
        };

        let u_opp_fold = self.calculate_utility(pot_size - hero_invested, loss_aversion) * valuation_stack;
        let p_best_opp_fold = 1.0;

        let (u_opp_call, p_best_opp_call) = if street_idx >= 2 {
            let win_delta = pot_size + raise_size - hero_invested;
            let lose_delta = -(hero_invested + raise_size);
            let u_win = self.calculate_utility(win_delta, loss_aversion) * valuation_stack;
            let u_lose = self.calculate_utility(lose_delta, loss_aversion) * valuation_stack;
            ((realized_eq * u_win) + ((1.0 - realized_eq) * u_lose), realized_eq)
        } else {
            let next_pot = pot_size + 2.0 * raise_size;
            let next_stack = (stack_eff - raise_size).max(0.1);
            let next_res_js = self.simulate_decision_tree(
                equity, next_pot, next_stack, active_players, street_idx + 1,
                hero_invested + raise_size, ev_fold_dynamic, structural_liability,
                valuation_stack, amortized_edge, aggression_factor, realization_factor,
                loss_aversion_base, fgs_health, rp_opp, fold_equity
            );
            let res: TreeResult = serde_wasm_bindgen::from_value(next_res_js).unwrap();
            (res.pm_best * 0.9, res.p_best_outcome * 0.9)
        };

        let shove_size = stack_eff - raise_size;
        let u_hero_fold_to_shove = self.calculate_utility(-(hero_invested + raise_size), loss_aversion) * valuation_stack;
        let p_best_hero_fold_to_shove = 0.0;

        let win_delta_shove = pot_size + stack_eff - hero_invested;
        let lose_delta_shove = -(hero_invested + stack_eff);
        let u_hero_call_shove_win = self.calculate_utility(win_delta_shove, loss_aversion) * valuation_stack;
        let u_hero_call_shove_lose = self.calculate_utility(lose_delta_shove, loss_aversion) * valuation_stack;
        let u_hero_call_shove = (realized_eq * u_hero_call_shove_win) + ((1.0 - realized_eq) * u_hero_call_shove_lose);
        let p_best_hero_call_shove = realized_eq;

        let (u_opp_raise, p_best_opp_raise) = if u_hero_call_shove > u_hero_fold_to_shove {
            (u_hero_call_shove, p_best_hero_call_shove)
        } else {
            (u_hero_fold_to_shove, p_best_hero_fold_to_shove)
        };

        let pm_raise = (p_opp_fold * u_opp_fold) + (p_opp_call * u_opp_call) + (p_opp_raise * u_opp_raise) - structural_liability;
        let p_best_raise = (p_opp_fold * p_best_opp_fold) + (p_opp_call * p_best_opp_call) + (p_opp_raise * p_best_opp_raise);

        let decisions = [
            ("FOLD", pm_fold, p_best_fold),
            ("CALL", pm_call, p_best_call),
            ("RAISE", pm_// la continuation do código
        ];
        
        // Simplified for first pass to avoid truncation issues
        let result = TreeResult {
            pm_fold,
            pm_call,
            pm_raise,
            pm_best: pm_fold.max(pm_call).max(pm_raise),
            p_best_outcome: 0.0,
            best_action: "TBD".to_string(),
        };

        serde_wasm_bindgen::to_value(&result).unwrap()
    }

    pub fn calculate_perspective(
        &self,
        equity: f64,
        realization_factor: f64,
        valuation_stack: f64,
        ev_fold_dynamic: f64,
        structural_liability: f64,
        stack_depth_bb: f64,
        active_players: i32,
        edge_base: f64,
        aggression_factor: f64,
        pot_size: f64,
    ) -> JsValue {
        let tree_complexity = (stack_depth_bb.max(1.0)).log10();
        let effective_edge = edge_base * tree_complexity;
        let capture_rate = aggression_factor * 0.15;
        let amortized_edge = effective_edge + capture_rate;

        let effective_eq = equity * realization_factor;
        let clamped_eq = effective_eq.max(0.01).min(0.99);
        
        let win_delta = pot_size; 
        let lose_delta = -0.0; 

        let u_win = self.calculate_utility(win_delta, self.lambda) * valuation_stack;
        let u_lose = self.calculate_utility(lose_delta, self.lambda) * valuation_stack;

        let pmev_value = (clamped_eq * u_win) + ((1.0 - clamped_eq) * u_lose) - ev_fold_// la continuation do código
        let pmev_value_final = (clamped_eq * u_win) + ((1.0 - clamped_eq) * u_lose) - ev_fold_dynamic - structural_liability + amortized_edge;

        let opt_action = if pmev_value_final > 0.5 {
            "RAISE".to_string()
        } else if pmev_value_final >= 0.0 {
            "CALL".to_string()
        } else {
            "FOLD".to_string()
        };

        let result = PmevResult {
            pmev: pmev_value_final,
            dynamic_ev_fold: ev_fold_dynamic,
            structural_liability,
            amortized_edge,
            risk_advantage: 0.0,
            required_equity: 0.0,
            bubble_factor: 1.0,
            utility_win: u_win,
            utility_lose: u_lose,
            optimal_action: opt_action,
        };

        serde_wasm_bindgen::to_value(&result).unwrap()
    }
}
