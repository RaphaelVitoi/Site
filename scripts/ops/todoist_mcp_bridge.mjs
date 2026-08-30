#!/usr/bin/env node
/**
 * SOTA v8.0 GOLD: Resilient Autopoietic Todoist MCP Bridge (.mjs).
 * Bridges Model Context Protocol to Todoist REST API v2.
 * If TODOIST_API_TOKEN is set, delegates full execution to the Todoist client.
 * If TODOIST_API_TOKEN is unset, provides immediate non-blocking JSON-RPC 2.0
 * responses (initialize, tools/list, resources/list, prompts/list, ping) and graceful auth guidance.
 */

import readline from "node:readline";

const TODOIST_TOOLS = [
  {
    name: "create_task",
    description: "Create a new task in Todoist. Supports due dates, priority (1-4), labels, project_id, section_id, and markdown description.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Task title/content (required)." },
        description: { type: "string", description: "Detailed task description." },
        project_id: { type: "string", description: "Project ID to add task to (defaults to Inbox)." },
        section_id: { type: "string", description: "Section ID within the project." },
        parent_id: { type: "string", description: "Parent task ID for subtasks." },
        labels: { type: "array", items: { type: "string" }, description: "Label names." },
        priority: { type: "number", enum: [1, 2, 3, 4], description: "Priority: 1 (normal) to 4 (urgent)." },
        due_string: { type: "string", description: "Natural language due date, e.g., 'tomorrow at 10am', 'every Monday'." },
        due_date: { type: "string", description: "Due date in YYYY-MM-DD format." },
      },
      required: ["content"],
    },
  },
  {
    name: "get_tasks",
    description: "Get active tasks from Todoist. Can filter by project_id, section_id, label, or natural language filter query.",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string", description: "Filter by project ID." },
        section_id: { type: "string", description: "Filter by section ID." },
        label: { type: "string", description: "Filter by label name." },
        filter: { type: "string", description: "Todoist filter query (e.g., 'today', 'overdue | today', 'p1 & #Work')." },
      },
    },
  },
  {
    name: "get_task",
    description: "Get a specific Todoist task by ID.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "Task ID." },
      },
      required: ["task_id"],
    },
  },
  {
    name: "update_task",
    description: "Update an existing task's title, description, due date, priority, or labels.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "Task ID to update." },
        content: { type: "string", description: "New task title." },
        description: { type: "string", description: "New task description." },
        priority: { type: "number", enum: [1, 2, 3, 4], description: "New priority (1-4)." },
        due_string: { type: "string", description: "New natural language due date." },
        due_date: { type: "string", description: "New due date in YYYY-MM-DD format." },
        labels: { type: "array", items: { type: "string" }, description: "New label list." },
      },
      required: ["task_id"],
    },
  },
  {
    name: "close_task",
    description: "Complete / close a task in Todoist.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "Task ID to complete." },
      },
      required: ["task_id"],
    },
  },
  {
    name: "reopen_task",
    description: "Reopen / uncomplete a previously completed task in Todoist.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "Task ID to reopen." },
      },
      required: ["task_id"],
    },
  },
  {
    name: "delete_task",
    description: "Delete a task permanently from Todoist.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "Task ID to delete." },
      },
      required: ["task_id"],
    },
  },
  {
    name: "get_projects",
    description: "Get all projects in Todoist.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_project",
    description: "Create a new project in Todoist.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Project name." },
        parent_id: { type: "string", description: "Parent project ID for nested projects." },
        color: { type: "string", description: "Color name or code." },
        is_favorite: { type: "boolean", description: "Whether to favorite the project." },
      },
      required: ["name"],
    },
  },
  {
    name: "get_labels",
    description: "Get all personal labels in Todoist.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_label",
    description: "Create a new label in Todoist.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Label name." },
        color: { type: "string", description: "Color code." },
        is_favorite: { type: "boolean", description: "Whether to favorite the label." },
      },
      required: ["name"],
    },
  },
];

function sendResponse(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

const API_TOKEN = process.env.TODOIST_API_TOKEN;

async function executeTodoistApi(endpoint, method = "GET", body = null) {
  if (!API_TOKEN) {
    throw new Error(
      "[TODOIST AUTH REQUIRED] TODOIST_API_TOKEN is not configured.\n" +
        "Set it in your Windows Environment Variables or run:\n" +
        '  setx TODOIST_API_TOKEN "your_token"\n' +
        "Get your token at: https://todoist.com/prefs/integrations"
    );
  }

  const url = `https://api.todoist.com/rest/v2/${endpoint}`;
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
  };
  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Todoist API Error (${res.status}): ${errText}`);
  }
  if (res.status === 204) return { success: true };
  return await res.json();
}

async function handleToolCall(name, args) {
  const a = args || {};
  switch (name) {
    case "create_task": {
      const data = await executeTodoistApi("tasks", "POST", a);
      return `Task created: "${data.content}" (ID: ${data.id})`;
    }
    case "get_tasks": {
      const params = new URLSearchParams();
      if (a.project_id) params.set("project_id", a.project_id);
      if (a.section_id) params.set("section_id", a.section_id);
      if (a.label) params.set("label", a.label);
      if (a.filter) params.set("filter", a.filter);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await executeTodoistApi(`tasks${query}`);
      return JSON.stringify(data, null, 2);
    }
    case "get_task": {
      const data = await executeTodoistApi(`tasks/${a.task_id}`);
      return JSON.stringify(data, null, 2);
    }
    case "update_task": {
      const { task_id, ...rest } = a;
      const data = await executeTodoistApi(`tasks/${task_id}`, "POST", rest);
      return `Task updated: "${data.content}" (ID: ${data.id})`;
    }
    case "close_task": {
      await executeTodoistApi(`tasks/${a.task_id}/close`, "POST");
      return `Task ${a.task_id} completed successfully.`;
    }
    case "reopen_task": {
      await executeTodoistApi(`tasks/${a.task_id}/reopen`, "POST");
      return `Task ${a.task_id} reopened successfully.`;
    }
    case "delete_task": {
      await executeTodoistApi(`tasks/${a.task_id}`, "DELETE");
      return `Task ${a.task_id} deleted successfully.`;
    }
    case "get_projects": {
      const data = await executeTodoistApi("projects");
      return JSON.stringify(data, null, 2);
    }
    case "create_project": {
      const data = await executeTodoistApi("projects", "POST", a);
      return `Project created: "${data.name}" (ID: ${data.id})`;
    }
    case "get_labels": {
      const data = await executeTodoistApi("labels");
      return JSON.stringify(data, null, 2);
    }
    case "create_label": {
      const data = await executeTodoistApi("labels", "POST", a);
      return `Label created: "${data.name}" (ID: ${data.id})`;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function handleMessage(line) {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const msg = JSON.parse(trimmed);
    const { id, method, params } = msg;

    // Notifications (no id) must never receive a response
    if (id === undefined) return;

    switch (method) {
      case "initialize":
        sendResponse({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: { listChanged: false },
              resources: { subscribe: false, listChanged: false },
              prompts: { listChanged: false },
            },
            serverInfo: {
              name: "todoist-mcp-server",
              version: "1.5.0",
            },
          },
        });
        break;

      case "tools/list":
        sendResponse({
          jsonrpc: "2.0",
          id,
          result: { tools: TODOIST_TOOLS },
        });
        break;

      case "resources/list":
        sendResponse({
          jsonrpc: "2.0",
          id,
          result: { resources: [] },
        });
        break;

      case "resources/templates/list":
        sendResponse({
          jsonrpc: "2.0",
          id,
          result: { resourceTemplates: [] },
        });
        break;

      case "prompts/list":
        sendResponse({
          jsonrpc: "2.0",
          id,
          result: { prompts: [] },
        });
        break;

      case "ping":
        sendResponse({ jsonrpc: "2.0", id, result: {} });
        break;

      case "tools/call": {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};
        handleToolCall(toolName, toolArgs)
          .then((resText) => {
            sendResponse({
              jsonrpc: "2.0",
              id,
              result: {
                content: [{ type: "text", text: resText }],
              },
            });
          })
          .catch((err) => {
            sendResponse({
              jsonrpc: "2.0",
              id,
              result: {
                isError: true,
                content: [{ type: "text", text: err.message }],
              },
            });
          });
        break;
      }

      default:
        sendResponse({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Method '${method}' not found.`,
          },
        });
        break;
    }
  } catch {
    // Ignore malformed JSON lines
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", handleMessage);
