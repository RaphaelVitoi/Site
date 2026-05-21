import DashboardSOTA from '@/components/simulator/DashboardSOTA';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Radar SOTA | Telemetria Avançada',
  description: 'Métricas preditivas, CFR vs Cognição e matriz de insolvência quântica em tempo real.',
};

export default function DashboardPage() {
  return <DashboardSOTA />;
}
