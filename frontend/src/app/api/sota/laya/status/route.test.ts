/** @jest-environment node */
import { GET } from './route';

describe('API SOTA Laya Status: verificação de integridade dos pesos', () => {
	it('retorna resposta estruturada de status com campos obrigatórios', async () => {
		const response = await GET();
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.status).toMatch(/ONLINE|OFFLINE/);
		expect(typeof json.weights_loaded).toBe('boolean');
		expect(json.model).toBe('multilingual');
		expect(json.canonical_repo).toBe('convaiinnovations/laya-multilingual');
	});
});
