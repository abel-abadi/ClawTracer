export type OpenClawActionType = "thought" | "tool_call" | "observation" | "model_output";

export interface OpenClawAction {
  id: string;
  timestamp: string;
  type: OpenClawActionType;
  agent_name: string;
  
  // Specific to thought or model_output
  content?: string;
  
  // Specific to tool_call
  tool_name?: string;
  tool_args?: {
    command?: string;
    [key: string]: any;
  };

  // Specific to observation
  source_tool?: string;
  reference_id?: string;
  stdout?: string;
  stderr?: string;
  exit_code?: number;
}
