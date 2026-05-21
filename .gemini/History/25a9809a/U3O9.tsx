import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { UniversalLabShell } from './UniversalLabShell';

// Mock do Web Worker (Fricção Zero para o Jest)
class MockWorker {
    onmessage: ( ( ev: MessageEvent ) => void ) | null = null;
    postMessage ( data: any ) {
        // Simula o processamento O(1) do motor quântico devolvendo o payload
        if ( this.onmessage && data?.type === 'EVALUATE_MATRIX' )
        {
            this.onmessage( {
                data: {
                    type: 'QUANTUM_SYNC',
                    payload: { monopolyVector: 1.45, riskPremium: 18.2, perspective: 0.85 }
                }
            } as MessageEvent );
        }
    }
    terminate () {
        this.onmessage = null; /* NOSONAR: Libera as referências de callback no mock simulando a terminação real */
    }
}

describe( 'UniversalLabShell - Integração SOTA WASM', () => {
    let originalWorker: any;

    beforeAll( () => {
        originalWorker = globalThis.Worker;
        globalThis.Worker = MockWorker as any;
    } );

    afterAll( () => {
        globalThis.Worker = originalWorker;
    } );

    it( 'deve orquestrar a ponte quântica e atualizar a Perspectiva via Web Worker', () => {
        render( <UniversalLabShell /> );

        const btnProcessar = screen.getByRole( 'button', { name: /Processar Matriz Quântica/i } );
        fireEvent.click( btnProcessar );

        // Verifica a mutação de estado pelo Worker (Sincronia Quântica)
        expect( screen.getByText( '1.450' ) ).toBeInTheDocument(); // monopolyVector mockado
        expect( screen.getByText( '18.2%' ) ).toBeInTheDocument(); // riskPremium mockado
    } );
} );
