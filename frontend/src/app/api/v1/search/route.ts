import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const runtime = 'nodejs';

interface SearchResultItem {
	title: string;
	link: string;
	snippet: string;
}

export async function GET(request: Request) {
	const session = await auth();
	if (!session) {
		return NextResponse.json({ error: 'Acesso Negado: Sessão SOTA exigida.' }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const query = searchParams.get('q')?.trim();
	if (!query) {
		return NextResponse.json({ error: 'Parâmetro de busca ausente.' }, { status: 400 });
	}

	try {
		const targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
		const res = await fetch(targetUrl, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
				'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
			},
			cache: 'no-store',
		});

		if (!res.ok) {
			return NextResponse.json({ results: [], formatted: '' });
		}

		const html = await res.text();
		const items: SearchResultItem[] = [];

		// Parser regex leve e seguro em Node.js sem dependências pesadas
		const algoBlocks = html.split(/<li\s+class="b_algo"/i).slice(1);

		for (const block of algoBlocks.slice(0, 4)) {
			const titleMatch = block.match(/<h2[^>]*><a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/is);
			const snippetMatch =
				block.match(/<div\s+class="b_caption"[^>]*>.*?<p[^>]*>(.*?)<\/p>/is) ||
				block.match(/<p\s+class="b_lineclamp[^"]*"[^>]*>(.*?)<\/p>/is);

			if (titleMatch && titleMatch[1] && titleMatch[2]) {
				const link = titleMatch[1];
				const rawTitle = titleMatch[2].replace(/<[^>]+>/g, '').trim();
				const rawSnippet =
					snippetMatch && snippetMatch[1] ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';

				if (rawTitle && rawSnippet) {
					items.push({
						title: rawTitle,
						link,
						snippet: rawSnippet,
					});
				}
			}
		}

		let formatted = '';
		if (items.length > 0) {
			formatted = '\n\n--- INFORMAÇÕES PESQUISADAS NA WEB (TEMPO REAL) ---\n';
			items.forEach((it, idx) => {
				formatted += `[Fonte ${idx + 1}]: ${it.title}\nURL: ${it.link}\nResumo: ${it.snippet}\n\n`;
			});
			formatted += '--- FIM DAS INFORMAÇÕES DA WEB. USE ESTES DADOS PARA EMBASAR SUA RESPOSTA COM FATOS ATUAIS. ---\n';
		}

		return NextResponse.json({ results: items, formatted });
	} catch (err: unknown) {
		console.warn('[WebSearch Route] Falha ao realizar busca:', err);
		return NextResponse.json({ results: [], formatted: '' });
	}
}
