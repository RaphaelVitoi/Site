# Gemma 4 Brain-Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Gemma 4 Oracle into a context-aware strategic partner by syncing real-time simulator state (Stacks, Pots, Position) with the inference engine.

**Architecture:** Use `useSotaSync` in the frontend to capture a physics snapshot, inject it into the prompt payload, and display a "Telemetry Card" in the chat. The Python backend will parse this snapshot to ground the Oracle's reasoning.

**Tech Stack:** Next.js (TS), Tailwind v4, FastAPI (Python), PyTorch/Transformers.

---

### Task 1: Backend Snapshot Support

**Files:**
- Modify: `engine/gemma_server.py`

- [ ] **Step 1: Update `InferenceRequest` schema to include physics snapshot**

```python
class PhysicsSnapshot(BaseModel):
    heroStack: float
    pot: float
    heroInvested: float
    position: str
    referenceStatus: str

class InferenceRequest(BaseModel):
    prompt: str
    physics_snapshot: Optional[PhysicsSnapshot] = None
    max_tokens: int = 1024
```

- [ ] **Step 2: Implement prompt injection logic for the snapshot**

```python
def _format_snapshot_block(snapshot: Optional[PhysicsSnapshot]) -> str:
    if not snapshot:
        return ""
    return f"""
[SOTA_SNAPSHOT_ACTIVE]
Hero Stack: {snapshot.heroStack}bb
Pot Size: {snapshot.pot}bb
Hero Invested: {snapshot.heroInvested}bb
Position: {snapshot.position}
Psychological Status: {snapshot.referenceStatus}
[END_SNAPSHOT]
"""

# Inside generate_response:
snapshot_block = _format_snapshot_block(req.physics_snapshot)
final_prompt = VITOI_SYSTEM_PROMPT + rag_context + snapshot_block + "[CENARIO/PERGUNTA]:\\n" + req.prompt
```

- [ ] **Step 3: Verify server health check**

Run: `python engine/gemma_server.py` (ensure it starts)

- [ ] **Step 4: Commit backend changes**

```bash
git add engine/gemma_server.py
git commit -m "feat(engine): add physics snapshot support to gemma server"
```

---

### Task 2: Frontend Sync Infrastructure

**Files:**
- Modify: `frontend/src/app/templo/gemma/page.tsx`

- [ ] **Step 1: Import `useSotaSync` and capture state**

```typescript
import { useSotaSync } from '@/components/simulator/hooks/useSotaSync';

// Inside GemmaPortal component:
const { physics, isHydrated: isSyncHydrated } = useSotaSync();
```

- [ ] **Step 2: Add Sync Badge to UI**

```tsx
<div className="flex items-center gap-3">
  <div className={`w-3 h-3 rounded-full animate-pulse ${status === 'online' ? 'bg-accent-emerald' : status === 'thinking' ? 'bg-accent-indigo' : 'bg-rose-500'}`} />
  <span className="text-xs font-black uppercase tracking-[0.2em]">Status do Motor: {status.toUpperCase()}</span>
  {isSyncHydrated && (
    <span className="text-[0.65rem] font-black text-accent-emerald-light bg-accent-emerald/10 px-2 py-0.5 rounded border border-accent-emerald/20 animate-in fade-in zoom-in">
      [ SYNC: OK]
    </span>
  )}
</div>
```

- [ ] **Step 3: Commit sync infrastructure**

```bash
git add frontend/src/app/templo/gemma/page.tsx
git commit -m "feat(frontend): integrate useSotaSync into Gemma portal"
```

---

### Task 3: Telemetry Card & History Integration

**Files:**
- Modify: `frontend/src/app/templo/gemma/page.tsx`

- [ ] **Step 1: Update message state to support history with snapshots**

```typescript
interface Message {
  role: 'user' | 'assistant' | 'telemetry';
  content: string;
}
const [messages, setMessages] = useState<Message[]>([]);
```

- [ ] **Step 2: Create `TelemetryCard` component and render in chat list**

```tsx
function TelemetryCard({ snapshot }: { snapshot: any }) {
  return (
    <div className="my-4 p-4 bg-slate-900/60 border border-accent-indigo/20 rounded-xl font-mono text-[0.7rem] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-accent-indigo" />
      <div className="flex justify-between items-center mb-2">
        <span className="text-accent-indigo-light font-black uppercase tracking-tighter">Telemetria de Oraculo</span>
        <span className="text-[0.6rem] text-text-muted">ACTIVE SNAPSHOT</span>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-1">
        <div>STACK: <span className="text-white">{snapshot.heroStack}bb</span></div>
        <div>POT: <span className="text-white">{snapshot.pot}bb</span></div>
        <div>POS: <span className="text-white">{snapshot.position}</span></div>
        <div>STATUS: <span className="text-white">{snapshot.referenceStatus}</span></div>
      </div>
    </div>
  );
}

// Inside response display area:
{messages.map((m, i) => (
  m.role === 'telemetry' ? <TelemetryCard key={i} snapshot={JSON.parse(m.content)} /> : 
  <div key={i} className={m.role === 'user' ? 'text-text-muted text-right' : 'text-white'}>{m.content}</div>
))}
```

- [ ] **Step 3: Commit history overhaul**

```bash
git add frontend/src/app/templo/gemma/page.tsx
git commit -m "feat(frontend): implement Telemetry Card and chat history"
```

---

### Task 4: Integrated Request Dispatch

**Files:**
- Modify: `frontend/src/app/templo/gemma/page.tsx`

- [ ] **Step 1: Capture snapshot and dispatch full payload**

```typescript
async function handleConsult() {
    if (!prompt.trim()) return;
    const snapshot = { ...physics };
    setMessages(prev => [...prev, { role: 'user', content: prompt }, { role: 'telemetry', content: JSON.stringify(snapshot) }]);
    setLoading(true);
    // ...
    const res = await fetch('http://127.0.0.1:11434/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vitoi-Auth': 'sota-token-2026'
        },
        body: JSON.stringify({ 
            prompt, 
            physics_snapshot: snapshot,
            max_tokens: 1024 
        })
    });
    // ... logic for assistant response stream
}
```

- [ ] **Step 2: Final UI Polishing (SOTA Gold style)**

Add `sota-grain` and metallic shadows to the GlassPanel.

- [ ] **Step 3: Commit final integration**

```bash
git add frontend/src/app/templo/gemma/page.tsx
git commit -m "feat(frontend): final integrated Brain-Sync for Gemma 4"
```
