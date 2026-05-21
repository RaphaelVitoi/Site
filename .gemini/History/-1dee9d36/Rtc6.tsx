'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  // SOTA: O SessionProvider permite que você use o hook useSession()
  // em qualquer Client Component (como o MasterSimulator ou Dashboard)
  return <SessionProvider>{children}</SessionProvider>;
}
