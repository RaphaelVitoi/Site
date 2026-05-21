import RiskGeometryMasterclass from '@/components/icm/RiskGeometryMasterclass';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'A Geometria do Risco | Masterclass Elite',
    description: 'Motor de Inferência Ativo e Masterclass de Teoria dos Jogos.',
};

export default function MasterclassPage() {
    return <RiskGeometryMasterclass />;
}