# 🐾 ClawTracer

**ClawTracer** is a "Chrome DevTools for OpenClaw chains." It's a developer-focused, local-first React visualizer that turns complex OpenClaw `.jsonl` session transcripts into an interactive, step-by-step Execution Graph.

Developing and debugging multi-step agentic chains often feels like a "black box" where you are forced to tail massive logs or parse raw JSON strings to understand what failed. ClawTracer solves this by providing:

- 🗺️ **A Visual Mental Map**: A React Flow visualizer that graphs out User Prompts, Agent Thoughts, Tool Calls, and Tool Results (Observations) sequentially.
- 🔴 **Instant Error Highlighting**: Automatically detects and highlights failed tool calls (e.g. `stderr` or non-zero exit codes) entirely in red so you can spot the breakdown immediately.
- 🔎 **Deep Payload Inspector**: A clickable sidebar that displays the exact `stdout`, `stderr`, timestamp, token cost, and JSON API payloads used in any given step.

---

## 🚀 Getting Started (Run Locally)

ClawTracer is currently a React Single Page Application (SPA) built with Vite, TailwindCSS, and `shadcn/ui`.

### Prerequisites
- Node.js `v20.19.0` or higher (or `v22.12.0+`)
- An OpenClaw `.jsonl` session file. (By default, OpenClaw stores these at `~/.openclaw/agents/<agentId>/sessions/<sessionId>.jsonl`).

### Setup Instructions

1. **Clone or navigate to the repository directory:**
   ```bash
   cd ClawTracer
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open the App:**
   Open your browser to the URL provided by Vite (usually `http://localhost:5173`).

---

## 🛠️ How to Use the UI
1. Once the web app is open, simply drag and drop **any OpenClaw `.jsonl` session trace** into the upload area.
2. If you don't have one handy, click **"Load the Sample Trace"** at the bottom of the screen to see a predefined mock trace featuring a Python `ModuleNotFoundError`.
3. Click on any node in the graph to open the **Inspector Sidebar** on the right. 

---

## 🏗️ Architecture & Tech Stack (Phase 1)
- **Frontend Framework**: React 19 + TypeScript (Vite 5)
- **Styling**: Tailwind CSS v3 + `shadcn/ui` (Radix)
- **Graphing Engine**: `@xyflow/react` + `dagre` (for auto-layouting)
- **Parsing**: A robust, zero-dependency ingestion engine built to parse the official OpenClaw nested `message.content[]` telemetry format.

*Built for the OpenClaw Ecosystem.*
