import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '../../app/(public)/page';

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock fetch global para evitar erros de rede no Server Component
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ tasks: { running: 2, pending: 1 } }),
  }),
) as jest.Mock;

// Mock global para HTMLMediaElement para evitar o vazamento de exceções no JSDOM
Object.defineProperty(globalThis.window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: jest.fn().mockReturnValue(undefined),
});

describe('Landing Page - Poker Racional', () => {
  it('renderiza o título principal e o CTA principal', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /O Edge Mudou de Lugar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Simulador Mestre/i })).toBeInTheDocument();
  });

  it('renderiza a ementa de módulos e os CTAs principais', () => {
    render(<Home />);

    expect(screen.getAllByText(/Laboratório CFR/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Biblioteca/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/O Downward Drift/i)).toBeInTheDocument();
    expect(screen.getByText(/A "Mentira" do ICM/i)).toBeInTheDocument();
  });
});
