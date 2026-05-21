import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { useSotaWorkers } from '../simulator/hooks/useSotaWorkers';
import { UniversalLabShell } from './UniversalLabShell';

// SOTA: Mock do hook para isolar o componente do seu provedor de contexto
vi.mock( '../simulator/hooks/useSotaWorkers' );

describe( 'UniversalLabShell - Integração SOTA WASM', () => {
    const mockDispatchQuantumSync = vi.fn();

    beforeEach( () => {
        // Limpa mocks antes de cada teste
        mockDispatchQuantumSync.mockClear();

        // SOTA: Escudo de I/O para ambiente JSDOM
        const mockLocalStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        };
        vi.stubGlobal( 'localStorage', mockLocalStorage );

        ( useSotaWorkers as Mock ).mockReturnValue( {
            dispatchQuantumSync: mockDispatchQuantumSync,
        } );
    } );

    it( 'deve orquestrar a ponte quântica e atualizar a Perspectiva via Web Worker', async () => {
        // SOTA: O mock do dispatch simula a resposta do worker chamando o callback imediatamente
        mockDispatchQuantumSync.mockImplementation( ( buffer: Float32Array, callback: ( payload: any ) => void ) => {
            callback( { monopolyVector: 1.45, riskPremium: 18.2, perspective: 0.85 } );
        } );

        render( <UniversalLabShell /> );

        const btnProcessar = screen.getByRole( 'button', { name: /Processar Matriz Quântica/i } );
        fireEvent.click( btnProcessar );

        expect( mockDispatchQuantumSync ).toHaveBeenCalled();

        // Verifica a mutação de estado pelo Worker (Sincronia Quântica)
        expect( screen.getByText( '1.450' ) ).toBeInTheDocument(); // monopolyVector mockado
        const monopolyElements = screen.getAllByText( '1.450' );
        expect( monopolyElements.length ).toBeGreaterThan( 0 ); // O valor de monopolyVector repete-se na UI (Painel + Vetor)
        expect( screen.getByText( '18.2%' ) ).toBeInTheDocument(); // riskPremium mockado
    } );
} );
