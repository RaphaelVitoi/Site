import type { ReactNode } from 'react';
import { SotaHubNavbar } from '@/components/simulator/SotaHubNavbar';

export default function VoceAprendeLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<section className="voce-aprende-root min-h-screen bg-bg-base text-text-main">
			<SotaHubNavbar />
			{children}
		</section>
	);
}
