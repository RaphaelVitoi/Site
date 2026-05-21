'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Message {
    id: string;
    role: 'user' | 'oracle';
    content: string;
    source?: 'llm' | 'context_only' | 'error';
}

const getSourceColor = ( source: string ) => {
    if ( source === 'llm' ) return 'text-magenta-400';
    if ( source === 'error' ) return 'text-red-500';
    return 'text-yellow-500';
};

export function OracleChat () {
    const [ query, setQuery ] = useState( '' );
    const [ messages, setMessages ] = useState<Message[]>( [] );
    const [ isLoading, setIsLoading ] = useState( false );
    const messagesEndRef = useRef<HTMLDivElement>( null );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
    };

    useEffect( () => {
        scrollToBottom();
    }, [ messages ] );

    const handleSubmit = async ( e: React.FormEvent ) => {
        e.preventDefault();

        const sanitizedQuery = query.trim();
        if ( !sanitizedQuery || isLoading ) return;
        if ( sanitizedQuery.length < 2 || sanitizedQuery.length > 2000 )
        {
            // Validação local espelhando o contrato Zod da rota
            return;
        }

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: sanitizedQuery };
        setMessages( ( prev ) => [ ...prev, userMsg ] );
        setQuery( '' );
        setIsLoading( true );

        try
        {
            const res = await fetch( '/api/oracle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( { question: userMsg.content } ),
            } );

            const data = await res.json();

            if ( !res.ok )
            {
                throw new Error( data.error || 'Falha ao consultar a Mente Coletiva.' );
            }

            const oracleMsg: Message = {
                id: ( Date.now() + 1 ).toString(),
                role: 'oracle',
                content: data.answer,
                source: data.source,
            };

            setMessages( ( prev ) => [ ...prev, oracleMsg ] );
        } catch ( error: any )
        {
            const errorMsg: Message = {
                id: ( Date.now() + 1 ).toString(),
                role: 'oracle',
                content: `[CORTEX SHIELD] Interceptação de Falha: ${error.message}`,
                source: 'error',
            };
            setMessages( ( prev ) => [ ...prev, errorMsg ] );
        } finally
        {
            setIsLoading( false );
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-gray-950 border border-gray-800 rounded-lg shadow-2xl overflow-hidden font-sans">
            {/* Header SOTA */ }
            <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                <h2 className="text-cyan-400 font-semibold tracking-wide uppercase text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span>Oráculo Híbrido (Mente Coletiva)</span>
                </h2>
            </div>

            {/* Messages Area */ }
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                { messages.length === 0 && (
                    <div className="text-center text-gray-500 text-sm mt-10 italic">
                        Aguardando input para sondagem na memória vetorial e Knowledge Graph...
                    </div>
                ) }
                { messages.map( ( msg ) => (
                    <div key={ msg.id } className={ `flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}` }>
                        <div className={ `max-w-[85%] rounded-lg p-4 ${msg.role === 'user' ? 'bg-cyan-900/30 border border-cyan-800/50 text-cyan-100' : 'bg-gray-900 border border-gray-700 text-gray-300'}` }>
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                { msg.content }
                            </pre>
                        </div>
                        { msg.role === 'oracle' && msg.source && (
                            <span className={ `text-[10px] mt-1 uppercase tracking-widest ${getSourceColor( msg.source )}` }>
                                Source: { msg.source }
                            </span>
                        ) }
                    </div>
                ) ) }
                { isLoading && (
                    <div className="flex items-start">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-cyan-500 text-sm animate-pulse">
                            Sintetizando contexto...
                        </div>
                    </div>
                ) }
                <div ref={ messagesEndRef } />
            </div>

            {/* Input Area */ }
            <form onSubmit={ handleSubmit } className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={ query }
                        onChange={ ( e ) => setQuery( e.target.value ) }
                        placeholder="Consulte a Mente Coletiva..."
                        className="w-full bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-md pl-4 pr-12 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
                        disabled={ isLoading }
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        disabled={ isLoading || !query.trim() }
                        className="absolute right-2 p-2 text-gray-400 hover:text-cyan-400 disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={ 2 } stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
