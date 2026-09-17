/**
 * FE-08 (auditoria 2026-09-17): o reconhecimento de fala não pode sobreviver à página.
 */
import { act, render } from '@testing-library/react';

jest.mock('@/components/simulator/hooks/useSotaSync', () => ({
	useSotaSync: () => ({ physics: {}, isHydrated: false }),
}));
const generateAnalysis = jest.fn();
jest.mock('@/components/simulator/useGemmaStream', () => ({
	useGemmaStream: () => ({ streamedText: '', isStreaming: false, error: null, telemetry: {}, generateAnalysis }),
}));
jest.mock('@/components/simulator/hooks/useSotaSpeech', () => ({ useSotaSpeech: () => ({}) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null, status: 'unauthenticated' }) }));
jest.mock('@/components/ui/layout/SotaMarkdown', () => ({ SotaMarkdown: () => null }));
jest.mock('@/components/ui/layout/ContentPageHeader', () => ({ ContentPageHeader: () => null }));

import GemmaPortal from '@/app/(lab)/templo/gemma/page';

class ReconhecimentoFalso {
	static instancias: ReconhecimentoFalso[] = [];
	continuous = false;
	interimResults = false;
	lang = '';
	onstart: () => void = () => {};
	onend: () => void = () => {};
	onresult: (e: unknown) => void = () => {};
	onerror: (e: unknown) => void = () => {};
	start = jest.fn();
	stop = jest.fn();
	constructor() {
		ReconhecimentoFalso.instancias.push(this);
	}
}

describe('ditado do Oráculo Gemma (FE-08)', () => {
	beforeEach(() => {
		ReconhecimentoFalso.instancias = [];
		(window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = ReconhecimentoFalso;
		global.fetch = jest.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
	});

	it('ao sair da página, para o microfone e não reinicia no onend', async () => {
		const { unmount } = render(<GemmaPortal />);
		const rec = ReconhecimentoFalso.instancias.at(-1)!;
		expect(rec).toBeDefined();

		act(() => rec.onstart()); // microfone ativo: isListeningRef = true
		const onendDuranteEscuta = rec.onend;

		unmount();

		expect(rec.stop).toHaveBeenCalled();
		// O handler antigo reiniciava enquanto a escuta estava marcada; o de agora não reinicia nada.
		rec.onend();
		expect(rec.start).not.toHaveBeenCalled();
		expect(rec.onend).not.toBe(onendDuranteEscuta);
	});
});
