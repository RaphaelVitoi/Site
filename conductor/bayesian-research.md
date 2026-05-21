# Research: Bayesian Recursive Updating for Range Reading

## Objective

Transition the range reading module from a static heuristic to a dynamic Bayesian belief state that updates street-by-street.

## Current State

- `calculateBayesianUpdate` in `ai-models.ts` handles a single "Prior -> Posterior" update for aggregate values (e.g., P(Value) vs P(Bluff)).
- `RangeMatrix.tsx` uses a rank-based heuristic to classify hands into categories (Core, Marginal, Bluff, Death).
- `NashPanel.tsx` displays aggregate frequencies but doesn't persist the state of the ranges across streets.

## Bayesian Recursive Architecture

The new module should treat the range as a vector of 169 probabilities $B = [p_1, p_2, ..., p_{169}]$.

### 1. Bayesian Update Formula

For each hand $H_i$:
$$P(H_i | Action) = \frac{P(Action | H_i) \cdot P(H_i)}{\sum_{j=1}^{169} P(Action | H_j) \cdot P(H_j)}$$

Where:

- $P(H_i)$ is the belief *before* the action (Prior).
- $P(Action | H_i)$ is the likelihood of the hand taking that action (from the Nash Strategy).
- $P(H_i | Action)$ is the updated belief (Posterior).

### 2. State Propagation

The Posterior of the Flop becomes the Prior of the Turn.
$$Belief_{Turn} = Belief_{Flop\_Posterior}$$

### 3. Integration with ICM

The "Likelihood" $P(Action | H_i)$ should be distorted by the ICM engine. If ICM forces a hand to fold more, its likelihood of calling/betting decreases, accelerating the range contraction.

## Implementation Plan

1. **Engine**: Create `src/lib/bayesianRangeEngine.ts` to handle the vector math.
2. **Hook**: Create `src/components/simulator/hooks/useBayesianRange.ts` to manage state across streets.
3. **UI**: Update `RangeMatrix.tsx` or create `BeliefMatrix.tsx` to visualize the probability density (heat-map).
4. **Orchestration**: Link `NashPanel` action selection to the `useBayesianRange` update function.

## Next Steps

- Implement `bayesianRangeEngine.ts`.
- Mock a Nash Strategy per hand category to validate the recursive logic.
- Integrate with `MasterSimulator`.
