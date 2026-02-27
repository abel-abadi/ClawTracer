import React, { useState, useCallback } from 'react';
import { UploadCloud, FileJson, Github } from 'lucide-react';
import { ParsedAction } from './types';
import { FlowViewer } from './components/FlowViewer';
import { InspectorSidebar } from './components/InspectorSidebar';

function App() {
  const [traceData, setTraceData] = useState<ParsedAction[] | null>(null);
  const [selectedAction, setSelectedAction] = useState<ParsedAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        let rawLogs: any[] = [];
        try {
          rawLogs = JSON.parse(content);
        } catch {
          rawLogs = content
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
              try { return JSON.parse(line); } catch { return null; }
            })
            .filter(Boolean);
        }

        const parsedData: ParsedAction[] = [];

        rawLogs.forEach((log) => {
          if (log.type !== 'message' || !log.message?.content) return;
          
          log.message.content.forEach((item: any, index: number) => {
            const actionId = `${log.timestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`;
            
            if (log.message.role === 'assistant') {
               if (item.type === 'text') {
                 // Thought or final response
                 parsedData.push({
                   id: actionId,
                   timestamp: log.timestamp,
                   type: 'thought',
                   content: item.text,
                   cost: log.message.usage?.cost?.total,
                   raw: log
                 } as any);
               } else if (item.type === 'toolCall') {
                 // Tool Execution
                 parsedData.push({
                   id: actionId,
                   timestamp: log.timestamp,
                   type: 'tool_call',
                   tool_name: item.name,
                   tool_args: item.input,
                   cost: log.message.usage?.cost?.total,
                   raw: log
                 } as any);
               }
            } else if (log.message.role === 'toolResult') {
               // Observation / Tool Result
               const isError = item.isError === true;
               parsedData.push({
                 id: actionId,
                 timestamp: log.timestamp,
                 type: 'observation',
                 source_tool: item.name || 'Unknown Tool',
                 result: item.result || item.text, // format varies
                 isError: isError,
                 exit_code: isError ? 1 : 0,
                 stderr: isError ? (item.result || item.text) : '',
                 stdout: !isError ? (item.result || item.text) : '',
                 raw: log
               } as any);
            }
          });
        });

        // Use mock data if empty (e.g., parsing naive JSON instead of JSONL)
        if (parsedData.length === 0 && rawLogs.length > 0 && rawLogs[0].type === 'thought') {
            setTraceData(rawLogs as any[]);
        } else {
            setTraceData(parsedData);
        }
        
        setError(null);
        setSelectedAction(null);
      } catch (err) {
        setError('Failed to parse file. Please ensure it is a valid OpenClaw .jsonl session log.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  }, []);

  const loadSampleData = async () => {
    try {
      const response = await fetch('/sample-trace.jsonl');
      const text = await response.text();
      
      const rawLogs = text
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try { return JSON.parse(line); } catch { return null; }
        })
        .filter(Boolean);

      const parsedData: ParsedAction[] = [];

      rawLogs.forEach((log) => {
        if (log.type !== 'message' || !log.message?.content) return;
        
        log.message.content.forEach((item: any, index: number) => {
          const actionId = `${log.timestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`;
          
          if (log.message.role === 'assistant') {
             if (item.type === 'text') {
               parsedData.push({
                 id: actionId,
                 timestamp: log.timestamp || new Date().toISOString(),
                 type: 'thought',
                 content: item.text,
                 cost: log.message.usage?.cost?.total,
                 raw: log
               } as any);
             } else if (item.type === 'toolCall') {
               parsedData.push({
                 id: actionId,
                 timestamp: log.timestamp || new Date().toISOString(),
                 type: 'tool_call',
                 tool_name: item.name,
                 tool_args: item.input,
                 cost: log.message.usage?.cost?.total,
                 raw: log
               } as any);
             }
          } else if (log.message.role === 'toolResult') {
             const isError = item.isError === true;
             parsedData.push({
               id: actionId,
               timestamp: log.timestamp || new Date().toISOString(),
               type: 'observation',
               source_tool: item.name || 'Unknown Tool',
               result: item.result || item.text,
               isError: isError,
               exit_code: isError ? 1 : 0,
               stderr: isError ? (item.result || item.text) : '',
               stdout: !isError ? (item.result || item.text) : '',
               raw: log
             } as any);
          }
        });
      });

      setTraceData(parsedData);
      setError(null);
      setSelectedAction(null);
    } catch (err) {
      setError('Failed to load sample data.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">ClawTracer</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Visualizer MVP</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
           {traceData && (
              <button 
                onClick={() => setTraceData(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
               >
                 Clear Trace
              </button>
           )}
           <a href="https://github.com/openclaw/openclaw" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
              <span>OpenClaw</span>
           </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {!traceData ? (
          // Empty State / Uploader
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/20">
             <div className="text-center max-w-md w-full space-y-8">
               
               <div className="space-y-2">
                 <h2 className="text-2xl font-bold tracking-tight">Inspect your OpenClaw agents.</h2>
                 <p className="text-muted-foreground text-sm">
                    Upload a `.jsonl` session file from your local `sessions/` directory to instantly visualize the execution chain, discover failures, and understand data flow.
                 </p>
               </div>

               <div className="p-8 border-2 border-dashed rounded-xl border-slate-300 dark:border-slate-800 bg-card hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-4 relative group cursor-pointer">
                  <input 
                    type="file" 
                    accept=".jsonl,.json" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Upload OpenClaw Session File"
                  />
                  <div className="bg-primary/10 p-4 rounded-full text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Click or drag `.jsonl` file here</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Max size 20MB</p>
                  </div>
               </div>

               {error && (
                 <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                   {error}
                 </div>
               )}

               <div className="pt-4 border-t w-full flex flex-col items-center gap-2">
                  <p className="text-xs text-muted-foreground">Don't have an OpenClaw trace handy?</p>
                  <button 
                    onClick={loadSampleData}
                    className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    Load the Sample Trace
                  </button>
               </div>

             </div>
          </div>
        ) : (
          // Application State (Graph + Sidebar)
          <div className="flex-1 flex w-full h-full overflow-hidden">
            <div className="flex-1 h-full p-2 bg-slate-50 dark:bg-slate-900/50">
               <FlowViewer 
                 data={traceData} 
                 onNodeClick={setSelectedAction} 
               />
            </div>
            
            <div className="w-[400px] h-full border-l shrink-0 bg-card shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
               <InspectorSidebar action={selectedAction} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
