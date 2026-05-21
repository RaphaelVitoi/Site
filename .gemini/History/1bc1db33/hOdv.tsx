"use client";

import { createContext, useState, type ReactNode } from "react";

export interface SotaMetricsState {
  predictiveProfile: Record<string, number> | null;
  predictiveTelemetry: any[] | null;
}

export const SotaMetricsContext = createContext<SotaMetricsState>({
  predictiveProfile: null,
  predictiveTelemetry: null,
});

export function SotaProvider({ children }: { readonly children: ReactNode }) {
  const [state] = useState<SotaMetricsState>({
    predictiveProfile: null,
    predictiveTelemetry: null,
  });

  return (
    <SotaMetricsContext.Provider value={state}>
      {children}
    </SotaMetricsContext.Provider>
  );
}
