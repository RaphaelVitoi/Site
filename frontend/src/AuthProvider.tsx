'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
	return <SessionProvider>{children}</SessionProvider>;
}
