/// <reference types="jest" />

import '@testing-library/jest-dom';
import { renderHook, act } from '@testing-library/react';
import { useSotaSpeech } from '../../components/simulator/hooks/useSotaSpeech';

describe('useSotaSpeech Hook (Voice Nexus & Lexicon SOTA)', () => {
	beforeEach(() => {
		const mockSpeechSynthesis = {
			speak: jest.fn(),
			cancel: jest.fn(),
			pause: jest.fn(),
			resume: jest.fn(),
			speaking: false,
			getVoices: jest.fn().mockReturnValue([
				{ name: 'Google português do Brasil', lang: 'pt-BR' },
				{ name: 'Microsoft Francisca Online', lang: 'pt-BR' },
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

	it('should initialize with default states and available voices', () => {
		const { result } = renderHook(() => useSotaSpeech());
		expect(result.current.isPlaying).toBe(false);
		expect(result.current.isPaused).toBe(false);
		expect(result.current.rate).toBe(1.25);
		expect(result.current.audioSource).toBe('sapi');
	});

	it('should cycle rate through predefined speeds', () => {
		const { result } = renderHook(() => useSotaSpeech());
		expect(result.current.rate).toBe(1.25);

		act(() => {
			result.current.cycleRate();
		});
		expect(result.current.rate).toBe(1.5);

		act(() => {
			result.current.cycleRate();
		});
		expect(result.current.rate).toBe(1.75);
	});

	it('should clean and trigger speech synthesis for poker terminology without crashing', async () => {
		const { result } = renderHook(() => useSotaSpeech());

		await act(async () => {
			result.current.toggle('msg-1', 'Vilão aplicou c-bet no flop e temos ICM desfavorável com chipEV positivo.');
			await Promise.resolve();
		});

		expect(result.current.activeMessageId).toBe('msg-1');
		expect(window.speechSynthesis.cancel).toHaveBeenCalled();
	});

	it('should stop playback and reset state', async () => {
		const { result } = renderHook(() => useSotaSpeech());

		await act(async () => {
			result.current.toggle('msg-1', 'Texto para reprodução.');
			await Promise.resolve();
		});

		act(() => {
			result.current.stop();
		});

		expect(result.current.isPlaying).toBe(false);
		expect(result.current.activeMessageId).toBeNull();
		expect(window.speechSynthesis.cancel).toHaveBeenCalled();
	});
});
