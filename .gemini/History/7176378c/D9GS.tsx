'use client';

import React, { useState, useEffect } from 'react';
import { useAIPreferences, TextProvider, AudioProvider } from '../store/ai-preferences';

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const {
        textProvider, audioProvider, setTextProvider, setAudioProvider,
        customApiKey, customBaseUrl, customModelName,
        setCustomCredentials, clearCustomCredentials
    } = useAIPreferences();

    const [tempKey, setTempKey] = useState(customApiKey);
    const [tempUrl, setTempUrl] = useState(customBaseUrl);
    const [tempModel, setTempModel] = useState(customModelName);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    if (!isOpen || !isMounted) return null;

    const handleSave = () => {
        if (textProvider === 'byok-custom') {
            setCustomCredentials(tempUrl, tempKey, tempModel);
        }
        onClose();
    };

    const handleClear = () => {
        clearCustomCredentials();
        setTempKey('');
        setTempUrl('https://api.openai.com/v1');
        setTempModel('gpt-4o');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)] p-8 relative animate-fade-up">
                <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                    ✕
                </button>

                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 tracking-tight">
                    <span className="text-indigo-400">⚙️</span> Motor Agnóstico Neural
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Motor de Raciocínio (LLM)</label>
                        <select
                            value={textProvider}
                            onChange={(e) => setTextProvider(e.target.value as TextProvider)}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        >
                            <option value="openrouter-free">Llama 3 / Mistral (Nuvem Gratuita)</option>
                            <option value="ollama-local">Ollama (Offline / Servidor Local)</option>
                            <option value="pokerracional-cloud">Gemini Flash (Padrão PokerRacional)</option>
                            <option value="byok-custom">Modo Avançado (Traga a Sua Própria Chave)</option>
                        </select>
                    </div>

                    {textProvider === 'byok-custom' && (
                        <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800 space-y-4">
                            <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg flex items-start gap-3">
                                <span className="text-emerald-400 mt-0.5">🔒</span>
                                <p className="text-[13px] text-emerald-100/70 leading-relaxed">
                                    <strong className="text-emerald-400 block mb-1 font-bold">Soberania de Dados Garantida</strong>
                                    A sua chave é encriptada no navegador (Local Storage). Ela nunca toca na nossa base de dados.
                                </p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">API Endpoint (Padrão OpenAI)</label>
                                <input type="text" value={tempUrl} onChange={e => setTempUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 font-mono focus:border-indigo-500 outline-none" placeholder="https://api.openai.com/v1" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome do Modelo</label>
                                <input type="text" value={tempModel} onChange={e => setTempModel(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 font-mono focus:border-indigo-500 outline-none" placeholder="gpt-4o" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">API Key (Secreta)</label>
                                <input type="password" value={tempKey} onChange={e => setTempKey(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 font-mono focus:border-indigo-500 outline-none" placeholder="sk-..." />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button onClick={handleClear} className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5">
                                    <span className="text-rose-500">⚠</span> Purgar Credenciais (Logout)
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all">
                        Guardar Matriz
                    </button>
                </div>
            </div>
        </div>
    );
}