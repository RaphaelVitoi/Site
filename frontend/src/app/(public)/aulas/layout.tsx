import type { ReactNode } from 'react';
import { EditorialRouteEvidence } from '@/components/ui/layout/EditorialRouteEvidence';

export default function AulasLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <EditorialRouteEvidence />
    </>
  );
}
