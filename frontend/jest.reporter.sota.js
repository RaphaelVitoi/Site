class SotaJestGuardReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this.errors = [];
    this.warnings = [];
  }

  onTestResult(test, testResult, aggregatedResult) {
    if (testResult.testResults) {
      testResult.testResults.forEach((result) => {
        if (result.status === 'failed') {
          const comp = (testResult.testFilePath || '').split(/[\\/]/).pop().replace(/\.test\.(tsx?|jsx?)$/, '');
          const rawMsg = (result.failureMessages || []).join('\n');
          const firstLine = rawMsg.split('\n')[0] || 'Assertion/Runtime Error';
          this.errors.push({
            type: 'ERROR',
            component: 'frontend.' + comp,
            test: (result.ancestorTitles ? result.ancestorTitles.join(' > ') : '') + ' > ' + result.title,
            message: firstLine.trim(),
            recommendation: this.generateRecommendation('ERROR', comp, firstLine),
          });
        }
      });
    }

    if (testResult.console) {
      testResult.console.forEach((entry) => {
        if (entry.type === 'warn') {
          const comp = (testResult.testFilePath || '').split(/[\\/]/).pop().replace(/\.test\.(tsx?|jsx?)$/, '');
          const message = entry.message || '';
          this.warnings.push({
            type: 'WARNING',
            component: 'frontend.' + comp,
            test: (testResult.testFilePath || '').split(/[\\/]/).pop(),
            message: message.trim(),
            recommendation: this.generateRecommendation('WARNING', comp, message),
          });
        }
      });
    }
  }

  generateRecommendation(type, component, message) {
    const msg = (message || '').toLowerCase();
    if (msg.includes('act(')) {
      return "[SOTA-REC] Envolver a atualizacao de estado assincrona no componente '" + component + "' em 'await act(async () => ...)' ou usar 'waitFor'.";
    }
    if (msg.includes('unmounted') || msg.includes('memory leak')) {
      return "[SOTA-REC] Cancelar subscriptions ou abortar requisicoes pendentes no cleanup de useEffect em '" + component + "'.";
    }
    if (msg.includes('key') || msg.includes('unique key')) {
      return "[SOTA-REC] Adicionar propriedade 'key' unica e estavel na renderizacao da lista em '" + component + "'.";
    }
    if (type === 'ERROR') {
      return "[SOTA-REC] Corrigir a quebra de contrato de renderizacao/estado no componente React '" + component + "'.";
    }
    return "[SOTA-REC] Inspecionar o componente React '" + component + "' e alinhar ao Padrao-Ouro v8.0 GOLD.";
  }

  onRunComplete(contexts, results) {
    const totalErrors = this.errors.length + results.numFailedTests;
    const totalWarnings = this.warnings.length;
    
    let status = 'SUCESSO';
    let statusColor = '\x1b[32m';
    if (totalErrors === 0 && totalWarnings === 0) {
      status = 'SUCESSO (VERDE)';
      statusColor = '\x1b[32m';
    } else if (totalErrors === 0 && totalWarnings <= 2) {
      status = 'FRAGIL (AMARELO)';
      statusColor = '\x1b[33m';
    } else {
      status = 'FALHOU (VERMELHO)';
      statusColor = '\x1b[31m';
    }

    const guardPassed = status !== 'FALHOU (VERMELHO)';

    console.log('\n' + '='.repeat(80));
    console.log('\x1b[36m\x1b[1m========= SOTA QUALITY & INTEGRITY GUARD — PROTOCOLO CHICO v8.0 GOLD (FRONTEND) ==========\x1b[0m');
    console.log('• Total de Erros:    ' + totalErrors + ' (Teto Maximo Permitido: 0 | Peso: CRITICO)');
    console.log('• Total de Warnings: ' + totalWarnings + ' (Teto Maximo Permitido: 2 | Tolerancia: 0 para SUCESSO)');
    console.log(statusColor + '\x1b[1m• Status da Bateria: [' + status + ']\x1b[0m');

    if (status === 'SUCESSO (VERDE)') {
      console.log('\x1b[32m• Homeostase Total:  Nenhum erro ou warning detectado em toda a suite frontend.\x1b[0m');
    } else if (status === 'FRAGIL (AMARELO)') {
      console.log('\x1b[33m• Atencao Entropica: 0 Erros, mas detectados ' + totalWarnings + ' warnings no React/DOM.\x1b[0m');
    } else {
      console.log('\x1b[31m• Bloqueio Termodinamico: Violacao dos limites estritos do Guard no Frontend.\x1b[0m');
    }

    const allFindings = [...this.errors, ...this.warnings];
    if (allFindings.length > 0) {
      console.log('\x1b[33m' + '-'.repeat(80) + '\x1b[0m');
      console.log('\x1b[33m\x1b[1mSUMARIO INDIVIDUAL DE DETECCOES (' + allFindings.length + ' OCORRENCIAS)\x1b[0m');
      allFindings.forEach((item, idx) => {
        const color = item.type === 'ERROR' ? '\x1b[31m' : '\x1b[33m';
        console.log(color + '\x1b[1m[' + (idx + 1) + '] ' + item.type + " -> Componente: '" + item.component + "' | Teste: " + item.test + '\x1b[0m');
        console.log('    Causa/Motivo: ' + item.message);
        console.log('    \x1b[36m💡 Recomendacao: ' + item.recommendation + '\x1b[0m\n');
      });
    }

    console.log('\x1b[36m\x1b[1m' + '='.repeat(80) + '\x1b[0m\n');

    if (!guardPassed) {
      results.numFailedTests = Math.max(results.numFailedTests, 1);
    }
  }
}

module.exports = SotaJestGuardReporter;
