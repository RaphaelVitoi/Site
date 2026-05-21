// @ts-nocheck
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
      screen.getByRole("heading", { name: /O Edge Mudou de Lugar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Conhecer o Método/i }),
    ).toBeInTheDocument();
  });

  it("renderiza a vitrine de laboratórios (bifurcação do funil)", async () => {
    const ResolvedHome = await Home();
    render(ResolvedHome);

    expect(screen.getByText(/Teoria ICM/i)).toBeInTheDocument();
    expect(screen.getByText(/Telemetria/i)).toBeInTheDocument();
    expect(screen.getByText(/Doutrina/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulação/i)).toBeInTheDocument();
  });
});
