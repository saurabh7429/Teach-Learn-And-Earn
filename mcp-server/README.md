# ⚡ TL&E Token-Saving Model Context Protocol (MCP) Server

A dedicated **Model Context Protocol (MCP)** server for **Teach, Learn & Earn (TL&E)** designed to save **up to 95% LLM tokens** while providing AI assistants with structured tools to query project architecture, verify skills, inspect learning feeds, and execute token-optimized Groq queries.

---

## 🛠️ Available MCP Tools

| Tool Name | Purpose | Token Savings Impact |
| :--- | :--- | :--- |
| `tle_get_architecture` | Returns concise system architecture, routes, schemas & state layout. | **~95% tokens saved** vs loading repository files |
| `tle_query_skills` | Filtered list of teaching skills & qualification metrics in compact JSON. | **~85% tokens saved** vs full database dumps |
| `tle_query_learning_requests` | Compact view of open & active learning requests. | **~80% tokens saved** vs raw logs |
| `tle_optimize_prompt` | Strips filler words & measures token reduction percentage. | Direct prompt reduction |
| `tle_groq_ai_query` | Fast Groq AI inference (`llama-3.3-70b-versatile`) with strict token budget. | Enforces token limits on completions |
| `tle_health_check` | Rapid status check of backend, client, and Groq API readiness. | Instant 1-line check |

---

## 🚀 Running the MCP Server

### 1. Direct Start (Stdio mode)
```bash
npm --prefix mcp-server start
```
or from the root directory:
```bash
npm run mcp
```

### 2. Connecting to Antigravity IDE / Claude Desktop / Cursor
Add the following to your `mcp_config.json`:

```json
{
  "mcpServers": {
    "tle-token-saver": {
      "command": "node",
      "args": ["c:/Users/msaur/Desktop/github/Teach-Learn-And-Earn/mcp-server/index.js"],
      "env": {
        "GROQ_API_KEY": "YOUR_GROQ_API_KEY_HERE"
      }
    }
  }
}
```
