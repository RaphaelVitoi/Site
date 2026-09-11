import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function TemploRootPage() {
	redirect(ROUTES.TEMPLO.ANALYTICS);
}
