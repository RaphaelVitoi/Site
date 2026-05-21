"use client";

import { createContext, ReactNode, useState } from "react";

export interface SotaMetricsState {
  predictiveProfile: Record<string, number> | null;
  predictiveTelemetry: any[] | null;
}

export const SotaMetricsContext = createContext<SotaMetricsState>({
  predictiveProfile: null,
  predictiveTelemetry: null,
});

export function SotaProvider({ children }: { children: ReactNode }) {
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
