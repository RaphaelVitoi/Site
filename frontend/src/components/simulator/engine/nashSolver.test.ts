/// <reference types="jest" />

import { solveIcmDistortion } from './nashSolver';
import { ChipEvFreqs } from './types';

describe( 'solveIcmDistortion - Auditoria de Coerência Teórica', () => {
    const baselineFreqs: ChipEvFreqs = {
        ip_check: 40,
        ip_bet_small: 30,
        ip_bet_large: 30,
        oop_call: 50,
        oop_fold: 30,
        oop_raise: 20
    };

    it( 'Caso IP sob Pressão (deltaRp > 0): OOP deve pagar MENOS (Risco de Ressurreição)', () => {
        // IP RP = 20, OOP RP = 5 => deltaRp = 15 (IP sob pressão)
        const res = solveIcmDistortion( 20, 5, baselineFreqs );

        // Teoria Vitoi: "O OOP, com menor Risk Premium, PAGA MENOS vs o mesmo range (do IP sob pressão)"
        // Motivo: Dobrar o IP reduz a pressão do ICM sobre a mesa, beneficiando o IP mais do que o OOP.
        
        console.log(`OOP Call Center: ${res.oop.call.center}, Original: ${baselineFreqs.oop_call}`);
        
        // BUG IDENTIFICADO: O código atual aumenta o call quando deltaRp > 0
        expect( res.oop.call.center ).toBeLessThan( baselineFreqs.oop_call ); 
    } );

    it( 'Caso OOP sob Pressão (deltaRp < 0): OOP deve pagar MENOS (Aversão ao Risco)', () => {
        // IP RP = 5, OOP RP = 20 => deltaRp = -15 (OOP sob pressão)
        const res = solveIcmDistortion( 5, 20, baselineFreqs );

        // Teoria: Sob pressão direta, o defensor deve fortalecer o range e desistir mais de mãos marginais.
        expect( res.oop.call.center ).toBeLessThan( baselineFreqs.oop_call );
    } );
} );
