import { useCallback, useEffect, useRef, type RefObject } from 'react';

/**
 * Diz se um laço de animação deve rodar agora: aba visível e elemento na tela.
 *
 * Os laços de CFR rodavam sem fim, inclusive numa página de artigo com o widget fora da tela (SIM-06, auditoria do
 * simulador de 2026-09-17: 219 mensagens ao worker em 10 s com a página parada). O valor mora num ref, não em estado,
 * para que o laço consulte sem renderizar de novo.
 *
 * Devolve um callback ref, não um RefObject. A primeira versão recebia um RefObject e observava no efeito de montagem;
 * o GtoCfrSimulator monta um placeholder antes de hidratar, o ref ainda era nulo, e o observador nunca era criado.
 * Medido no Chrome: 86 pedidos ao worker em 4 s com o painel fora da tela. O callback ref observa quando o elemento
 * de fato entra no DOM.
 *
 * Sem IntersectionObserver (jsdom, navegador antigo), considera o elemento na tela: pausar por falta de API
 * esconderia o widget sem motivo.
 */
export function useLoopVisibility(): [(elemento: Element | null) => void, RefObject<boolean>] {
	const ativo = useRef(true);
	const naTela = useRef(true);
	const observador = useRef<IntersectionObserver | null>(null);

	const atualizar = useCallback(() => {
		ativo.current = naTela.current && document.visibilityState !== 'hidden';
	}, []);

	const definirAlvo = useCallback(
		(elemento: Element | null) => {
			observador.current?.disconnect();
			observador.current = null;
			naTela.current = true;
			if (elemento && typeof IntersectionObserver !== 'undefined') {
				observador.current = new IntersectionObserver((entradas) => {
					naTela.current = entradas.some((e) => e.isIntersecting);
					atualizar();
				});
				observador.current.observe(elemento);
			}
			atualizar();
		},
		[atualizar],
	);

	useEffect(() => {
		document.addEventListener('visibilitychange', atualizar);
		atualizar();
		return () => {
			document.removeEventListener('visibilitychange', atualizar);
			observador.current?.disconnect();
		};
	}, [atualizar]);

	return [definirAlvo, ativo];
}
