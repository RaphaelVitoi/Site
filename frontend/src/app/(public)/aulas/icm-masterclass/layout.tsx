import type { ReactNode } from 'react';
import { SotaHubNavbar } from '@/components/simulator/SotaHubNavbar';

export default function IcmMasterclassLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<section className="icm-masterclass-root min-h-screen bg-bg-base text-text-main">
			<SotaHubNavbar />
			{children}
		</section>
	);
}
