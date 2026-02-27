// Represents the raw line from an OpenClaw .jsonl file
export interface OpenClawRawLog {
  type: string;
  timestamp: string;
  message?: {
    role: "user" | "assistant" | "toolResult";
    content?: Array<{
      type: "text" | "toolCall" | "toolResult";
      text?: string;
      name?: string;     // the tool name
      input?: any;       // the tool arguments
      result?: any;      // the tool result
      isError?: boolean;
    }>;
    usage?: {
      cost?: {
        total?: number;
      }
    };
  };
}

// Our internal parsed representation for the Flow Viewer
export type ActionType = "user_prompt" | "thought" | "tool_call" | "observation" | "model_output";

export interface ParsedAction {
  id: string;
  timestamp: string;
  type: ActionType;
  
  // Specific to thought, user_prompt, or model_output
  content?: string;
  
  // Specific to tool_call
  tool_name?: string;
  tool_args?: any;

  // Specific to observation (toolResult)
  source_tool?: string;
  result?: any;
  isError?: boolean;
  exit_code?: number;
  stdout?: string;
  stderr?: string;
  cost?: number; // Total cost tracking if applicable
}
