<#
.SYNOPSIS
    Invokes existing Monte Carlo ICM and CFR engines as bounded support for a
    calibration hypothesis.

.DESCRIPTION
    This adapter never creates behavioural evidence, chooses a calibration, or
    converts a model output into a factual conclusion. Its input parameters,
    model scope, and limitations must be copied into the daily audit report.

    Available engines:
      - monte-carlo-equity-wasm: wasm-equity/lib.rs::calculate_equity_monte_carlo_binary
      - monte-carlo-icm: frontend/src/lib/montecarlo.ts
      - cfr-regret: engine/math_sota.py::cfr_mock_strategy
      - cfr-pure: frontend/src/components/simulator/workers/cfr.worker.ts
      - timesfm-forecast: engine/timesfm_engine.py::forecast_agent_calibration_trajectory

    TimesFM is Google Research's zero-shot foundation model for time series forecasting,
    providing inductive statistical drift projection for agent calibration scores.
    CFR means Counterfactual Regret Minimization. It is a bounded quantitative
    support layer, not an autonomous decision maker.
#>
[CmdletBinding(DefaultParameterSetName = 'MonteCarloWasm')]
param(
    [Parameter(Mandatory, ParameterSetName = 'MonteCarloWasm')]
    [ValidateSet('monte-carlo-equity-wasm')]
    [string]$WasmMode,

    [Parameter(Mandatory, ParameterSetName = 'MonteCarloWasm')]
    [ValidateNotNullOrEmpty()]
    [string]$HeroRange,

    [Parameter(Mandatory, ParameterSetName = 'MonteCarloWasm')]
    [ValidateNotNullOrEmpty()]
    [string]$VillainRange,

    [Parameter(ParameterSetName = 'MonteCarloWasm')]
    [string]$Board = '',

    [Parameter(ParameterSetName = 'MonteCarloWasm')]
    [ValidateRange(1, 10000000)]
    [int]$WasmIterations = 50000,

    [Parameter(ParameterSetName = 'MonteCarloWasm')]
    [uint32]$Seed = 424242,

    [Parameter(ParameterSetName = 'MonteCarloWasm')]
    [ValidateRange(0.0, 1.0)]
    [double]$Kappa = 1.0,

    [Parameter(Mandatory, ParameterSetName = 'MonteCarlo')]
    [ValidateSet('monte-carlo-icm')]
    [string]$Mode,

    [Parameter(Mandatory, ParameterSetName = 'MonteCarlo')]
    [ValidateNotNullOrEmpty()]
    [string]$StacksJson,

    [Parameter(Mandatory, ParameterSetName = 'MonteCarlo')]
    [ValidateNotNullOrEmpty()]
    [string]$PrizesJson,

    [Parameter(ParameterSetName = 'MonteCarlo')]
    [ValidateRange(1, 10000000)]
    [int]$Iterations = 10000,

    [Parameter(Mandatory, ParameterSetName = 'Cfr')]
    [ValidateSet('cfr-regret')]
    [string]$CfrMode,

    [Parameter(Mandatory, ParameterSetName = 'Cfr')]
    [ValidateNotNullOrEmpty()]
    [string]$RegretsJson,

    [Parameter(Mandatory, ParameterSetName = 'CfrPure')]
    [ValidateSet('cfr-pure')]
    [string]$CfrPureMode,

    [Parameter(ParameterSetName = 'CfrPure')]
    [ValidateRange(2, 64)]
    [int]$CfrNodes = 13,

    [Parameter(Mandatory, ParameterSetName = 'CfrPure')]
    [ValidateRange(0.000001, 1000000000.0)]
    [double]$CfrPot,

    [Parameter(Mandatory, ParameterSetName = 'CfrPure')]
    [ValidateRange(0.000001, 1000000000.0)]
    [double]$CfrStack,

    [Parameter(ParameterSetName = 'CfrPure')]
    [ValidateRange(0.0, 1.0)]
    [double]$CfrKappa = 1.0,

    [Parameter(Mandatory, ParameterSetName = 'CfrPure')]
    [ValidateRange(1, 100000)]
    [int]$CfrIterations = 32,

    [Parameter(Mandatory, ParameterSetName = 'TimesFm')]
    [ValidateSet('timesfm-forecast')]
    [string]$TimesFmMode,

    [Parameter(ParameterSetName = 'TimesFm')]
    [string]$ScoresJson,

    [Parameter(ParameterSetName = 'TimesFm')]
    [ValidateRange(1, 30)]
    [int]$TimesFmHorizon = 3,

    [Parameter(ParameterSetName = 'TimesFm')]
    [string]$ConductorModel
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

if ($PSCmdlet.ParameterSetName -eq 'MonteCarloWasm') {
    $env:AGENT_CALIBRATION_HERO_RANGE = $HeroRange
    $env:AGENT_CALIBRATION_VILLAIN_RANGE = $VillainRange
    $env:AGENT_CALIBRATION_BOARD = $Board
    $env:AGENT_CALIBRATION_ITERATIONS = [string]$WasmIterations
    $env:AGENT_CALIBRATION_SEED = [string]$Seed
    $env:AGENT_CALIBRATION_KAPPA = [string]$Kappa
    $env:TS_NODE_COMPILER_OPTIONS = '{"module":"commonjs","target":"es2022","lib":["es2022","dom"]}'
    $nodeScript = @'
const { initializeMonteCarloWasm } = require('./frontend/src/lib/monteCarloWasmRuntime.node.ts');
const { maskToBytes, rangeToBitmask } = require('./frontend/src/components/simulator/workers/rangeParser.ts');
(async () => {
  const calculate = await initializeMonteCarloWasm();
  const equity = calculate(
    maskToBytes(rangeToBitmask(process.env.AGENT_CALIBRATION_HERO_RANGE)),
    maskToBytes(rangeToBitmask(process.env.AGENT_CALIBRATION_VILLAIN_RANGE)),
    process.env.AGENT_CALIBRATION_BOARD ?? '',
    Number.parseInt(process.env.AGENT_CALIBRATION_ITERATIONS, 10),
    Number.parseInt(process.env.AGENT_CALIBRATION_SEED, 10),
    Number.parseFloat(process.env.AGENT_CALIBRATION_KAPPA),
  );
  console.log(JSON.stringify({ equity }));
})().catch((error) => { console.error(error); process.exit(1); });
'@
    $rawResult = & node -r ts-node/register -e $nodeScript
    if ($LASTEXITCODE -ne 0) { throw 'Pure Monte Carlo WASM engine failed.' }
    $result = $rawResult | ConvertFrom-Json
    [pscustomobject]@{
        schema_version = 'agent-calibration-quantitative-support/v2'
        engine         = 'monte-carlo-equity-wasm'
        source         = 'wasm-equity/lib.rs::calculate_equity_monte_carlo_binary'
        inputs         = [ordered]@{ hero_range = $HeroRange; villain_range = $VillainRange; board = $Board; iterations = $WasmIterations; seed = $Seed; kappa = $Kappa }
        output         = [ordered]@{ equity = [double]$result.equity }
        limitations    = @(
            'Pure Rust/WASM Monte Carlo estimates poker equity for the declared ranges and board; it is not a behavioural-evidence model.',
            'The supplied seed makes this invocation reproducible for the same compiled artifact and inputs.',
            'A result supports sensitivity analysis only after the audit declares the scenario assumptions.'
        )
    } | ConvertTo-Json -Depth 8
    exit 0
}

if ($PSCmdlet.ParameterSetName -eq 'MonteCarlo') {
    try {
        $stacks = @($StacksJson | ConvertFrom-Json)
        $prizes = @($PrizesJson | ConvertFrom-Json)
    }
    catch {
        throw 'StacksJson and PrizesJson must each be valid JSON arrays of numbers.'
    }
    if ($stacks.Count -eq 0 -or $prizes.Count -eq 0) {
        throw 'StacksJson and PrizesJson must each contain at least one number.'
    }
    $numericStacks = @()
    $numericPrizes = @()
    foreach ($value in $stacks) {
        $number = 0.0
        if (-not [double]::TryParse([string]$value, [ref]$number)) { throw 'StacksJson must contain only numbers.' }
        $numericStacks += $number
    }
    foreach ($value in $prizes) {
        $number = 0.0
        if (-not [double]::TryParse([string]$value, [ref]$number)) { throw 'PrizesJson must contain only numbers.' }
        $numericPrizes += $number
    }
    if ($numericStacks.Count -ne $numericPrizes.Count -and $numericPrizes.Count -gt $numericStacks.Count) {
        # The engine intentionally truncates prizes to player count; make that
        # semantic fact visible instead of silently changing input here.
        Write-Verbose 'The engine will truncate prizes beyond the number of stacks.'
    }
    if (@($numericStacks | Where-Object { $_ -lt 0 }).Count -gt 0 -or @($numericPrizes | Where-Object { $_ -lt 0 }).Count -gt 0) {
        throw 'Stacks and prizes must be non-negative.'
    }

    # -InputObject is essential: pipeline enumeration would serialize each
    # number separately and make the Node engine receive a scalar.
    $env:AGENT_CALIBRATION_STACKS = ConvertTo-Json -InputObject $numericStacks -Compress
    $env:AGENT_CALIBRATION_PRIZES = ConvertTo-Json -InputObject $numericPrizes -Compress
    $env:AGENT_CALIBRATION_ITERATIONS = [string]$Iterations
    $env:TS_NODE_COMPILER_OPTIONS = '{"module":"commonjs","target":"es2022","lib":["es2022"]}'
    $nodeScript = @'
const { calculateIcmMonteCarlo } = require('./frontend/src/lib/montecarlo.ts');
const stacks = JSON.parse(process.env.AGENT_CALIBRATION_STACKS);
const prizes = JSON.parse(process.env.AGENT_CALIBRATION_PRIZES);
const iterations = Number.parseInt(process.env.AGENT_CALIBRATION_ITERATIONS, 10);
const equity = calculateIcmMonteCarlo(stacks, prizes, { iterations });
console.log(JSON.stringify({ equity }));
'@
    $rawResult = & node -r ts-node/register -e $nodeScript
    if ($LASTEXITCODE -ne 0) { throw 'Monte Carlo ICM engine failed.' }
    $result = $rawResult | ConvertFrom-Json
    [pscustomobject]@{
        schema_version = 'agent-calibration-quantitative-support/v1'
        engine         = 'monte-carlo-icm'
        source         = 'frontend/src/lib/montecarlo.ts::calculateIcmMonteCarlo'
        inputs         = [ordered]@{ stacks = $numericStacks; prizes = $numericPrizes; iterations = $Iterations }
        output         = [ordered]@{ equity = @($result.equity) }
        limitations    = @(
            'ICM/equity scenario support only; it is not a behavioural-evidence model.',
            'The existing engine uses Math.random and exposes no seed; repeatability is statistical, not bit-for-bit.',
            'A result supports sensitivity analysis only after the audit declares the scenario assumptions.'
        )
    } | ConvertTo-Json -Depth 8
    exit 0
}

if ($PSCmdlet.ParameterSetName -eq 'CfrPure') {
    $env:AGENT_CALIBRATION_CFR_NODES = [string]$CfrNodes
    $env:AGENT_CALIBRATION_CFR_POT = [string]$CfrPot
    $env:AGENT_CALIBRATION_CFR_STACK = [string]$CfrStack
    $env:AGENT_CALIBRATION_CFR_KAPPA = [string]$CfrKappa
    $env:AGENT_CALIBRATION_CFR_ITERATIONS = [string]$CfrIterations
    $env:TS_NODE_COMPILER_OPTIONS = '{"module":"commonjs","target":"es2022","lib":["es2022","dom"]}'
    $nodeScript = @'
let captured = null;
globalThis.postMessage = (message) => { captured = message; };
require('./frontend/src/components/simulator/workers/cfr.worker.ts');
const data = {
  id: 'agent-calibration',
  nodes: Number.parseInt(process.env.AGENT_CALIBRATION_CFR_NODES, 10),
  pot: Number.parseFloat(process.env.AGENT_CALIBRATION_CFR_POT),
  stack: Number.parseFloat(process.env.AGENT_CALIBRATION_CFR_STACK),
  kappa: Number.parseFloat(process.env.AGENT_CALIBRATION_CFR_KAPPA),
};
const iterations = Number.parseInt(process.env.AGENT_CALIBRATION_CFR_ITERATIONS, 10);
for (let index = 0; index < iterations; index += 1) globalThis.onmessage({ data });
if (!captured || captured.error || !captured.matrix) throw new Error(captured?.error || 'CFR worker produced no matrix.');
const matrix = Array.from(captured.matrix);
const sum = matrix.reduce((total, value) => total + value, 0);
console.log(JSON.stringify({ matrix, summary: { cells: matrix.length, minimum: Math.min(...matrix), maximum: Math.max(...matrix), mean: sum / matrix.length } }));
'@
    $rawResult = & node -r ts-node/register -e $nodeScript
    if ($LASTEXITCODE -ne 0) { throw 'Pure CFR worker failed.' }
    $result = $rawResult | ConvertFrom-Json
    [pscustomobject]@{
        schema_version = 'agent-calibration-quantitative-support/v2'
        engine         = 'cfr-pure'
        source         = 'frontend/src/components/simulator/workers/cfr.worker.ts'
        inputs         = [ordered]@{ nodes = $CfrNodes; pot = $CfrPot; stack = $CfrStack; kappa = $CfrKappa; iterations = $CfrIterations }
        output         = [ordered]@{ matrix = @($result.matrix); summary = $result.summary }
        limitations    = @(
            'The active worker is a pure iterative CFR-style regret-matching implementation over its declared 13x13-style abstraction.',
            'Pot, stack, kappa, node count, and iteration count are audit inputs and must be derived and cited before invocation.',
            'The matrix compares declared alternatives under its abstraction; it does not establish that a calibration is true or safe.'
        )
    } | ConvertTo-Json -Depth 8
    exit 0
}

if ($PSCmdlet.ParameterSetName -eq 'TimesFm') {
    $pythonPath = Join-Path $repositoryRoot '.venv\Scripts\python.exe'
    if (-not (Test-Path -LiteralPath $pythonPath)) { throw 'Project Python runtime (.venv\Scripts\python.exe) was not found.' }

    $numericScores = @()
    if (-not [string]::IsNullOrWhiteSpace($ScoresJson)) {
        try {
            $parsed = @($ScoresJson | ConvertFrom-Json)
            foreach ($item in $parsed) {
                $val = 0.0
                if (-not [double]::TryParse([string]$item, [ref]$val)) { throw 'ScoresJson must contain only numeric values.' }
                $numericScores += $val
            }
        } catch {
            throw 'ScoresJson must be a valid JSON array of numbers.'
        }
    } else {
        $ledgerPath = Join-Path $repositoryRoot 'reports\agent-calibration\feedback-ledger.jsonl'
        if (Test-Path -LiteralPath $ledgerPath) {
            $lines = Get-Content -LiteralPath $ledgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
            foreach ($line in $lines) {
                try {
                    $entry = $line | ConvertFrom-Json
                    if ($entry.record_type -eq 'feedback' -and $null -ne $entry.score) {
                        if ([string]::IsNullOrWhiteSpace($ConductorModel) -or [string]$entry.conductor_model -eq $ConductorModel) {
                            $val = 0.0
                            if ([double]::TryParse([string]$entry.score, [ref]$val)) {
                                $numericScores += $val
                            }
                        }
                    }
                } catch {}
            }
        }
    }

    if ($numericScores.Count -lt 4) {
        throw "TimesFM requires at least 4 historical calibration score points. Found: $($numericScores.Count)."
    }

    $env:AGENT_CALIBRATION_SCORES = ConvertTo-Json -InputObject $numericScores -Compress
    $env:AGENT_CALIBRATION_HORIZON = [string]$TimesFmHorizon
    $env:AGENT_CALIBRATION_CONDUCTOR = if ($ConductorModel) { $ConductorModel } else { '' }

    $pythonCode = @'
import json
import os
from engine.timesfm_engine import forecast_agent_calibration_trajectory

scores = [float(x) for x in json.loads(os.environ["AGENT_CALIBRATION_SCORES"])]
horizon = int(os.environ.get("AGENT_CALIBRATION_HORIZON", "3"))
conductor = os.environ.get("AGENT_CALIBRATION_CONDUCTOR") or None

fc = forecast_agent_calibration_trajectory(scores, horizon_sessions=horizon, conductor_model=conductor)
print(fc.model_dump_json())
'@

    $rawResult = & $pythonPath -c $pythonCode
    if ($LASTEXITCODE -ne 0) { throw 'TimesFM calibration forecast engine failed.' }
    $result = $rawResult | ConvertFrom-Json

    [pscustomobject]@{
        schema_version = 'agent-calibration-quantitative-support/v2'
        engine         = 'google-timesfm-2.0'
        source         = 'engine/timesfm_engine.py::forecast_agent_calibration_trajectory'
        inputs         = [ordered]@{
            scores_count    = $numericScores.Count
            horizon         = $TimesFmHorizon
            conductor_model = $ConductorModel
        }
        output         = $result
        limitations    = @(
            'Google Research TimesFM 2.0 (Apache 2.0) zero-shot foundation model estimates score drift, predictive mean trajectory and degradation risks over upcoming sessions.',
            'It is an inductive statistical prior and bounded quantitative support layer; it does not replace empirical session evaluation or gate criteria.',
            'Degradation detection triggers when 10th percentile crosses the gate threshold (8.5) or mean trajectory slopes downwards.'
        )
    } | ConvertTo-Json -Depth 8
    exit 0
}

try {
    $parsedRegrets = $RegretsJson | ConvertFrom-Json
}
catch {
    throw 'RegretsJson must be a valid JSON object mapping candidate actions to numeric counterfactual regrets.'
}
if ($null -eq $parsedRegrets -or $parsedRegrets -isnot [pscustomobject]) {
    throw 'RegretsJson must be a JSON object.'
}
foreach ($property in $parsedRegrets.PSObject.Properties) {
    $value = 0.0
    if (-not [double]::TryParse([string]$property.Value, [ref]$value)) {
        throw "Regret for '$($property.Name)' must be numeric."
    }
}

$pythonPath = Join-Path $repositoryRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $pythonPath)) { throw 'Project Python runtime (.venv\\Scripts\\python.exe) was not found.' }
$env:AGENT_CALIBRATION_REGRETS = $RegretsJson
$pythonCode = @'
import json
import os
from engine.math_sota import cfr_mock_strategy

regrets = json.loads(os.environ["AGENT_CALIBRATION_REGRETS"])
if not isinstance(regrets, dict) or not all(isinstance(v, (int, float)) for v in regrets.values()):
    raise ValueError("regrets must be a mapping of action to number")
print(json.dumps({"strategy": cfr_mock_strategy(regrets)}, sort_keys=True))
'@
$rawResult = & $pythonPath -c $pythonCode
if ($LASTEXITCODE -ne 0) { throw 'CFR regret engine failed.' }
$result = $rawResult | ConvertFrom-Json
[pscustomobject]@{
    schema_version = 'agent-calibration-quantitative-support/v1'
    engine         = 'cfr-regret'
    source         = 'engine/math_sota.py::cfr_mock_strategy'
    inputs         = [ordered]@{ regrets = $parsedRegrets }
    output         = [ordered]@{ strategy = $result.strategy }
    limitations    = @(
        'This is one-step positive-regret normalization, not a converged CFR equilibrium solver.',
        'Counterfactual regrets are audit inputs and must be derived and cited before invocation.',
        'The strategy ranks declared alternatives; it does not establish that a calibration is true or safe.'
    )
} | ConvertTo-Json -Depth 8
