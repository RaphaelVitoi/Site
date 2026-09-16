'use client';

import { useEffect } from 'react';
import { logTelemetryEvent } from '@/lib/telemetry-client';

interface GlobalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: Readonly<GlobalErrorProps>) {
	useEffect(() => {
		try {
			logTelemetryEvent({
				category: 'error',
				componentName: 'GlobalRootErrorBoundary',
				metadata: {
					message: error.message,
					stack: error.stack,
					digest: error.digest,
				},
			});
		} catch {
			// Fallback silencioso caso a telemetria não consiga inicializar no erro fatal
		}
		console.error('[SOTA FATAL] Critical Root Layout failure:', error);
	}, [error]);

	return (
		<html lang="pt-BR">
			<body
				style={{
					backgroundColor: '#0a0d14',
					color: '#f1f5f9',
					fontFamily: 'system-ui, -apple-system, sans-serif',
					display: 'flex',
					minHeight: '100vh',
					alignItems: 'center',
					justifyContent: 'center',
					margin: 0,
					padding: '1rem',
				}}
			>
				<div
					style={{
						maxWidth: '480px',
						width: '100%',
						backgroundColor: '#161e2e',
						borderRadius: '16px',
						padding: '2rem',
						border: '1px solid rgba(244, 63, 94, 0.3)',
						textAlign: 'center',
						boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
					}}
				>
					<div
						style={{
							width: '56px',
							height: '56px',
							borderRadius: '50%',
							backgroundColor: 'rgba(244, 63, 94, 0.15)',
							color: '#f43f5e',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							margin: '0 auto 1.5rem',
							fontSize: '1.75rem',
							fontWeight: 'bold',
						}}
					>
						!
					</div>
					<h1 style={{ fontSize: '1.5rem', margin: '0 0 0.75rem', color: '#ffffff' }}>
						Falha Crítica no Kernel
					</h1>
					<p
						style={{
							fontSize: '0.875rem',
							color: '#94a3b8',
							lineHeight: 1.6,
							margin: '0 0 1.5rem',
						}}
					>
						O sistema central de renderização encontrou uma divergência irrecuperável na raiz.
					</p>
					{error.digest && (
						<p
							style={{
								fontSize: '0.75rem',
								fontFamily: 'monospace',
								color: '#64748b',
								backgroundColor: '#0f172a',
								padding: '0.5rem',
								borderRadius: '6px',
								marginBottom: '1.5rem',
							}}
						>
							Ref: {error.digest}
						</p>
					)}
					<button
						type="button"
						onClick={() => reset()}
						style={{
							backgroundColor: '#4f46e5',
							color: '#ffffff',
							border: 'none',
							borderRadius: '8px',
							padding: '0.75rem 1.5rem',
							fontSize: '0.875rem',
							fontWeight: 600,
							cursor: 'pointer',
							transition: 'background-color 0.2s',
						}}
					>
						Reiniciar Aplicação
					</button>
				</div>
			</body>
		</html>
	);
}
