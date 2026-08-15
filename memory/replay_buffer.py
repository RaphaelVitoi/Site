"""
SOTA Vectorized Replay Memory & Trajectory Ring-Buffer Engine (Chico v7.0 GOLD)
Protocol Chico SOTA v7.0 GOLD - Prioritized Experience Replay (PER) & Agent State Memory
"""

import numpy as np
import threading
from typing import NamedTuple, Any, List, Dict, Optional, Tuple


class Transition(NamedTuple):
    state: Any
    action: Any
    reward: float
    next_state: Any
    done: bool
    info: Dict[str, Any]


class SumTree:
    """
    Árvore binária de soma para amostragem probabilística e atualização O(log N).
    Usada para Prioritized Experience Replay (PER) com ponderação de TD-error.
    """

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.tree = np.zeros(2 * capacity - 1, dtype=np.float64)
        self.data = np.zeros(capacity, dtype=object)
        self.write_idx = 0
        self.size = 0
        self.lock = threading.Lock()

    def _propagate(self, idx: int, change: float):
        parent = (idx - 1) // 2
        self.tree[parent] += change
        if parent != 0:
            self._propagate(parent, change)

    def _retrieve(self, idx: int, s: float) -> int:
        left = 2 * idx + 1
        right = left + 1
        if left >= len(self.tree):
            return idx
        if s <= self.tree[left]:
            return self._retrieve(left, s)
        else:
            return self._retrieve(right, s - self.tree[left])

    def total(self) -> float:
        return self.tree[0]

    def add(self, priority: float, data: Any):
        with self.lock:
            idx = self.write_idx + self.capacity - 1
            self.data[self.write_idx] = data
            self.update(idx, priority)
            self.write_idx = (self.write_idx + 1) % self.capacity
            if self.size < self.capacity:
                self.size += 1

    def update(self, idx: int, priority: float):
        change = priority - self.tree[idx]
        self.tree[idx] = priority
        self._propagate(idx, change)

    def get(self, s: float) -> Tuple[int, float, Any]:
        idx = self._retrieve(0, s)
        data_idx = idx - self.capacity + 1
        return idx, self.tree[idx], self.data[data_idx]


class PrioritizedReplayMemory:
    """
    Memória de Replay Prioritária (PER) SOTA com vetorização NumPy,
    amostragem estocástica e compensação de viés por Importance Sampling (IS).
    """

    def __init__(self, capacity: int = 100000, alpha: float = 0.6, beta: float = 0.4, beta_increment: float = 0.001):
        self.tree = SumTree(capacity)
        self.capacity = capacity
        self.alpha = alpha
        self.beta = beta
        self.beta_increment = beta_increment
        self.epsilon = 1e-5
        self.max_priority = 1.0

    def push(
        self, state: Any, action: Any, reward: float, next_state: Any, done: bool, info: Optional[Dict[str, Any]] = None
    ):
        """Armazena uma transição de agente com prioridade máxima inicial."""
        transition = Transition(state, action, reward, next_state, done, info or {})
        priority = self.max_priority**self.alpha
        self.tree.add(priority, transition)

    def sample(self, batch_size: int) -> Tuple[List[Transition], np.ndarray, np.ndarray]:
        """Amostra um lote de transições proporcionalmente à prioridade de TD-error."""
        batch: List[Transition] = []
        idxs = np.zeros(batch_size, dtype=np.int32)
        priorities = np.zeros(batch_size, dtype=np.float64)

        segment = self.tree.total() / batch_size
        self.beta = min(1.0, self.beta + self.beta_increment)

        for i in range(batch_size):
            a = segment * i
            b = segment * (i + 1)
            s = np.random.uniform(a, b)
            idx, priority, data = self.tree.get(s)

            # Fallback para transição vazia se árvore não totalmente preenchida
            if data == 0 or data is None:
                s = np.random.uniform(0, max(self.epsilon, self.tree.total()))
                idx, priority, data = self.tree.get(s)

            priorities[i] = priority
            idxs[i] = idx
            batch.append(data)

        # Importance Sampling Weights: w_i = (N * P(i)) ^ (-beta) / max_w
        sampling_probs = priorities / max(self.epsilon, self.tree.total())
        is_weights = np.power(self.tree.size * sampling_probs + self.epsilon, -self.beta)
        is_weights /= is_weights.max() + self.epsilon

        return batch, idxs, is_weights

    def update_priorities(self, idxs: np.ndarray, td_errors: np.ndarray):
        """Atualiza as prioridades na SumTree com base nos novos erros TD absolutos."""
        for idx, error in zip(idxs, td_errors, strict=False):
            clipped_error = min(abs(error) + self.epsilon, 100.0)
            priority = clipped_error**self.alpha
            self.tree.update(idx, priority)
            self.max_priority = max(self.max_priority, priority)

    def __len__(self):
        return self.tree.size


def test_replay_buffer():
    print("=" * 60)
    print("  TESTE DO MOTOR DE MEMÓRIA DE REPLAY PRIORITÁRIA (PER)")
    print("=" * 60)

    memory = PrioritizedReplayMemory(capacity=10000)

    # Ingest 1,000 synthetic agent transitions
    for i in range(1000):
        s = np.array([i, i * 2, np.sin(i)])
        a = i % 4
        r = float(np.random.randn())
        s_next = s + np.array([1, 2, 0.1])
        done = i % 50 == 0
        memory.push(s, a, r, s_next, done, {"step": i})

    print(f"[OK] {len(memory)} transições injetadas na SumTree com sucesso.")

    batch, idxs, weights = memory.sample(batch_size=32)
    print(f"[OK] Amostrado lote de {len(batch)} itens via Importance Sampling.")
    print(f"     Média de Pesos IS: {np.mean(weights):.4f} (Min: {np.min(weights):.4f}, Max: {np.max(weights):.4f})")

    # Simulate TD-error update
    simulated_td = np.random.exponential(scale=2.0, size=32)
    memory.update_priorities(idxs, simulated_td)
    print("[OK] Prioridades O(log N) atualizadas na árvore com sucesso absoluto.")
    print("=" * 60)


if __name__ == "__main__":
    test_replay_buffer()
