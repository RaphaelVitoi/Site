# Design Spec: Gemma 4 Brain-Sync (SOTA Gold)

**Date:** 2026-05-11
**Topic:** Deepening Gemma 4 Oracle Integration
**Status:** Approved by User

---

## 1. Overview
The goal is to transform the Gemma 4 Oracle into a context-aware strategic partner. Instead of generic LLM responses, the Oracle will have real-time access to the "Physics of the Table" (Stacks, Pots, Position, PM%) provided by the `useSotaSync` hub.

## 2. Architecture & Data Flow

### 2.1 The Oracle Hub (Frontend)
- **Component:** `GemmaPortal` (`src/app/templo/gemma/page.tsx`).
- **Mechanism:** Subscribe to `useSotaSync` to maintain a live connection to the simulator state.
- **Payload Construction:** On click "CONSULTAR", capture `SotaPhysicsState`.
- **Payload Format:**
  ```json
  {
    "prompt": "User message",
    "physics_snapshot": {
       "heroStack": 40,
       "pot": 15,
       "heroInvested": 5,
       "position": "OOP",
       "referenceStatus": "baseline",
       "prizes": [...]
    }
  }
  ```

### 2.2 Inference Engine (Backend)
- **Service:** `engine/gemma_server.py`.
- **Injection:** The backend will parse `physics_snapshot` and prepend a deterministic Markdown block to the prompt.
- **System Prompt Update:** Refine `VITOI_SYSTEM_PROMPT` to enforce validation against the injected snapshot data.

---

## 3. UI/UX: The "Oracle SOTA" Interface

### 3.1 Visual Elements
- **Sync Badge:** A dynamic indicator next to the "Consult" button: `[● SYNC: OK]`.
- **Telemetry Card:** The injected snapshot will be displayed in the chat history as a **"Telemetria de Oráculo"** card (Mono font, Metallic glows).
- **Thinking Process:** A vector-analysis animation (SOTA Gold style) during inference.

### 3.2 Information Hierarchy
1. **User Prompt** (Human Intuition).
2. **Telemetry Card** (Deterministic Physics).
3. **Oracle Response** (Synthesis).

---

## 4. Success Criteria
- [ ] Gemma 4 correctly references the current Hero Stack in its analysis.
- [ ] Zero latency added to the prompt construction phase.
- [ ] UI reflects the aesthetic SOTA Gold standard (Glassmorphism + Grain).
- [ ] No "hallucination" of chip counts or positions when snapshot is active.
