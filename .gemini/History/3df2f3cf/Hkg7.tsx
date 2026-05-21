import '@testing-library/jest-dom';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from './page';

jest.mock( 'next/link', () => {
  return ( { children, href }: { children: React.ReactNode; href: string } ) => {
    return <a href={ href }>{ children }</a>;
  };
} );

describe( 'Landing Page - Poker Racional', () => {
  it( 'renderiza o título principal e o CTA principal', () => {
    render( <Home /> );
    expect( screen.getByRole( 'heading', { name: /O Edge Mudou de Lugar/i } ) ).toBeInTheDocument();
    expect( screen.getByRole( 'link', { name: /Conhecer o Método/i } ) ).toBeInTheDocument();
  } );

  it( 'renderiza a vitrine de laboratórios (bifurcação do funil)', () => {
    render( <Home /> );
    expect( screen.getByText( /Motor ICM/i ) ).toBeInTheDocument();
    expect( screen.getByText( /Psicologia High Stakes/i ) ).toBeInTheDocument();
    expect( screen.getByText( /Biblioteca Epistêmica/i ) ).toBeInTheDocument();
    expect( screen.getByText( /Oráculo Híbrido/i ) ).toBeInTheDocument();
  } );
} );
