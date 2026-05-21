use wasm_bindgen::prelude::*;
use js_sys::Float64Array;

/// IDENTITY: Motor Termodinâmico SOTA (WASM)
/// ROLE: Ingestão de vetores pesados e processamento O(1) com Fricção Zero.

#[wasm_bindgen]
pub struct QuantumEngine {
    // Vetor interno alocado estaticamente para Zero-Copy FFI
    shared_buffer: Vec<f64>,
}

#[wasm_bindgen]
impl QuantumEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(buffer_size: usize) -> Self {
        Self {
            // Pré-aloca a memória linear (Evita Garbage Collection e realocações dinâmicas)
            shared_buffer: vec![0.0; buffer_size],
        }
    }

    /// MÉTODO 1: Ingestão via js_sys (Fast V8 Copy)
    /// Ideal para payloads que a Main Thread / Worker geraram e precisam enviar ao Rust.
    #[wasm_bindgen]
    pub fn ingest_matrix_js_sys(&self, payload: &Float64Array) -> f64 {
        // A conversão para Vec usa a instrução nativa do engine JS para copiar o buffer
        // diretamente para a memória WASM de forma altamenete otimizada.
        let data = payload.to_vec();

        // Operação termodinâmica O(N) no lado do Rust
        data.iter().sum()
    }

    /// MÉTODO 2: Ponteiro de Memória (SOTA Absoluto - Zero-Copy)
    /// Retorna o endereço bruto da memória do Rust.
    /// O JS instancia: `new Float64Array(wasm.memory.buffer, ptr, size)` e escreve DENTRO do Rust.
    #[wasm_bindgen]
    pub fn get_shared_buffer_ptr(&self) -> *const f64 {
        self.shared_buffer.as_ptr()
    }

    /// O Rust lê a memória que o JS acabou de escrever, sem nunca ter trafegado dados pela FFI.
    #[wasm_bindgen]
    pub fn compute_thermodynamics_zero_copy(&mut self) -> f64 {
        let mut risk_index = 0.0;
        for val in self.shared_buffer.iter() {
            risk_index += val; // Exemplo de distorção
        }
        risk_index
    }
}
