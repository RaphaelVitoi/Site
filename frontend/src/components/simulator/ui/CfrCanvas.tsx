'use client';

/**
 * IDENTITY: CfrCanvas (WebGPU Render Bridge)
 * PATH: src/components/simulator/ui/CfrCanvas.tsx
 * ROLE: Renderizador ultrarrápido SOTA. Consome a matriz de regret (Zero-Copy) e injeta direto no pipeline WebGPU.
 * PRINCIPLE: Fricção Zero (Main Thread liberada, renderização de pixels delegada à GPU via Fragment Shader).
 */

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// SOTA FIX: Selando a tipagem WebGPU para o TypeScript (Ambientes sem @types/webgpu global)
declare const GPUBufferUsage: {
	readonly MAP_READ: 0x0001;
	readonly MAP_WRITE: 0x0002;
	readonly COPY_SRC: 0x0004;
	readonly COPY_DST: 0x0008;
	readonly INDEX: 0x0010;
	readonly VERTEX: 0x0020;
	readonly UNIFORM: 0x0040;
	readonly STORAGE: 0x0080;
};

const WGSL_SHADER = `
struct Uniforms {
  nodes: f32,
};
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> matrix: array<f32>;

struct VertexOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

// SOTA: Renderização de um Quad fullscreen sem necessidade de Vertex Buffers
@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  var pos = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
    vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0)
  );
  var uv = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 1.0), vec2<f32>(1.0, 1.0), vec2<f32>(0.0, 0.0),
    vec2<f32>(0.0, 0.0), vec2<f32>(1.0, 1.0), vec2<f32>(1.0, 0.0)
  );
  var out: VertexOut;
  out.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
  out.uv = uv[vertexIndex];
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4<f32> {
  // Extração O(1) do índice vetorial baseada na coordenada UV e grid
  let x = u32(in.uv.x * uniforms.nodes);
  let y = u32(in.uv.y * uniforms.nodes);
  let idx = x * u32(uniforms.nodes) + y;

  let val = matrix[idx];

  // SOTA: Colorimetria Semântico-Associativa (Heatmap)
  // Indigo = Cold (Baixo Regret), Emerald = Hot (Alto Regret)
  let r = val * 0.1;       // Baixa incidência de Red
  let g = val;             // Alta incidência de Green (Emerald)
  let b = 1.0 - (val * 0.5); // Redução gradual de Blue
  let a = 0.1 + (val * 0.6); // Transparência dinâmica para estética Glassmorphism

  return vec4<f32>(r, g, b, a);
}
`;

export interface CfrCanvasProps {
	nodes: number;
}

export interface CfrCanvasRef {
	updateMatrix: (matrix: Float32Array) => void;
}

// SOTA: Interfaces mínimas para blindagem de tipos WebGPU sem dependências externas
interface SotaWebGpuContext {
	configure(config: { device: unknown; format: string; alphaMode: string }): void;
	getCurrentTexture(): { createView(): unknown };
}

interface SotaGpuDevice {
	createShaderModule(desc: { label: string; code: string }): unknown;
	createRenderPipeline(desc: Record<string, unknown>): {
		getBindGroupLayout(index: number): unknown;
	};
	createBuffer(desc: { size: number; usage: number }): unknown;
	queue: {
		writeBuffer(buffer: unknown, offset: number, data: Float32Array): void;
		submit(commands: unknown[]): void;
	};
	createBindGroup(desc: Record<string, unknown>): unknown;
	createCommandEncoder(): {
		beginRenderPass(desc: Record<string, unknown>): {
			setPipeline(pipeline: unknown): void;
			setBindGroup(index: number, bindGroup: unknown): void;
			draw(v: number, i: number, v1: number, v2: number): void;
			end(): void;
		};
		finish(): unknown;
	};
	destroy(): void;
}

export const CfrCanvas = forwardRef<CfrCanvasRef, Readonly<CfrCanvasProps>>(({ nodes }, ref) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const deviceRef = useRef<SotaGpuDevice | null>(null);
	const pipelineRef = useRef<unknown>(null);
	const matrixBufferRef = useRef<unknown>(null);
	const uniformBufferRef = useRef<unknown>(null);
	const bindGroupRef = useRef<unknown>(null);

	const [isReady, setIsReady] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isCancelled = false;

		async function initWebGPU() {
			const navigatorGpu = (navigator as unknown as Record<string, unknown>)['gpu'] as
				| {
						requestAdapter(options?: Record<string, unknown>): Promise<{
							requestDevice(): Promise<SotaGpuDevice>;
						} | null>;
						getPreferredCanvasFormat(): string;
				  }
				| undefined;

			if (!navigatorGpu) {
				setError(
					'WebGPU não suportado neste navegador. Verifique a compatibilidade e aceleração de hardware.',
				);
				return;
			}

			try {
				const adapter = await navigatorGpu.requestAdapter({
					powerPreference: 'high-performance',
				});
				if (!adapter) throw new Error('Adaptador WebGPU negou o pedido de contexto.');

				const device = await adapter.requestDevice();
				if (isCancelled) return;
				deviceRef.current = device;

				const canvas = canvasRef.current;
				if (!canvas) return;

				// Cast blindado para anular a cegueira tipográfica do TS sobre WebGPU
				const context = canvas.getContext('webgpu') as unknown as SotaWebGpuContext;
				if (!context)
					throw new Error('Falha ao ancorar o contexto de desenho WebGPU no DOM.');

				const presentationFormat = navigatorGpu.getPreferredCanvasFormat();
				context.configure({
					device,
					format: presentationFormat,
					alphaMode: 'premultiplied',
				});

				const shaderModule = device.createShaderModule({
					label: 'CFR Heatmap Shader',
					code: WGSL_SHADER,
				});

				const pipeline = device.createRenderPipeline({
					label: 'CFR Render Pipeline',
					layout: 'auto',
					vertex: { module: shaderModule, entryPoint: 'vs_main' },
					fragment: {
						module: shaderModule,
						entryPoint: 'fs_main',
						targets: [
							{
								format: presentationFormat,
								blend: {
									color: {
										srcFactor: 'src-alpha',
										dstFactor: 'one-minus-src-alpha',
										operation: 'add',
									},
									alpha: {
										srcFactor: 'one',
										dstFactor: 'one-minus-src-alpha',
										operation: 'add',
									},
								},
							},
						],
					},
					primitive: { topology: 'triangle-list' },
				});

				pipelineRef.current = pipeline;

				// Homeostase de VRAM: O Uniform e o Storage são imutáveis em tamanho no ciclo de vida
				const uBuffer = device.createBuffer({
					size: 4,
					usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
				});
				device.queue.writeBuffer(uBuffer, 0, new Float32Array([nodes]));
				uniformBufferRef.current = uBuffer;

				const maxNodes = 100 * 100; // Limite arquitetural estrito
				const mBuffer = device.createBuffer({
					size: maxNodes * 4,
					usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
				});
				matrixBufferRef.current = mBuffer;

				bindGroupRef.current = device.createBindGroup({
					layout: pipeline.getBindGroupLayout(0),
					entries: [
						{ binding: 0, resource: { buffer: uBuffer } },
						{ binding: 1, resource: { buffer: mBuffer } },
					],
				});

				setIsReady(true);
			} catch (err: unknown) {
				setError((err as Error).message || 'Entropia detectada na ponte WebGPU');
			}
		}

		initWebGPU();

		return () => {
			isCancelled = true;
			if (uniformBufferRef.current)
				(uniformBufferRef.current as { destroy(): void }).destroy();
			if (matrixBufferRef.current) (matrixBufferRef.current as { destroy(): void }).destroy();
			if (deviceRef.current) (deviceRef.current as { destroy(): void }).destroy();
		};
	}, [nodes]);

	useImperativeHandle(
		ref,
		() => ({
			updateMatrix: (newMatrix: Float32Array) => {
				if (
					!isReady ||
					!deviceRef.current ||
					!pipelineRef.current ||
					!matrixBufferRef.current ||
					!bindGroupRef.current
				)
					return;

				const device = deviceRef.current as {
					queue: {
						writeBuffer(buffer: unknown, offset: number, data: Float32Array): void;
						submit(commands: unknown[]): void;
					};
					createCommandEncoder(): {
						beginRenderPass(desc: Record<string, unknown>): {
							setPipeline(pipeline: unknown): void;
							setBindGroup(index: number, bindGroup: unknown): void;
							draw(v: number, i: number, v1: number, v2: number): void;
							end(): void;
						};
						finish(): unknown;
					};
				};
				const context = canvasRef.current?.getContext(
					'webgpu',
				) as unknown as SotaWebGpuContext;
				if (!context) return;

				// Fricção Zero: Injeção direta da matriz (Zero-Copy)
				device.queue.writeBuffer(matrixBufferRef.current, 0, newMatrix);

				const commandEncoder = device.createCommandEncoder();
				const textureView = (
					context.getCurrentTexture() as { createView(): unknown }
				).createView();

				const renderPass = commandEncoder.beginRenderPass({
					colorAttachments: [
						{
							view: textureView,
							clearValue: { r: 0, g: 0, b: 0, a: 0 }, // Fundo transparente SOTA (Glassmorphism integration)
							loadOp: 'clear',
							storeOp: 'store',
						},
					],
				});

				renderPass.setPipeline(pipelineRef.current);
				renderPass.setBindGroup(0, bindGroupRef.current);
				renderPass.draw(6, 1, 0, 0);
				renderPass.end();

				device.queue.submit([commandEncoder.finish()]);
			},
		}),
		[isReady],
	);

	if (error) {
		return (
			<div className="w-full h-full flex items-center justify-center border border-accent-danger/20 bg-accent-danger/5 rounded-3xl text-accent-danger text-[0.6rem] font-mono p-4 text-center">
				{error}
			</div>
		);
	}

	return (
		<canvas
			ref={canvasRef}
			className="w-full h-full absolute inset-0 mix-blend-screen opacity-90 transition-opacity duration-1000"
		/>
	);
});
CfrCanvas.displayName = 'CfrCanvas';
