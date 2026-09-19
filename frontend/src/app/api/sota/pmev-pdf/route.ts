import { NextResponse } from 'next/server';
import { escapePdfText, linhasDoCenario, validarParametrosDoTratado } from '@/lib/server/pmev-pdf-params';

/**
 * IDENTITY: SOTA PMev Multi-Page Pedagogical Treatise & Technical Report PDF Export API
 * PATH: src/app/api/sota/pmev-pdf/route.ts
 * ROLE: Gera e transmite arquivo binario PDF 1.4 multi-pagina contendo a fundamentacao
 *       teorica, conceitual, matematica e comparativa PMev 3.2 vs HRC Pro para estudantes.
 */

function generateMultiPagePdf(pagesData: string[][], docTitle: string): Uint8Array {
	const numPages = pagesData.length;
	const parts: Uint8Array[] = [];
	const offsets: Record<number, number> = {};
	let currentLen = 0;

	const append = (str: string) => {
		const b = new TextEncoder().encode(str);
		parts.push(b);
		currentLen += b.length;
	};

	const appendBytes = (b: Uint8Array) => {
		parts.push(b);
		currentLen += b.length;
	};

	const recordObj = (objId: number) => {
		offsets[objId] = currentLen;
		append(`${objId} 0 obj\n`);
	};

	const closeObj = () => {
		append('endobj\n');
	};

	append('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');

	const fontF1Id = 3 + 2 * numPages;
	const fontF2Id = fontF1Id + 1;
	const fontF3Id = fontF1Id + 2;
	const fontF4Id = fontF1Id + 3;
	const totalObjects = fontF4Id;

	// 1: Catalog
	recordObj(1);
	append('<< /Type /Catalog /Pages 2 0 R >>\n');
	closeObj();

	// 2: Pages
	const kidsStr = Array.from({ length: numPages }, (_, i) => `${3 + i} 0 R`).join(' ');
	recordObj(2);
	append(`<< /Type /Pages /Kids [${kidsStr}] /Count ${numPages} >>\n`);
	closeObj();

	// Page objects
	for (let i = 0; i < numPages; i++) {
		const pageId = 3 + i;
		const streamId = 3 + numPages + i;
		recordObj(pageId);
		append(
			`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents ${streamId} 0 R /Resources << /Font << /F1 ${fontF1Id} 0 R /F2 ${fontF2Id} 0 R /F3 ${fontF3Id} 0 R /F4 ${fontF4Id} 0 R >> >> >>\n`
		);
		closeObj();
	}

	// Content Streams for each page
	for (let i = 0; i < numPages; i++) {
		const streamId = 3 + numPages + i;
		const pageLines = pagesData[i] || [];
		const contentStream: string[] = [];

		// Dark obsidian theme background, Header Box, Title, and Footer
		contentStream.push(
			'q',
			'0.05 0.07 0.10 rg 0 0 595.28 841.89 re f',
			'0.08 0.11 0.16 rg 30 740 535.28 72 re f',
			'0.85 0.55 0.10 RG 1.5 w 30 740 535.28 72 re S',
			`BT /F2 13 Tf 1.0 1.0 1.0 rg 45 783 Td (${docTitle}) Tj ET`,
			'BT /F1 9 Tf 0.65 0.75 0.85 rg 45 766 Td (POKER RACIONAL - NEXUS SOTA v8.0 GOLD | AUTOR: RAPHAEL VITOI) Tj ET',
			`BT /F1 8 Tf 0.85 0.55 0.10 rg 45 750 Td (PARTE ${i + 1} DE ${numPages} | GUIA DIDATICO E TRATADO MATEMATICO PARA ESTUDANTES) Tj ET`,
			`BT /F1 8 Tf 0.45 0.55 0.65 rg 220 25 Td (Pagina ${i + 1} de ${numPages} - Poker Racional SOTA v8.0 GOLD) Tj ET`
		);

		let y = 710;
		for (const rawLine of pageLines) {
			const line = escapePdfText(rawLine);
			if (line.startsWith('# ')) {
				y -= 22;
				contentStream.push(
					`0.12 0.16 0.22 rg 30 ${y - 4} 535.28 17 re f`,
					`BT /F2 9.5 Tf 0.95 0.65 0.15 rg 38 ${y} Td (${line.slice(2)}) Tj ET`
				);
				y -= 6;
			} else if (line.startsWith('## ')) {
				y -= 16;
				contentStream.push(`BT /F2 9 Tf 0.40 0.80 1.0 rg 38 ${y} Td (${line.slice(3)}) Tj ET`);
			} else if (line.startsWith('   * ') || line.startsWith(' - ') || line.startsWith('   - ')) {
				y -= 13;
				contentStream.push(`BT /F1 8.5 Tf 0.85 0.90 0.95 rg 45 ${y} Td (${line}) Tj ET`);
			} else if (line.startsWith('     [FORMULA] ')) {
				y -= 15;
				contentStream.push(
					`0.07 0.12 0.18 rg 45 ${y - 3} 505.28 15 re f`,
					`0.20 0.45 0.70 RG 0.5 w 45 ${y - 3} 505.28 15 re S`,
					`BT /F3 8 Tf 0.60 0.95 0.70 rg 52 ${y} Td (${line.slice(15).trim()}) Tj ET`
				);
				y -= 4;
			} else if (line.startsWith('     ')) {
				y -= 11;
				contentStream.push(`BT /F3 8 Tf 0.70 0.95 0.75 rg 52 ${y} Td (${line.trim()}) Tj ET`);
			} else {
				y -= 12;
				contentStream.push(`BT /F1 8.5 Tf 0.80 0.85 0.90 rg 38 ${y} Td (${line}) Tj ET`);
			}
		}

		contentStream.push('Q');
		const streamBytes = new TextEncoder().encode(contentStream.join('\n'));

		recordObj(streamId);
		append(`<< /Length ${streamBytes.length} >>\nstream\n`);
		appendBytes(streamBytes);
		append('\nendstream\n');
		closeObj();
	}

	// Font Objects
	const fonts = [
		[fontF1Id, 'Helvetica'],
		[fontF2Id, 'Helvetica-Bold'],
		[fontF3Id, 'Courier-Bold'],
		[fontF4Id, 'Times-Italic'],
	] as const;

	for (const [fid, fname] of fonts) {
		recordObj(fid);
		append(`<< /Type /Font /Subtype /Type1 /BaseFont /${fname} >>\n`);
		closeObj();
	}

	// Xref
	const xrefOffset = currentLen;
	append(`xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`);
	for (let oid = 1; oid <= totalObjects; oid++) {
		const off = offsets[oid] ?? 0;
		append(`${off.toString().padStart(10, '0')} 00000 n \n`);
	}

	append(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

	const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
	const merged = new Uint8Array(totalLength);
	let ptr = 0;
	for (const p of parts) {
		merged.set(p, ptr);
		ptr += p.length;
	}
	return merged;
}

export async function POST(req: Request) {
	try {
		const body: unknown = await req.json().catch(() => ({}));
		const params = validarParametrosDoTratado(body);
		if (!params) {
			return NextResponse.json(
				{ error: 'Parametros invalidos: numeros finitos na faixa e ate 169 maos canonicas (ex.: AKs, 72o, 55).' },
				{ status: 400 },
			);
		}
		const page1 = [
			'# 1. FUNDAMENTACAO CONCEITUAL: O QUE E O ICM CLASSICO?',
			'O Independent Chip Model - ICM - revolucionou a teoria dos torneios ao demonstrar que o valor',
			'financeiro real das fichas $EV nao e linear. Ganhar fichas agrega menos valor marginal do que',
			'perder a mesma quantidade custa em probabilidade de eliminacao.',
			'No entanto, o ICM classico possui uma fragilidade estrutural grave: ele e um modelo ESTATICO.',
			'O ICM calcula as equidades como se o torneio terminasse imediatamente apos o desfecho da mao atual,',
			'ignorando a passagem do tempo, a subida dos blinds e a sangria inevitavel de fichas na orbita.',
			'',
			'# 2. O QUE E A PERSPECTIVA MATEMATICA - PMEV 3.2?',
			'Criada por Raphael Vitoi, a Perspectiva Matematica PMev e a evolucao diacronica do ICM.',
			'Ela unifica a Teoria dos Jogos GTO, a Psicologia Economica Prospect Theory de Kahneman e a',
			'Fisica de Orbitas para responder a pergunta que o ICM classico falha em antecipar:',
			'Qual e o custo real de foldar esta mao quando os blinds vao subir em 3 minutos?',
			'',
			'# 3. O PARADOXO DO FALSO CONSERVADORISMO EXPLICADO',
			'Estudantes frequentemente acreditam que foldar maos de borda na bolha e uma atitude segura.',
			'O PMev prova matematicamente que em stacks curtos e medios, o over-fold passivo e suicidio.',
			'Ao dar fold, o jogador aceita uma sangria garantida de EV_fold negativo decorrente da orbita.',
			'Com 18.5 BB no SB, foldar significa queimar 0.5 BB agora e 1.5 BB na rodada seguinte,',
			'degradando um stack competitivo de 18.5 BB para uma condicao terminal de 16.5 BB em 4 maos.'
		];

		const page2 = [
			'# 4. FORMALISMO MATEMATICO E AXIOMAS DO MOTOR PMEV',
			'O motor PMev substitui hipoteses estaticas por 4 formulacoes axiomativas dinamicamente calibradas:',
			'',
			'## Axioma 1: Custo Dinamico de Sobrevivencia - EV_fold',
			'     [FORMULA] EV_fold = - [ Antes + Blinds / N ] * [ 1 + gamma / t_blind + 1 ] * Phi_pos',
			'   * t_blind: minutos restantes ate a subida do nivel de blind.',
			'   * Phi_pos: multiplicador de pressao posicional UTG = 1.4, BTN = 0.8, SB = 1.2.',
			'',
			'## Axioma 2: Utilidade Prospectiva Assimetrica de Kahneman & Tversky',
			'     [FORMULA] U_x = x^0.88 para vitoria; -2.25 * |-x|^0.88 para derrota',
			'   * O coeficiente lambda = 2.25 modela matematicamente a aversao a perda do oponente e do Hero.',
			'',
			'## Axioma 3: Passivo Estrutural Multiway N^2',
			'     [FORMULA] L_structural = N_opponents^2 * Base_RIO',
			'',
			'## Axioma 4: Equacao Mestra da Perspectiva Matematica',
			'     [FORMULA] PMev = Eq_eff * U_win + 1 - Eq_eff * U_loss - EV_fold - L_struct + E_eff',
			'   * Veredito: PUSH se PMev > 0, CALL se PMev >= 0, FOLD se PMev < 0.'
		];

		const page3 = [
			...linhasDoCenario(params),
			'',
			'# 8. CONCLUSAO PEDAGOGICA SOTA GOLD',
			'O Operador Soberano nao joga para evitar perder fichas; joga para maximizar a sobrevivencia ativa.',
			'A Perspectiva Matematica transforma a passividade estatica do ICM em alavancagem de primeiro lugar.'
		];

		const pdfBytes = generateMultiPagePdf([page1, page2, page3], 'TRATADO DIDATICO: PERSPECTIVA MATEMATICA (PMEV 3.2) VS. HRC PRO');
		const buffer = Buffer.from(pdfBytes);

		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'attachment; filename="tratado_didatico_pmev_hrc_sota.pdf"',
				'Content-Length': buffer.length.toString(),
			},
		});
	} catch (error) {
		console.error('[pmev-pdf] Falha na geracao do PDF', error);
		return NextResponse.json({ error: 'Falha na geracao do PDF' }, { status: 500 });
	}
}
