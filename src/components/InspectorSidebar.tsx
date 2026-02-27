import React from 'react';
import { ParsedAction } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { ShieldAlert, Terminal, Brain, MessageSquare } from 'lucide-react';

interface InspectorSidebarProps {
  action: ParsedAction | null;
}

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ action }) => {
  if (!action) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-muted-foreground text-center">
        Select a node in the graph to view execution details.
      </div>
    );
  }

  const isError = action.type === 'observation' && (action.exit_code !== 0 || action.stderr);

  const getIcon = () => {
    switch (action.type) {
      case 'thought': return <Brain className="w-5 h-5 text-indigo-500" />;
      case 'tool_call': return <Terminal className="w-5 h-5 text-blue-500" />;
      case 'observation': return isError ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <Terminal className="w-5 h-5 text-green-500" />;
      case 'model_output': return <MessageSquare className="w-5 h-5 text-teal-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h2 className="font-semibold text-lg capitalize">{action.type.replace('_', ' ')}</h2>
        </div>
        {isError && <Badge variant="destructive">Error Run</Badge>}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Metadata Section */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Metadata</h3>
            <div className="grid grid-cols-2 gap-2 text-sm bg-muted/50 p-3 rounded-md">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-xs">{action.id}</span>
              <span className="text-muted-foreground">Time:</span>
              <span>{new Date(action.timestamp).toLocaleTimeString()}</span>
            </div>
          </section>

          {/* Type-Specific Content */}
          {(action.type === 'thought' || action.type === 'model_output') && action.content && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content</h3>
              <div className="p-3 bg-card border rounded-md text-sm whitespace-pre-wrap">
                {action.content}
              </div>
            </section>
          )}

          {action.type === 'tool_call' && action.tool_args && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tool Call: {action.tool_name}</h3>
              <pre className="p-3 bg-slate-950 text-slate-50 rounded-md text-xs overflow-x-auto">
                <code>{JSON.stringify(action.tool_args, null, 2)}</code>
              </pre>
            </section>
          )}

          {action.type === 'observation' && (
            <section className="space-y-4">
              <div className="flex gap-2 text-xs">
                <span className="font-semibold">Source Tool:</span> {action.source_tool}
              </div>
              <div className="flex gap-2 text-xs">
                <span className="font-semibold">Exit Code:</span> 
                <span className={action.exit_code === 0 ? 'text-green-500' : 'text-red-500 font-bold'}>{action.exit_code}</span>
              </div>
              
              {action.stdout && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Standard Output</h3>
                  <pre className="p-3 bg-slate-950 text-green-400 rounded-md text-xs overflow-x-auto max-h-64 overflow-y-auto">
                    <code>{action.stdout}</code>
                  </pre>
                </div>
              )}

              {action.stderr && (
                <div>
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Standard Error</h3>
                  <pre className="p-3 bg-red-950/20 text-red-500 rounded-md text-xs overflow-x-auto border border-red-900/50">
                    <code>{action.stderr}</code>
                  </pre>
                </div>
              )}
            </section>
          )}

          {/* Raw JSON Debug */}
          <section className="pt-4 mt-8 border-t border-dashed">
             <h3 className="text-xs font-semibold text-muted-foreground mb-2">Raw JSON Payload</h3>
             <pre className="p-3 bg-muted rounded-md text-[10px] overflow-x-auto text-muted-foreground">
                <code>{JSON.stringify(action, null, 2)}</code>
             </pre>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};
