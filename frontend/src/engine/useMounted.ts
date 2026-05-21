"use client";

import { useState, useEffect } from "react";

/**
 * SOTA Mount Guard: Previne Hydration Mismatches garantindo que o
 * estado do componente só seja processado após a montagem no cliente.
 */
export function useMounted(): boolean {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
