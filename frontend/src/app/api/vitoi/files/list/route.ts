import { encaminharGetDeOperador } from '@/lib/server/operator-gateway';

export const runtime = 'nodejs';

export async function GET() {
	return encaminharGetDeOperador('/api/files/list', {});
}
