import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock do next/link para testes isolados
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Landing Page - Poker Racional', () => {
  it('renderiza o título principal e a promessa sem falhas', () => {
    render(<Home />);
    expect(screen.getByText(/O Edge Mudou de Lugar/i)).toBeInTheDocument();
    expect(screen.getByText(/Domine a Incerteza/i)).toBeInTheDocument();
  });

  it('renderiza a vitrine de laboratórios (bifurcação do funil)', () => {
    render(<Home />);
    expect(screen.getByText(/Motor Algorítmico ICM/i)).toBeInTheDocument();
    expect(screen.getByText(/Psicologia High Stakes/i)).toBeInTheDocument();
    expect(screen.getByText(/Biblioteca Epistêmica/i)).toBeInTheDocument();
  });

});