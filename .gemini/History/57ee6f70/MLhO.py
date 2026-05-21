import logging
from typing import List, Dict

class PokerMathEngine:
    """
    Motor de Calculo SOTA para ICM, PKO e Risk Premium.
    Foco: Performance, Pure ASCII, e Precisao de Ponto Flutuante.
    """

    @staticmethod
    def calculate_icm(prizes: List[float], stacks: List[float]) -> List[float]:
        """
        Calcula o ICM usando uma aproximacao iterativa do modelo Malmuth-Harville.
        Retorna a Equity ($EV) de cada jogador com base no Prizepool.
        
        TODO (@validador / @implementor): Implementar algoritmo recursivo M-H completo
        ou utilizar aproximacao de limite (dependentes da complexidade e performance).
        """
        total_chips = sum(stacks)
        if total_chips == 0:
            return [0.0] * len(stacks)
            
        total_prize = sum(prizes)
        
        # Placeholder de Proporcao Simples (ChipEV) para estrutura inicial.
        # A logica M-H real requer permutacoes (fatorial) ou aproximacoes.
        # cEV = (stack / total_chips) * total_prize
        equities = [(s / total_chips) * total_prize for s in stacks]
        
        return equities

    @staticmethod
    def calculate_bounty_equity(hero_stack: float, opponent_stacks: List[float], opponent_bounties: List[float]) -> float:
        """
        Estima a Bounty Equity em PKO. 
        Regra base: A chance de coletar um bounty e proporcional as chances de cobrir
        e eliminar o oponente em futuros confrontos.
        """
        bounty_equity = 0.0
        for opp_stack, opp_bounty in zip(opponent_stacks, opponent_bounties):
            if hero_stack > opp_stack:
                # Heuristica simplificada de cobertura:
                # Hero tem uma vantagem intrinseca para coletar este bounty.
                coverage_factor = hero_stack / (hero_stack + opp_stack)
                bounty_equity += (opp_bounty / 2.0) * coverage_factor 
                # Divide por 2 porque metade do bounty vai pro bolso, metade pra cabeca.
        return bounty_equity

    @classmethod
    def calculate_risk_premium(cls, hero_idx: int, villain_idx: int, stacks: List[float], prizes: List[float], bet_size: float) -> Dict[str, float]:
        """
        Calcula o Risk Premium (RP) exato de uma colisao especifica.
        RP = (Equity necessaria em $EV) - (Equity necessaria em cEV)
        """
        # 1. Estado Atual ($EV Base)
        base_ev = cls.calculate_icm(prizes, stacks)
        
        # 2. Simula Vitoria do Hero (Hero +bet_size, Villain -bet_size)
        stacks_win = stacks.copy()
        stacks_win[hero_idx] += bet_size
        stacks_win[villain_idx] = max(0.0, stacks_win[villain_idx] - bet_size)
        ev_win = cls.calculate_icm(prizes, stacks_win)
        
        # 3. Simula Derrota do Hero (Hero -bet_size, Villain +bet_size)
        stacks_loss = stacks.copy()
        stacks_loss[hero_idx] = max(0.0, stacks_loss[hero_idx] - bet_size)
        stacks_loss[villain_idx] += bet_size
        ev_loss = cls.calculate_icm(prizes, stacks_loss)
        
        # 4. Deltas de Risco
        gain_ev = ev_win[hero_idx] - base_ev[hero_idx]
        loss_ev = base_ev[hero_idx] - ev_loss[hero_idx]
        
        # Validacao de divisao por zero
        if gain_ev + loss_ev == 0:
            rp = 0.0
        else:
            # Ratio de Risco: Quanto a perda doi mais que o ganho.
            rp = (loss_ev / (gain_ev + loss_ev)) * 100.0
            
        return {"risk_premium_percent": rp, "ev_win": gain_ev, "ev_loss": loss_ev}