/**
 * SOTA v7.0 GOLD: Global React Hooks barrel exports.
 * Provides clean access to global state and simulator-specific hooks.
 */

// Global App Hooks
export { useMounted } from './useMounted';
export { useLlamaEngine } from './useLlamaEngine';

// Gemma Inference Stream Bridge Hook
export { useGemmaStream } from '../components/simulator/useGemmaStream';

// Simulator Sub-Hooks
export { useBayesianRange } from '../components/simulator/hooks/useBayesianRange';
export { useDebouncedLocalStorage } from '../components/simulator/hooks/useDebouncedLocalStorage';
export { useFrequencyPropagation } from '../components/simulator/hooks/useFrequencyPropagation';
export { useIcmCalculations } from '../components/simulator/hooks/useIcmCalculations';
export { useInsolvencyRadar } from '../components/simulator/hooks/useInsolvencyRadar';
export { useMasterCalculations } from '../components/simulator/hooks/useMasterCalculations';
export { useMasterHandlers } from '../components/simulator/hooks/useMasterHandlers';
export { useMasterSpotLogic } from '../components/simulator/hooks/useMasterSpotLogic';
export { usePerspectiveCalculations } from '../components/simulator/hooks/usePerspectiveCalculations';
export { usePmLensCalculations } from '../components/simulator/hooks/usePmLensCalculations';
export { useQuantumEngine } from '../components/simulator/hooks/useQuantumEngine';
export { useRadarCalculations } from '../components/simulator/hooks/useRadarCalculations';
export { useScenario } from '../components/simulator/hooks/useScenario';
export { useSimulatorState } from '../components/simulator/hooks/useSimulatorState';
export { useSimulatorTour } from '../components/simulator/hooks/useSimulatorTour';
export { useSotaSync } from '../components/simulator/hooks/useSotaSync';
export { useSotaTelemetry } from '../components/simulator/hooks/useSotaTelemetry';

