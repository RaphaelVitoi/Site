/**
 * Benchmark do motor Rust/WASM (wasm-equity), medido e nao declarado.
 *
 * Reescrito em 2026-09-16. A versao anterior tinha tres defeitos que produziam numero
 * sem medicao por tras:
 * - o multiway lia um buffer alocado e nunca preenchido; o disjuntor disparava nas 10
 *   rodadas e o "throughput" de 528 milhoes it/s media o atalho de saida;
 * - "Isolamento Zero-Leak" vinha do heap do JavaScript, que nao enxerga a memoria do WASM;
 * - "ESTAVEL / NOMINAL" era texto fixo, impresso com ou sem falha.
 * Agora: aquecimento antes de medir, varias amostras por caso (mediana, min, max),
 * memoria linear do WASM antes e depois, e veredito derivado das checagens.
 *
 * O multiway (caso 4) avalia maos desde 2026-09-16; com ranges uniformes cada jogador deve ficar perto de 1/N.
 *
 * Uso:  node scripts/benchmark_wasm_quantum.mjs [--json] [--amostras N]
 * --json imprime so o JSON; e o formato que scripts/benchmark_sota_suite.py consome.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  calculate_equity_monte_carlo_binary,
  calculate_perspectiva_vitoi_wasm,
  solve_icm_distortion_v2,
  alloc_range_buffer,
  free_range_buffer,
  calculate_multiway_equity_zerocopy,
  initSync,
} from '../frontend/src/lib/engine/generated/vitoi_equity_engine.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WASM = path.join(RAIZ, 'frontend', 'src', 'lib', 'engine', 'generated', 'vitoi_equity_engine_bg.wasm');
const COMBOS = 1326;

const args = process.argv.slice(2);
const SO_JSON = args.includes('--json');
const idxAmostras = args.indexOf('--amostras');
const AMOSTRAS = idxAmostras >= 0 ? Math.max(3, Number(args[idxAmostras + 1]) || 7) : 7;

const log = (...linhas) => {
  if (!SO_JSON) console.log(...linhas);
};

function estatistica(tempos) {
  const ordenados = [...tempos].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);
  const mediana = ordenados.length % 2 ? ordenados[meio] : (ordenados[meio - 1] + ordenados[meio]) / 2;
  return { mediana_ms: mediana, min_ms: ordenados[0], max_ms: ordenados.at(-1), amostras: ordenados.length };
}

/** Aquece o JIT e o WASM, depois mede `AMOSTRAS` execucoes do mesmo trabalho. */
function medir(trabalho) {
  trabalho();
  trabalho();
  const tempos = [];
  let resultado;
  for (let i = 0; i < AMOSTRAS; i++) {
    const t0 = performance.now();
    resultado = trabalho();
    tempos.push(performance.now() - t0);
  }
  return { ...estatistica(tempos), resultado };
}

/** Mascara com os N primeiros combos pela ORDEM DO INDICE -- nao e top N% por forca de mao. */
function mascaraPrimeirosCombos(fracao) {
  const mask = new Uint8Array(Math.ceil(COMBOS / 8));
  const total = Math.floor(COMBOS * fracao);
  for (let i = 0; i < total; i++) mask[i >> 3] |= 1 << (i % 8);
  return mask;
}

const porSegundo = (operacoes, ms) => Math.round(operacoes / (ms / 1000));

function run() {
  const exportsWasm = initSync({ module: new WebAssembly.Module(readFileSync(WASM)) });
  const memoriaInicial = exportsWasm.memory.buffer.byteLength;
  const falhas = [];
  const casos = [];

  log('='.repeat(78));
  log('BENCHMARK DO MOTOR RUST/WASM -- mediana de', AMOSTRAS, 'amostras apos aquecimento');
  log('='.repeat(78));

  // 1. Monte Carlo de equidade range x range
  const heroi = mascaraPrimeirosCombos(0.15);
  const vilao = mascaraPrimeirosCombos(0.35);
  log('\n[1/4] Monte Carlo range x range (ranges = primeiros 15% e 35% dos combos por indice)');
  for (const cfg of [
    { iters: 50_000, board: '', kappa: 1.0 },
    { iters: 50_000, board: 'AhKd7c', kappa: 1.0 },
    { iters: 50_000, board: 'AhKd7c2s9h', kappa: 1.0 },
    { iters: 50_000, board: 'AhKd7c', kappa: 0.7 },
  ]) {
    const m = medir(() => calculate_equity_monte_carlo_binary(heroi, vilao, cfg.board, cfg.iters, 42, cfg.kappa));
    const equidade = m.resultado;
    if (!Number.isFinite(equidade) || equidade < 0 || equidade > 1) falhas.push(`monte carlo ${cfg.board}: equidade ${equidade}`);
    const taxa = porSegundo(cfg.iters, m.mediana_ms);
    casos.push({ caso: 'monte_carlo', board: cfg.board || 'preflop', kappa: cfg.kappa, iteracoes: cfg.iters, equidade, taxa_por_s: taxa, ...m, resultado: undefined });
    log(`  ${(cfg.board || 'preflop').padEnd(12)} k=${cfg.kappa.toFixed(2)}  equidade ${(equidade * 100).toFixed(2)}%  mediana ${m.mediana_ms.toFixed(2)} ms  [${m.min_ms.toFixed(2)}..${m.max_ms.toFixed(2)}]  ${taxa.toLocaleString('pt-BR')} it/s`);
  }

  // 2. Perspectiva (funcao analitica O(1))
  const LOTE_PERSPECTIVA = 200_000;
  const perspectiva = medir(() => {
    let soma = 0;
    for (let i = 0; i < LOTE_PERSPECTIVA; i++) {
      soma += calculate_perspectiva_vitoi_wasm(0.48 + (i % 20) * 0.01, 0.52, -0.48, -1.2, 0.88, 0.95, (i % 8) + 2, 5, 25, 40, 12, 14, 0, 1.1, 0.05, i % 4)[0];
    }
    return soma;
  });
  if (!Number.isFinite(perspectiva.resultado)) falhas.push('perspectiva: soma nao finita');
  casos.push({ caso: 'perspectiva', chamadas: LOTE_PERSPECTIVA, checksum: perspectiva.resultado, taxa_por_s: porSegundo(LOTE_PERSPECTIVA, perspectiva.mediana_ms), ...perspectiva, resultado: undefined });
  log(`\n[2/4] Perspectiva: ${LOTE_PERSPECTIVA.toLocaleString('pt-BR')} chamadas, mediana ${perspectiva.mediana_ms.toFixed(2)} ms, ${porSegundo(LOTE_PERSPECTIVA, perspectiva.mediana_ms).toLocaleString('pt-BR')} chamadas/s, checksum ${perspectiva.resultado.toFixed(6)}`);

  // 3. Distorcao ICM
  const LOTE_ICM = 200_000;
  const icm = medir(() => {
    for (let i = 0; i < LOTE_ICM; i++) solve_icm_distortion_v2(15, 18, 1.25, (i % 7) + 2, 10 + (i % 50), i % 4, 0.45, 0.25);
    return LOTE_ICM;
  });
  casos.push({ caso: 'icm_distortion_v2', chamadas: LOTE_ICM, taxa_por_s: porSegundo(LOTE_ICM, icm.mediana_ms), ...icm, resultado: undefined });
  log(`\n[3/4] Distorcao ICM: ${LOTE_ICM.toLocaleString('pt-BR')} chamadas, mediana ${icm.mediana_ms.toFixed(2)} ms, ${porSegundo(LOTE_ICM, icm.mediana_ms).toLocaleString('pt-BR')} chamadas/s`);

  // 4. Multiway zero-copy com ranges preenchidos
  const JOGADORES = 6;
  const ITERS_MULTIWAY = 20_000;
  const total = JOGADORES * COMBOS;
  const ptr = alloc_range_buffer(total);
  // Peso uniforme em todo combo: trabalho real, sem o atalho do disjuntor.
  new Float64Array(exportsWasm.memory.buffer, ptr, total).fill(1);
  let disjuntor = 0;
  const multiway = medir(() => {
    const res = calculate_multiway_equity_zerocopy(ptr, JOGADORES, 0n, ITERS_MULTIWAY, 12345);
    if (res[JOGADORES] === 1) disjuntor++;
    return Array.from(res).slice(0, JOGADORES);
  });
  free_range_buffer(ptr, total);
  const somaEquidades = multiway.resultado.reduce((s, x) => s + x, 0);
  if (disjuntor > 0) falhas.push(`multiway: disjuntor disparou em ${disjuntor} execucoes`);
  if (Math.abs(somaEquidades - 1) > 1e-6) falhas.push(`multiway: equidades somam ${somaEquidades.toFixed(6)}, nao 1`);
  const esperado = 1 / JOGADORES;
  const desvio = Math.max(...multiway.resultado.map((e) => Math.abs(e - esperado)));
  // Ranges uniformes e simetricos: cada jogador tende a 1/N. Tolerancia folgada para 20 mil iteracoes.
  if (desvio > 0.02) falhas.push(`multiway: ranges identicos com desvio ${desvio.toFixed(4)} de 1/${JOGADORES}`);
  casos.push({ caso: 'multiway_zerocopy', desvio_max_de_1_n: desvio, jogadores: JOGADORES, iteracoes: ITERS_MULTIWAY, equidades: multiway.resultado, disjuntor, taxa_por_s: porSegundo(ITERS_MULTIWAY, multiway.mediana_ms), ...multiway, resultado: undefined });
  log(`\n[4/4] Multiway ${JOGADORES} jogadores, ranges uniformes: ${ITERS_MULTIWAY.toLocaleString('pt-BR')} it, mediana ${multiway.mediana_ms.toFixed(2)} ms, ${porSegundo(ITERS_MULTIWAY, multiway.mediana_ms).toLocaleString('pt-BR')} it/s, soma ${somaEquidades.toFixed(4)}, desvio max de 1/N ${desvio.toFixed(4)}, disjuntor ${disjuntor}x`);

  const memoriaFinal = exportsWasm.memory.buffer.byteLength;
  const relatorio = {
    gerado_em: new Date().toISOString(),
    node: process.version,
    amostras_por_caso: AMOSTRAS,
    memoria_wasm_bytes: { inicial: memoriaInicial, final: memoriaFinal, crescimento: memoriaFinal - memoriaInicial },
    casos,
    falhas,
    veredito: falhas.length === 0 ? 'OK' : 'FALHOU',
  };

  if (SO_JSON) {
    console.log(JSON.stringify(relatorio));
  } else {
    log('\n' + '='.repeat(78));
    log(`Memoria linear do WASM: ${memoriaInicial.toLocaleString('pt-BR')} -> ${memoriaFinal.toLocaleString('pt-BR')} bytes`);
    const detalhe = falhas.length ? ' -- ' + falhas.join('; ') : '';
    log(`Veredito: ${relatorio.veredito}${detalhe}`);
    log('='.repeat(78));
  }
  if (falhas.length) process.exitCode = 1;
}

run();
