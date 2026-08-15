/// <reference types="jest" />

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GeminiVoicePlayer } from '../../components/simulator/ui/GeminiVoicePlayer';

describe('GeminiVoicePlayer (SOTA v7.0 GOLD)', () => {
	beforeEach(() => {
		// Mock SpeechSynthesis
		const mockSpeechSynthesis = {
			speak: jest.fn(),
			cancel: jest.fn(),
			pause: jest.fn(),
			resume: jest.fn(),
			getVoices: jest.fn().mockReturnValue([
				{ name: 'Microsoft Francisca Online (Natural) - Portuguese (Brazil)', lang: 'pt-BR' },
				{ name: 'Google português do Brasil', lang: 'pt-BR' },
			]),
			onvoiceschanged: null,
		};
		Object.defineProperty(window, 'speechSynthesis', {
			value: mockSpeechSynthesis,
			writable: true,
		});
	});

	it('should render the Gemini Voice Player with Portuguese (Brazil) neural setup', () => {
		render(
			<GeminiVoicePlayer
				title="Assistente de Voz SOTA"
				defaultText="Mensagem de teste de áudio."
			/>
		);

		expect(screen.getByText('Assistente de Voz SOTA')).toBeInTheDocument();
		expect(screen.getByText('Voz Neural PT-BR Feminina • Síntese em Tempo Real')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Mensagem de teste de áudio.')).toBeInTheDocument();
		expect(screen.getByText('Ouvir Insight')).toBeInTheDocument();
	});
});
