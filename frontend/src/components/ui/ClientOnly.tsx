"use client";

import { ReactNode } from "react";
import { useMounted } from "../../hooks/useMounted";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * SOTA Boundary Override: Obliga a renderizacao exclusiva no cliente (CSR).
 * Use para envelopar canvas 3D, leituras de localStorage, ou graficos complexos.
 */
export function ClientOnly({ children, fallback = null }: Readonly<ClientOnlyProps>) {
  const isMounted = useMounted();

  // Renderiza o fallback (esqueleto HTML) durante o SSR para garantir simetria,
  // substituindo pelos filhos reais assim que o browser assumir o controle.
  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
