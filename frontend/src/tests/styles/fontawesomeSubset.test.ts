/**
 * @jest-environment node
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * Guarda do subconjunto do Font Awesome (scripts/fontawesome-subset.py).
 *
 * O layout importa só os ícones listados no manifesto. Um ícone novo citado no código sem rodar o
 * gerador renderizaria vazio, sem erro nenhum — e um ícone do Font Awesome Pro também, que foi o caso
 * de fa-radar, fa-grid-2 e fa-brain-circuit até 2026-09-17. Esta guarda transforma os dois em falha.
 */
const FRONTEND = path.resolve(__dirname, '..', '..', '..');
const SRC = path.join(FRONTEND, 'src');
const SUBSET = path.join(SRC, 'styles', 'fontawesome');
const FA_CSS = path.join(FRONTEND, '..', 'node_modules', '@fortawesome', 'fontawesome-free', 'css');

// Mesma regra de extração do gerador.
const EXTENSOES = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx']);
const IGNORAR_DIRS = new Set(['coverage', 'tests', 'interativo', 'fontawesome']);
const TOKEN = /(?<![\w-])fa-([a-z0-9]+(?:-[a-z0-9]+)*)/g;
const BLOCO_ICONE = /^\.fa-([a-z0-9-]+) \{\n {2}--fa: "(?:\\.|[^"\\])+";\n\}\n/gm;

function tokensUsados(): Set<string> {
	const usados = new Set<string>();
	const visitar = (dir: string) => {
		for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
			const caminho = path.join(dir, entrada.name);
			if (entrada.isDirectory()) {
				if (!IGNORAR_DIRS.has(entrada.name)) visitar(caminho);
			} else if (EXTENSOES.has(path.extname(entrada.name)) && !entrada.name.includes('.test.')) {
				for (const m of fs.readFileSync(caminho, 'utf8').matchAll(TOKEN)) usados.add(m[1] as string);
			}
		}
	};
	visitar(SRC);
	return usados;
}

function lerCss(nome: string): string {
	return fs.readFileSync(path.join(FA_CSS, `${nome}.css`), 'utf8').replace(/\r\n/g, '\n');
}

describe('subconjunto do Font Awesome', () => {
	const manifesto = JSON.parse(fs.readFileSync(path.join(SUBSET, 'manifest.json'), 'utf8')) as {
		icones: string[];
		marcas: string[];
	};
	const nucleo = lerCss('fontawesome');
	const marcas = lerCss('brands');
	const icones = new Set([...nucleo.matchAll(BLOCO_ICONE), ...marcas.matchAll(BLOCO_ICONE)].map((m) => m[1] as string));
	const naoIcones = new Set(
		[...(nucleo + marcas).replace(BLOCO_ICONE, '').matchAll(/\.fa-([a-z0-9-]+)/g)].map((m) => m[1] as string),
	);
	const usados = tokensUsados();

	it('todo token fa- citado existe no Font Awesome Free', () => {
		const inexistentes = [...usados].filter((t) => !icones.has(t) && !naoIcones.has(t)).sort();
		expect(inexistentes).toEqual([]);
	});

	it('o manifesto cobre exatamente os ícones citados -- divergindo, rode scripts/fontawesome-subset.py', () => {
		const citados = [...usados].filter((t) => icones.has(t)).sort();
		expect([...manifesto.icones, ...manifesto.marcas].sort()).toEqual(citados);
	});

	it('o CSS gerado declara cada ícone do manifesto e aponta para as fontes locais', () => {
		const css = fs.readFileSync(path.join(SUBSET, 'fontawesome-subset.css'), 'utf8');
		for (const nome of [...manifesto.icones, ...manifesto.marcas]) expect(css).toContain(`.fa-${nome} {`);
		expect(css).not.toContain('../webfonts/');
		for (const fonte of ['fa-solid-900', 'fa-regular-400', 'fa-brands-400']) {
			expect(css).toContain(`url("./${fonte}.woff2")`);
			expect(fs.existsSync(path.join(SUBSET, `${fonte}.woff2`))).toBe(true);
		}
	});
});
