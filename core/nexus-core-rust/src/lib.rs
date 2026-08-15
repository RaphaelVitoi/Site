use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::{HashMap, HashSet};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TaskMetadata {
    pub priority: Option<String>,
    pub depends_on: Option<Vec<String>>,
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Task {
    pub id: String,
    pub agent: String,
    pub description: String,
    pub status: String,
    pub timestamp: String,
    pub metadata: Option<TaskMetadata>,
}

pub struct Node {
    pub task: Task,
    pub in_degree: usize,
    pub out_edges: Vec<String>,
    pub base_weight: f64,
    pub total_utility: f64,
}

pub fn calculate_base_weight(task: &Task, priority_scalars: &HashMap<String, f64>, alpha: f64) -> f64 {
    let priority_str = task.metadata.as_ref()
        .and_then(|m| m.priority.clone())
        .unwrap_or_else(|| "medium".to_string())
        .to_lowercase();
    
    let base_prio = *priority_scalars.get(&priority_str).unwrap_or(&1000.0);
    
    let created_dt = DateTime::parse_from_rfc3339(&task.timestamp)
        .map(|dt| dt.with_timezone(&Utc))
        .unwrap_or_else(|_| Utc::now());
    
    let wait_seconds = Utc::now().signed_duration_since(created_dt).num_seconds() as f64;
    let wait_seconds = if wait_seconds < 0.0 { 0.0 } else { wait_seconds };
    
    // SOTA: Crescimento Sublinear (Achatamento Logaritmico)
    let time_bonus = (wait_seconds + 1.0).ln() * (base_prio * 0.05) * alpha;
    
    base_prio + time_bonus
}

pub fn build_graph(tasks: Vec<Task>, priority_scalars: &HashMap<String, f64>, alpha: f64) -> HashMap<String, Node> {
    let mut graph = HashMap::new();
    let task_ids: HashSet<String> = tasks.iter().map(|t| t.id.clone()).collect();

    for task in tasks.clone() {
        let base_weight = calculate_base_weight(&task, priority_scalars, alpha);
        graph.insert(task.id.clone(), Node {
            task,
            in_degree: 0,
            out_edges: Vec::new(),
            base_weight,
            total_utility: 0.0,
        });
    }

    for task in tasks {
        if let Some(metadata) = &task.metadata {
            if let Some(depends_on) = &metadata.depends_on {
                for dep_id in depends_on {
                    if task_ids.contains(dep_id) {
                        if let Some(node) = graph.get_mut(dep_id) {
                            node.out_edges.push(task.id.clone());
                        }
                        if let Some(node) = graph.get_mut(&task.id) {
                            node.in_degree += 1;
                        }
                    }
                }
            }
        }
    }
    graph
}

pub fn compute_utilities(graph: &mut HashMap<String, Node>, gamma: f64) -> Result<(), String> {
    let ids: Vec<String> = graph.keys().cloned().collect();
    let mut memo: HashMap<String, f64> = HashMap::new();
    let mut visited: HashSet<String> = HashSet::new();

    for id in ids {
        if !visited.contains(&id) {
            dfs_utility(&id, graph, &mut memo, &mut visited, &mut HashSet::new(), gamma)?;
        }
    }
    
    for (id, utility) in memo {
        if let Some(node) = graph.get_mut(&id) {
            node.total_utility = utility;
        }
    }
    Ok(())
}

fn dfs_utility(
    node_id: &str,
    graph: &HashMap<String, Node>,
    memo: &mut HashMap<String, f64>,
    visited: &mut HashSet<String>,
    recursion_stack: &mut HashSet<String>,
    gamma: f64,
) -> Result<f64, String> {
    if let Some(&val) = memo.get(node_id) {
        return Ok(val);
    }
    if recursion_stack.contains(node_id) {
        return Err(format!("Ciclo topologico detectado na tarefa {}", node_id));
    }

    recursion_stack.insert(node_id.to_string());
    
    let node_data = graph.get(node_id).ok_or_else(|| "Node not found".to_string())?;
    let mut inherited_weight = 0.0;

    for child_id in &node_data.out_edges {
        let child_node = graph.get(child_id).ok_or_else(|| "Child node not found".to_string())?;
        let child_utility = dfs_utility(child_id, graph, memo, visited, recursion_stack, gamma)?;
        inherited_weight += gamma * (child_utility / (child_node.in_degree as f64).max(1.0));
    }

    let final_utility = node_data.base_weight + inherited_weight;

    recursion_stack.remove(node_id);
    visited.insert(node_id.to_string());
    memo.insert(node_id.to_string(), final_utility);

    Ok(final_utility)
}

#[cfg(feature = "python")]
use pyo3::prelude::*;

#[cfg(feature = "python")]
#[pyfunction]
fn extract_optimal_task_py(tasks_json: String, scalars_json: String, alpha: f64, gamma: f64) -> PyResult<Option<String>> {
    let tasks: Vec<Task> = serde_json::from_str(&tasks_json).map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))?;
    let scalars: HashMap<String, f64> = serde_json::from_str(&scalars_json).map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e.to_string()))?;
    
    let mut graph = build_graph(tasks, &scalars, alpha);
    compute_utilities(&mut graph, gamma).map_err(|e| PyErr::new::<pyo3::exceptions::PyValueError, _>(e))?;
    
    let mut optimal_task: Option<Task> = None;
    let mut max_utility = f64::NEG_INFINITY;

    for node in graph.values() {
        if node.in_degree == 0 && node.total_utility > max_utility {
            max_utility = node.total_utility;
            optimal_task = Some(node.task.clone());
        }
    }

    Ok(optimal_task.and_then(|t| serde_json::to_string(&t).ok()))
}

#[cfg(feature = "python")]
#[pymodule]
fn nexus_core_rust(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(extract_optimal_task_py, m)?)?;
    Ok(())
}

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn extract_optimal_task_wasm(tasks_json: &str, scalars_json: &str, alpha: f64, gamma: f64) -> JsValue {
    let tasks: Vec<Task> = serde_json::from_str(tasks_json).unwrap_or_default();
    let scalars: HashMap<String, f64> = serde_json::from_str(scalars_json).unwrap_or_default();
    
    let mut graph = build_graph(tasks, &scalars, alpha);
    if compute_utilities(&mut graph, gamma).is_err() {
        return JsValue::NULL;
    }
    
    let mut optimal_task: Option<Task> = None;
    let mut max_utility = f64::NEG_INFINITY;

    for node in graph.values() {
        if node.in_degree == 0 && node.total_utility > max_utility {
            max_utility = node.total_utility;
            optimal_task = Some(node.task.clone());
        }
    }

    serde_json::to_string(&optimal_task).map(|s| JsValue::from_str(&s)).unwrap_or(JsValue::NULL)
}
