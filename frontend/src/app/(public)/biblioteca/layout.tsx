import type { ReactNode } from 'react';
import { EditorialRouteEvidence } from '@/components/ui/layout/EditorialRouteEvidence';

export default function BibliotecaLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <EditorialRouteEvidence />
    </>
  );
}
