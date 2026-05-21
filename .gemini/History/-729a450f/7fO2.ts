import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TextProvider = 'openrouter-free' | 'ollama-local' | 'pokerracional-cloud' | 'byok-custom';
export type AudioProvider = 'browser-native' | 'gemini-tts';

interface AIPreferencesState {
    textProvider: TextProvider;
    audioProvider: AudioProvider;
    customApiKey: string;
    customBaseUrl: string;
    customModelName: string;
    setTextProvider: (provider: TextProvider) => void;
    setAudioProvider: (provider: AudioProvider) => void;
    setCustomCredentials: (url: string, key: string, model: string) => void;
    clearCustomCredentials: () => void;
}

export const useAIPreferences = create<AIPreferencesState>()(
    persist(
        (set) => ({
            textProvider: 'pokerracional-cloud',
            audioProvider: 'browser-native',
            customApiKey: '',
            customBaseUrl: 'https://api.openai.com/v1',
            customModelName: 'gpt-4o',

            setTextProvider: (provider) => set({ textProvider: provider }),
            setAudioProvider: (provider) => set({ audioProvider: provider }),

            setCustomCredentials: (url, key, model) => set({
                customBaseUrl: url, customApiKey: key, customModelName: model
            }),
            clearCustomCredentials: () => set({
                customApiKey: '', customBaseUrl: 'https://api.openai.com/v1', customModelName: 'gpt-4o'
            }),
        }),
        {
            name: 'pr-neural-vault',
            storage: createJSONStorage(() => localStorage),
        }
    )
);