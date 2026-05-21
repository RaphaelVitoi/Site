import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock the next/link component as a simple anchor for testing
// Mock do next/link para testes isolados
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Landing Page - Poker Racional (Home)', () => {
  
  it('renders the main headline correctly', () => {
describe('Landing Page - Poker Racional', () => {
  it('renderiza o título principal e a promessa sem falhas', () => {
    render(<Home />);
    
    // Verifica se a mensagem central de impacto está na tela
    expect(screen.getByText(/O Edge Mudou de Lugar./i)).toBeInTheDocument();
    expect(screen.getByText(/O Edge Mudou de Lugar/i)).toBeInTheDocument();
    expect(screen.getByText(/Você Ainda Está Jogando o Jogo de 2020\?/i)).toBeInTheDocument();
    expect(screen.getByText(/mais de 10% do seu ROI/i)).toBeInTheDocument();
  });

  it('renders the "A Mentira do ICM" and "O Custo Invisível" sections', () => {
  it('renderiza a seção metodológica "A Mentira do ICM"', () => {
    render(<Home />);
    
    expect(screen.getByText(/A "Mentira" do ICM/i)).toBeInTheDocument();
    expect(screen.getByText(/O Custo Invisível/i)).toBeInTheDocument();
    // O dado percentual assustador deve estar lá
    expect(screen.getByText(/mais de 10% do seu ROI/i)).toBeInTheDocument();
  });

  it('renders the Hub / Biblioteca cards', () => {
  it('renderiza a biblioteca e os cards de conteúdo corretamente', () => {
    render(<Home />);
    
    // Verifica os títulos dos cards da biblioteca
    expect(screen.getByText(/ICM & RP: A Aula/i)).toBeInTheDocument();
    expect(screen.getByText(/Protocolo de Análise/i)).toBeInTheDocument();
    expect(screen.getByText(/Psicologia High Stakes/i)).toBeInTheDocument();
    
    // Verifica a presença do card bloqueado (lock)
    expect(screen.getByText(/Aguardando conteúdo específico./i)).toBeInTheDocument();
    expect(screen.getByText(/Aguardando conteúdo específico/i)).toBeInTheDocument();
  });
});