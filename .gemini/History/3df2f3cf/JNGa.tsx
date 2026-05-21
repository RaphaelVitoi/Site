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
    expect(screen.getByText(/Você Ainda Está Jogando o Jogo de 2020\?/i)).toBeInTheDocument();
    expect(screen.getByText(/mais de 10% do seu ROI/i)).toBeInTheDocument();
  });

  it('renderiza a seção metodológica "A Mentira do ICM"', () => {
    render(<Home />);
    expect(screen.getByText(/A "Mentira" do ICM/i)).toBeInTheDocument();
    expect(screen.getByText(/O Custo Invisível/i)).toBeInTheDocument();
  });

  it('renderiza a biblioteca e os cards de conteúdo corretamente', () => {
    render(<Home />);
    expect(screen.getByText(/ICM & RP: A Aula/i)).toBeInTheDocument();
    expect(screen.getByText(/Protocolo de Análise/i)).toBeInTheDocument();
    expect(screen.getByText(/Aguardando conteúdo específico/i)).toBeInTheDocument();
  });
});