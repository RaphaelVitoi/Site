import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Home from "../../app/page";

jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock fetch global para evitar erros de rede no Server Component
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ tasks: { running: 2, pending: 1 } }),
  }),
) as jest.Mock;

describe("Landing Page - Poker Racional", () => {
  it("renderiza o título principal e o CTA principal", async () => {
    const ResolvedHome = await Home();
    render(ResolvedHome);

    expect(
      screen.getByRole("heading", { name: /A Fronteira da Resolução/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Consultar Oráculo/i }),
    ).toBeInTheDocument();
  });

  it("renderiza a vitrine de laboratórios (bifurcação do funil)", async () => {
    const ResolvedHome = await Home();
    render(ResolvedHome);

    expect(screen.getByText(/Laboratório CFR/i)).toBeInTheDocument();
    expect(screen.getByText(/Oráculo Gemma 4/i)).toBeInTheDocument();
    expect(screen.getByText(/A Mente Coletiva/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulador Mestre/i)).toBeInTheDocument();
  });
});
