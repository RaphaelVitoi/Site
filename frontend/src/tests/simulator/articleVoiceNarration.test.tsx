/// <reference types="jest" />

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { ArticleVoiceNarration } from '../../components/ui/layout/ArticleVoiceNarration';

describe('ArticleVoiceNarration', () => {
	beforeEach(() => {
		const mockSpeechSynthesis = {
			speak: jest.fn((utterance) => {
				if (utterance?.onstart) utterance.onstart();
			}),
			cancel: jest.fn(),
			pause: jest.fn(),
			resume: jest.fn(),
			getVoices: jest.fn().mockReturnValue([
				{ name: 'Microsoft Francisca Online (Natural) - Portuguese (Brazil)', lang: 'pt-BR' },
			]),
			onvoiceschanged: null,
		};
		class MockUtterance {
			text: string;
			voice: unknown = null;
			lang = 'pt-BR';
			rate = 1;
			pitch = 1;
			onstart = () => {};
			onend = () => {};
			onerror = () => {};
			constructor(text: string) {
				this.text = text;
			}
		}
		Object.defineProperty(window, 'SpeechSynthesisUtterance', {
			value: MockUtterance,
			writable: true,
		});
		Object.defineProperty(window, 'speechSynthesis', {
			value: mockSpeechSynthesis,
			writable: true,
		});
		global.fetch = jest.fn().mockRejectedValue(new Error('Nexus offline'));
	});

	it('should render article narration bar with title and action button', () => {
		render(
			<ArticleVoiceNarration
				title="Teoria dos Jogos e ICM em MTTs"
				content="Neste artigo discutimos o equilíbrio de Nash e a formulação PMev."
			/>
		);

		expect(screen.getByText('Ouvir Artigo Completo')).toBeInTheDocument();
		expect(
			screen.getByText('Síntese Neural Calibrada • MTTs & Teoria dos Jogos')
		).toBeInTheDocument();
		expect(screen.getByLabelText('Ouvir artigo')).toBeInTheDocument();
	});

	it('should trigger play on button click', async () => {
		render(
			<ArticleVoiceNarration
				title="Teoria dos Jogos e ICM em MTTs"
				content="Neste artigo discutimos o equilíbrio de Nash."
			/>
		);

		const playBtn = screen.getByLabelText('Ouvir artigo');
		await act(async () => {
			fireEvent.click(playBtn);
		});

		await waitFor(() => {
			expect(screen.getByText('Transmitindo Narração')).toBeInTheDocument();
		});
	});
});
