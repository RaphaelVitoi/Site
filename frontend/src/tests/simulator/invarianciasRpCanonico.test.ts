/**
 * @jest-environment node
 *
 * IDENTITY: Invariâncias Canônicas do Risk Premium (I1 a I7)
 * PATH: frontend/src/tests/simulator/invarianciasRpCanonico.test.ts
 * ROLE: Travar matematicamente as invariâncias I3, I4, I6 e I7 sob a grandeza canônica:
 *       RP(bf, a) = a * (bf - 1) / (a * bf + 1 - a) * 100
 */

import { premioDeRiscoCanonico } from '@/lib/perspectiva';
import * as fs from 'fs';
import * as path from 'path';

describe('Invariâncias Canônicas do Risk Premium', () => {
	// I3: Redução exata em a = 0.5 para (BF - 1) / (BF + 1)
	describe('I3: Redução em all-in even money (a = 0.5)', () => {
		const bfs = [0.2, 0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 3.0, 5.0, 10.0];

		it.each(bfs)('para bf = %f e a = 0.5, coincide exatamente com (bf-1)/(bf+1)', (bf) => {
			const canonico = premioDeRiscoCanonico(bf, 0.5);
			const grandezaA = ((bf - 1) / (bf + 1)) * 100;
			expect(canonico).toBeCloseTo(grandezaA, 10);
		});
	});

	// I4: Teorema 2 preservado: BF < 1 <=> RP < 0
	describe('I4: Teorema 2 (Sinal do Risk Premium)', () => {
		it('bf < 1 produz RP estritamente negativo para qualquer pot odds a > 0', () => {
			const as = [0.1, 0.25, 0.33, 0.5, 0.67, 0.9];
			const bf = 0.8;
			for (const a of as) {
				const rp = premioDeRiscoCanonico(bf, a);
				expect(rp).toBeLessThan(0);
			}
		});

		it('bf = 1 produz RP exatamente zero para qualquer pot odds a > 0', () => {
			const as = [0.1, 0.33, 0.5, 0.75];
			for (const a of as) {
				expect(premioDeRiscoCanonico(1, a)).toBeCloseTo(0, 12);
			}
		});

		it('bf > 1 produz RP estritamente positivo para qualquer pot odds a > 0', () => {
			const as = [0.1, 0.33, 0.5, 0.75];
			const bf = 1.35;
			for (const a of as) {
				expect(premioDeRiscoCanonico(bf, a)).toBeGreaterThan(0);
			}
		});
	});

	// I6: Monotonicidade estrita em BF
	describe('I6: Monotonicidade em BF com pot odds fixas', () => {
		it('RP é estritamente crescente com BF', () => {
			const a = 0.33;
			const bfs = [0.6, 0.8, 1.0, 1.2, 1.5, 2.0, 3.0, 4.0];
			for (let i = 0; i < bfs.length - 1; i++) {
				const rpAtual = premioDeRiscoCanonico(bfs[i]!, a);
				const rpProximo = premioDeRiscoCanonico(bfs[i + 1]!, a);
				expect(rpProximo).toBeGreaterThan(rpAtual);
			}
		});
	});

	// I7: Fonte única de cálculo no frontend
	describe('I7: Fonte Única (proibição de expressões literais dispersas)', () => {
		it('não existem re-implementações manuais de (bf - 1) / bf fora de arquivos de teste/documentação', () => {
			const libDir = path.resolve(__dirname, '../../lib');
			const files = fs.readdirSync(libDir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
			const forbidden = [/\(bf\s*-\s*1\)\s*\/\s*bf/i, /\(bf\s*-\s*1\.0\)\s*\/\s*bf/i];

			for (const file of files) {
				const content = fs.readFileSync(path.join(libDir, file), 'utf-8');
				// Remove comentários para avaliar apenas código executável
				const codeOnly = content
					.replace(/\/\*[\s\S]*?\*\//g, '')
					.replace(/\/\/.*$/gm, '');

				for (const re of forbidden) {
					expect(codeOnly).not.toMatch(re);
				}
			}
		});
	});
});
